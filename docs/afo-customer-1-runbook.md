# AFO Customer #1 Self-Audit Runbook

> **Parallel Internet Sites — AFO Dogfood Runbook**
> Version: 1.0 | Created: 2026-05-14 | Author: alice
>
> This runbook walks through the complete process of auditing the AFO domain using our own AFO methodology, then deploying a Parallel Internet Site for it. We are our own first customer.

---

## Purpose

This is a self-audit: we apply our own product to our own domain. The goals are:

1. Validate that the AFO audit + intake + generate + deploy pipeline works end-to-end on a real domain
2. Establish a real pre-deployment baseline of LLM visibility for the AFO domain
3. Create a time-stamped experiment we can reference when talking to future clients
4. Surface any gaps or weaknesses in the pipeline before we run it for paying clients

---

## Step 1 — Run the Baseline First

**Before doing anything else,** capture current LLM visibility. This is the zero-point the experiment depends on.

1. Open `docs/llm-baseline-template.md`
2. Copy it to `examples/afo/prompt-tests/day-0-baseline.md`
3. Fill in every section for the AFO domain
4. Run at minimum: **ChatGPT, Perplexity, Gemini** — ideally all 5 (add Claude, Bing Copilot)
5. Use the exact prompts in the template — do not improvise
6. Record date, time, and model versions used
7. Commit to repo before any files are deployed: `git commit -m "test: AFO Day 0 baseline"`

> **Why this matters:** If you forget to run the baseline before deployment, you lose the before/after comparison forever. No baseline = no experiment.

---

## Step 2 — AFO Domain Audit

Apply the standard AFO audit methodology to `agentfeedoptimization.com` (or the chosen primary domain).

### 2a — Crawl & Inventory
- List all public-facing pages
- Note: does the domain currently have `llms.txt`? `robots.txt`? `sitemap.xml`? JSON-LD?
- Record what AI-readable signals (if any) currently exist

### 2b — Identity Clarity Check
For each question, answer as if you are an AI crawler reading the current site:
- [ ] What does this domain do? (Can you state it in one sentence from the homepage alone?)
- [ ] Who does it serve?
- [ ] What are the specific services or outputs?
- [ ] What should an AI NOT claim about this domain? (do_not_claim candidates)
- [ ] Is there a clear canonical identity?

### 2c — Gaps Identified
List every gap between current state and full AFO compliance:
- Missing files (llms.txt, agent-context.json, sitemap-agent.xml)
- Missing structured data (JSON-LD on key pages)
- Unclear or missing identity signals
- Content that could cause AI misrepresentation

### 2d — Audit Report
Produce `examples/afo/audit/audit-report-afo.md` using the standard audit report format from `agent-feed-optimization` repo.

---

## Step 3 — Build the AFO Intake JSON

Using findings from the audit, populate `templates/intake/client-intake.afo.json`.

Key fields specific to AFO:

```json
{
  "client_id": "afo",
  "business_name": "Agent Feed Optimization",
  "primary_domain": "agentfeedoptimization.com",
  "parallel_site_subdomain": "ai.agentfeedoptimization.com",
  "content_role": "knowledge-expansion",
  "canonical_identity_source": "https://agentfeedoptimization.com",
  "cross_domain_entity_id": "agentfeedoptimization.com"
}
```

Fill all required fields. Run the generator with `--dry-run` or check for zero unmatched token warnings.

---

## Step 4 — Generate the Site

```bash
node scripts/generate-site.js templates/intake/client-intake.afo.json
```

**Expected output directory:** `examples/afo/site/`

Confirm:
- Zero unmatched token warnings
- All 7 pages generated
- Spot-check: `index.html` title, `llms.txt` business name, `agent-context.json` fields

---

## Step 5 — Deploy to Cloudflare Pages

> Cloudflare Pages is the preferred host for AFO (fast global CDN, free tier, easy custom domains).

**Step 5a — Cloudflare Pages setup**
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages → Create application → Pages → Upload assets**
3. Upload the `examples/afo/site/` folder contents
4. Note the assigned `*.pages.dev` URL for initial verification

**Step 5b — Custom domain**
1. In Pages project: **Custom domains → Set up a custom domain**
2. Enter `ai.agentfeedoptimization.com`
3. Cloudflare will auto-provision DNS if the domain is already on Cloudflare (most likely yes)
4. HTTPS provisioned automatically — no extra steps

**Step 5c — Verify**
Run the full Post-Deployment Verification Checklist from `docs/deployment-pack-v1.md` Section 5 against `ai.agentfeedoptimization.com`.

---

## Step 6 — Install Main-Domain AFO Files

Deploy the following files to the root of `agentfeedoptimization.com`:

| File | Source | Purpose |
|------|--------|---------|
| `llms.txt` | `examples/afo/site/llms.txt` | Main-domain AI identity signal |
| `agent-context.json` | `examples/afo/site/agent-context.json` | Machine-readable identity card |
| `sitemap-agent.xml` | `examples/afo/site/sitemap-agent.xml` | Cross-domain entity declaration |

> These files must be live on `agentfeedoptimization.com` before or at the same time as the parallel site launches. The parallel site's `canonical_identity_source` points to the main domain — if those files don't exist there, agent reconciliation breaks.

---

## Step 7 — Record Day 0 Deployment

1. Fill in `docs/monitoring/day-0-deploy.md` immediately after deployment
2. Record: deploy timestamp, all deployed URLs, main-domain AFO file URLs, initial verification results
3. Commit: `git commit -m "test: AFO Day 0 deployment record"`

---

## Step 8 — Monitor

Follow the monitoring schedule:

| Checkpoint | File | Action |
|------------|------|--------|
| Day 0 | `docs/monitoring/day-0-deploy.md` | Record deployment facts |
| Day 7 | `docs/monitoring/day-7.md` | Light check — crawl, early signals |
| Day 30 | `docs/monitoring/day-30.md` | First before/after comparison |
| Day 60–90 | `docs/monitoring/day-60-90.md` | Trend analysis + proof deliverable |

---

## Honesty Rules

This is an experiment, not a demo. Report what you actually observe:

- ✅ Report: "Day 30 — Perplexity now returns AFO in response to X prompt. Score improved from 0/5 to 2/5."
- ✅ Report: "Day 30 — No measurable change yet across all 5 LLMs."
- ❌ Do not: Extrapolate from one LLM to claim "LLM visibility established."
- ❌ Do not: Present early results as proof of ranking improvement.
- ❌ Do not: Attribute improvement to AFO files alone — crawl timing, domain age, content quality all contribute.

The experiment is valuable whether the results are dramatic or modest. Report honestly.

---

_AFO Customer #1 Self-Audit Runbook v1.0 | `docs/afo-customer-1-runbook.md`_
