# Alice Inbox

## 🟡 READY FOR COMMIT 5 — Results / thank-you page
**Date:** 2026-05-15  
**Status:** Commits 1–4 + 4b complete. Worker code and deploy workflow are live on main.

### Commit 4b delivered:
- `.github/workflows/deploy-visibility-snapshot.yml`
  - Mirrors deploy-audit-signup.yml exactly
  - Triggers on push to `workers/visibility-snapshot/**` or manual workflow_dispatch
  - Deploys via `cloudflare/wrangler-action@v3`
  - Sets `TURNSTILE_SECRET` from `secrets.TURNSTILE_SECRET` GitHub repo secret
  - Uses existing `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets

### One manual step before first deploy:
Add `TURNSTILE_SECRET` as a GitHub repo secret:
1. Go to github.com/nothinginfinity/parallel-internet-sites/settings/secrets/actions
2. Click "New repository secret"
3. Name: `TURNSTILE_SECRET`
4. Value: your Cloudflare Turnstile **secret** key (from dash.cloudflare.com → Turnstile)
5. Save — then trigger the workflow via Actions → Deploy visibility-snapshot Worker → Run workflow

### Commit 5 scope:
- `workers/visibility-snapshot/results.html`
  - Score badge (0–100) with A–F grade + colour
  - Check-by-check results list (pass/fail)
  - 5 Ideal Visibility Prompts with one-tap copy buttons
  - Self-test instructions for ChatGPT, Gemini, Claude, Perplexity
  - CTA to book a call / request full audit
- No Worker changes

### Before Commit 5:
No manual steps needed. Just say "proceed with Commit 5."
