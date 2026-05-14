# AFO v1 Launch Checklist
_status: pre-launch | updated: 2026-05-14_

This checklist covers everything needed to go live with the AFO v1 dogfood launch. Complete in order. Do not skip the baseline step.

---

## Phase 1 — Infrastructure

- [ ] **Buy domain** — `agentfeedoptimization.com` (if not already owned)
- [ ] **Add domain to Cloudflare** — add as a site, update nameservers at registrar
- [ ] **Set up Cloudflare Pages**
  - Connect to `nothinginfinity/parallel-internet-sites` repo
  - Build command: (static, none required)
  - Output directory: `examples/afo/` (or your generated output path)
- [ ] **Configure custom domains on Cloudflare Pages**
  - `agentfeedoptimization.com` → main site
  - `ai.agentfeedoptimization.com` → parallel site (subdomain CNAME to Pages)

---

## Phase 2 — Backend

- [ ] **Create D1 database**
  ```bash
  wrangler d1 create afo-v1
  # Copy database_id into workers/audit-signup/wrangler.toml
  ```
- [ ] **Run migrations**
  ```bash
  wrangler d1 execute afo-v1 --file=workers/audit-signup/migrations/0001_initial.sql
  ```
- [ ] **Create Turnstile keys**
  - Cloudflare Dashboard → Turnstile → Add site
  - Domain: `agentfeedoptimization.com`
  - Copy site key → `templates/intake/client-intake.afo.json` → `tokens.TURNSTILE_SITE_KEY`
  - Copy secret key → set as Worker secret
- [ ] **Choose and configure email provider**
  - Recommended: Resend (`resend.com`) — free tier covers early launch
  - Verify sender domain in provider dashboard
  - Set `EMAIL_PROVIDER=resend` in `wrangler.toml`
- [ ] **Configure Worker env vars and secrets**
  ```bash
  wrangler secret put TURNSTILE_SECRET
  wrangler secret put EMAIL_API_KEY
  wrangler secret put EMAIL_FROM        # e.g. hello@agentfeedoptimization.com
  wrangler secret put ADMIN_EMAIL       # Jared's notification email
  wrangler secret put GITHUB_TOKEN      # fine-grained PAT, Issues r/w only
  ```
- [ ] **Deploy Worker**
  ```bash
  cd workers/audit-signup
  wrangler deploy
  ```
- [ ] **Verify Worker health endpoint**
  ```
  GET https://agentfeedoptimization.com/api/health
  # Expected: { "ok": true, "version": "afo-v1" }
  ```
- [ ] **Create GitHub fine-grained PAT for issue bridge**
  - Settings → Developer Settings → Fine-grained tokens
  - Repository: `nothinginfinity/agent-feed-optimization`
  - Permissions: Issues → Read and Write only
  - Add labels `audit-request` and `dogfood-v1` to the repo first

---

## Phase 3 — Site

- [ ] **Generate AFO site** using `templates/intake/client-intake.afo.json`
  - Confirm `start.html` is included in output
  - Confirm `thanks.html` is included in output
  - Confirm nav includes "Start Free Audit" CTA link
- [ ] **Confirm `{{TURNSTILE_SITE_KEY}}` is replaced** in `start.html` output
- [ ] **Confirm `{{AUDIT_SIGNUP_ENDPOINT}}` is replaced** with `https://agentfeedoptimization.com/api/audit-signup`
- [ ] **CORS check** — Worker allows requests from `agentfeedoptimization.com`

---

## Phase 4 — Baseline LLM Test (CRITICAL — do before any AFO files deploy)

> ⚠️ **This step must happen before any AFO context files touch the domain.**
> The baseline is the zero-point. It cannot be recreated after deployment.

- [ ] **Run `docs/llm-baseline-template.md`** against `agentfeedoptimization.com`
- [ ] **Save results** to `examples/afo/prompt-tests/day-0-baseline.md`
- [ ] **Commit** the baseline file (so it is timestamped and immutable)
- [ ] **Set `baseline_completed: true`** and `baseline_date` in `client-intake.afo.json`
- [ ] **Do not deploy AFO files until baseline is committed**

---

## Phase 5 — First Customer Submission (Jared as Customer #1)

- [ ] **Submit Jared as Customer #1** using the live `/start` form:
  - Name: Jared
  - Email: (Jared's email)
  - Business: Agent Feed Optimization
  - Website: https://agentfeedoptimization.com
  - Coupon: `AFO-FOUNDER`
- [ ] **Confirm D1 row created** in `audit_requests` table
  ```bash
  wrangler d1 execute afo-v1 --command="SELECT * FROM audit_requests LIMIT 5;"
  ```
- [ ] **Confirm confirmation email** received in Jared's inbox
- [ ] **Confirm admin notification email** received
- [ ] **Confirm GitHub Issue created** in `agent-feed-optimization` repo

---

## Phase 6 — AFO File Deployment

- [ ] **Deploy AFO context files** to `agentfeedoptimization.com`
  - `/agent-context.json`
  - `/llms.txt`
  - `/agent-policy.json`
  - `/context-cookie.json`
  - `/agent-actions.json`
  - `/sitemap.xml` (updated with all pages)
- [ ] **Set `afo_files_deployed: true`** and `afo_deploy_date` in `client-intake.afo.json`
- [ ] **Complete Day 0 monitoring record** in `docs/monitoring/day-0-deploy.md`

---

## Phase 7 — Monitoring Cadence

- [ ] Day 7 — `docs/monitoring/day-7.md`
- [ ] Day 30 — `docs/monitoring/day-30.md`
- [ ] Day 60+90 — `docs/monitoring/day-60-90.md`

---

## Success Criteria

| Criterion | Status |
|---|---|
| Visitor can enter email + website URL | ☐ |
| Submission protected by Turnstile | ☐ |
| D1 audit request record created | ☐ |
| Customer confirmation email sent | ☐ |
| Admin notification email sent | ☐ |
| GitHub issue created for each signup | ☐ |
| Founder coupon `AFO-FOUNDER` accepted | ☐ |
| Jared submitted as Customer #1 | ☐ |
| Baseline LLM test committed before AFO files | ☐ |
| No Stripe / no payment required | ☐ |
