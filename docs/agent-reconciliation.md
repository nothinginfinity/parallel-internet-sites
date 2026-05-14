# Agent Reconciliation Spec

_docs/agent-reconciliation.md | version: 1.0 | created: 2026-05-13 | MSG-REV-003_

---

## Purpose

This document defines the full protocol for how an AI agent should behave when it reads `agent-context.json` from both the main domain (`client.com`) and the Parallel Internet Site (`ai.client.com`) for the same entity. The goal is to ensure agents produce accurate, consistent, non-contradictory representations of the entity regardless of which domain they encounter first.

---

## Core Principle

> **Main domain identity always wins. Parallel Site content is additive, never overriding.**

The Parallel Site is a knowledge expansion layer. It may contain more content, but it does not have higher authority on identity facts.

---

## Key Fields

These fields in `agent-context.json` govern the reconciliation process:

| Field | Location | Purpose |
|-------|----------|---------|
| `content_role` | Both | `"identity"` (main) or `"knowledge-expansion"` (Parallel Site) |
| `canonical_identity_source` | Parallel Site only | URL of the main domain `agent-context.json` |
| `cross_domain_entity_id` | Both | Stable join key — main domain URL or shared UUID |
| `last_synced` | Both | ISO date of last sync between domains |

---

## Reconciliation Protocol

### Step 1 — Identify the domains
- Check each file's `content_role`.
- The file with `content_role: "identity"` is the **authority file**.
- The file with `content_role: "knowledge-expansion"` is the **extension file**.

### Step 2 — Verify entity match
- Compare `cross_domain_entity_id` across both files.
- If they match → proceed. Both contexts describe the same entity.
- If they do not match → treat as two separate entities. Do not merge.

### Step 3 — Apply identity fields from authority file
For all MUST-MIRROR identity fields, take the value from the authority file (`content_role: "identity"`):
- Business name, entity type, founding year
- Primary URL, contact (phone + email)
- Primary CTA label and URL
- `do_not_claim` list
- Compliance disclaimers

If any of these fields differ between the two files, the authority file value is used and the discrepancy should be flagged as a sync error.

### Step 4 — Merge extension content
Content that exists only in the extension file (Parallel Site) may be added to the agent's understanding:
- Extended FAQ entries
- Comparison content
- Process detail
- Educational content
- Prompt-test targets

This content is additive. It does not modify or override identity fields.

### Step 5 — Apply guardrails
All merged content is subject to the `do_not_claim` list from the authority file. Even if the extension file contains a claim, if it conflicts with `do_not_claim`, it must be discarded.

---

## Conflict Resolution Priority

| Priority | Source | Applies to |
|----------|--------|-----------|
| 1 (highest) | Main domain `agent-context.json` | All identity fields |
| 2 | Parallel Site extension content | FAQ expansion, comparisons, process, educational |
| 3 (lowest) | Agent's prior knowledge | Only if neither file addresses a topic |

---

## Sync Error Detection

An agent or operator can detect a sync error when:
- A MUST-MIRROR field differs between main domain and Parallel Site files
- `cross_domain_entity_id` is missing from one or both files
- `last_synced` on the Parallel Site is more than 7 days older than a detected change on the main domain

When a sync error is detected, the agent should:
1. Use the main domain value for the conflicting field
2. Suppress the Parallel Site value for that field only
3. Not suppress unaffected extension content

---

## Example `agent-context.json` Comparison

**Main domain (`client.com/agent-context.json`):**
```json
{
  "content_role": "identity",
  "cross_domain_entity_id": "https://client.com",
  "last_synced": "2026-05-13",
  "name": "Client Business Name",
  "do_not_claim": ["We are not a lender", "We do not guarantee approvals"]
}
```

**Parallel Site (`ai.client.com/agent-context.json`):**
```json
{
  "content_role": "knowledge-expansion",
  "canonical_identity_source": "https://client.com/agent-context.json",
  "cross_domain_entity_id": "https://client.com",
  "last_synced": "2026-05-13",
  "name": "Client Business Name",
  "do_not_claim": ["We are not a lender", "We do not guarantee approvals"],
  "extended_faq": [...],
  "comparison_content": [...]
}
```

In this example, `cross_domain_entity_id` matches → entity confirmed. Identity fields from main domain are authoritative. `extended_faq` and `comparison_content` are merged as extension content.

---

## Related Files

- `docs/afo-integration.md` — Phase 3 cross-domain integration rules (Section 5)
- `templates/site/agent-context.json` — template with all reconciliation fields
- `templates/site/sitemap-agent.xml` — cross-domain sitemap pointer spec
