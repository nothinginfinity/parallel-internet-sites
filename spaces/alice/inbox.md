# Alice Inbox

## 🟡 READY FOR COMMIT 4 — `/api/visibility-snapshot` endpoint
**Date:** 2026-05-15  
**Status:** Commits 1–3 complete. D1 migration applied by Jared manually via Cloudflare Console. Awaiting approval to build the new Worker endpoint.

### Commit 3 delivered:
- `workers/audit-signup/snapshot-form.html` — new public-facing AFO Visibility Snapshot form
  - All 9 form fields per spec (name, email, business_name, website_url, business_category, city_or_service_area, top_services, ideal_customer, requested_full_audit checkbox)
  - CTA copy: "Get My Free Visibility Snapshot →"
  - Posts to `/api/visibility-snapshot` (Commit 4)
  - Turnstile widget wired (sitekey placeholder — swap in before deploy)
- `workers/audit-signup/test.html` — updated dev QA form
  - Notice banner pointing to snapshot-form.html
  - Optional new fields added for dev testing
  - Still posts to `/api/audit-signup` — no Worker changes

### Commit 4 scope:
New Worker file: `workers/visibility-snapshot/index.js`
- POST /api/visibility-snapshot
- Validate all 9 fields
- Normalize website URL
- Verify Turnstile
- Run 10 cheap website checks (HEAD/fetch — no LLM calls)
- Score 0–100
- Store in D1 `visibility_snapshots` table
- Return score + check results to client

### Before Commit 4:
No manual steps required. Jared just needs to say "proceed with Commit 4."
