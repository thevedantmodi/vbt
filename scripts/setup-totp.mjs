import * as OTPAuth from 'otpauth';
import { randomBytes } from 'crypto';

const secret = new OTPAuth.Secret({ size: 20 });
const totp = new OTPAuth.TOTP({
  issuer: 'VBT',
  label: 'vedant',
  secret,
  digits: 6,
  period: 30,
  algorithm: 'SHA1',
});

const sessionSecret = randomBytes(32).toString('hex');

console.log('\n=== VBT TOTP Setup ===\n');
console.log('1. Add these to Vercel env vars (Production + Preview):\n');
console.log(`   TOTP_SECRET=${secret.base32}`);
console.log(`   SESSION_SECRET=${sessionSecret}`);
console.log('\n2. Scan this URI with Google Authenticator (or paste into a QR generator):\n');
console.log(`   ${totp.toString()}`);
console.log('\n3. Keep these values secret — do not commit them.\n');
