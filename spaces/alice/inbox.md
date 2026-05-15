# Alice Inbox

## 🟡 READY FOR COMMIT 6 — Rate limiting / abuse controls
**Date:** 2026-05-15  
**Status:** Commits 1–5 complete. Full snapshot form + results page live. Awaiting Commit 6 approval.

### Commit 5 delivered:
- `workers/visibility-snapshot/results.html` — full results page:
  - Animated score ring (0–100) with A–F grade badge + colour coding
  - Animated score bar
  - 10-point check breakdown (pass/fail with points)
  - 5 Ideal Visibility Prompts with one-tap copy buttons
  - Self-test links to ChatGPT, Gemini, Claude, Perplexity
  - “What good looks like” personalised ideal response example
  - CTA card: book a call (or “audit requested” state if checkbox was checked)
  - Reads result from sessionStorage (set by form on successful POST)
- `workers/audit-signup/snapshot-form.html` — updated:
  - On success: stores result in sessionStorage + redirects to results.html
  - Passes _meta (business_name, city, services) through for results page personalisation

### Commit 6 scope (next):
Docs update — free vs paid audit boundary definition:
- `docs/afo-product-tiers.md`
  - Free Snapshot tier spec
  - Paid Basic tier spec
  - Pro Install tier spec
  - Growth / Monitoring tier spec
  - Sales boundary rules (what triggers upsell)

Note: Rate limiting is already built into the Worker (Commit 4). Commit 6 is docs only per the roadmap.

### Before Commit 6:
No manual steps required. Just say “proceed with Commit 6.”
