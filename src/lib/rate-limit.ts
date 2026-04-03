/**
 * Server-side rate limiting with Upstash Redis support.
 * Falls back to in-memory rate limiting when Upstash is not configured.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

function createRateLimiter(maxRequests: number, windowSec: number) {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    return new Ratelimit({
      redis: new Redis({ url: upstashUrl, token: upstashToken }),
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
      analytics: true,
    });
  }

  return null;
}

const limiters = new Map<string, Ratelimit | null>();

function getLimiter(maxRequests: number, windowSec: number): Ratelimit | null {
  const key = `${maxRequests}:${windowSec}`;
  if (!limiters.has(key)) {
    limiters.set(key, createRateLimiter(maxRequests, windowSec));
  }
  return limiters.get(key)!;
}

export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowSec: number = 60
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const limiter = getLimiter(maxRequests, windowSec);

  if (limiter) {
    const result = await limiter.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
      retryAfterSeconds: result.success ? 0 : Math.ceil((result.reset - Date.now()) / 1000),
    };
  }

  // In-memory fallback
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const entry = inMemoryStore.get(identifier);

  if (Math.random() < 0.01) {
    for (const [k, v] of inMemoryStore.entries()) {
      if (now > v.resetTime) inMemoryStore.delete(k);
    }
  }

  if (!entry || now > entry.resetTime) {
    inMemoryStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterSeconds: 0 };
}
