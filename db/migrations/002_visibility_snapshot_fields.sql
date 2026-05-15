-- Migration 002: AFO Visibility Snapshot fields
-- Date: 2026-05-15
-- Safe: additive only. No columns dropped. No existing data affected.
-- Apply with: wrangler d1 execute <DB_NAME> --file=db/migrations/002_visibility_snapshot_fields.sql

-- ─────────────────────────────────────────────
-- 1. Add snapshot/funnel columns to audit_requests
-- ─────────────────────────────────────────────
ALTER TABLE audit_requests ADD COLUMN business_category TEXT;
ALTER TABLE audit_requests ADD COLUMN service_area TEXT;
ALTER TABLE audit_requests ADD COLUMN top_services TEXT;
ALTER TABLE audit_requests ADD COLUMN ideal_customer TEXT;
ALTER TABLE audit_requests ADD COLUMN requested_full_audit INTEGER DEFAULT 0;
ALTER TABLE audit_requests ADD COLUMN audit_status TEXT DEFAULT 'requested';
ALTER TABLE audit_requests ADD COLUMN audit_tier TEXT DEFAULT 'free_snapshot';

-- audit_status values: requested | snapshot_done | call_required | paid | approved | completed
-- audit_tier values:   free_snapshot | paid_basic | pro_install | monitoring

-- ─────────────────────────────────────────────
-- 2. Create visibility_snapshots table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visibility_snapshots (
  id                     TEXT PRIMARY KEY,
  customer_id            TEXT NOT NULL,
  audit_request_id       TEXT,
  website_url            TEXT NOT NULL,
  snapshot_score         INTEGER,
  snapshot_json          TEXT,   -- JSON: { checks: [{name, passed, points}], total, max }
  generated_prompts_json TEXT,   -- JSON: [{type, prompt, instructions}]
  self_test_status       TEXT DEFAULT 'pending',
  requested_full_audit   INTEGER DEFAULT 0,
  created_at             TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Index for rate limiting lookups
CREATE INDEX IF NOT EXISTS idx_snapshots_customer    ON visibility_snapshots(customer_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_website_url ON visibility_snapshots(website_url);
CREATE INDEX IF NOT EXISTS idx_snapshots_created_at  ON visibility_snapshots(created_at);
