import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as OTPAuth from 'otpauth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body ?? {};
  const totpSecret = process.env.TOTP_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!totpSecret || !sessionSecret) {
    return res.status(503).json({ error: 'Server misconfigured' });
  }

  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid code format' });
  }

  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(totpSecret),
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  });

  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) return res.status(401).json({ error: 'Invalid code' });

  const ts = Date.now().toString();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(sessionSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ts));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));
  const token = encodeURIComponent(`${ts}.${sig}`);

  res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${30 * 24 * 60 * 60}`);
  res.json({ ok: true });
}
