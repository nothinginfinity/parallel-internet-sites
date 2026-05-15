/**
 * Cloudflare Worker — POST /api/audit-signup
 * AFO v1 dogfood launch. No payment. Founder coupons only.
 */

const VALID_COUPONS = ['AFO-FOUNDER', 'AFO-DOGFOOD'];
const REQUIRED_FIELDS = ['name', 'email', 'business_name', 'website_url'];

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

    // Health check
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({ ok: true, version: 'afo-v1' });
    }

    // Test page — DEV ONLY, remove before public launch
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

  const customer = await upsertCustomer(env.DB, { email, name, businessName, role });
  const auditRequest = await createAuditRequest(env.DB, {
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

  if (couponRaw) {
    await logCouponRedemption(env.DB, {
      customerId: customer.id,
      auditRequestId: auditRequest.id,
      couponCode: couponRaw,
    });
  }

  await sendEmails(env, { email, name, businessName, websiteUrl, plan, auditRequestId: auditRequest.id });
  await createGitHubIssue(env, { email, name, businessName, websiteUrl, plan, couponCode: couponRaw, auditRequestId: auditRequest.id });

  return json({
    ok: true,
    message: 'Audit request received.',
    audit_request_id: auditRequest.id,
    plan,
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
    await sendResend(env, { to: email, subject: confirmationSubject, text: confirmationText });
    await sendResend(env, { to: env.ADMIN_EMAIL, subject: adminSubject, text: adminText });
  } else if (provider === 'sendgrid') {
    await sendSendGrid(env, { to: email, subject: confirmationSubject, text: confirmationText });
    await sendSendGrid(env, { to: env.ADMIN_EMAIL, subject: adminSubject, text: adminText });
  } else {
    console.log('[EMAIL LOG] To customer:', JSON.stringify({ to: email, subject: confirmationSubject }));
    console.log('[EMAIL LOG] To admin:', JSON.stringify({ to: env.ADMIN_EMAIL, subject: adminSubject }));
  }
}

async function sendResend(env, { to, subject, text }) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, text }),
  });
}

async function sendSendGrid(env, { to, subject, text }) {
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: env.EMAIL_FROM },
      subject,
      content: [{ type: 'text/plain', value: text }],
    }),
  });
}

async function createGitHubIssue(env, { email, name, businessName, websiteUrl, plan, couponCode, auditRequestId }) {
  if (!env.GITHUB_TOKEN) {
    console.log('[GITHUB] No token configured, skipping issue creation.');
    return;
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

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ title, body, labels: ['audit-request', 'dogfood-v1'] }),
  });
  if (!res.ok) {
    console.error('[GITHUB] Issue creation failed:', res.status, await res.text());
  }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
