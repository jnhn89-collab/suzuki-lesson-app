import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;
const PORTAL_LINK_TOKEN_PREFIX = "pl_";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createPublicToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export function createPortalLinkToken(linkId: string) {
  return `${PORTAL_LINK_TOKEN_PREFIX}${linkId}`;
}

export function parsePortalLinkToken(token: string) {
  if (!token.startsWith(PORTAL_LINK_TOKEN_PREFIX)) return null;
  const id = token.slice(PORTAL_LINK_TOKEN_PREFIX.length);
  return UUID_PATTERN.test(id) ? id : null;
}

export function hmacIdentifier(value: string, pepper: string) {
  return createHmac("sha256", pepper).update(value).digest("base64url");
}

export function safeEqualString(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
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
