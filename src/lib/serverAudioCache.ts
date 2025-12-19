/**
 * Server-Side Audio Cache
 *
 * For Q&A responses, we cache generated audio on the server to prevent
 * repeated generation of the same content. This uses file-based caching
 * in the /tmp directory (available in Vercel serverless functions).
 *
 * For lesson audio, we do NOT generate at runtime - only pre-generated
 * static files are used.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Cache directory - /tmp is available in Vercel serverless
const CACHE_DIR = '/tmp/audio-cache';

// Cache expiration (7 days in milliseconds)
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export interface CacheEntry {
  audioBase64: string;
  createdAt: number;
  textHash: string;
}

/**
 * Generate a deterministic cache key from text content
 */
export function generateCacheKey(text: string, context?: string): string {
  const content = context ? `${text}::${context}` : text;
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 32);
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Get cached audio if it exists and is not expired
 */
export function getCachedAudio(cacheKey: string): string | null {
  try {
    ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

    if (!fs.existsSync(cachePath)) {
      return null;
    }

    const data = fs.readFileSync(cachePath, 'utf-8');
    const entry: CacheEntry = JSON.parse(data);

    // Check if expired
    if (Date.now() - entry.createdAt > CACHE_EXPIRY_MS) {
      // Delete expired entry
      fs.unlinkSync(cachePath);
      return null;
    }

    return entry.audioBase64;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Save audio to server-side cache
 */
export function setCachedAudio(cacheKey: string, audioBase64: string, textHash: string): void {
  try {
    ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

    const entry: CacheEntry = {
      audioBase64,
      createdAt: Date.now(),
      textHash,
    };

    fs.writeFileSync(cachePath, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
    // Don't throw - caching failure shouldn't break the app
  }
}

/**
 * Check if a specific cache entry exists (without reading full content)
 */
export function hasCachedAudio(cacheKey: string): boolean {
  try {
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    return fs.existsSync(cachePath);
  } catch {
    return false;
  }
}

/**
 * Clean up expired cache entries
 */
export function cleanExpiredCache(): number {
  try {
    ensureCacheDir();
    const files = fs.readdirSync(CACHE_DIR);
    let cleaned = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const cachePath = path.join(CACHE_DIR, file);
      const data = fs.readFileSync(cachePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(data);

      if (Date.now() - entry.createdAt > CACHE_EXPIRY_MS) {
        fs.unlinkSync(cachePath);
        cleaned++;
      }
    }

    return cleaned;
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
}
