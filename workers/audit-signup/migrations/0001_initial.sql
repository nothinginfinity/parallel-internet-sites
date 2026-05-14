-- AFO v1 D1 Schema
-- Run via: wrangler d1 execute afo-v1 --file=migrations/0001_initial.sql

CREATE TABLE IF NOT EXISTS customers (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  business_name TEXT NOT NULL,
  role          TEXT,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_requests (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_name   TEXT NOT NULL,
  business_name   TEXT NOT NULL,
  website_url     TEXT NOT NULL,
  coupon_code     TEXT,
  plan            TEXT NOT NULL DEFAULT 'audit_only_v1',
  status          TEXT NOT NULL DEFAULT 'pending',
  source          TEXT NOT NULL DEFAULT 'afo_site',
  launch_phase    TEXT NOT NULL DEFAULT 'dogfood_v1',
  notes           TEXT,
  created_at      TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id               TEXT PRIMARY KEY,
  customer_id      TEXT NOT NULL,
  audit_request_id TEXT NOT NULL,
  coupon_code      TEXT NOT NULL,
  redeemed_at      TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (audit_request_id) REFERENCES audit_requests(id)
);

-- Index for quick email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_audit_requests_status ON audit_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_requests_customer ON audit_requests(customer_id);
