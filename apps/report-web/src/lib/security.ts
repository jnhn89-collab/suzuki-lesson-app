import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

export function createPublicToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export function hmacIdentifier(value: string, pepper: string) {
  return createHmac("sha256", pepper).update(value).digest("base64url");
}

export function hashPassword(secret: string) {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(secret, salt, SCRYPT_KEY_LENGTH).toString("base64url");
  return `scrypt$${salt}$${key}`;
}

export function verifyPassword(secret: string, stored: string) {
  const [scheme, salt, key] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  const actual = scryptSync(secret, salt, SCRYPT_KEY_LENGTH);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

