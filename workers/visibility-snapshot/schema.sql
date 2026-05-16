-- AFO Visibility Snapshot — D1 schema
-- Run once against your D1 database:
--   wrangler d1 execute afo-v1 --file=workers/visibility-snapshot/schema.sql --remote

CREATE TABLE IF NOT EXISTS customers (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  website_url  TEXT,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visibility_snapshots (
  id                     TEXT PRIMARY KEY,
  customer_id            TEXT NOT NULL REFERENCES customers(id),
  website_url            TEXT NOT NULL,
  snapshot_score         INTEGER NOT NULL DEFAULT 0,
  snapshot_json          TEXT,
  generated_prompts_json TEXT,
  self_test_status       TEXT DEFAULT 'pending',
  requested_full_audit   INTEGER NOT NULL DEFAULT 0,
  created_at             TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_customer ON visibility_snapshots(customer_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_url ON visibility_snapshots(website_url);
CREATE INDEX IF NOT EXISTS idx_snapshots_created ON visibility_snapshots(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
