
import crypto from "crypto";

const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generates a random short URL code.
 * Example: aB72xK9
 */
export function generateShortCode(length = 7) {
  const bytes = crypto.randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += CHARACTERS[bytes[i] % CHARACTERS.length];
  }

  return result;
}

/**
 * Checks whether a custom alias is valid.
 * Allowed:
 *   abc
 *   my-link
 *   summer2026
 */
export function isValidShortCode(code) {
  return /^[A-Za-z0-9_-]{3,50}$/.test(code);
}
