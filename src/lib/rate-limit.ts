/**
 * In-memory rate limiter for simple abuse protection.
 *
 * For a multi-instance deployment, this should be swapped out with
 * a Redis-backed rate limiter (e.g. upstash/ratelimit).
 */

interface RateLimitStore {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitStore>();

/**
 * Checks if a particular key (e.g. IP + Action) has exceeded its limit.
 *
 * @param key Unique identifier for the rate limit bucket (e.g. \`req.ip + ":register"\`)
 * @param limit Maximum number of requests allowed in the window.
 * @param windowMs Duration of the window in milliseconds.
 * @returns \`true\` if the request is ALLOWED (under the limit), \`false\` if BLOCKED.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record || record.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  store.set(key, record);
  return true;
}

/** Clear old entries to prevent memory leaks in long-running processes. */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt < now) {
      store.delete(key);
    }
  }
}

// Periodically clean up
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 60_000).unref();
}
