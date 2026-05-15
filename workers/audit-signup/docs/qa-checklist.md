# AFO Visibility Snapshot — Manual QA Checklist

> Run this checklist before every public launch or deploy to production.
> All tests use `curl` or the `/test` page unless noted.
> Turnstile is bypassed in dev via `cf_turnstile_response: "SKIP"`.

---

## 0. Pre-flight

- [ ] `wrangler deploy` completes with no errors
- [ ] `GET /api/health` returns `{ ok: true, version: "afo-v1" }`
- [ ] D1 migration has been applied (run `docs/migration-v2.sql` if not already done)
- [ ] `visibility_snapshots` table exists in D1
- [ ] `rate_limits` table exists in D1 (created automatically on first snapshot request)

---

## 1. /api/audit-signup — regression (must not be broken)

```bash
curl -s -X POST https://<worker-url>/api/audit-signup \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "QA Test",
    "email": "qa@example.com",
    "business_name": "QA Corp",
    "website_url": "example.com",
    "coupon_code": "AFO-FOUNDER",
    "cf_turnstile_response": "SKIP"
  }' | jq .
```

- [ ] Returns `{ ok: true, audit_request_id: "...", plan: "founder_free" }`
- [ ] Row inserted in `audit_requests` table
- [ ] GitHub issue created in `agent-feed-optimization` repo (check Issues tab)
- [ ] Confirmation email sent (or logged if provider = log)

---

## 2. /api/visibility-snapshot — happy path

```bash
curl -s -X POST https://<worker-url>/api/visibility-snapshot \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "QA User",
    "email": "qa-snapshot@example.com",
    "website_url": "https://agentfeedoptimization.com",
    "business_name": "Agent Feed Optimization",
    "business_category": "Digital Marketing",
    "city_or_service_area": "San Juan Capistrano, CA",
    "top_services": "AFO audit, LLM visibility, AI search optimization",
    "ideal_customer": "local service businesses",
    "cf_turnstile_response": "SKIP"
  }' | jq .
```

- [ ] Returns `{ ok: true, snapshot_id: "...", score: <number>, band: "...", results_url: "/results?..." }`
- [ ] `score` is between 0 and 100
- [ ] `band` is one of: `Not AI-Visible`, `Partially Visible`, `Mostly Visible`, `AI-Ready`
- [ ] `results_url` is a valid path starting with `/results?`
- [ ] Row inserted in `visibility_snapshots` table with correct fields
- [ ] `snapshot_json` column contains valid JSON with check results
- [ ] `generated_prompts_json` column contains an array of 3–5 prompts
- [ ] `audit_tier` = `free_snapshot`
- [ ] `audit_status` = `snapshot_done`

---

## 3. /api/visibility-snapshot — validation errors

### 3a. Missing required field
```bash
curl -s -X POST https://<worker-url>/api/visibility-snapshot \
  -H 'Content-Type: application/json' \
  -d '{ "name": "QA", "email": "qa@example.com" }' | jq .
```
- [ ] Returns `{ ok: false, error: "Missing required field: website_url" }` (or whichever field)
- [ ] HTTP status 400

### 3b. Invalid email
```bash
curl -s -X POST https://<worker-url>/api/visibility-snapshot \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "QA", "email": "notanemail",
    "website_url": "example.com",
    "business_name": "X", "business_category": "X",
    "city_or_service_area": "X", "top_services": "X",
    "cf_turnstile_response": "SKIP"
  }' | jq .
```
- [ ] Returns `{ ok: false, error: "Invalid email address" }`
- [ ] HTTP status 400

### 3c. Invalid website URL
```bash
# Use a clearly invalid URL
curl -s -X POST https://<worker-url>/api/visibility-snapshot \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "QA", "email": "qa@example.com",
    "website_url": "not a url at all !!!",
    "business_name": "X", "business_category": "X",
    "city_or_service_area": "X", "top_services": "X",
    "cf_turnstile_response": "SKIP"
  }' | jq .
```
- [ ] Returns `{ ok: false, error: "Invalid website_url" }`
- [ ] HTTP status 400

---

## 4. Rate limiting

> Run the happy-path request from §2 three times in a row with the same email/domain.

- [ ] 1st request: `{ ok: true }` ✅
- [ ] 2nd request (same email): `{ ok: true }` ✅ (email limit = 2/24h)
- [ ] 3rd request (same email): HTTP 429, `{ ok: false, error: "Rate limit exceeded for email..." }`
- [ ] `Retry-After` header is present on the 429 response
- [ ] Domain limit: a 2nd request for the same domain from a different email also returns 429

