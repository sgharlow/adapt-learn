/**
 * Server-side session validation for API routes.
 * Checks the httpOnly cookie set by /api/auth/verify.
 */
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/app/api/auth/verify/route';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('adaptlearn-session');
  if (!sessionCookie?.value) return false;
  return validateSessionToken(sessionCookie.value);
}
