# AFO Visibility Snapshot — Launch Readiness Checklist

> This is the final gate before flipping the public CTA live.
> Every item must be ✅ before launch.
> Owner: Jared. Executor: Alice.

---

## 1. Infrastructure

- [ ] `wrangler deploy` completes cleanly on latest `main`
- [ ] `GET /api/health` returns `{ ok: true, version: "afo-v1" }` on production Worker URL
- [ ] D1 migration `docs/migration-v2.sql` has been applied to **production** database (`afo-v1`)
- [ ] `visibility_snapshots` table confirmed present in production D1
- [ ] `rate_limits` table confirmed present (or will auto-create on first request)
- [ ] Cloudflare Worker CPU/memory limits reviewed — snapshot checks run ~6s max per request
- [ ] Worker route is bound to the correct domain/subdomain in Cloudflare dashboard

---

## 2. Secrets (Cloudflare Dashboard → Settings → Variables)

- [ ] `TURNSTILE_SECRET` — set to live site key (not test key)
- [ ] `EMAIL_PROVIDER` — set to `resend` or `sendgrid`
- [ ] `EMAIL_API_KEY` — live key for chosen provider
- [ ] `EMAIL_FROM` — verified sender address (must be verified in Resend/SendGrid)
- [ ] `ADMIN_EMAIL` — receives admin notification on each snapshot
- [ ] `GITHUB_TOKEN` — scoped to `agent-feed-optimization` repo, `issues: write`
- [ ] `GIT_HUBTOKEN_AFO` — confirm this is the secret name used in the deploy workflow

---

## 3. Turnstile

- [ ] Turnstile widget is embedded on the public snapshot form
- [ ] Turnstile site key matches the domain in the Cloudflare Turnstile dashboard
- [ ] Form cannot be submitted without a valid Turnstile token
- [ ] `cf_turnstile_response: "SKIP"` only works when `TURNSTILE_SECRET = SKIP_IN_DEV` (verify this is NOT set in production)

---

## 4. Rate Limiting

- [ ] IP limit: 3 snapshots / 24h — confirmed via QA checklist §4
- [ ] Email limit: 2 snapshots / 24h — confirmed
- [ ] Domain limit: 1 snapshot / 24h — confirmed
- [ ] 429 response includes `Retry-After` header
- [ ] Rate limit table is not shared with audit-signup (it is not — separate table)

---

## 5. Free vs Paid Boundary (see `docs/product-boundary.md`)

- [ ] `/api/visibility-snapshot` never calls paid LLM APIs ✅ (by design)
- [ ] `/api/visibility-snapshot` never calls Perplexity API ✅ (by design)
- [ ] Full audit is NOT triggered automatically — it requires manual approval by Jared
- [ ] `requested_full_audit: true` only creates a GitHub issue — no automated fulfillment
- [ ] Paid audit boundary language is live on the results page CTA

---

## 6. Email

- [ ] Confirmation email sends to user on snapshot submission (test with real address)
- [ ] Admin notification sends to `ADMIN_EMAIL` on each snapshot
- [ ] Email `From` address passes SPF/DKIM (check with mail-tester.com)
- [ ] Emails do not land in spam (test with ProtonMail, Gmail, Apple Mail)

> Note: snapshot confirmation email template should be added before launch (currently only audit-signup sends emails — add snapshot confirmation in a follow-up commit if needed).

---

## 7. Results Page

- [ ] `/results` page loads correctly from a real `results_url` returned by `/api/visibility-snapshot`
- [ ] Score ring animates on load
- [ ] Copy-to-clipboard works on desktop and mobile
- [ ] CTA links to correct booking/contact URL (update hardcoded URL in `results-page.js` if needed)
- [ ] Page is readable at 375px mobile viewport
- [ ] No console errors in browser DevTools

---

## 8. AFO Website Integration

- [ ] Public snapshot form on `agentfeedoptimization.com` points to production Worker URL
- [ ] Form collects all required fields: name, email, website_url, business_name, business_category, city_or_service_area, top_services
- [ ] Optional fields present: ideal_customer, requested_full_audit checkbox
- [ ] On successful response, frontend redirects to `results_url`
- [ ] Form shows a friendly error message on 400/429/500 responses
- [ ] Turnstile widget is visible and functional on the form

---

## 9. QA Sign-off

- [ ] All items in `docs/qa-checklist.md` marked ✅
- [ ] Regression test: `/api/audit-signup` still works (run §1 of qa-checklist)
- [ ] Snapshot tested against `agentfeedoptimization.com` itself (dogfood)
- [ ] Results page reviewed by Jared — copy, prompts, CTA all approved

---

## 10. Go / No-Go Decision

| Item | Status |
|---|---|
| Infrastructure ✅ | |
| Secrets ✅ | |
| Turnstile live ✅ | |
| Rate limits confirmed ✅ | |
| Free/paid boundary enforced ✅ | |
| Email working ✅ | |
| Results page approved ✅ | |
| AFO site wired ✅ | |
| QA signed off ✅ | |

> When all rows above are ✅, Jared approves and Alice flips the public CTA live.
