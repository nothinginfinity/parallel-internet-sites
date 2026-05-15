/**
 * results-page.js
 * Commit 6 — AFO Visibility Snapshot Results Page
 *
 * Exports a single function: renderResultsPage(data)
 * Called by the Worker GET /results route.
 *
 * Receives snapshot data as a plain JS object (parsed from URL params or
 * passed directly from /api/visibility-snapshot response).
 * Returns a full HTML string — no external dependencies, no framework.
 */

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

function scoreBand(score) {
  if (score >= 80) return { label: 'AI-Ready',         color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', emoji: '🟢' };
  if (score >= 56) return { label: 'Mostly Visible',   color: '#ca8a04', bg: '#fefce8', border: '#fef08a', emoji: '🟡' };
  if (score >= 31) return { label: 'Partially Visible', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', emoji: '🟠' };
  return              { label: 'Not AI-Visible',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca', emoji: '🔴' };
}

function scoreArc(score) {
  // SVG arc for circular progress — 0-100 mapped to 0-251.2 (circumference of r=40 circle)
  const pct = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * 251.2;
  return { dash, gap: 251.2 - dash };
}

// ---------------------------------------------------------------------------
// Check row renderer
// ---------------------------------------------------------------------------

function checkRow(label, passed, detail) {
  const icon  = passed ? '✅' : '❌';
  const color = passed ? '#166534' : '#991b1b';
  const bg    = passed ? '#f0fdf4' : '#fef2f2';
  return `
    <div class="check-row" style="background:${bg};">
      <span class="check-icon">${icon}</span>
      <span class="check-label" style="color:${color};">${label}</span>
      ${detail ? `<span class="check-detail">${detail}</span>` : ''}
    </div>`;
}

// ---------------------------------------------------------------------------
// Prompt card renderer
// ---------------------------------------------------------------------------

function promptCard(p, idx) {
  const id = `prompt-${idx}`;
  return `
    <div class="prompt-card">
      <div class="prompt-header">
        <span class="prompt-num">${idx + 1}</span>
        <span class="prompt-label">${escHtml(p.label)}</span>
        <button class="copy-btn" onclick="copyPrompt('${id}')" aria-label="Copy prompt">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
      </div>
      <div class="prompt-text" id="${id}">${escHtml(p.prompt)}</div>
      <div class="prompt-desc">${escHtml(p.description)}</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Platform badge renderer
// ---------------------------------------------------------------------------

const PLATFORM_LINKS = {
  ChatGPT:   'https://chat.openai.com',
  Gemini:    'https://gemini.google.com',
  Claude:    'https://claude.ai',
  Perplexity:'https://www.perplexity.ai',
};

const PLATFORM_COLORS = {
  ChatGPT:    '#10a37f',
  Gemini:     '#1a73e8',
  Claude:     '#d97706',
  Perplexity: '#6366f1',
};

function platformBadge(name) {
  const color = PLATFORM_COLORS[name] || '#6b7280';
  const href  = PLATFORM_LINKS[name] || '#';
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"
    class="platform-badge" style="border-color:${color};color:${color};">${name}</a>`;
}

// ---------------------------------------------------------------------------
// HTML escape
// ---------------------------------------------------------------------------

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * @param {Object} data
 * @param {string}   data.business_name
 * @param {string}   data.website_url
 * @param {number}   data.snapshot_score        0–100
 * @param {Object}   data.snapshot_checks       { check_key: boolean }
 * @param {Array}    data.prompts               GeneratedPrompt[]
 * @param {string[]} data.selfTestPlatforms
 * @param {string}   data.selfTestInstruction
 * @param {boolean}  data.requested_full_audit
 * @param {string}   [data.snapshot_id]
 * @returns {string} Full HTML document
 */
export function renderResultsPage(data) {
  const {
    business_name      = 'Your Business',
    website_url        = '',
    snapshot_score     = 0,
    snapshot_checks    = {},
    prompts            = [],
    selfTestPlatforms  = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'],
    selfTestInstruction = '',
    requested_full_audit = false,
    snapshot_id        = '',
  } = data;

  const band    = scoreBand(snapshot_score);
  const arc     = scoreArc(snapshot_score);

  const CHECK_LABELS = {
    reachable:          'Website Reachable',
    robots_txt:         'robots.txt Present',
    sitemap_xml:        'sitemap.xml Present',
    llms_txt:           'llms.txt Present',
    agent_context:      'agent-context.json Present',
    sitemap_agent:      'sitemap-agent.xml Present',
    title_present:      'Homepage Title Present',
    meta_description:   'Meta Description Present',
    json_ld:            'JSON-LD Structured Data',
    contact_detectable: 'Contact Path Detectable',
  };

  const checkRows = Object.entries(CHECK_LABELS)
    .map(([key, label]) => checkRow(label, !!snapshot_checks[key]))
    .join('');

  const promptCards = prompts.map((p, i) => promptCard(p, i)).join('');
  const platformBadges = selfTestPlatforms.map(platformBadge).join('\n        ');

  const ctaSection = requested_full_audit
    ? `<div class="cta-box cta-requested">
        <div class="cta-icon">✅</div>
        <h3>Full Audit Requested</h3>
        <p>We received your request for a full AFO audit. Jared will reach out within 1–2 business days to schedule a call and review your snapshot results.</p>
        <p class="cta-sub">Request ID: <code>${escHtml(snapshot_id)}</code></p>
      </div>`
    : `<div class="cta-box">
        <div class="cta-icon">🚀</div>
        <h3>Ready to Fix Your Visibility?</h3>
        <p>A full AFO audit maps exactly what's missing, builds your AFO files, and installs your Parallel Internet presence so you show up by name in AI-powered search.</p>
        <a href="https://agentfeedoptimization.com" target="_blank" rel="noopener noreferrer" class="btn-primary">Book a Free Strategy Call →</a>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AFO Visibility Snapshot — ${escHtml(business_name)}</title>
<style>
  /* ── Reset + Base ─────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
  body {
    font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 16px; line-height: 1.6;
    background: #f8f9fb; color: #1a1a2e;
    min-height: 100dvh;
  }

  /* ── Layout ────────────────────────────────────────── */
  .page   { max-width: 680px; margin: 0 auto; padding: 32px 16px 64px; }
  section { margin-top: 40px; }

  /* ── Header ────────────────────────────────────────── */
  .header { text-align: center; margin-bottom: 8px; }
  .header .eyebrow {
    font-size: 12px; font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: #6b7280; margin-bottom: 6px;
  }
  .header h1 { font-size: clamp(1.4rem, 4vw, 1.9rem); font-weight: 700; color: #111; }
  .header .site-url { font-size: 14px; color: #6b7280; margin-top: 4px; }

  /* ── Score Ring ────────────────────────────────────── */
  .score-wrap {
    display: flex; flex-direction: column; align-items: center;
    padding: 32px 0 24px;
  }
  .score-ring { position: relative; width: 120px; height: 120px; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-ring .score-num {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 800; color: #111;
    line-height: 1;
  }
  .score-ring .score-denom { font-size: 12px; color: #6b7280; font-weight: 500; }
  .score-band {
    margin-top: 14px;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 15px;
    border: 1.5px solid;
  }

  /* ── Section heading ───────────────────────────────── */
  .section-heading {
    font-size: 13px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: #6b7280;
    margin-bottom: 12px; padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }

  /* ── Check rows ────────────────────────────────────── */
  .checks { display: flex; flex-direction: column; gap: 6px; }
  .check-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 8px;
    font-size: 14px;
  }
  .check-icon  { font-size: 16px; flex-shrink: 0; }
  .check-label { font-weight: 500; flex: 1; }
  .check-detail { font-size: 12px; color: #6b7280; }

  /* ── Prompt cards ──────────────────────────────────── */
  .prompts { display: flex; flex-direction: column; gap: 14px; }
  .prompt-card {
    background: #fff; border: 1px solid #e5e7eb;
    border-radius: 12px; padding: 16px 18px;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
  }
  .prompt-header {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  }
  .prompt-num {
    width: 24px; height: 24px; border-radius: 50%;
    background: #1a1a2e; color: #fff;
    font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .prompt-label { font-weight: 600; font-size: 14px; flex: 1; color: #374151; }
  .copy-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 6px; font-size: 13px;
    font-weight: 600; cursor: pointer;
    background: #f3f4f6; color: #374151;
    border: 1px solid #d1d5db;
    transition: background .15s, color .15s;
  }
  .copy-btn:hover { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
  .copy-btn.copied { background: #16a34a; color: #fff; border-color: #16a34a; }
  .prompt-text {
    background: #f8f9fb; border: 1px solid #e5e7eb; border-radius: 8px;
    padding: 12px 14px; font-size: 15px; font-weight: 500;
    color: #111; line-height: 1.5; margin-bottom: 8px;
    cursor: text; user-select: all;
  }
  .prompt-desc { font-size: 13px; color: #6b7280; }

  /* ── Self-test platform badges ─────────────────────── */
  .self-test-instruction {
    background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
    padding: 18px 20px; font-size: 14px; color: #374151; line-height: 1.6;
    margin-bottom: 16px;
  }
  .platform-badges { display: flex; flex-wrap: wrap; gap: 10px; }
  .platform-badge {
    display: inline-flex; align-items: center;
    padding: 7px 18px; border-radius: 999px;
    font-size: 13px; font-weight: 700;
    border: 2px solid; text-decoration: none;
    transition: opacity .15s;
  }
  .platform-badge:hover { opacity: .75; }

  /* ── CTA box ────────────────────────────────────────── */
  .cta-box {
    background: #1a1a2e; color: #fff;
    border-radius: 16px; padding: 28px 28px 24px;
    text-align: center;
  }
  .cta-box.cta-requested { background: #052e16; }
  .cta-icon { font-size: 2rem; margin-bottom: 10px; }
  .cta-box h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
  .cta-box p  { font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 6px; }
  .cta-sub    { font-size: 12px; color: #9ca3af; }
  .cta-sub code { background: rgba(255,255,255,.1); padding: 2px 6px; border-radius: 4px; font-size: 11px; }
  .btn-primary {
    display: inline-block; margin-top: 16px;
    padding: 13px 28px; border-radius: 10px;
    background: #4f9cf9; color: #fff;
    font-size: 15px; font-weight: 700;
    text-decoration: none;
    transition: background .15s;
  }
  .btn-primary:hover { background: #2563eb; }

  /* ── Footer ────────────────────────────────────────── */
  .footer {
    margin-top: 48px; text-align: center;
    font-size: 12px; color: #9ca3af;
  }
  .footer a { color: #6b7280; text-decoration: none; }
  .footer a:hover { color: #374151; }

  @media (max-width: 480px) {
    .page { padding: 20px 12px 48px; }
    .cta-box { padding: 20px 16px; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <header class="header">
    <div class="eyebrow">AFO Visibility Snapshot</div>
    <h1>${escHtml(business_name)}</h1>
    <div class="site-url">${escHtml(website_url)}</div>
  </header>

  <!-- Score Ring -->
  <div class="score-wrap">
    <div class="score-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="40" fill="none" stroke="#e5e7eb" stroke-width="10"/>
        <circle cx="60" cy="60" r="40" fill="none"
          stroke="${band.color}" stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="${arc.dash.toFixed(1)} ${arc.gap.toFixed(1)}"
          style="transition: stroke-dasharray .8s ease;"/>
      </svg>
      <div class="score-num">
        ${snapshot_score}
        <span class="score-denom">/100</span>
      </div>
    </div>
    <div class="score-band" style="color:${band.color};background:${band.bg};border-color:${band.border};">
      ${band.emoji} ${band.label}
    </div>
  </div>

  <!-- Checks -->
  <section>
    <div class="section-heading">AI Readiness Checks</div>
    <div class="checks">${checkRows}</div>
  </section>

  <!-- Ideal Visibility Prompts -->
  <section>
    <div class="section-heading">Your Ideal Visibility Prompts</div>
    <div class="prompts">${promptCards}</div>
  </section>

  <!-- Self-Test Instructions -->
  <section>
    <div class="section-heading">How to Self-Test</div>
    <div class="self-test-instruction">${escHtml(selfTestInstruction)}</div>
    <div class="platform-badges">${platformBadges}</div>
  </section>

  <!-- CTA -->
  <section>
    ${ctaSection}
  </section>

  <footer class="footer">
    <p>Powered by <a href="https://agentfeedoptimization.com" target="_blank" rel="noopener noreferrer">Agent Feed Optimization</a></p>
    ${snapshot_id ? `<p style="margin-top:4px;">Snapshot ID: ${escHtml(snapshot_id)}</p>` : ''}
  </footer>

</div>

<script>
  // Copy prompt to clipboard
  function copyPrompt(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.textContent.trim();
    const btn  = el.previousElementSibling.querySelector('.copy-btn');
    navigator.clipboard.writeText(text).then(() => {
      if (btn) {
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
          btn.classList.remove('copied');
        }, 2000);
      }
    }).catch(() => {
      // Fallback for older browsers
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }
</script>
</body>
</html>`;
}
