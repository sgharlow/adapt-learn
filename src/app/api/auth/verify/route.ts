import { NextResponse } from 'next/server';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function createSessionToken(): string {
  const payload = {
    authenticated: true,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    nonce: randomBytes(8).toString('hex'),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function validateSessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  const expectedSig = createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  const sigBuf = Buffer.from(sig, 'base64url');
  const expectedBuf = Buffer.from(expectedSig, 'base64url');
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    return Date.now() < payload.exp;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const { password } = await request.json();
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return NextResponse.json({ valid: false }, { status: 503 });
  }

  // Timing-safe comparison
  const passwordBuf = Buffer.from(password || '');
  const expectedBuf = Buffer.from(sitePassword);
  const valid =
    passwordBuf.length === expectedBuf.length &&
    timingSafeEqual(passwordBuf, expectedBuf);

  if (!valid) {
    return NextResponse.json({ valid: false });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ valid: true });
  response.cookies.set('adaptlearn-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });

  return response;
}
