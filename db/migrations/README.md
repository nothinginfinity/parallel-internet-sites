# D1 Migrations

All migrations are additive and safe to run in order.

## How to apply

```bash
# Apply a single migration
wrangler d1 execute <DB_NAME> --file=db/migrations/002_visibility_snapshot_fields.sql

# Verify tables
wrangler d1 execute <DB_NAME> --command="SELECT name FROM sqlite_master WHERE type='table';"

# Verify new columns on audit_requests
wrangler d1 execute <DB_NAME> --command="PRAGMA table_info(audit_requests);"

# Verify visibility_snapshots table
wrangler d1 execute <DB_NAME> --command="PRAGMA table_info(visibility_snapshots);"
```

## Migration log

| # | File | Date | Description |
|---|---|---|---|
| 001 | *(initial schema)* | 2026-05-14 | customers, audit_requests, coupon_redemptions |
| 002 | `002_visibility_snapshot_fields.sql` | 2026-05-15 | Add snapshot columns to audit_requests; create visibility_snapshots table |

## Schema Notes

### audit_requests — new columns (002)
| Column | Type | Default | Notes |
|---|---|---|---|
| `business_category` | TEXT | NULL | e.g. "Physical Therapy", "HVAC" |
| `service_area` | TEXT | NULL | e.g. "San Juan Capistrano, CA" |
| `top_services` | TEXT | NULL | Comma-separated, 1–5 items |
| `ideal_customer` | TEXT | NULL | One-sentence description |
| `requested_full_audit` | INTEGER | 0 | 1 = checkbox checked |
| `audit_status` | TEXT | 'requested' | requested \| snapshot_done \| call_required \| paid \| approved \| completed |
| `audit_tier` | TEXT | 'free_snapshot' | free_snapshot \| paid_basic \| pro_install \| monitoring |

### visibility_snapshots
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `customer_id` | TEXT FK | References customers.id |
| `audit_request_id` | TEXT | Optional link to audit_requests |
| `website_url` | TEXT | Normalized URL |
| `snapshot_score` | INTEGER | 0–100 |
| `snapshot_json` | TEXT | JSON: check results array |
| `generated_prompts_json` | TEXT | JSON: prompt array |
| `self_test_status` | TEXT | pending \| in_progress \| done |
| `requested_full_audit` | INTEGER | 0 or 1 |
| `created_at` | TEXT | ISO 8601 |
