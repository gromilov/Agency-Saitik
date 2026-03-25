import type { AstroCookies } from 'astro';

/**
 * Verifies if the request has a valid admin session cookie 
 * OR a valid Master Cipher header for high-resonance API calls.
 */
export function isAuthenticated(cookies: AstroCookies, request?: Request): boolean {
  // Check cookie-based session (for browser)
  const session = cookies.get('syndicate_session');
  if (session?.value === 'admin_active') return true;

  // Check Master Cipher header (for cross-agent / CLI calls)
  if (request) {
    const cipher = request.headers.get('X-Syndicate-Cipher');
    const masterCipher = process.env.NEBULA_MASTER_CIPHER || 'SYNDICATE-RES';
    if (cipher === masterCipher) return true;
  }

  return false;
}
