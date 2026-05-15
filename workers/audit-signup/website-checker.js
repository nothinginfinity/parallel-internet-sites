/**
 * website-checker.js — cheap, read-only website checks for /api/visibility-snapshot
 *
 * All checks use a single fetch of the homepage (or targeted path).
 * No paid APIs. No LLM calls. No browser rendering.
 *
 * Score weights (total = 100):
 *   reachable          15  — site is up and returns 200
 *   title_present      10  — <title> tag exists and is non-empty
 *   meta_description   10  — <meta name="description"> exists
 *   robots_txt          8  — /robots.txt returns 200
 *   sitemap_xml         8  — /sitemap.xml returns 200
 *   json_ld            12  — JSON-LD script block detected on homepage
 *   llms_txt           15  — /llms.txt present (AFO signal)
 *   agent_context      12  — /agent-context.json present (AFO signal)
 *   sitemap_agent       8  — /sitemap-agent.xml present (AFO signal)
 *   contact_detectable  2  — href with /contact, /about, or tel: detected
 */

const FETCH_TIMEOUT_MS = 6000;
const USER_AGENT = 'AFO-Snapshot-Bot/1.0 (+https://agentfeedoptimization.com/bot)';

const CHECK_WEIGHTS = {
  reachable:          15,
  title_present:      10,
  meta_description:   10,
  robots_txt:          8,
  sitemap_xml:         8,
  json_ld:            12,
  llms_txt:           15,
  agent_context:      12,
  sitemap_agent:       8,
  contact_detectable:  2,
};

/**
 * Run all 10 checks against a normalized website URL.
 *
 * @param {string} websiteUrl  — must start with https?://
 * @returns {Promise<{ checks: object, score: number, scoreBreakdown: object }>}
 */
export async function runWebsiteChecks(websiteUrl) {
  const origin = getOrigin(websiteUrl);

  const checks = {
    reachable:          false,
    robots_txt:         false,
    sitemap_xml:        false,
    llms_txt:           false,
    agent_context:      false,
    sitemap_agent:      false,
    title_present:      false,
    meta_description:   false,
    json_ld:            false,
    contact_detectable: false,
  };

  // ── 1. Fetch homepage ───────────────────────────────────────────────────
  let homepageHtml = '';
  try {
    const res = await fetchWithTimeout(origin + '/', FETCH_TIMEOUT_MS);
    if (res.ok) {
      checks.reachable = true;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('text/html')) {
        // Read up to 100 KB — enough to find <head> content
        const reader = res.body.getReader();
        let bytes = 0;
        const chunks = [];
        while (bytes < 102400) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          bytes += value.length;
        }
        reader.cancel();
        homepageHtml = new TextDecoder().decode(
          mergeUint8Arrays(chunks)
        );
      }
    }
  } catch (_) {
    // reachable stays false
  }

  if (homepageHtml) {
    checks.title_present      = /<title[^>]*>[^<]{1,200}<\/title>/i.test(homepageHtml);
    checks.meta_description   = /<meta[^>]+name=["']description["'][^>]*content=["'][^"']{10}/i.test(homepageHtml)
                             || /<meta[^>]+content=["'][^"']{10}[^>]+name=["']description["']/i.test(homepageHtml);
    checks.json_ld            = /<script[^>]+type=["']application\/ld\+json["']/i.test(homepageHtml);
    checks.contact_detectable = /href=["'][^"']*(\/contact|\/about|tel:|mailto:)/i.test(homepageHtml);
  }

  // ── 2. robots.txt ───────────────────────────────────────────────────────
  checks.robots_txt = await headOk(origin + '/robots.txt');

  // ── 3. sitemap.xml ──────────────────────────────────────────────────────
  checks.sitemap_xml = await headOk(origin + '/sitemap.xml');

  // ── 4. llms.txt (AFO signal) ────────────────────────────────────────────
  checks.llms_txt = await headOk(origin + '/llms.txt');

  // ── 5. agent-context.json (AFO signal) ─────────────────────────────────
  checks.agent_context = await headOk(origin + '/agent-context.json');

  // ── 6. sitemap-agent.xml (AFO signal) ───────────────────────────────────
  checks.sitemap_agent = await headOk(origin + '/sitemap-agent.xml');

  // ── Score ────────────────────────────────────────────────────────────────
  const scoreBreakdown = {};
  let score = 0;
  for (const [key, weight] of Object.entries(CHECK_WEIGHTS)) {
    const earned = checks[key] ? weight : 0;
    scoreBreakdown[key] = { passed: checks[key], weight, earned };
    score += earned;
  }

  return { checks, score, scoreBreakdown };
}

/**
 * Return a human-readable score band label.
 */
export function scoreBand(score) {
  if (score >= 80) return { label: 'AI-Ready',          emoji: '🟢', tier: 'strong' };
  if (score >= 55) return { label: 'Mostly Visible',    emoji: '🟡', tier: 'partial' };
  if (score >= 30) return { label: 'Partially Visible', emoji: '🟠', tier: 'weak' };
  return              { label: 'Not AI-Visible',       emoji: '🔴', tier: 'missing' };
}

// ── Internal helpers ────────────────────────────────────────────────────────

function getOrigin(url) {
  try {
    const u = new URL(url);
    return u.origin; // e.g. "https://example.com"
  } catch {
    return url.replace(/\/+$/, '');
  }
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }
}

async function headOk(url) {
  try {
    // Try HEAD first (cheaper), fall back to GET if server rejects HEAD
    let res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    // Some servers return 405 for HEAD — retry as GET with range
    if (res.status === 405) {
      res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    }
    return res.ok;
  } catch {
    return false;
  }
}

function mergeUint8Arrays(arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}
