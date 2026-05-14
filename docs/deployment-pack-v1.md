# Deployment Pack v1

> **Parallel Internet Sites — Human Deployment Guide**  
> Version: 1.0 | Built: 2026-05-14 | Author: alice-ops (MSG-OPS-006)  
> This document lets anyone deploy a Parallel Internet Site for a client without Alice's involvement.

---

## Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Generator Run Instructions](#2-generator-run-instructions)
3. [Netlify Deploy Steps](#3-netlify-deploy-steps)
4. [GitHub Pages Deploy Steps (alternative)](#4-github-pages-deploy-steps-alternative)
5. [Post-Deployment Verification Checklist](#5-post-deployment-verification-checklist)
6. [Prompt Test Schedule](#6-prompt-test-schedule)
7. [Client Handoff Template](#7-client-handoff-template)

---

## 1. Pre-Deployment Checklist

Complete every item below **before** running the generator or deploying. Do not proceed until all boxes are checked.

- [ ] **DNS** — `ai.[clientdomain].com` (or chosen subdomain) created and pointed to host (Netlify or GitHub Pages IP)
- [ ] **Form action URL** — A real form endpoint is confirmed and added to intake JSON as `cta_url` / `form_action_url` (replaces `{{FORM_ACTION_URL}}` in `contact.html`)
- [ ] **Content approval** — Jared / client has reviewed and approved all rendered HTML pages
- [ ] **Comparisons page** — `comparisons.html` has been reviewed and approved by client, or removed / redirected if pending
- [ ] **Main-domain AFO files** — `llms.txt`, `agent-context.json`, and `sitemap-agent.xml` are ready to deploy on the client's primary domain (e.g. `truebuild.com`)
- [ ] **Intake JSON complete** — `templates/intake/client-intake.[client].json` is fully populated with zero `{{PLACEHOLDER}}` tokens remaining; all required fields present
- [ ] **Compliance disclaimer confirmed** — `compliance_disclaimers` array in intake JSON reviewed and approved by client
- [ ] **Do-not-claim list confirmed** — `do_not_claim` array in intake JSON reviewed and approved

---

## 2. Generator Run Instructions

### Prerequisites
- Node.js 16 or later installed
- Repo cloned locally: `git clone https://github.com/nothinginfinity/parallel-internet-sites.git`

### Step-by-step

**Step 1 — Navigate to the repo root**
```bash
cd parallel-internet-sites
```

**Step 2 — Confirm your intake JSON is in place**
```bash
ls templates/intake/
# Should show: client-intake.[client].json
```

**Step 3 — Run the generator**
```bash
node scripts/generate-site.js templates/intake/client-intake.[client].json
```

Example for TrueBuild:
```bash
node scripts/generate-site.js templates/intake/client-intake.example.truebuild.json
```

**Step 4 — Confirm zero unmatched token warnings**

Expected output (success):
```
🏗  generate-site.js
   intake : templates/intake/client-intake.example.truebuild.json
   output : examples/truebuild/site

  wrote: examples/truebuild/site/index.html
  wrote: examples/truebuild/site/pages/about.html
  ... (all files listed)

✅ Zero unmatched tokens — output is fully populated.

Done.
```

If you see `⚠ Unmatched tokens`, add the missing fields to the intake JSON and re-run before proceeding.

**Step 5 — Confirm output folder exists**
```bash
ls examples/[client]/site/
# Should show: index.html  llms.txt  agent-context.json  robots.txt  sitemap.xml  sitemap-agent.xml  pages/
```

**Step 6 — Spot-check 3 files**

Open each file and confirm no `{{PLACEHOLDER}}` tokens remain and business name / URL is correct:
- `examples/[client]/site/index.html` — check `<title>`, `<h1>`, and JSON-LD `name` field
- `examples/[client]/site/llms.txt` — check business name and `# Source of Truth` URLs
- `examples/[client]/site/agent-context.json` — check `business_name`, `parallel_site_url`, and `content_role`

---

## 3. Netlify Deploy Steps

> **Recommended path.** Netlify handles HTTPS, CDN, and custom domains with zero configuration.

**Step 1 — Create a Netlify account** (if not already)
Visit https://netlify.com and sign up or log in.

**Step 2 — Create a new site**
From the Netlify dashboard: **Add new site → Deploy manually**

**Step 3 — Drag and drop**
Drag the `examples/[client]/site/` folder into the Netlify deploy drop zone.
- Netlify will assign a random URL (e.g. `quirky-fox-abc123.netlify.app`) — note it for verification

**Step 4 — Set custom domain**
- Go to **Site settings → Domain management → Add custom domain**
- Enter `ai.[clientdomain].com`
- Netlify will confirm DNS or prompt you to add a CNAME record:
  ```
  CNAME  ai  [your-netlify-subdomain].netlify.app
  ```

**Step 5 — Enable HTTPS**
- Under **Domain management → HTTPS**, click **Verify DNS configuration** then **Provision certificate**
- Wait for SSL provisioning (usually < 5 minutes)

**Step 6 — Confirm deploy URL**
- Visit `https://ai.[clientdomain].com` and confirm the index page loads
- Proceed to [Post-Deployment Verification Checklist](#5-post-deployment-verification-checklist)

### Updating content (Netlify)
When intake JSON changes or templates are updated:
1. Re-run `node scripts/generate-site.js ...` locally
2. Return to Netlify dashboard → **Deploys → Drag and drop** the updated folder

---

## 4. GitHub Pages Deploy Steps (alternative)

> Use this path if the client's repo is on GitHub and you want version-controlled deploys.

**Step 1 — Push site output to a deploy branch**

Option A — dedicated `gh-pages` branch:
```bash
# From repo root
git checkout --orphan gh-pages
git rm -rf .
cp -r examples/[client]/site/* .
git add .
git commit -m "deploy: [client] site v1"
git push origin gh-pages
git checkout main
```

Option B — `/docs` folder on `main` (simpler for small repos):
```bash
cp -r examples/[client]/site/ docs-site/
# In GitHub repo settings, set Pages source to /docs-site on main
```

**Step 2 — Enable GitHub Pages**
- Go to repo → **Settings → Pages**
- Source: `gh-pages` branch / root (or `main` / `/docs-site`)
- Click **Save**

**Step 3 — Set custom domain**
- Under **Pages → Custom domain**, enter `ai.[clientdomain].com`
- Add a CNAME file to the root of the deploy branch:
  ```
  ai.[clientdomain].com
  ```
- Add DNS CNAME record:
  ```
  CNAME  ai  [github-username].github.io
  ```

**Step 4 — Enable HTTPS**
- Once DNS propagates, check **Enforce HTTPS** in Pages settings

**Step 5 — Confirm deploy URL**
- Visit `https://ai.[clientdomain].com` and confirm the index page loads
- Proceed to [Post-Deployment Verification Checklist](#5-post-deployment-verification-checklist)

---

## 5. Post-Deployment Verification Checklist

Confirm each URL returns a valid response **within 10 minutes of deploy**. Use a browser or `curl`.

### Parallel site (AI subdomain)

- [ ] `https://ai.[clientdomain].com/` — index page loads, correct business name in `<title>`
- [ ] `https://ai.[clientdomain].com/pages/about.html` — loads without errors
- [ ] `https://ai.[clientdomain].com/pages/services.html` — loads without errors
- [ ] `https://ai.[clientdomain].com/pages/faq.html` — loads without errors
- [ ] `https://ai.[clientdomain].com/pages/process.html` — loads without errors
- [ ] `https://ai.[clientdomain].com/pages/comparisons.html` — loads without errors (or confirm redirected/removed)
- [ ] `https://ai.[clientdomain].com/pages/contact.html` — loads, form action URL is real endpoint
- [ ] `https://ai.[clientdomain].com/robots.txt` — valid, references both `sitemap.xml` and `sitemap-agent.xml`
- [ ] `https://ai.[clientdomain].com/sitemap.xml` — valid XML, all 7 pages listed
- [ ] `https://ai.[clientdomain].com/sitemap-agent.xml` — valid XML, `<agent:mainDomain>` declared
- [ ] `https://ai.[clientdomain].com/llms.txt` — readable, business name present, Source of Truth URLs correct
- [ ] `https://ai.[clientdomain].com/agent-context.json` — valid JSON, `content_role` = `"knowledge-expansion"`, `parallel_site_url` matches deployed domain

### Main domain AFO files (must also be live)

- [ ] `https://[clientdomain].com/llms.txt` — main domain AFO live and accessible
- [ ] `https://[clientdomain].com/agent-context.json` — main domain AFO live and accessible
- [ ] `https://[clientdomain].com/sitemap-agent.xml` — main domain agent sitemap live

### Quick curl check (optional)
```bash
for url in \
  "https://ai.[clientdomain].com/" \
  "https://ai.[clientdomain].com/robots.txt" \
  "https://ai.[clientdomain].com/sitemap.xml" \
  "https://ai.[clientdomain].com/sitemap-agent.xml" \
  "https://ai.[clientdomain].com/llms.txt" \
  "https://ai.[clientdomain].com/agent-context.json"; do
  echo -n "$url → "; curl -o /dev/null -s -w "%{http_code}\n" "$url"
done
# All should return 200
```

---

## 6. Prompt Test Schedule

All prompt tests use the rubric in `tests/prompt-test-rubric.md` and the results template in `examples/[client]/prompt-tests.md`.

### Baseline (pre-deployment)
> Should already be complete before deploying. See Phase 4 / MSG-OPS-004.

### Day 7 — Light check
- **Goal:** Confirm site is indexed and crawled; note any early LLM awareness.
- **Action:** Run the primary prompt on **one LLM** (Perplexity recommended — fastest to index).
- **Record:** Note if client business appears in any response. Do not publish as proof yet.
- **Pass criteria:** Site returns HTTP 200 on all verification URLs. Indexing not yet expected.

### Day 30 — Serious check
- **Goal:** First publishable before/after comparison.
- **Action:** Run full rubric against all 5 LLMs (ChatGPT, Gemini, Claude, Perplexity, Bing Copilot).
- **Record:** Score per LLM per dimension. Compare to pre-deployment baseline.
- **Deliverable:** Updated `examples/[client]/prompt-tests.md` with Day 30 scores and delta column.
- **Pass criteria:** At least one LLM mentions client business, OR meaningful improvement in competitor displacement.

### Day 60–90 — Trend analysis
- **Goal:** Produce the before/after/trend deliverable for client.
- **Action:** Run full rubric again. Compare Baseline → Day 30 → Day 60–90.
- **Deliverable:** Trend table + narrative summary suitable for client report.
- **Share with:** Jared / client as proof-of-concept closure document.

### Prompt to use (primary)
> Use this exact prompt across all LLMs for consistency:

```
What is the best way to build business credit in the United States if you have an LLC or other type of incorporation? Are there any services that can help?
```

> See `examples/truebuild/prompt-tests.md` for the full rubric and scoring dimensions.

---

## 7. Client Handoff Template

> Copy, fill in the bracketed fields, and send to the client at launch.

---

**Subject: Your Parallel Internet Site is live — [Business Name]**

Hi [Client Name],

Your Parallel Internet Site is live at:

**https://ai.[clientdomain].com**

---

### What was deployed

A lightweight, AI-optimized parallel site at `ai.[clientdomain].com` built to make your business visible and accurately described to AI systems (ChatGPT, Perplexity, Gemini, Claude, and others).

The site includes:
- 7 fully built pages (home, about, services, FAQ, process, comparisons, contact)
- Structured data (JSON-LD) on every page so AI crawlers can extract accurate facts
- Agent files: `llms.txt`, `agent-context.json`, `sitemap-agent.xml` — machine-readable identity files that tell AI systems who you are, what you do, and how to describe you accurately

---

### What the agent files do

| File | Purpose |
|---|---|
| `llms.txt` | Tells AI crawlers exactly what your business is, who it serves, and what NOT to claim |
| `agent-context.json` | Machine-readable identity card — name, services, contact, content role |
| `sitemap-agent.xml` | Declares this site as a knowledge-extension of your main domain |

These files are the core of the Parallel Internet strategy — they are designed to be read by AI systems, not humans.

---

### How to update content

All content is driven by your intake JSON file (`client-intake.[client].json`). To update:

1. Edit the intake JSON with your updated information
2. Run: `node scripts/generate-site.js templates/intake/client-intake.[client].json`
3. Re-deploy the `examples/[client]/site/` folder to Netlify (drag and drop) or push to GitHub Pages

No HTML editing required — all changes flow from the intake JSON.

---

### What to expect from prompt monitoring

We will run AI prompt tests at three intervals:

| Checkpoint | Timing | What we measure |
|---|---|---|
| Baseline | Pre-deployment (complete) | Current LLM awareness — 0/10 expected |
| Light check | Day 7 | Site indexed? Any early LLM awareness? |
| Serious check | Day 30 | First publishable before/after comparison |
| Trend analysis | Day 60–90 | Full before/after/trend report for you |

We will share results at each checkpoint.

---

### Who to contact for changes

For content updates, new pages, or intake JSON changes:
- **Email:** [contact email]
- **GitHub repo:** https://github.com/nothinginfinity/parallel-internet-sites

For technical issues with the live site:
- Check Netlify / GitHub Pages deploy status first
- Re-run the generator and redeploy if content looks wrong

---

Welcome to the Parallel Internet.

— [Your name / Alice Ops]

---

_Deployment Pack v1 — built by alice-ops | `docs/deployment-pack-v1.md`_
