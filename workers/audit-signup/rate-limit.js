/**
 * rate-limit.js — D1-backed rate limiting for /api/visibility-snapshot
 *
 * Uses a single `rate_limits` table. No KV namespace required.
 * Lazy expiry: expired rows are pruned on each check.
 *
 * Limits enforced (all configurable via LIMITS constant):
 *   - per IP:     3 snapshots per 24h
 *   - per email:  2 snapshots per 24h
 *   - per domain: 1 snapshot per 24h
 */

const LIMITS = {
  ip:     { max: 3, windowSeconds: 86400 },
  email:  { max: 2, windowSeconds: 86400 },
  domain: { max: 1, windowSeconds: 86400 },
};

/**
 * Ensure the rate_limits table exists.
 * Called once at worker startup via the route handler.
 */
export async function ensureRateLimitTable(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key          TEXT PRIMARY KEY,
      count        INTEGER NOT NULL DEFAULT 1,
      window_start INTEGER NOT NULL,
      expires_at   INTEGER NOT NULL
    )
  `).run();
}

/**
 * Check and increment rate limit counters for a snapshot request.
 *
 * @param {D1Database} DB
 * @param {{ ip: string, email: string, domain: string }} identifiers
 * @returns {{ allowed: boolean, reason?: string, retryAfter?: number }}
 */
export async function checkRateLimit(DB, { ip, email, domain }) {
  const now = Math.floor(Date.now() / 1000);

  // Prune expired rows (lazy GC — keep table small)
  await DB.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now).run();

  const checks = [
    { type: 'ip',     value: ip },
    { type: 'email',  value: email },
    { type: 'domain', value: domain },
  ];

  for (const { type, value } of checks) {
    if (!value) continue;
    const key = `${type}:${value.toLowerCase()}`;
    const limit = LIMITS[type];

    const row = await DB.prepare(
      'SELECT count, expires_at FROM rate_limits WHERE key = ?'
    ).bind(key).first();

    if (row) {
      if (row.count >= limit.max) {
        return {
          allowed: false,
          reason: `Rate limit exceeded for ${type}. Try again later.`,
          retryAfter: row.expires_at - now,
        };
      }
      // Increment counter within existing window
      await DB.prepare(
        'UPDATE rate_limits SET count = count + 1 WHERE key = ?'
      ).bind(key).run();
    } else {
      // First request in this window — insert
      const expiresAt = now + limit.windowSeconds;
      await DB.prepare(
        `INSERT INTO rate_limits (key, count, window_start, expires_at)
         VALUES (?, 1, ?, ?)`
      ).bind(key, now, expiresAt).run();
    }
  }

  return { allowed: true };
}

/**
 * Extract the best available IP from a Cloudflare Workers request.
 * CF-Connecting-IP is always set in production.
 */
export function getClientIP(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Extract the root domain from a full URL string.
 * e.g. "https://www.example.com/path" → "example.com"
 */
export function extractDomain(websiteUrl) {
  try {
    const u = new URL(
      /^https?:\/\//i.test(websiteUrl) ? websiteUrl : 'https://' + websiteUrl
    );
    // Strip www. prefix for deduplication
    return u.hostname.replace(/^www\./, '');
  } catch {
    return websiteUrl.toLowerCase().trim();
  }
}
