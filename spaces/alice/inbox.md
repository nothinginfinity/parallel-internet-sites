# Alice Inbox

## 🟡 READY FOR COMMIT 3 — UI Copy + Form Field Updates
**Date:** 2026-05-15  
**Status:** Commit 2 complete (D1 migration SQL). Awaiting Jared to apply migration + approve Commit 3.

### Before proceeding to Commit 3, Jared must:
1. Apply the migration to the live D1 database:
   ```bash
   wrangler d1 execute <DB_NAME> --file=db/migrations/002_visibility_snapshot_fields.sql
   ```
2. Verify the new table exists:
   ```bash
   wrangler d1 execute <DB_NAME> --command="PRAGMA table_info(visibility_snapshots);"
   ```
3. Confirm and say "proceed with Commit 3"

**Commit 3 scope:** UI copy updates + new form fields on the public snapshot form. No backend changes.
