/**
 * AFO Visibility Snapshot Worker
 * Routes:
 *   GET  /start                   — serves the snapshot intake form
 *   GET  /results                 — serves the results page (reads ?d= param)
 *   POST /api/visibility-snapshot — runs checks, scores, generates prompts
 *
 * Env vars:
 *   TURNSTILE_SITE_KEY   — public Turnstile site key (injected into form HTML)
 *   TURNSTILE_SECRET     — Turnstile secret for server-side verify
 *   DB                   — D1 database binding
 *   NOTIFY_EMAIL         — email address to receive lead notifications (e.g. jared@agentfeedoptimization.com)
 *   NOTIFY_FROM          — sender address for MailChannels (e.g. noreply@agentfeedoptimization.com)
 *   SNAPSHOT_RATE_LIMIT_WINDOW_HOURS — default 24
 *   SNAPSHOT_MAX_PER_DOMAIN          — default 3
 */

const BOOKING_URL = 'https://cal.com/jared-edwards-gscxmo';

// ─────────────────────────────────────────────
// Inlined HTML pages
// ─────────────────────────────────────────────
const START_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free AFO Visibility Snapshot — Agent Feed Optimization</title>
  <meta name="description" content="Find out whether your business appears in AI chat. Get your free AFO Visibility Snapshot in 60 seconds.">
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer><\/script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --teal:       #01696f;
      --teal-dark:  #0c4e54;
      --teal-light: #cedcd8;
      --bg:         #f7f6f2;
      --surface:    #ffffff;
      --border:     #dcd9d5;
      --text:       #28251d;
      --muted:      #7a7974;
      --red:        #a12c7b;
      --red-bg:     #e0ced7;
      --radius:     0.75rem;
      --radius-sm:  0.375rem;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem 1rem 4rem;
    }
    .container { max-width: 600px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 2rem; }
    .eyebrow {
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.09em; text-transform: uppercase;
      color: var(--teal); margin-bottom: 0.5rem;
    }
    .header h1 {
      font-size: clamp(1.5rem, 4vw, 2.1rem);
      font-weight: 800; line-height: 1.15; margin-bottom: 0.6rem;
    }
    .header p { color: var(--muted); font-size: 0.95rem; line-height: 1.55; max-width: 48ch; margin: 0 auto; }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem 1.5rem;
      margin-bottom: 1.25rem;
    }
    .card-title {
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.07em; text-transform: uppercase;
      color: var(--teal); margin-bottom: 1.25rem;
    }
    .form-grid { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; gap: 1rem; }
    @media (min-width: 520px) { .form-row.two { grid-template-columns: 1fr 1fr; } }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    label { font-size: 0.82rem; font-weight: 600; color: var(--text); }
    label .required { color: var(--teal); margin-left: 0.15rem; }
    label .optional { color: var(--muted); font-weight: 400; margin-left: 0.25rem; font-size: 0.78rem; }
    input, select, textarea {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.92rem;
      color: var(--text);
      background: var(--bg);
      transition: border-color 150ms ease, box-shadow 150ms ease;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
    }
    input:focus, select:focus, textarea:focus {
      border-color: var(--teal);
      box-shadow: 0 0 0 3px rgba(1,105,111,0.12);
    }
    textarea { resize: vertical; min-height: 4.5rem; font-family: inherit; line-height: 1.5; }
    select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a7974' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.875rem center; padding-right: 2.25rem; }
    .field-hint { font-size: 0.77rem; color: var(--muted); line-height: 1.4; }
    .checkbox-row {
      display: flex; align-items: flex-start; gap: 0.6rem;
      padding: 1rem; background: var(--bg);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .checkbox-row input[type="checkbox"] {
      width: 1.1rem; height: 1.1rem; flex-shrink: 0;
      margin-top: 0.1rem; accent-color: var(--teal);
      cursor: pointer;
    }
    .checkbox-label { font-size: 0.875rem; line-height: 1.45; color: var(--text); cursor: pointer; }
    .checkbox-label strong { color: var(--teal); }
    .audit-booking {
      display: none;
      margin-top: 0.875rem;
      background: var(--teal);
      border-radius: var(--radius-sm);
      padding: 1rem 1.25rem;
      text-align: center;
    }
    .audit-booking.visible { display: block; }
    .audit-booking p {
      font-size: 0.85rem; color: rgba(255,255,255,0.88); margin-bottom: 0.75rem; line-height: 1.5;
    }
    .audit-booking a {
      display: inline-block;
      background: #fff;
      color: var(--teal-dark);
      font-weight: 700;
      font-size: 0.9rem;
      padding: 0.6rem 1.4rem;
      border-radius: 9999px;
      text-decoration: none;
      transition: opacity 150ms ease;
    }
    .audit-booking a:hover { opacity: 0.9; }
    .turnstile-wrap { display: flex; justify-content: center; margin: 0.5rem 0; }
    .submit-btn {
      width: 100%;
      background: var(--teal);
      color: #fff;
      font-size: 1rem; font-weight: 700;
      padding: 0.9rem 1.5rem;
      border: none; border-radius: 9999px;
      cursor: pointer;
      transition: background 180ms ease;
      margin-top: 0.25rem;
    }
    .submit-btn:hover { background: var(--teal-dark); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .submit-sub {
      text-align: center; font-size: 0.78rem;
      color: var(--muted); margin-top: 0.6rem; line-height: 1.45;
    }
    .form-error {
      background: var(--red-bg); border: 1px solid var(--red);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      font-size: 0.875rem; color: var(--red);
      display: none; margin-top: 0.5rem;
    }
    .loading-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(247,246,242,0.88);
      z-index: 100;
      flex-direction: column;
      align-items: center; justify-content: center;
      gap: 1rem; text-align: center;
    }
    .loading-overlay.active { display: flex; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--teal);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-overlay p { color: var(--muted); font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="eyebrow">Agent Feed Optimization</div>
      <h1>Get Your Free AI<br>Visibility Snapshot</h1>
      <p>Find out whether your business appears when customers ask AI assistants for what you offer.<br>
      Takes 60 seconds. No credit card. No spam.</p>
    </div>

    <form id="snapshotForm" novalidate>
      <div class="card">
        <div class="card-title">About You</div>
        <div class="form-grid">
          <div class="form-row two">
            <div class="field">
              <label for="name">Your Name <span class="required">*</span></label>
              <input type="text" id="name" name="name" placeholder="Jane Smith" autocomplete="name" required>
            </div>
            <div class="field">
              <label for="email">Email Address <span class="required">*</span></label>
              <input type="email" id="email" name="email" placeholder="jane@example.com" autocomplete="email" required>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">About Your Business</div>
        <div class="form-grid">
          <div class="form-row two">
            <div class="field">
              <label for="business_name">Business Name <span class="required">*</span></label>
              <input type="text" id="business_name" name="business_name" placeholder="Acme Plumbing Co." required>
            </div>
            <div class="field">
              <label for="website_url">Website URL <span class="required">*</span></label>
              <input type="url" id="website_url" name="website_url" placeholder="https://yoursite.com" autocomplete="url" required>
            </div>
          </div>
          <div class="form-row two">
            <div class="field">
              <label for="business_category">Business Category <span class="required">*</span></label>
              <select id="business_category" name="business_category" required>
                <option value="" disabled selected>Select a category…</option>
                <option value="home_services">Home Services</option>
                <option value="legal">Legal Services</option>
                <option value="healthcare">Healthcare</option>
                <option value="financial">Financial Services</option>
                <option value="real_estate">Real Estate</option>
                <option value="restaurant_food">Restaurant / Food</option>
                <option value="retail">Retail</option>
                <option value="professional_services">Professional Services</option>
                <option value="tech_saas">Tech / SaaS</option>
                <option value="agency_marketing">Agency / Marketing</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="field">
              <label for="city_or_service_area">City or Service Area <span class="required">*</span></label>
              <input type="text" id="city_or_service_area" name="city_or_service_area" placeholder="San Diego, CA" required>
            </div>
          </div>
          <div class="field">
            <label for="top_services">Top Services / Products <span class="required">*</span></label>
            <textarea id="top_services" name="top_services" placeholder="e.g. Water heater installation, drain cleaning, emergency plumbing" required></textarea>
            <span class="field-hint">List your 2–4 main services, separated by commas.</span>
          </div>
          <div class="field">
            <label for="ideal_customer">Who Is Your Ideal Customer? <span class="required">*</span></label>
            <textarea id="ideal_customer" name="ideal_customer" placeholder="e.g. Homeowners in San Diego who need fast, reliable plumbing help" required></textarea>
            <span class="field-hint">One sentence is fine. This helps us generate accurate visibility prompts.</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Optional</div>
        <label class="checkbox-row">
          <input type="checkbox" id="requested_full_audit" name="requested_full_audit" value="1">
          <span class="checkbox-label">
            <strong>I want a full AFO audit</strong> — contact me about a paid audit or install package.
          </span>
        </label>
        <div class="audit-booking" id="auditBooking">
          <p>Great! Skip the wait — book your free discovery call now and we'll walk you through exactly what's missing.</p>
          <a href="https://cal.com/jared-edwards-gscxmo" target="_blank" rel="noopener noreferrer">Book My Free Discovery Call →</a>
        </div>
      </div>

      <div class="card">
        <div class="turnstile-wrap">
          <div class="cf-turnstile" data-sitekey="{{TURNSTILE_SITE_KEY}}" data-theme="light"></div>
        </div>
        <div class="form-error" id="formError"></div>
        <button type="submit" class="submit-btn" id="submitBtn">
          Run My Free Visibility Snapshot →
        </button>
        <p class="submit-sub">No spam. No credit card. Results appear immediately.</p>
      </div>
    </form>
  </div>

  <div class="loading-overlay" id="loadingOverlay">
    <div class="spinner"></div>
    <p>Running your visibility snapshot…<br><span style="font-size:0.82rem">Checking 10 signals — usually under 15 seconds</span></p>
  </div>

  <script>
    const SNAPSHOT_URL = '/api/visibility-snapshot';

    document.getElementById('requested_full_audit').addEventListener('change', function() {
      document.getElementById('auditBooking').classList.toggle('visible', this.checked);
    });

    function showError(msg) {
      const el = document.getElementById('formError');
      el.textContent = msg; el.style.display = 'block';
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    function clearError() {
      const el = document.getElementById('formError');
      el.textContent = ''; el.style.display = 'none';
    }

    document.getElementById('snapshotForm').addEventListener('submit', async (e) => {
      e.preventDefault(); clearError();
      const btn = document.getElementById('submitBtn');
      const overlay = document.getElementById('loadingOverlay');
      const fd = new FormData(e.target);
      const body = {};
      for (const [k, v] of fd.entries()) body[k] = v;
      body.requested_full_audit = fd.has('requested_full_audit') ? '1' : '0';
      const required = ['name','email','business_name','website_url','business_category','city_or_service_area','top_services','ideal_customer'];
      for (const f of required) {
        if (!body[f] || String(body[f]).trim() === '') {
          showError('Please fill in all required fields (missing: ' + f.replace(/_/g,' ') + ').');
          return;
        }
      }
      const tsToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
      if (!tsToken) { showError('Please complete the security check before submitting.'); return; }
      body['cf-turnstile-response'] = tsToken;
      btn.disabled = true; overlay.classList.add('active');
      try {
        const res = await fetch(SNAPSHOT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          overlay.classList.remove('active'); btn.disabled = false;
          showError(data.error || 'Something went wrong. Please try again.'); return;
        }
        // Attach meta for results page rendering
        data._meta = { business_name: body.business_name, city_or_service_area: body.city_or_service_area, top_services: body.top_services };
        // Pass full result as base64url-encoded JSON in query param — no sessionStorage needed
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,'');
        window.location.href = '/results?d=' + encoded;
      } catch (err) {
        overlay.classList.remove('active'); btn.disabled = false;
        showError('Network error. Please check your connection and try again.');
      }
    });
  <\/script>
</body>
</html>`;

const RESULTS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AFO Visibility Snapshot</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --teal:#01696f;--teal-dark:#0c4e54;--teal-light:#cedcd8;
      --bg:#f7f6f2;--surface:#ffffff;--border:#dcd9d5;
      --text:#28251d;--muted:#7a7974;--faint:#bab9b4;
      --green:#437a22;--green-bg:#d4dfcc;
      --red:#a12c7b;--red-bg:#e0ced7;
      --orange:#964219;--orange-bg:#ddcfc6;
      --yellow:#d19900;--yellow-bg:#e9e0c6;
      --radius:0.75rem;--radius-sm:0.375rem;
    }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding:2rem 1rem 4rem; }
    .container { max-width:680px;margin:0 auto; }
    .loading { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;min-height:60vh;text-align:center;color:var(--muted); }
    .spinner { width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--teal);border-radius:50%;animation:spin 0.8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .unreachable-state { display:none;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:2.5rem 2rem;text-align:center;margin-top:1rem; }
    .unreachable-icon { font-size:2.5rem;margin-bottom:1rem; }
    .unreachable-state h2 { font-size:1.3rem;font-weight:700;color:var(--text);margin-bottom:0.6rem; }
    .unreachable-state p { color:var(--muted);font-size:0.92rem;line-height:1.6;max-width:44ch;margin:0 auto 1.5rem; }
    .unreachable-actions { display:flex;flex-direction:column;gap:0.75rem;align-items:center; }
    .btn-primary { display:inline-block;background:var(--teal);color:#fff;font-weight:700;font-size:0.92rem;padding:0.7rem 1.5rem;border-radius:9999px;text-decoration:none;transition:background 180ms ease; }
    .btn-primary:hover { background:var(--teal-dark); }
    .btn-secondary { display:inline-block;background:transparent;color:var(--teal);font-weight:600;font-size:0.88rem;padding:0.6rem 1.25rem;border-radius:9999px;border:1px solid var(--teal);text-decoration:none;transition:background 180ms ease; }
    .btn-secondary:hover { background:var(--teal-light); }
    .error-state { background:var(--red-bg);border:1px solid var(--red);border-radius:var(--radius);padding:1.5rem;text-align:center;display:none; }
    .error-state h2 { color:var(--red);margin-bottom:0.5rem; }
    #results { display:none; }
    .header { text-align:center;margin-bottom:2rem; }
    .header .eyebrow { font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--teal);margin-bottom:0.5rem; }
    .header h1 { font-size:clamp(1.4rem,4vw,2rem);font-weight:700;line-height:1.2;margin-bottom:0.5rem; }
    .header .subtitle { color:var(--muted);font-size:0.95rem; }
    .score-card { background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:2rem 1.5rem;text-align:center;margin-bottom:1.5rem; }
    .score-ring { width:120px;height:120px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 1rem;border:6px solid; }
    .score-ring .score-number { font-size:2.25rem;font-weight:800;line-height:1; }
    .score-ring .score-max { font-size:0.75rem;color:var(--muted);margin-top:0.15rem; }
    .grade-badge { display:inline-flex;align-items:center;gap:0.4rem;padding:0.35rem 0.9rem;border-radius:9999px;font-size:0.85rem;font-weight:600;margin-bottom:0.75rem; }
    .grade-label { font-size:1rem;font-weight:600;margin-bottom:0.25rem; }
    .grade-sub { font-size:0.875rem;color:var(--muted); }
    .grade-green { border-color:var(--green);color:var(--green);background:var(--green-bg); }
    .badge-green { background:var(--green-bg);color:var(--green); }
    .grade-yellow { border-color:var(--yellow);color:var(--yellow);background:var(--yellow-bg); }
    .badge-yellow { background:var(--yellow-bg);color:var(--yellow); }
    .grade-orange { border-color:var(--orange);color:var(--orange);background:var(--orange-bg); }
    .badge-orange { background:var(--orange-bg);color:var(--orange); }
    .grade-red { border-color:var(--red);color:var(--red);background:var(--red-bg); }
    .badge-red { background:var(--red-bg);color:var(--red); }
    .card { background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;margin-bottom:1.25rem; }
    .card-title { font-size:0.75rem;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:var(--teal);margin-bottom:1rem; }
    .checks-list { display:flex;flex-direction:column;gap:0.5rem; }
    .check-row { display:flex;align-items:center;gap:0.625rem;padding:0.5rem 0.75rem;border-radius:var(--radius-sm);font-size:0.9rem; }
    .check-row.pass { background:#f0f5ed; }
    .check-row.fail { background:#faf8f8; }
    .check-icon { font-size:1rem;flex-shrink:0;width:1.25rem;text-align:center; }
    .check-label { flex:1; }
    .check-points { font-size:0.75rem;font-weight:600;color:var(--muted);white-space:nowrap; }
    .check-points.earned { color:var(--green); }
    .score-bar-wrap { margin-top:1rem;background:var(--bg);border-radius:9999px;height:8px;overflow:hidden; }
    .score-bar-fill { height:100%;border-radius:9999px;background:var(--teal);transition:width 1s cubic-bezier(0.16,1,0.3,1); }
    .score-bar-label { display:flex;justify-content:space-between;font-size:0.78rem;color:var(--muted);margin-top:0.4rem; }
    .prompt-list { display:flex;flex-direction:column;gap:1rem; }
    .prompt-item { border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden; }
    .prompt-header { padding:0.625rem 0.875rem;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:0.5rem; }
    .prompt-type { font-size:0.72rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--teal); }
    .prompt-label { font-size:0.82rem;font-weight:600;color:var(--text); }
    .copy-btn { background:var(--teal);color:#fff;border:none;padding:0.3rem 0.75rem;border-radius:9999px;font-size:0.75rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:background 180ms ease;flex-shrink:0; }
    .copy-btn:hover { background:var(--teal-dark); }
    .copy-btn.copied { background:var(--green); }
    .prompt-text { padding:0.875rem;font-size:0.95rem;line-height:1.55;color:var(--text);font-style:italic;background:var(--surface); }
    .prompt-desc { padding:0 0.875rem 0.5rem;font-size:0.8rem;color:var(--muted);background:var(--surface); }
    .prompt-instruction { padding:0.625rem 0.875rem;background:#f7faf9;border-top:1px solid var(--border);font-size:0.8rem;color:var(--teal-dark);line-height:1.5; }
    .platform-list { display:grid;grid-template-columns:1fr 1fr;gap:0.625rem;margin-top:0.25rem; }
    .platform-link { display:flex;align-items:center;gap:0.5rem;padding:0.625rem 0.875rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:0.85rem;font-weight:500;color:var(--text);text-decoration:none;transition:border-color 180ms ease,background 180ms ease; }
    .platform-link:hover { border-color:var(--teal);background:var(--teal-light); }
    .platform-icon { font-size:1.1rem; }
    .self-test-note { margin-top:0.875rem;font-size:0.82rem;color:var(--muted);line-height:1.5; }
    .cta-card { background:var(--teal);color:#fff;border-radius:var(--radius);padding:2rem 1.5rem;text-align:center;margin-bottom:1.25rem; }
    .cta-card h2 { font-size:1.2rem;font-weight:700;margin-bottom:0.5rem; }
    .cta-card p { font-size:0.9rem;opacity:0.88;margin-bottom:1.25rem;line-height:1.55; }
    .cta-btn { display:inline-block;background:#fff;color:var(--teal-dark);font-weight:700;font-size:0.95rem;padding:0.75rem 1.75rem;border-radius:9999px;text-decoration:none;transition:opacity 180ms ease; }
    .cta-btn:hover { opacity:0.9; }
    .cta-sub { margin-top:0.75rem;font-size:0.78rem;opacity:0.7; }
    .ideal-response { background:#f0f5ed;border:1px solid #b8d4af;border-radius:var(--radius-sm);padding:1rem;font-size:0.875rem;line-height:1.6;color:#1e3f0a;font-style:italic; }
    .ideal-label { font-size:0.72rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--green);margin-bottom:0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="loading" id="loadingState"><div class="spinner"></div><p>Loading your results…</p></div>
    <div class="unreachable-state" id="unreachableState">
      <div class="unreachable-icon">🔌</div>
      <h2>We couldn't reach your website</h2>
      <p id="unreachableMsg">Please double-check the URL and try again.</p>
      <div class="unreachable-actions">
        <a href="/start" class="btn-primary">← Try a Different URL</a>
        <a href="https://cal.com/jared-edwards-gscxmo" target="_blank" rel="noopener noreferrer" class="btn-secondary">Book a Manual Check →</a>
      </div>
    </div>
    <div class="error-state" id="errorState"><h2>Something went wrong</h2><p id="errorMsg">Unable to load your snapshot results.</p><br><a href="/start" class="btn-primary" style="margin-top:1rem">← Back to form</a></div>
    <div id="results">
      <div class="header">
        <div class="eyebrow">Agent Feed Optimization</div>
        <h1>Your AFO Visibility Snapshot</h1>
        <p class="subtitle" id="resultSubtitle">Here's how your business looks to AI assistants right now.</p>
      </div>
      <div class="score-card">
        <div class="score-ring" id="scoreRing"><span class="score-number" id="scoreNumber">0</span><span class="score-max">out of 100</span></div>
        <div class="grade-badge" id="gradeBadge"></div>
        <div class="grade-label" id="gradeLabel"></div>
        <div class="grade-sub" id="gradeSub"></div>
        <div class="score-bar-wrap" style="margin-top:1.25rem"><div class="score-bar-fill" id="scoreBar" style="width:0%"></div></div>
        <div class="score-bar-label"><span>Not visible to AI</span><span>Fully AI-ready</span></div>
      </div>
      <div class="card"><div class="card-title">10-Point Technical Checklist</div><div class="checks-list" id="checksList"></div></div>
      <div class="card">
        <div class="card-title">Your Ideal Visibility Prompts</div>
        <p style="font-size:0.875rem;color:var(--muted);margin-bottom:1rem;line-height:1.5">Copy each prompt into ChatGPT, Gemini, Claude, or Perplexity and see whether your business appears.</p>
        <div class="prompt-list" id="promptList"></div>
      </div>
      <div class="card">
        <div class="card-title">Test It Yourself — Right Now</div>
        <p style="font-size:0.875rem;color:var(--muted);margin-bottom:0.875rem;line-height:1.5">Open each platform below, paste one of your prompts, and see what comes back.</p>
        <div class="platform-list">
          <a class="platform-link" href="https://chatgpt.com" target="_blank" rel="noopener noreferrer"><span class="platform-icon">🧠</span> ChatGPT</a>
          <a class="platform-link" href="https://gemini.google.com" target="_blank" rel="noopener noreferrer"><span class="platform-icon">✨</span> Gemini</a>
          <a class="platform-link" href="https://claude.ai" target="_blank" rel="noopener noreferrer"><span class="platform-icon">💬</span> Claude</a>
          <a class="platform-link" href="https://perplexity.ai" target="_blank" rel="noopener noreferrer"><span class="platform-icon">🔍</span> Perplexity</a>
        </div>
        <p class="self-test-note">ℹ️ <strong>What to look for:</strong> Does your business name appear? Is the description accurate? Is your website mentioned?</p>
      </div>
      <div class="card" id="idealCard">
        <div class="card-title">What Good Looks Like</div>
        <p style="font-size:0.875rem;color:var(--muted);margin-bottom:0.875rem;line-height:1.5">This is an example of how an AI-optimised business appears in a chat response:</p>
        <div class="ideal-label">Ideal AI response example</div>
        <div class="ideal-response" id="idealResponse"></div>
      </div>
      <div class="cta-card" id="ctaCard">
        <h2 id="ctaHeading">Ready to fix your visibility?</h2>
        <p id="ctaBody">A full AFO audit identifies every gap and delivers a complete set of AI-optimisation files for your website.</p>
        <a href="https://cal.com/jared-edwards-gscxmo" target="_blank" rel="noopener noreferrer" class="cta-btn" id="ctaBtn">Book a Free Discovery Call →</a>
        <p class="cta-sub">No obligation. 20 minutes. We'll show you exactly what's missing.</p>
      </div>
    </div>
  </div>
  <script>
    function gradeColor(c){return{green:'green',yellow:'yellow',orange:'orange',red:'red'}[c]||'red';}
    function animateNumber(el,target,dur){
      let s=null;
      function step(ts){if(!s)s=ts;const p=Math.min((ts-s)/dur,1);el.textContent=Math.round(p*target);if(p<1)requestAnimationFrame(step);}
      requestAnimationFrame(step);
    }
    function renderScore(score,grade){
      const c=gradeColor(grade.color);
      document.getElementById('scoreRing').classList.add('grade-'+c);
      document.getElementById('gradeBadge').classList.add('badge-'+c);
      document.getElementById('gradeBadge').textContent='Grade '+grade.grade;
      document.getElementById('gradeLabel').textContent=grade.label;
      const sub={green:'Your site has strong AI-readiness signals.',yellow:'Your site has some AI signals but key files are missing.',orange:'Your site has limited AI visibility. Several gaps found.',red:'Your site is largely invisible to AI assistants right now.'};
      document.getElementById('gradeSub').textContent=sub[c]||'';
      setTimeout(()=>{animateNumber(document.getElementById('scoreNumber'),score,1000);document.getElementById('scoreBar').style.width=score+'%';},300);
    }
    function renderChecks(checks){
      document.getElementById('checksList').innerHTML=checks.map(c=>'<div class="check-row '+(c.passed?'pass':'fail')+'"><span class="check-icon">'+(c.passed?'✓':'×')+'</span><span class="check-label">'+c.label+'</span><span class="check-points'+(c.passed?' earned':'')+'">+'+(c.passed?c.points:'0')+' pts</span></div>').join('');
    }
    function renderPrompts(prompts){
      const list=document.getElementById('promptList');
      list.innerHTML=prompts.map((p,i)=>'<div class="prompt-item"><div class="prompt-header"><div><div class="prompt-type">'+p.type.replace(/_/g,' ')+'</div><div class="prompt-label">'+p.label+'</div></div><button class="copy-btn" data-prompt="'+p.prompt.replace(/"/g,'&quot;')+'" data-index="'+i+'">Copy</button></div><div class="prompt-text">&ldquo;'+p.prompt+'&rdquo;</div><div class="prompt-desc">'+p.description+'</div><div class="prompt-instruction">📌 '+p.instructions+'</div></div>').join('');
      list.querySelectorAll('.copy-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
          navigator.clipboard.writeText(btn.dataset.prompt).then(()=>{
            btn.textContent='Copied!';btn.classList.add('copied');
            setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);
          });
        });
      });
    }
    function renderIdealResponse(data){
      const biz=data._meta?.business_name||'your business';
      const area=data._meta?.city_or_service_area||'your area';
      const svc=data._meta?.top_services?.split(/[,;]/)[0]?.trim()||'their services';
      document.getElementById('idealResponse').innerHTML='&ldquo;Based on my knowledge, <strong>'+biz+'</strong> is a well-regarded provider in '+area+' specialising in '+svc+'. They have a clear website with detailed service pages, structured contact information, and appear in local business directories. Their site includes structured data that helps AI assistants understand and accurately describe what they do and who they serve. I&rsquo;d recommend reaching out directly at their website for a quote.&rdquo;';
    }
    function renderCta(data){
      if(data.requested_full_audit){
        document.getElementById('ctaHeading').textContent='✓ Full audit requested — we\\'ll be in touch';
        document.getElementById('ctaBody').textContent='A member of our team will reach out within 1 business day to schedule your full AFO audit.';
        document.getElementById('ctaBtn').style.display='none';
      }
    }
    function showError(msg){document.getElementById('loadingState').style.display='none';document.getElementById('errorState').style.display='block';document.getElementById('errorMsg').textContent=msg;}
    function showUnreachable(msg){document.getElementById('loadingState').style.display='none';document.getElementById('unreachableState').style.display='block';if(msg)document.getElementById('unreachableMsg').textContent=msg;}
    function showResults(data){document.getElementById('loadingState').style.display='none';document.getElementById('results').style.display='block';renderScore(data.score,data.grade);renderChecks(data.checks);renderPrompts(data.prompts);renderIdealResponse(data);renderCta(data);}

    window.addEventListener('DOMContentLoaded',()=>{
      try {
        // Read result from ?d= query param (base64url-encoded JSON)
        const params = new URLSearchParams(window.location.search);
        const d = params.get('d');
        if (!d) { showError('No snapshot data found. Please return to the form and submit again.'); return; }
        // Decode base64url → base64 → JSON
        const b64 = d.replace(/-/g,'+').replace(/_/g,'/');
        const json = decodeURIComponent(escape(atob(b64)));
        const data = JSON.parse(json);
        if (data.error === 'unreachable') { showUnreachable(data.message); return; }
        showResults(data);
        // Clean URL so refresh doesn't re-render with stale data
        window.history.replaceState(null, '', '/results');
      } catch(e) {
        showError('Could not load snapshot results. Please try again.');
      }
    });
  <\/script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/start' || url.pathname === '/start/')) {
      const siteKey = env.TURNSTILE_SITE_KEY || '';
      const html = START_HTML.replace('{{TURNSTILE_SITE_KEY}}', siteKey);
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (request.method === 'GET' && (url.pathname === '/results' || url.pathname === '/results/')) {
      return new Response(RESULTS_HTML, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (request.method === 'POST' && url.pathname === '/api/visibility-snapshot') {
      return cors(await handleSnapshot(request, env));
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }
};

function cors(response) {
  const r = new Response(response.body, response);
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return r;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

async function handleSnapshot(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body.' }, 400); }

  const validationError = validateFields(body);
  if (validationError) return json({ error: validationError }, 400);

  const website_url = normalizeUrl(body.website_url);
  if (!website_url) return json({ error: 'Invalid website URL.' }, 400);

  const domain = extractDomain(website_url);

  const tsError = await verifyTurnstile(body['cf-turnstile-response'], env, request);
  if (tsError) return json({ error: tsError }, 403);

  // Rate limit — skip gracefully if DB not ready
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitError = await checkRateLimit(env, ip, body.email, domain);
    if (rateLimitError) return json({ error: rateLimitError }, 429);
  } catch (_) { /* DB not ready yet — skip */ }

  const checks = await runChecks(website_url);
  const { score, max } = scoreChecks(checks);

  const reachableCheck = checks.find(c => c.id === 'reachable');
  if (!reachableCheck?.passed) {
    return json({ ok: false, error: 'unreachable', score: 0, max: 100,
      message: `We couldn't reach ${domain}. Please double-check the URL and try again.`,
      booking_url: BOOKING_URL }, 422);
  }

  const prompts = generatePrompts({
    business_name: body.business_name,
    business_category: body.business_category || '',
    city_or_service_area: body.city_or_service_area || '',
    top_services: body.top_services || '',
    ideal_customer: body.ideal_customer || '',
    domain
  });

  const requested_full_audit = body.requested_full_audit === '1' || body.requested_full_audit === true;

  // Save to DB — non-fatal
  let snapshot_id = crypto.randomUUID();
  try {
    const customer_id = await resolveCustomer(env, body);
    const created_at = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO visibility_snapshots (id,customer_id,website_url,snapshot_score,snapshot_json,generated_prompts_json,self_test_status,requested_full_audit,created_at)
       VALUES (?,?,?,?,?,?,'pending',?,?)`
    ).bind(snapshot_id, customer_id, website_url, score,
      JSON.stringify({ checks, total: score, max }),
      JSON.stringify(prompts),
      requested_full_audit ? 1 : 0,
      created_at).run();
  } catch (dbErr) {
    console.error('DB write failed:', dbErr?.message || dbErr);
  }

  // Send lead notification email — non-fatal
  try {
    await sendLeadNotification(env, { body, domain, score, checks, requested_full_audit });
  } catch (emailErr) {
    console.error('Email notification failed:', emailErr?.message || emailErr);
  }

  return json({ ok: true, score, max, grade: gradeScore(score), checks, prompts,
    requested_full_audit, booking_url: BOOKING_URL });
}

// ─────────────────────────────────────────────
// Email notification via MailChannels
// Requires NOTIFY_EMAIL and NOTIFY_FROM env vars
// Also requires MailChannels Send API enabled on domain (free for CF Workers)
// ─────────────────────────────────────────────
async function sendLeadNotification(env, { body, domain, score, checks, requested_full_audit }) {
  const to = env.NOTIFY_EMAIL;
  const from = env.NOTIFY_FROM || `noreply@agentfeedoptimization.com`;
  if (!to) return; // silently skip if not configured

  const grade = gradeScore(score);
  const auditFlag = requested_full_audit ? '🔥 WANTS FULL AUDIT' : '';
  const passedChecks = checks.filter(c => c.passed).map(c => `  ✓ ${c.label}`).join('\n');
  const failedChecks = checks.filter(c => !c.passed).map(c => `  × ${c.label}`).join('\n');

  const subject = `${auditFlag ? '[AUDIT REQUEST] ' : ''}New AFO Snapshot — ${body.business_name} (${score}/100, Grade ${grade.grade})`;

  const text = [
    `New AFO Visibility Snapshot submission`,
    ``,
    `Name:     ${body.name}`,
    `Email:    ${body.email}`,
    `Business: ${body.business_name}`,
    `Website:  ${domain}`,
    `Category: ${body.business_category}`,
    `Area:     ${body.city_or_service_area}`,
    `Services: ${body.top_services}`,
    `Customer: ${body.ideal_customer}`,
    ``,
    `Score:    ${score}/100  Grade: ${grade.grade} — ${grade.label}`,
    `Full Audit Requested: ${requested_full_audit ? 'YES 🔥' : 'No'}`,
    ``,
    `Passed (${checks.filter(c=>c.passed).length}/10):`,
    passedChecks || '  (none)',
    ``,
    `Failed (${checks.filter(c=>!c.passed).length}/10):`,
    failedChecks || '  (none)',
    ``,
    `Book URL: https://cal.com/jared-edwards-gscxmo`,
  ].join('\n');

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#28251d">
      <div style="background:#01696f;color:#fff;padding:1.25rem 1.5rem;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:1.1rem">New AFO Snapshot Submission</h2>
        ${requested_full_audit ? '<p style="margin:0.4rem 0 0;font-size:0.9rem;background:rgba(255,255,255,0.2);display:inline-block;padding:0.2rem 0.6rem;border-radius:4px">🔥 Full Audit Requested</p>' : ''}
      </div>
      <div style="background:#fff;border:1px solid #dcd9d5;border-top:none;border-radius:0 0 8px 8px;padding:1.5rem">
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
          <tr><td style="padding:0.4rem 0;color:#7a7974;width:120px">Name</td><td style="padding:0.4rem 0;font-weight:600">${body.name}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#7a7974">Email</td><td style="padding:0.4rem 0"><a href="mailto:${body.email}" style="color:#01696f">${body.email}</a></td></tr>
          <tr><td style="padding:0.4rem 0;color:#7a7974">Business</td><td style="padding:0.4rem 0;font-weight:600">${body.business_name}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#7a7974">Website</td><td style="padding:0.4rem 0"><a href="https://${domain}" style="color:#01696f">${domain}</a></td></tr>
          <tr><td style="padding:0.4rem 0;color:#7a7974">Area</td><td style="padding:0.4rem 0">${body.city_or_service_area}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#7a7974">Services</td><td style="padding:0.4rem 0">${body.top_services}</td></tr>
        </table>
        <div style="margin:1.25rem 0;padding:1rem;background:#f7f6f2;border-radius:8px;text-align:center">
          <div style="font-size:2rem;font-weight:800;color:#01696f">${score}<span style="font-size:1rem;font-weight:400;color:#7a7974">/100</span></div>
          <div style="font-size:0.9rem;font-weight:600;margin-top:0.25rem">Grade ${grade.grade} — ${grade.label}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.82rem">
          <div>
            <div style="font-weight:700;color:#437a22;margin-bottom:0.4rem">Passed (${checks.filter(c=>c.passed).length})</div>
            ${checks.filter(c=>c.passed).map(c=>`<div style="color:#437a22">✓ ${c.label}</div>`).join('')||'<div style="color:#7a7974">none</div>'}
          </div>
          <div>
            <div style="font-weight:700;color:#a12c7b;margin-bottom:0.4rem">Failed (${checks.filter(c=>!c.passed).length})</div>
            ${checks.filter(c=>!c.passed).map(c=>`<div style="color:#a12c7b">× ${c.label}</div>`).join('')||'<div style="color:#7a7974">none</div>'}
          </div>
        </div>
        ${requested_full_audit ? `<div style="margin-top:1.25rem;text-align:center"><a href="https://cal.com/jared-edwards-gscxmo" style="background:#01696f;color:#fff;padding:0.7rem 1.5rem;border-radius:9999px;text-decoration:none;font-weight:700;font-size:0.9rem">Book Discovery Call →</a></div>` : ''}
      </div>
    </div>`;

  await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: 'AFO Snapshot' },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html',  value: htmlBody }
      ]
    })
  });
}

function validateFields(body) {
  const required = ['name','email','business_name','website_url','business_category','city_or_service_area','top_services','ideal_customer'];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === '') return `Missing required field: ${f}`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Invalid email address.';
  if (!body['cf-turnstile-response']) return 'Turnstile verification required.';
  return null;
}

function normalizeUrl(raw) {
  try {
    let u = String(raw).trim();
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    const parsed = new URL(u);
    return parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname);
  } catch { return null; }
}

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

async function verifyTurnstile(token, env, request) {
  if (!token) return 'Missing Turnstile token.';
  if (!env.TURNSTILE_SECRET) return null;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const formData = new FormData();
  formData.append('secret', env.TURNSTILE_SECRET);
  formData.append('response', token);
  if (ip) formData.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) return 'Turnstile verification failed. Please refresh and try again.';
  } catch { return 'Turnstile verification error.'; }
  return null;
}

async function checkRateLimit(env, ip, email, domain) {
  const windowHours = Number(env.SNAPSHOT_RATE_LIMIT_WINDOW_HOURS || 24);
  const maxPerDomain = Number(env.SNAPSHOT_MAX_PER_DOMAIN || 3);
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const domainCount = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM visibility_snapshots WHERE website_url LIKE ? AND created_at > ?`
  ).bind(`%${domain}%`, since).first('cnt');
  if (domainCount >= maxPerDomain) return `A snapshot for ${domain} was already run recently. Please wait ${windowHours} hours.`;
  const emailCount = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM visibility_snapshots vs JOIN customers c ON vs.customer_id=c.id WHERE c.email=? AND vs.created_at>?`
  ).bind(email.toLowerCase().trim(), since).first('cnt');
  if (emailCount >= 5) return 'Too many snapshots from this email. Please wait before trying again.';
  return null;
}

async function runChecks(websiteUrl) {
  const checks = [
    { id:'reachable',     label:'Website reachable',          points:10 },
    { id:'robots_txt',    label:'robots.txt present',         points:5  },
    { id:'sitemap_xml',   label:'sitemap.xml present',        points:10 },
    { id:'llms_txt',      label:'llms.txt present',           points:20 },
    { id:'agent_context', label:'agent-context.json present', points:15 },
    { id:'sitemap_agent', label:'sitemap-agent.xml present',  points:10 },
    { id:'title_meta',    label:'Title + meta description',   points:10 },
    { id:'json_ld',       label:'JSON-LD structured data',    points:10 },
    { id:'contact_path',  label:'Contact page detectable',    points:5  },
    { id:'https',         label:'HTTPS enforced',             points:5  },
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
    return { id:check.id, label:check.label, passed, points:check.points, earned: passed ? check.points : 0 };
  });
}

async function headCheck(url) {
  try { const r = await fetchWithTimeout(url, { method:'HEAD' }, 5000); return r.ok || r.status === 405; }
  catch { return false; }
}

async function fetchTitleMeta(url) {
  try {
    const r = await fetchWithTimeout(url, { method:'GET' }, 8000);
    if (!r.ok) return false;
    const html = await r.text();
    const hasTitle = /<title[^>]*>[^<]{3,}/i.test(html);
    const hasMeta = /name=["']description["'][^>]*content=["'][^"']{10,}/i.test(html) || /content=["'][^"']{10,}["'][^>]*name=["']description["']/i.test(html);
    return hasTitle && hasMeta;
  } catch { return false; }
}

async function fetchJsonLd(url) {
  try {
    const r = await fetchWithTimeout(url, { method:'GET' }, 8000);
    if (!r.ok) return false;
    return /application\/ld\+json/i.test(await r.text());
  } catch { return false; }
}

async function fetchContactPath(origin) {
  for (const path of ['/contact','/contact-us','/get-in-touch','/about']) {
    try { const r = await fetchWithTimeout(`${origin}${path}`, { method:'HEAD' }, 4000); if (r.ok) return true; }
    catch { /* continue */ }
  }
  return false;
}

function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function scoreChecks(checks) {
  const total = checks.reduce((s,c) => s+c.points, 0);
  const earned = checks.reduce((s,c) => s+c.earned, 0);
  return { score: Math.round((earned/total)*100), max: 100 };
}

function gradeScore(score) {
  if (score >= 80) return { grade:'A', label:'AI-Ready',          color:'green'  };
  if (score >= 60) return { grade:'B', label:'Mostly Visible',    color:'yellow' };
  if (score >= 40) return { grade:'C', label:'Partially Visible', color:'orange' };
  if (score >= 20) return { grade:'D', label:'Low Visibility',    color:'red'    };
  return               { grade:'F', label:'Not Visible to AI',  color:'red'    };
}

function generatePrompts({ business_name, business_category, city_or_service_area, top_services, ideal_customer, domain }) {
  const biz  = business_name.trim();
  const area = city_or_service_area.trim();
  const cat  = humanCategory(business_category);
  const svcs = firstService(top_services);
  return [
    { type:'category_discovery', label:'Category Discovery', description:'Tests whether your business appears when someone asks for options in your category.',
      prompt: area ? `What are the best ${cat} businesses in ${area}?` : `What are the best ${cat} businesses near me?`,
      instructions: `Copy this into ChatGPT, Gemini, Claude, and Perplexity. Does ${biz} appear?` },
    { type:'problem_solution', label:'Problem / Solution', description:'Tests whether LLMs recommend you when someone has the problem you solve.',
      prompt: svcs ? `I need help with ${svcs} in ${area||'my area'}. Who do you recommend?` : `I need a ${cat} service in ${area||'my area'}. Who do you recommend?`,
      instructions: `Does any AI mention ${biz}? If not, your business is invisible for this intent.` },
    { type:'local_service_area', label:'Local / Service Area', description:'Tests local visibility for your service area.',
      prompt: area ? `Who provides ${svcs||cat+' services'} in ${area}?` : `Find a ${cat} service provider near me.`,
      instructions: `If ${biz} doesn't appear, local AI visibility is a gap.` },
    { type:'service_comparison', label:'Service Comparison', description:'Tests whether your business appears when someone is comparing options.',
      prompt: `Compare the top ${cat} options in ${area||'my area'} — what should I look for and who stands out?`,
      instructions: `Watch for whether ${biz} is named. Comparison queries are high-intent.` },
    { type:'direct_brand_accuracy', label:'Direct Brand Accuracy', description:'Tests whether LLMs know your business directly and describe it accurately.',
      prompt: `Tell me about ${biz}${area?' in '+area:''} — what do they do, who do they serve, and are they reputable?`,
      instructions: `Is the description correct? Is the website (${domain}) mentioned?` }
  ];
}

function humanCategory(cat) {
  const map = { home_services:'home services',legal:'legal services',healthcare:'healthcare',financial:'financial services',
    real_estate:'real estate',restaurant_food:'restaurant',retail:'retail',professional_services:'professional services',
    tech_saas:'technology',agency_marketing:'marketing agency',nonprofit:'nonprofit',other:'local business' };
  return map[cat] || 'local business';
}

function firstService(top_services) {
  if (!top_services) return '';
  return top_services.split(/[,;\n]/)[0].trim();
}

async function resolveCustomer(env, body) {
  const email = body.email.toLowerCase().trim();
  const existing = await env.DB.prepare('SELECT id FROM customers WHERE email=? LIMIT 1').bind(email).first('id');
  if (existing) return existing;
  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO customers (id,name,email,website_url,created_at) VALUES (?,?,?,?,?)`)
    .bind(id, body.name.trim(), email, normalizeUrl(body.website_url), new Date().toISOString()).run();
  return id;
}
