import { next } from '@vercel/edge';

export const config = { matcher: '/:path*' };

export default function middleware(request: Request) {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    return new Response('Server misconfigured: APP_PASSWORD not set', { status: 503 });
  }

  const auth = request.headers.get('authorization');
  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      const [, pass] = atob(encoded).split(':');
      if (pass === password) return next();
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="vbt"' },
  });
}
