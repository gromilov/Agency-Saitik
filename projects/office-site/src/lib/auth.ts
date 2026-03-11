import type { AstroCookies } from 'astro';

/**
 * Verifies if the request has a valid admin session cookie.
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  const session = cookies.get('syndicate_session');
  return session?.value === 'admin_active';
}
