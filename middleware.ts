import { next } from '@vercel/edge';

export const config = { matcher: '/:path*' };

const BYPASS = [
  '/login.html',
  '/api/auth/',
  '/favicon',
  '/apple-touch-icon',
  '/site.webmanifest',
  '/robots.txt',
];

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  if (BYPASS.some(p => url.pathname.startsWith(p))) return next();

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return new Response('Server misconfigured: SESSION_SECRET not set', { status: 503 });
  }

  const cookie = getCookie(request.headers.get('cookie') ?? '', 'session');
  if (cookie && await verifySession(cookie, sessionSecret)) return next();

  return Response.redirect(new URL('/login.html', request.url), 302);
}

function getCookie(header: string, name: string): string | null {
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function verifySession(token: string, secret: string): Promise<boolean> {
  try {
    const dot = token.indexOf('.');
    if (dot === -1) return false;
    const ts = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const age = Date.now() - parseInt(ts, 10);
    if (age > 30 * 24 * 60 * 60 * 1000 || age < 0) return false;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const sigBytes = Uint8Array.from(atob(sig), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(ts));
  } catch {
    return false;
  }
}
