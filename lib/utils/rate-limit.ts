/**
 * Simple in-memory rate limiter for brute-force protection.
 * Tracks attempts per key (typically IP address) within a sliding window.
 *
 * Note: Resets on server restart. Acceptable for a school coaching app.
 * Can be replaced with Redis-backed implementation if horizontal scaling is needed.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Checks whether a key (e.g., IP address) has exceeded the rate limit.
 * Automatically cleans up expired entries on each call.
 *
 * @param key - Identifier to rate-limit (e.g., IP address)
 * @param maxAttempts - Maximum allowed attempts within the window (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns Object with `allowed` (whether the request should proceed) and `remaining` attempts
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Clean up expired entries to prevent memory leaks
  for (const [entryKey, entry] of store) {
    if (now - entry.firstAttempt > windowMs) {
      store.delete(entryKey);
    }
  }

  const entry = store.get(key);

  // No existing entry — first attempt in this window
  if (!entry) {
    store.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Window expired — reset the entry
  if (now - entry.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Within window — increment and check
  entry.count += 1;

  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxAttempts - entry.count };
}

/**
 * Resets the rate limit counter for a key.
 * Called on successful activation to clear failed attempt history.
 *
 * @param key - Identifier to reset (e.g., IP address)
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
