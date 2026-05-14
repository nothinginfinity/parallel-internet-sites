# AFO Audit Signup Worker

Cloudflare Worker handling `POST /api/audit-signup` for the AFO v1 dogfood launch.

## What it does

1. Validates required fields + email format
2. Normalizes `website_url`
3. Verifies Cloudflare Turnstile token (skippable in dev via `TURNSTILE_SECRET=SKIP_IN_DEV`)
4. Validates founder coupon codes (`AFO-FOUNDER`, `AFO-DOGFOOD`)
5. Upserts customer + creates `audit_request` record in D1
6. Logs coupon redemption if applicable
7. Sends confirmation email to customer + admin notification
8. Creates GitHub Issue in `agent-feed-optimization` repo for Alice/Jared to action

## Setup

```bash
# 1. Create D1 database
wrangler d1 create afo-v1
# Copy the database_id into wrangler.toml

# 2. Run migrations
wrangler d1 execute afo-v1 --file=migrations/0001_initial.sql

# 3. Set secrets
wrangler secret put TURNSTILE_SECRET
wrangler secret put EMAIL_API_KEY
wrangler secret put EMAIL_FROM
wrangler secret put ADMIN_EMAIL
wrangler secret put GITHUB_TOKEN

# 4. Deploy
wrangler deploy
```

## Environment Variables

| Variable | Type | Required | Notes |
|---|---|---|---|
| `DB` | D1 binding | ✅ | Set in wrangler.toml |
| `TURNSTILE_SECRET` | Secret | ✅ | Set to `SKIP_IN_DEV` to bypass locally |
| `EMAIL_PROVIDER` | Var | ✅ | `resend` \| `sendgrid` \| `log` |
| `EMAIL_API_KEY` | Secret | ✅ | Provider API key |
| `EMAIL_FROM` | Secret | ✅ | Verified sender address |
| `ADMIN_EMAIL` | Secret | ✅ | Jared's email for notifications |
| `GITHUB_TOKEN` | Secret | Optional | Fine-grained PAT, Issues read/write only |
| `GITHUB_REPO_OWNER` | Var | Optional | Default: `nothinginfinity` |
| `GITHUB_REPO_NAME` | Var | Optional | Default: `agent-feed-optimization` |

## Coupon Codes

| Code | Plan granted |
|---|---|
| `AFO-FOUNDER` | `founder_free` |
| `AFO-DOGFOOD` | `founder_free` |
| (none) | `audit_only_v1` |

## GitHub Token Permissions

Create a **fine-grained personal access token** with **only** these permissions:
- Repository: `nothinginfinity/agent-feed-optimization`
- Permissions: `Issues` → Read and Write

No repo write, no code access. The worker cannot push files — that's intentional.
