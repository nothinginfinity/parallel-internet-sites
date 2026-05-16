# AFO Visibility Snapshot Worker

Serves `agentfeedoptimization.com` — the free AFO Visibility Snapshot funnel.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/start` | Snapshot intake form (8 fields + Turnstile) |
| `GET` | `/results` | Results page — score ring, checks, prompts, CTA |
| `POST` | `/api/visibility-snapshot` | Runs 10 cheap checks, scores, generates prompts, stores in D1 |

## Environment

| Binding | Type | Value |
|---------|------|-------|
| `DB` | D1 | `afo-v1` |
| `TURNSTILE_SECRET` | Secret | Set via GitHub Actions |
| `TURNSTILE_SITE_KEY` | Var | Set in Cloudflare dashboard |
| `SNAPSHOT_RATE_LIMIT_WINDOW_HOURS` | Var | `24` |
| `SNAPSHOT_MAX_PER_DOMAIN` | Var | `3` |

## Deploy

Auto-deploys on push to `workers/visibility-snapshot/**` via `.github/workflows/deploy-visibility-snapshot.yml`.

## D1 Migration

Apply `db/migrations/002_visibility_snapshot_fields.sql` to production before first use:

```bash
npx wrangler d1 execute afo-v1 --file=db/migrations/002_visibility_snapshot_fields.sql --remote
```

## Free vs Paid Boundary

- **Free:** Visibility Snapshot — 10 cheap checks + 5 ideal prompts. No LLM API calls.
- **Paid Basic:** Full AFO audit report.
- **Pro:** AFO file install (`llms.txt`, `agent-context.json`, `sitemap-agent.xml`).
- **Growth:** Parallel Internet Site + 30/60/90 monitoring.

See `docs/afo-funnel-roadmap-v1.md` for full product boundary spec.
