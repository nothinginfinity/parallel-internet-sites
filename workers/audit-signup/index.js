/**
 * Cloudflare Worker — POST /api/audit-signup
 * AFO v1 dogfood launch. No payment. Founder coupons only.
 */

const VALID_COUPONS = ['AFO-FOUNDER', 'AFO-DOGFOOD'];
const REQUIRED_FIELDS = ['name', 'email', 'business_name', 'website_url'];

const GH_HEADERS = (token) => ({
  Authorization: `Bearer ${token.trim()}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'afo-audit-worker/1.0',
  'X-GitHub-Api-Version': '2022-11-28',
});

const TEST_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AFO Worker Test</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
  button { background: #0070f3; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; width: 100%; cursor: pointer; margin-top: 12px; }
  pre { background: #1a1a1a; color: #0f0; padding: 16px; border-radius: 8px; font-size: 13px; overflow-x: auto; white-space: pre-wrap; margin-top: 16px; min-height: 60px; }
</style>
</head>
<body>
<h2>AFO Worker Test</h2>
<p>Fires a POST to /api/audit-signup with founder coupon.</p>
<button onclick="runTest()">🚀 Send Test Signup</button>
<pre id="out">Result will appear here…</pre>
<script>
async function runTest() {
  const out = document.getElementById('out');
  out.textContent = 'Sending…';
  try {
    const res = await fetch('/api/audit-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jared Test',
        email: 'getfitdoc@me.com',
        business_name: 'AFO Test Co',
        website_url: 'agentfeedoptimization.com',
        coupon_code: 'AFO-FOUNDER',
        cf_turnstile_response: 'SKIP'
      })
    });
    const data = await res.json();
    out.textContent = JSON.stringify(data, null, 2);
  } catch(e) {
    out.textContent = 'Error: ' + e.message;
  }
}
</script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({ ok: true, version: 'afo-v1' });
    }

    // DEV ONLY: diagnose GitHub token
    if (url.pathname === '/api/gh-check' && request.method === 'GET') {
      const token = env.GITHUB_TOKEN || '';
      const tokenPreview = token ? token.slice(0, 8) + '...' + token.slice(-4) : '(empty)';
      const tokenLength = token.length;
      const hasWhitespace = /[\s\r\n]/.test(token);

      let githubStatus = null;
      let githubBody = null;
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: GH_HEADERS(token),
        });
        githubStatus = res.status;
        githubBody = await res.text();
      } catch (err) {
        githubBody = 'fetch error: ' + err.message;
      }

      return json({
        token_preview: tokenPreview,
        token_length: tokenLength,
        has_whitespace: hasWhitespace,
        github_status: githubStatus,
        github_response: githubBody.slice(0, 300),
      });
    }

    if (url.pathname === '/test' && request.method === 'GET') {
      return new Response(TEST_PAGE, { headers: { 'Content-Type': 'text/html' } });
    }

    if (url.pathname === '/api/audit-signup' && request.method === 'POST') {
      return handleAuditSignup(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleAuditSignup(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || String(body[field]).trim() === '') {
      return json({ ok: false, error: `Missing required field: ${field}` }, 400);
    }
  }

  const email = String(body.email).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'Invalid email address' }, 400);
  }

  let websiteUrl = String(body.website_url).trim();
  if (!/^https?:\/\//i.test(websiteUrl)) {
    websiteUrl = 'https://' + websiteUrl;
  }
  try {
    new URL(websiteUrl);
  } catch {
    return json({ ok: false, error: 'Invalid website_url' }, 400);
  }

  if (env.TURNSTILE_SECRET && env.TURNSTILE_SECRET !== 'SKIP_IN_DEV') {
    const tsToken = body.cf_turnstile_response;
    if (!tsToken) {
      return json({ ok: false, error: 'Missing Turnstile token' }, 400);
    }
    const tsResult = await verifyTurnstile(tsToken, env.TURNSTILE_SECRET);
    if (!tsResult.success) {
      return json({ ok: false, error: 'Turnstile verification failed' }, 400);
    }
  }

  const couponRaw = body.coupon_code ? String(body.coupon_code).trim().toUpperCase() : null;
  const couponValid = couponRaw ? VALID_COUPONS.includes(couponRaw) : false;
  const plan = couponValid ? 'founder_free' : 'audit_only_v1';

  const name = String(body.name).trim();
  const businessName = String(body.business_name).trim();
  const role = body.role ? String(body.role).trim() : null;
  const source = body.source || 'afo_site';
  const launchPhase = body.launch_phase || 'dogfood_v1';

  let customer, auditRequest;
  try {
    customer = await upsertCustomer(env.DB, { email, name, businessName, role });
    auditRequest = await createAuditRequest(env.DB, {
      customerId: customer.id,
      customerEmail: email,
      customerName: name,
      businessName,
      websiteUrl,
      couponCode: couponRaw,
      plan,
      source,
      launchPhase,
    });
  } catch (err) {
    return json({ ok: false, error: 'DB error', detail: err.message }, 500);
  }

  if (couponRaw) {
    try {
      await logCouponRedemption(env.DB, {
        customerId: customer.id,
        auditRequestId: auditRequest.id,
        couponCode: couponRaw,
      });
    } catch (err) {
      console.error('[COUPON] Redemption log failed:', err.message);
    }
  }

  const emailResult = await sendEmails(env, { email, name, businessName, websiteUrl, plan, auditRequestId: auditRequest.id });
  const githubResult = await createGitHubIssue(env, { email, name, businessName, websiteUrl, plan, couponCode: couponRaw, auditRequestId: auditRequest.id });

  return json({
    ok: true,
    message: 'Audit request received.',
    audit_request_id: auditRequest.id,
    plan,
    _debug: {
      email: emailResult,
      github: githubResult,
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function verifyTurnstile(token, secret) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });
  return res.json();
}

async function upsertCustomer(DB, { email, name, businessName, role }) {
  const existing = await DB.prepare('SELECT * FROM customers WHERE email = ?').bind(email).first();
  if (existing) return existing;

  const id = crypto.randomUUID();
  await DB.prepare(
    `INSERT INTO customers (id, email, name, business_name, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, email, name, businessName, role, new Date().toISOString()).run();

  return { id, email, name, business_name: businessName, role };
}

async function createAuditRequest(DB, { customerId, customerEmail, customerName, businessName, websiteUrl, couponCode, plan, source, launchPhase }) {
  const id = crypto.randomUUID();
  await DB.prepare(
    `INSERT INTO audit_requests
     (id, customer_id, customer_email, customer_name, business_name, website_url,
      coupon_code, plan, status, source, launch_phase, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
  ).bind(id, customerId, customerEmail, customerName, businessName, websiteUrl,
    couponCode, plan, source, launchPhase, new Date().toISOString()).run();

  return { id };
}

async function logCouponRedemption(DB, { customerId, auditRequestId, couponCode }) {
  const id = crypto.randomUUID();
  await DB.prepare(
    `INSERT INTO coupon_redemptions (id, customer_id, audit_request_id, coupon_code, redeemed_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(id, customerId, auditRequestId, couponCode, new Date().toISOString()).run();
}

async function sendEmails(env, { email, name, businessName, websiteUrl, plan, auditRequestId }) {
  const provider = (env.EMAIL_PROVIDER || 'log').toLowerCase();

  const confirmationSubject = `Your free AFO audit request has been received`;
  const confirmationText = `Hi ${name},\n\nThanks for signing up for a free Agent Feed Optimization audit for ${businessName} (${websiteUrl}).\n\nWe'll review your site and be in touch shortly with next steps.\n\nYour request ID: ${auditRequestId}\nPlan: ${plan}\n\n— The AFO Team`;

  const adminSubject = `[AFO-SIGNUP] New audit request: ${businessName}`;
  const adminText = `New audit signup received.\n\nName: ${name}\nEmail: ${email}\nBusiness: ${businessName}\nWebsite: ${websiteUrl}\nPlan: ${plan}\nRequest ID: ${auditRequestId}`;

  if (provider === 'resend') {
    const r1 = await sendResend(env, { to: email, subject: confirmationSubject, text: confirmationText });
    const r2 = await sendResend(env, { to: env.ADMIN_EMAIL, subject: adminSubject, text: adminText });
    return { provider: 'resend', confirmation: r1, admin: r2 };
  } else if (provider === 'sendgrid') {
    const r1 = await sendSendGrid(env, { to: email, subject: confirmationSubject, text: confirmationText });
    const r2 = await sendSendGrid(env, { to: env.ADMIN_EMAIL, subject: adminSubject, text: adminText });
    return { provider: 'sendgrid', confirmation: r1, admin: r2 };
  } else {
    console.log('[EMAIL LOG] To customer:', JSON.stringify({ to: email, subject: confirmationSubject }));
    console.log('[EMAIL LOG] To admin:', JSON.stringify({ to: env.ADMIN_EMAIL, subject: adminSubject }));
    return { provider: 'log' };
  }
}

async function sendResend(env, { to, subject, text }) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, text }),
    });
    const body = await res.json();
    if (!res.ok) {
      return { ok: false, status: res.status, error: body };
    }
    return { ok: true, id: body.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function sendSendGrid(env, { to, subject, text }) {
  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: env.EMAIL_FROM },
        subject,
        content: [{ type: 'text/plain', value: text }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, status: res.status, error: body };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function createGitHubIssue(env, { email, name, businessName, websiteUrl, plan, couponCode, auditRequestId }) {
  if (!env.GITHUB_TOKEN) {
    return { ok: false, error: 'No GITHUB_TOKEN configured' };
  }
  const owner = env.GITHUB_REPO_OWNER || 'nothinginfinity';
  const repo = env.GITHUB_REPO_NAME || 'agent-feed-optimization';
  const title = `[AUDIT-REQUEST] ${businessName} — ${plan}`;
  const body = [
    `## New AFO Audit Request`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    `| **Name** | ${name} |`,
    `| **Email** | ${email} |`,
    `| **Business** | ${businessName} |`,
    `| **Website** | ${websiteUrl} |`,
    `| **Plan** | ${plan} |`,
    `| **Coupon** | ${couponCode || 'none'} |`,
    `| **Request ID** | ${auditRequestId} |`,
    ``,
    `**Next step:** Alice converts this to \`agent-feed-optimization/jobs/YYYY-MM-DD-${slugify(businessName)}/job.json\` after Jared approves.`,
  ].join('\n');

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: GH_HEADERS(env.GITHUB_TOKEN),
      body: JSON.stringify({ title, body, labels: ['audit-request', 'dogfood-v1'] }),
    });
    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return { ok: false, status: res.status, raw_response: rawText.slice(0, 300) };
    }
    if (!res.ok) {
      return { ok: false, status: res.status, error: data };
    }
    return { ok: true, issue_number: data.number, url: data.html_url };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
