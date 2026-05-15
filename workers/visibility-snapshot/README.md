# visibility-snapshot Worker

**Route:** `POST /api/visibility-snapshot`  
**Purpose:** Free AFO Visibility Snapshot — cheap checks only, zero LLM API calls.

## What it does

1. Validates all 9 required fields
2. Verifies Cloudflare Turnstile
3. Rate limits by IP + email + domain (D1-backed, 24-hour window)
4. Runs 10 cheap website checks concurrently (HEAD/fetch — no paid APIs)
5. Scores 0–100 (normalised across check point values)
6. Generates 3–5 deterministic Ideal Visibility Prompts
7. Resolves or creates the customer record in D1
8. Stores the snapshot in `visibility_snapshots`
9. Returns score + grade + checks + prompts as JSON

## Checks & Points

| Check | Points |
|---|---|
| Website reachable | 10 |
| robots.txt present | 5 |
| sitemap.xml present | 10 |
| llms.txt present | 20 |
| agent-context.json present | 15 |
| sitemap-agent.xml present | 10 |
| Title + meta description | 10 |
| JSON-LD structured data | 10 |
| Contact page detectable | 5 |
| HTTPS enforced | 5 |

**Total possible:** 100 points

## Score Grades

| Score | Grade | Label |
|---|---|---|
| 80–100 | A | AI-Ready |
| 60–79 | B | Mostly Visible |
| 40–59 | C | Partially Visible |
| 20–39 | D | Low Visibility |
| 0–19 | F | Not Visible to AI |

## Prompt Types

1. **Category Discovery** — Does your business appear when someone searches your category?
2. **Problem / Solution** — Do LLMs recommend you for the problem you solve?
3. **Local / Service Area** — Are you visible for local searches?
4. **Service Comparison** — Do you appear in comparison queries?
5. **Direct Brand Accuracy** — Do LLMs describe your business correctly?

## Environment Variables

Set in Cloudflare dashboard as secrets:
- `TURNSTILE_SECRET` — Cloudflare Turnstile secret key

Set in `wrangler.toml` (or override as secrets):
- `SNAPSHOT_RATE_LIMIT_WINDOW_HOURS` — default `24`
- `SNAPSHOT_MAX_PER_DOMAIN` — default `3`

## Deploy

```bash
cd workers/visibility-snapshot
wrangler deploy
```

## Does NOT

- Call any paid LLM APIs (OpenAI, Anthropic, Perplexity)
- Modify the `/api/audit-signup` Worker or `audit_requests` table
- Run any real-time AI queries
