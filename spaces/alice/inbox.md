# Alice Inbox

## 🟡 READY FOR COMMIT 5 — Prompt Generator module + thank-you/results page
**Date:** 2026-05-15  
**Status:** Commits 1–4 complete. Awaiting deploy of visibility-snapshot Worker + Commit 5 approval.

### Commit 4 delivered:
- `workers/visibility-snapshot/index.js` — full Worker:
  - POST /api/visibility-snapshot
  - Turnstile verification
  - D1-backed rate limiting (IP + email + domain, 24h window)
  - 10 concurrent cheap checks (HEAD/fetch, 5–8s timeout each)
  - 0–100 scoring with A–F grade
  - 5 deterministic Ideal Visibility Prompts (zero LLM API calls)
  - Customer resolve-or-create (reuses existing customer record by email)
  - Snapshot stored in visibility_snapshots table
- `workers/visibility-snapshot/wrangler.toml` — correct D1 binding (afo-v1)
- `workers/visibility-snapshot/README.md` — full check/score/prompt reference

### To deploy Commit 4:
```bash
cd workers/visibility-snapshot
wrangler deploy
```
Then set the `TURNSTILE_SECRET` secret:
```bash
wrangler secret put TURNSTILE_SECRET
```

### Commit 5 scope:
- Thank-you / results page (`workers/visibility-snapshot/results.html`)
  - Displays score + grade badge
  - Shows check-by-check results
  - Renders the 5 Ideal Visibility Prompts with copy buttons
  - Self-test instructions for ChatGPT, Gemini, Claude, Perplexity
  - CTA: Book a call / full audit
- No new Worker changes

### Before Commit 5:
No manual steps required. Just say "proceed with Commit 5."
