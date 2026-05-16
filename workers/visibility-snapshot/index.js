/**
 * AFO Visibility Snapshot Worker
 * Routes:
 *   GET  /start                  — serves the snapshot intake form
 *   GET  /results                — serves the results page
 *   POST /api/visibility-snapshot — runs checks, scores, generates prompts
 *
 * DOES NOT touch /api/audit-signup or the audit_requests table.
 */

import START_HTML from './start.html';
import RESULTS_HTML from './results.html';

const BOOKING_URL = 'https://cal.com/jared-edwards-gscxmo';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));

    // ── Static page routes ──────────────────────────────────────
    if (request.method === 'GET' && (url.pathname === '/start' || url.pathname === '/start/')) {
      const siteKey = env.TURNSTILE_SITE_KEY || '';
      const html = START_HTML.replace('{{TURNSTILE_SITE_KEY}}', siteKey);
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (request.method === 'GET' && (url.pathname === '/results' || url.pathname === '/results/')) {
      // Inject booking URL + detect score=0 for error screen
      const scoreParam = url.searchParams.get('score');
      const isUnreachable = scoreParam === '0' || scoreParam === null && url.searchParams.has('error');
      let html = RESULTS_HTML
        .replace('href="#" class="cta-btn" id="ctaBtn"', `href="${BOOKING_URL}" class="cta-btn" id="ctaBtn"`);
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // ── API route ───────────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/api/visibility-snapshot') {
      return cors(await handleSnapshot(request, env));
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ─────────────────────────────────────────────
// CORS helper
// ─────────────────────────────────────────────
function cors(response) {
  const r = new Response(response.body, response);
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return r;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ─────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────
async function handleSnapshot(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  // 1. Validate fields
  const validationError = validateFields(body);
  if (validationError) return json({ error: validationError }, 400);

  // 2. Normalize URL
  const website_url = normalizeUrl(body.website_url);
  if (!website_url) return json({ error: 'Invalid website URL.' }, 400);

  const domain = extractDomain(website_url);

  // 3. Verify Turnstile
  const tsError = await verifyTurnstile(body['cf-turnstile-response'], env, request);
  if (tsError) return json({ error: tsError }, 403);

  // 4. Rate limiting
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitError = await checkRateLimit(env, ip, body.email, domain);
  if (rateLimitError) return json({ error: rateLimitError }, 429);

  // 5. Run cheap checks
  const checks = await runChecks(website_url);

  // 6. Score
  const { score, max } = scoreChecks(checks);

  // 7. Site unreachable? Return early with dedicated error payload
  const reachableCheck = checks.find(c => c.id === 'reachable');
  if (!reachableCheck?.passed) {
    return json({
      ok: false,
      error: 'unreachable',
      score: 0,
      max: 100,
      message: `We couldn't reach ${domain}. Please double-check the URL and try again. If your site is live, it may have blocked our check — contact us and we can run it manually.`,
      booking_url: BOOKING_URL
    }, 422);
  }

  // 8. Generate prompts
  const prompts = generatePrompts({
    business_name: body.business_name,
    business_category: body.business_category || '',
    city_or_service_area: body.city_or_service_area || '',
    top_services: body.top_services || '',
    ideal_customer: body.ideal_customer || '',
    domain
  });

  // 9. Resolve or create customer in D1
  const customer_id = await resolveCustomer(env, body);

  // 10. Store snapshot
  const snapshot_id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO visibility_snapshots
       (id, customer_id, website_url, snapshot_score, snapshot_json,
        generated_prompts_json, self_test_status, requested_full_audit, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    snapshot_id,
    customer_id,
    website_url,
    score,
    JSON.stringify({ checks, total: score, max }),
    JSON.stringify(prompts),
    body.requested_full_audit === '1' || body.requested_full_audit === true ? 1 : 0,
    created_at
  ).run();

  // 11. Return result
  return json({
    ok: true,
    snapshot_id,
    score,
    max,
    grade: gradeScore(score, max),
    checks,
    prompts,
    requested_full_audit: body.requested_full_audit === '1' || body.requested_full_audit === true,
    booking_url: BOOKING_URL
  });
}

// ─────────────────────────────────────────────
// Field validation
// ─────────────────────────────────────────────
function validateFields(body) {
  const required = ['name', 'email', 'business_name', 'website_url',
                    'business_category', 'city_or_service_area',
                    'top_services', 'ideal_customer'];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === '') {
      return `Missing required field: ${f}`;
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'Invalid email address.';
  }
  if (!body['cf-turnstile-response']) {
    return 'Turnstile verification required.';
  }
  return null;
}

// ─────────────────────────────────────────────
// URL normalization
// ─────────────────────────────────────────────
function normalizeUrl(raw) {
  try {
    let u = String(raw).trim();
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    const parsed = new URL(u);
    return parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname);
  } catch {
    return null;
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ─────────────────────────────────────────────
// Turnstile verification
// ─────────────────────────────────────────────
async function verifyTurnstile(token, env, request) {
  if (!token) return 'Missing Turnstile token.';
  if (!env.TURNSTILE_SECRET) return null;

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const formData = new FormData();
  formData.append('secret', env.TURNSTILE_SECRET);
  formData.append('response', token);
  if (ip) formData.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!data.success) return 'Turnstile verification failed. Please refresh and try again.';
  } catch {
    return 'Turnstile verification error.';
  }
  return null;
}

// ─────────────────────────────────────────────
// Rate limiting (D1-backed)
// ─────────────────────────────────────────────
async function checkRateLimit(env, ip, email, domain) {
  const windowHours = Number(env.SNAPSHOT_RATE_LIMIT_WINDOW_HOURS || 24);
  const maxPerDomain = Number(env.SNAPSHOT_MAX_PER_DOMAIN || 3);
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

  const domainCount = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM visibility_snapshots
     WHERE website_url LIKE ? AND created_at > ?`
  ).bind(`%${domain}%`, since).first('cnt');

  if (domainCount >= maxPerDomain) {
    return `A snapshot for ${domain} was already run recently. Please wait ${windowHours} hours before running another.`;
  }

  const emailCount = await env.DB.prepare(
    `SELECT COUNT(*) as cnt
     FROM visibility_snapshots vs
     JOIN customers c ON vs.customer_id = c.id
     WHERE c.email = ? AND vs.created_at > ?`
  ).bind(email.toLowerCase().trim(), since).first('cnt');

  if (emailCount >= 5) {
    return 'Too many snapshots requested from this email address. Please wait before trying again.';
  }

  return null;
}

// ─────────────────────────────────────────────
// 10 cheap website checks
// ─────────────────────────────────────────────
async function runChecks(websiteUrl) {
  const checks = [
    { id: 'reachable',     label: 'Website reachable',          points: 10 },
    { id: 'robots_txt',    label: 'robots.txt present',         points: 5  },
    { id: 'sitemap_xml',   label: 'sitemap.xml present',        points: 10 },
    { id: 'llms_txt',      label: 'llms.txt present',           points: 20 },
    { id: 'agent_context', label: 'agent-context.json present', points: 15 },
    { id: 'sitemap_agent', label: 'sitemap-agent.xml present',  points: 10 },
    { id: 'title_meta',    label: 'Title + meta description',   points: 10 },
    { id: 'json_ld',       label: 'JSON-LD structured data',    points: 10 },
    { id: 'contact_path',  label: 'Contact page detectable',    points: 5  },
    { id: 'https',         label: 'HTTPS enforced',             points: 5  },
  ];

  const origin = new URL(websiteUrl).origin;

  const settled = await Promise.allSettled([
    headCheck(`${origin}/`),
    headCheck(`${origin}/robots.txt`),
    headCheck(`${origin}/sitemap.xml`),
    headCheck(`${origin}/llms.txt`),
    headCheck(`${origin}/agent-context.json`),
    headCheck(`${origin}/sitemap-agent.xml`),
    fetchTitleMeta(websiteUrl),
    fetchJsonLd(websiteUrl),
    fetchContactPath(origin),
    Promise.resolve(origin.startsWith('https://')),
  ]);

  return checks.map((check, i) => {
    const result = settled[i];
    const passed = result.status === 'fulfilled' && result.value === true;
    return { id: check.id, label: check.label, passed, points: check.points, earned: passed ? check.points : 0 };
  });
}

async function headCheck(url) {
  try {
    const res = await fetchWithTimeout(url, { method: 'HEAD' }, 5000);
    return res.ok || res.status === 405;
  } catch { return false; }
}

async function fetchTitleMeta(url) {
  try {
    const res = await fetchWithTimeout(url, { method: 'GET' }, 8000);
    if (!res.ok) return false;
    const html = await res.text();
    const hasTitle = /<title[^>]*>[^<]{3,}/i.test(html);
    const hasMeta  = /name=["']description["'][^>]*content=["'][^"']{10,}/i.test(html)
                  || /content=["'][^"']{10,}["'][^>]*name=["']description["']/i.test(html);
    return hasTitle && hasMeta;
  } catch { return false; }
}

async function fetchJsonLd(url) {
  try {
    const res = await fetchWithTimeout(url, { method: 'GET' }, 8000);
    if (!res.ok) return false;
    const html = await res.text();
    return /application\/ld\+json/i.test(html);
  } catch { return false; }
}

async function fetchContactPath(origin) {
  const candidates = ['/contact', '/contact-us', '/get-in-touch', '/about'];
  for (const path of candidates) {
    try {
      const res = await fetchWithTimeout(`${origin}${path}`, { method: 'HEAD' }, 4000);
      if (res.ok) return true;
    } catch { /* continue */ }
  }
  return false;
}

function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

// ─────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────
function scoreChecks(checks) {
  const total  = checks.reduce((s, c) => s + c.points, 0);
  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const score  = Math.round((earned / total) * 100);
  return { score, max: 100 };
}

function gradeScore(score) {
  if (score >= 80) return { grade: 'A', label: 'AI-Ready',          color: 'green'  };
  if (score >= 60) return { grade: 'B', label: 'Mostly Visible',    color: 'yellow' };
  if (score >= 40) return { grade: 'C', label: 'Partially Visible', color: 'orange' };
  if (score >= 20) return { grade: 'D', label: 'Low Visibility',    color: 'red'    };
  return               { grade: 'F', label: 'Not Visible to AI',  color: 'red'    };
}

// ─────────────────────────────────────────────
// Ideal Visibility Prompt generator
// (deterministic — zero LLM API calls)
// ─────────────────────────────────────────────
function generatePrompts({ business_name, business_category, city_or_service_area,
                           top_services, ideal_customer, domain }) {
  const biz  = business_name.trim();
  const area = city_or_service_area.trim();
  const cat  = humanCategory(business_category);
  const svcs = firstService(top_services);

  return [
    {
      type: 'category_discovery',
      label: 'Category Discovery',
      description: 'Tests whether your business appears when someone asks for options in your category.',
      prompt: area ? `What are the best ${cat} businesses in ${area}?` : `What are the best ${cat} businesses near me?`,
      instructions: `Copy this into ChatGPT, Gemini, Claude, and Perplexity. Does ${biz} appear? Is the description accurate?`
    },
    {
      type: 'problem_solution',
      label: 'Problem / Solution',
      description: 'Tests whether LLMs recommend you when someone has the problem you solve.',
      prompt: svcs ? `I need help with ${svcs} in ${area || 'my area'}. Who do you recommend?` : `I need a ${cat} service in ${area || 'my area'}. Who do you recommend?`,
      instructions: `Does any AI mention ${biz}? If not, your business is invisible for this intent.`
    },
    {
      type: 'local_service_area',
      label: 'Local / Service Area',
      description: 'Tests local visibility for your service area.',
      prompt: area ? `Who provides ${svcs || cat + ' services'} in ${area}?` : `Find a ${cat} service provider near me.`,
      instructions: `This is how local customers search. If ${biz} doesn't appear, local AI visibility is a gap.`
    },
    {
      type: 'service_comparison',
      label: 'Service Comparison',
      description: 'Tests whether your business appears when someone is comparing options.',
      prompt: `Compare the top ${cat} options in ${area || 'my area'} — what should I look for and who stands out?`,
      instructions: `Watch for whether ${biz} is named or described. Comparison queries are high-intent.`
    },
    {
      type: 'direct_brand_accuracy',
      label: 'Direct Brand Accuracy',
      description: 'Tests whether LLMs know your business directly and describe it accurately.',
      prompt: `Tell me about ${biz}${area ? ' in ' + area : ''} — what do they do, who do they serve, and are they reputable?`,
      instructions: `This is your brand accuracy test. Is the description correct? Is the website (${domain}) mentioned?`
    }
  ];
}

function humanCategory(cat) {
  const map = {
    home_services: 'home services', legal: 'legal services', healthcare: 'healthcare',
    financial: 'financial services', real_estate: 'real estate', restaurant_food: 'restaurant',
    retail: 'retail', professional_services: 'professional services', tech_saas: 'technology',
    agency_marketing: 'marketing agency', nonprofit: 'nonprofit', other: 'local business'
  };
  return map[cat] || 'local business';
}

function firstService(top_services) {
  if (!top_services) return '';
  return top_services.split(/[,;\n]/)[0].trim();
}

// ─────────────────────────────────────────────
// Customer resolution (look up or create)
// ─────────────────────────────────────────────
async function resolveCustomer(env, body) {
  const email = body.email.toLowerCase().trim();
  const existing = await env.DB.prepare(
    'SELECT id FROM customers WHERE email = ? LIMIT 1'
  ).bind(email).first('id');

  if (existing) return existing;

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO customers (id, name, email, website_url, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(id, body.name.trim(), email, normalizeUrl(body.website_url), new Date().toISOString()).run();
  return id;
}
