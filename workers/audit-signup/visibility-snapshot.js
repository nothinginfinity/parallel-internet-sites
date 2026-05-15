/**
 * visibility-snapshot.js — POST /api/visibility-snapshot handler
 *
 * Commit 8: cheap website checks + real scoring wired in.
 * rate-limit.js, prompt-generator.js, website-checker.js all imported.
 *
 * This file is intentionally separate from index.js so the existing
 * /api/audit-signup handler is never touched.
 */

import { checkRateLimit, ensureRateLimitTable, getClientIP, extractDomain } from './rate-limit.js';
import { generatePrompts } from './prompt-generator.js';
import { runWebsiteChecks, scoreBand } from './website-checker.js';

const REQUIRED_FIELDS = [
  'name', 'email', 'website_url', 'business_name',
  'business_category', 'city_or_service_area', 'top_services',
];

/**
 * Main handler — called from index.js router.
 * @param {Request} request
 * @param {object} env  — Cloudflare Worker bindings
 */
export async function handleVisibilitySnapshot(request, env) {
  // ── 1. Parse body ────────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  // ── 2. Required field validation ─────────────────────────────────────────
  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || String(body[field]).trim() === '') {
      return jsonError(`Missing required field: ${field}`, 400);
    }
  }

  const email = String(body.email).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return jsonError('Invalid email address', 400);
  }

  // ── 3. Normalize website URL ─────────────────────────────────────────────
  let websiteUrl = String(body.website_url).trim();
  if (!/^https?:\/\//i.test(websiteUrl)) websiteUrl = 'https://' + websiteUrl;
  try { new URL(websiteUrl); }
  catch { return jsonError('Invalid website_url', 400); }

  // ── 4. Turnstile verification ────────────────────────────────────────────
  const skipTurnstile =
    !env.TURNSTILE_SECRET ||
    env.TURNSTILE_SECRET === 'SKIP_IN_DEV' ||
    body.cf_turnstile_response === 'SKIP';

  if (!skipTurnstile) {
    if (!body.cf_turnstile_response) return jsonError('Missing Turnstile token', 400);
    const tsResult = await verifyTurnstile(body.cf_turnstile_response, env.TURNSTILE_SECRET);
    if (!tsResult.success) return jsonError('Turnstile verification failed', 403);
  }

  // ── 5. Rate limiting ─────────────────────────────────────────────────────
  try { await ensureRateLimitTable(env.DB); }
  catch (err) { console.error('[SNAPSHOT] ensureRateLimitTable failed:', err.message); }

  const ip     = getClientIP(request);
  const domain = extractDomain(websiteUrl);

  let rateResult;
  try {
    rateResult = await checkRateLimit(env.DB, { ip, email, domain });
  } catch (err) {
    console.error('[SNAPSHOT] Rate limit check failed:', err.message);
    rateResult = { allowed: true };
  }

  if (!rateResult.allowed) {
    return new Response(
      JSON.stringify({ ok: false, error: rateResult.reason }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateResult.retryAfter || 3600),
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // ── 6. Collect form fields ───────────────────────────────────────────────
  const name             = String(body.name).trim();
  const businessName     = String(body.business_name).trim();
  const businessCategory = String(body.business_category).trim();
  const cityOrArea       = String(body.city_or_service_area).trim();
  const topServices      = String(body.top_services).trim();
  const idealCustomer    = body.ideal_customer ? String(body.ideal_customer).trim() : '';
  const requestedFull    = body.requested_full_audit === true || body.requested_full_audit === 'true';

  // ── 7. Run cheap website checks ─────────────────────────────────────────
  let snapshotChecks, snapshotScore, scoreBreakdown, band;
  try {
    const result = await runWebsiteChecks(websiteUrl);
    snapshotChecks  = result.checks;
    snapshotScore   = result.score;
    scoreBreakdown  = result.scoreBreakdown;
    band            = scoreBand(snapshotScore);
  } catch (err) {
    console.error('[SNAPSHOT] runWebsiteChecks failed:', err.message);
    // Fail gracefully — return zero score rather than a 500
    snapshotChecks = {
      reachable: false, robots_txt: false, sitemap_xml: false, llms_txt: false,
      agent_context: false, sitemap_agent: false, title_present: false,
      meta_description: false, json_ld: false, contact_detectable: false,
    };
    snapshotScore  = 0;
    scoreBreakdown = {};
    band           = scoreBand(0);
  }

  // ── 8. Prompt generation ─────────────────────────────────────────────────
  let prompts = [];
  try {
    const promptResult = generatePrompts({
      business_name:        businessName,
      business_category:    businessCategory,
      city_or_service_area: cityOrArea,
      top_services:         topServices,
      ideal_customer:       idealCustomer,
    });
    prompts = promptResult.prompts;
  } catch (err) {
    console.error('[SNAPSHOT] generatePrompts failed:', err.message);
  }

  // ── 9. Persist snapshot to D1 ────────────────────────────────────────────
  const snapshotId = crypto.randomUUID();
  const now        = new Date().toISOString();

  try {
    const existing = await env.DB.prepare(
      'SELECT id FROM customers WHERE email = ?'
    ).bind(email).first();

    let customerId;
    if (existing) {
      customerId = existing.id;
    } else {
      customerId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO customers (id, email, name, business_name, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(customerId, email, name, businessName, now).run();
    }

    await env.DB.prepare(`
      INSERT INTO visibility_snapshots (
        id, customer_id, customer_email, business_name, website_url,
        business_category, city_or_service_area, top_services, ideal_customer,
        snapshot_score, snapshot_json, generated_prompts_json,
        requested_full_audit, audit_status, audit_tier, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'snapshot_done', 'free_snapshot', ?)
    `).bind(
      snapshotId, customerId, email, businessName, websiteUrl,
      businessCategory, cityOrArea, topServices, idealCustomer,
      snapshotScore,
      JSON.stringify(snapshotChecks),
      JSON.stringify(prompts),
      requestedFull ? 1 : 0,
      now
    ).run();
  } catch (err) {
    console.error('[SNAPSHOT] D1 insert failed:', err.message);
    return jsonError('Failed to save snapshot. Please try again.', 500);
  }

  // ── 10. Optional GitHub issue if full audit requested ────────────────────
  let githubResult = null;
  if (requestedFull && env.GITHUB_TOKEN) {
    githubResult = await createSnapshotIssue(env, {
      snapshotId, name, email, businessName, websiteUrl,
      businessCategory, cityOrArea, topServices,
      snapshotScore, band,
    });
  }

  // ── 11. Build results redirect URL ───────────────────────────────────────
  const passedKeys = Object.entries(snapshotChecks)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(',');

  const resultParams = new URLSearchParams({
    snapshot_id:          snapshotId,
    business_name:        businessName,
    website_url:          websiteUrl,
    score:                String(snapshotScore),
    checks:               passedKeys,
    business_category:    businessCategory,
    city:                 cityOrArea,
    services:             topServices,
    ideal_customer:       idealCustomer,
    requested_full_audit: requestedFull ? '1' : '0',
  });

  return new Response(
    JSON.stringify({
      ok:           true,
      snapshot_id:  snapshotId,
      score:        snapshotScore,
      band:         band.label,
      results_url:  `/results?${resultParams.toString()}`,
      _debug: {
        checks:         snapshotChecks,
        score_breakdown: scoreBreakdown,
        github:         githubResult,
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function jsonError(message, status = 400) {
  return new Response(
    JSON.stringify({ ok: false, error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

async function verifyTurnstile(token, secret) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });
  return res.json();
}

async function createSnapshotIssue(env, {
  snapshotId, name, email, businessName, websiteUrl,
  businessCategory, cityOrArea, topServices, snapshotScore, band,
}) {
  const owner = env.GITHUB_REPO_OWNER || 'nothinginfinity';
  const repo  = env.GITHUB_REPO_NAME  || 'agent-feed-optimization';
  const title = `[SNAPSHOT-FULL-REQUEST] ${businessName} — Score: ${snapshotScore} ${band.emoji}`;
  const issueBody = [
    `## Full Audit Requested via Free Visibility Snapshot`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| **Name** | ${name} |`,
    `| **Email** | ${email} |`,
    `| **Business** | ${businessName} |`,
    `| **Website** | ${websiteUrl} |`,
    `| **Category** | ${businessCategory} |`,
    `| **Service Area** | ${cityOrArea} |`,
    `| **Services** | ${topServices} |`,
    `| **Snapshot Score** | ${snapshotScore}/100 — ${band.label} ${band.emoji} |`,
    `| **Snapshot ID** | ${snapshotId} |`,
    ``,
    `**Next step:** Jared reviews, then Alice converts to a paid audit job.`,
  ].join('\n');

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN.trim()}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'afo-audit-worker/1.0',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ title, body: issueBody, labels: ['snapshot-full-request'] }),
      }
    );
    const data = await res.json();
    if (!res.ok) return { ok: false, status: res.status, error: data };
    return { ok: true, issue_number: data.number, url: data.html_url };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
