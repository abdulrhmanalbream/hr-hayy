import "server-only";

/**
 * In-memory login throttle (single-process; resets on restart/redeploy).
 * Good enough to stop scripted brute-force without adding an external
 * dependency or a DB round-trip on every request.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 8;

const attempts = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, v] of attempts) {
    if (v.resetAt <= now) attempts.delete(key);
  }
}, WINDOW_MS).unref?.();

/** Returns true if `key` is currently locked out from further attempts. */
export function isRateLimited(key: string): boolean {
  const v = attempts.get(key);
  if (!v) return false;
  if (v.resetAt <= Date.now()) {
    attempts.delete(key);
    return false;
  }
  return v.count >= MAX_ATTEMPTS;
}

/** Record a failed attempt for `key`. */
export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const v = attempts.get(key);
  if (!v || v.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  v.count += 1;
}

/** Clear throttle state for `key` (call on successful login). */
export function clearAttempts(key: string): void {
  attempts.delete(key);
}

/** Best-effort client identifier from request headers (behind a proxy, first hop). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
