"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// _api/auth/verify.ts
var verify_exports = {};
__export(verify_exports, {
  default: () => handler
});
module.exports = __toCommonJS(verify_exports);
var OTPAuth = __toESM(require("otpauth"));
async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { code } = req.body ?? {};
  const totpSecret = process.env.TOTP_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!totpSecret || !sessionSecret) {
    return res.status(503).json({ error: "Server misconfigured" });
  }
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "Invalid code format" });
  }
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(totpSecret),
    digits: 6,
    period: 30,
    algorithm: "SHA1"
  });
  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) return res.status(401).json({ error: "Invalid code" });
  const ts = Date.now().toString();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ts));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));
  const token = encodeURIComponent(`${ts}.${sig}`);
  res.setHeader("Set-Cookie", `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${30 * 24 * 60 * 60}`);
  res.json({ ok: true });
}