---

## 5. Website checks — spot check known sites

Run the happy path against two known sites and verify check results make sense:

### 5a. Site that should score high (e.g. a well-configured site)
- [ ] `reachable: true`
- [ ] `title_present: true`
- [ ] `meta_description: true`
- [ ] `robots_txt: true`
- [ ] `sitemap_xml: true`

### 5b. A minimal/new site (should score low)
- [ ] `llms_txt: false`
- [ ] `agent_context: false`
- [ ] `sitemap_agent: false`
- [ ] Score reflects missing AFO signals

### 5c. Unreachable domain
```bash
# Use a domain that definitely does not resolve
"website_url": "https://this-domain-does-not-exist-afo-qa-test.com"
```
- [ ] `reachable: false`
- [ ] All checks: false
- [ ] Score = 0
- [ ] Response still returns `{ ok: true }` — snapshot is stored with score 0

---

## 6. /results page — manual browser check

Open this URL in a browser (substitute real values):

```
/results?business_name=AFO&website_url=agentfeedoptimization.com&score=45&checks=reachable,title_present,meta_description&business_category=Digital+Marketing&city=San+Juan+Capistrano,+CA&services=AFO+audit
```

- [ ] Page loads without JS errors (check browser console)
- [ ] Score ring displays correct value
- [ ] Score band label matches the score (45 → 🟠 Partially Visible)
- [ ] Passed checks show ✅, failed checks show ❌
- [ ] At least 3 prompt cards are displayed
- [ ] Each prompt card has a working Copy button
- [ ] Platform badges (ChatGPT, Gemini, Claude, Perplexity) are visible
- [ ] CTA section is visible at the bottom
- [ ] Page is readable on mobile (375px viewport)
- [ ] Dark/light mode not broken (if applicable)

### 6a. Requested full audit flag
```
/results?...&requested_full_audit=1
```
- [ ] CTA section shows "Full Audit Requested" confirmation copy
- [ ] Does NOT show the "Book a Call" CTA (already requested)

---

## 7. /api/visibility-snapshot — full audit request + GitHub issue

```bash
curl -s -X POST https://<worker-url>/api/visibility-snapshot \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "QA Full",
    "email": "qa-full@example.com",
    "website_url": "https://example.com",
    "business_name": "Full Audit Co",
    "business_category": "Legal",
    "city_or_service_area": "Orange County, CA",
    "top_services": "estate planning, probate",
    "ideal_customer": "families with assets over $1M",
    "requested_full_audit": true,
    "cf_turnstile_response": "SKIP"
  }' | jq .
```

- [ ] Returns `{ ok: true }`
- [ ] `_debug.github.ok` = true
- [ ] GitHub issue created with label `snapshot-full-request`
- [ ] Issue title includes business name + score + band emoji
- [ ] `requested_full_audit` = 1 in D1 row

---

## 8. CORS / OPTIONS preflight

```bash
curl -s -X OPTIONS https://<worker-url>/api/visibility-snapshot \
  -H 'Origin: https://agentfeedoptimization.com' \
  -H 'Access-Control-Request-Method: POST' -v 2>&1 | grep -i access-control
```

- [ ] `Access-Control-Allow-Origin: *` present
- [ ] `Access-Control-Allow-Methods` includes POST
- [ ] HTTP 204

---

## 9. Prompt quality spot check

For the happy-path response, inspect `_debug` → check that prompts look reasonable:

- [ ] 3–5 prompts returned
- [ ] Each prompt is a complete, natural-language sentence
- [ ] Prompts reference the actual business name, category, and/or service area
- [ ] No placeholder text like `[BUSINESS]` or `undefined` in prompt strings
- [ ] Prompt types cover at least: category discovery, local/service-area, direct brand

---

## 10. Sign-off

| Area | Tester | Date | Pass/Fail |
|---|---|---|---|
| Regression — audit-signup | | | |
| Snapshot happy path | | | |
| Validation errors | | | |
| Rate limiting | | | |
| Website checks | | | |
| Results page | | | |
| Full audit GitHub issue | | | |
| CORS | | | |
| Prompt quality | | | |

> All items must be ✅ before public launch.
> Open a GitHub issue for any failures found.
