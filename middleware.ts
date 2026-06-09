import { NextRequest, NextResponse } from 'next/server';

export const config = { matcher: '/:path*' };

export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const password = process.env.APP_PASSWORD;

  if (!password) return NextResponse.next();

  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const [, pass] = decoded.split(':');
      if (pass === password) return NextResponse.next();
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="vbt"' },
  });
}
