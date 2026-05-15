# AFO Launch Funnel — Roadmap & Spec v1
**Date:** 2026-05-15  
**Status:** Approved by Jared + Brainstorm  
**Repo:** `nothinginfinity/parallel-internet-sites`

---

## Strategic Context

### AFO is Customer #1
Agent Feed Optimization (AFO) is the primary dogfood launch target and the real proof case. The goal is to generate genuine AFO leads through LLM visibility and the AFO website itself — meaning AFO must rank and appear in AI-powered search before any other customer does.

### TrueBuild is Demo/Sample Data Only
TrueBuild data in the codebase is sample/demonstration material. It is NOT a live customer and should not be treated as launch proof. If TrueBuild opts in later, it can be onboarded through the standard customer flow.

### The Core Product Correction
The free public offer is **not** a full audit. A full AFO audit is serious work — it is manual, paid, or call-gated.

The free public offer is a lightweight **"AFO Visibility Snapshot"** — a self-serve tool that helps a prospect discover whether their business currently appears in LLM responses for the ideal prompts their customers would actually use.

This is strategically correct because:
- It delivers immediate value with zero cost/risk to Jared
- It creates a natural CTA gap: "you now know you're invisible — here's how to fix it"
- It positions AFO as the diagnostic authority before a sale
- It requires no paid LLM API calls and no manual effort per visitor

---

## Product Tiers (Definitive)

| Tier | Name | Delivery | Price |
|---|---|---|---|
| **Free** | AFO Visibility Snapshot | Instant, automated | $0 |
| **Paid Basic** | AFO Audit Report | Manual, 3–5 business days | TBD |
| **Pro** | AFO File Install | Hands-on implementation | TBD |
| **Growth** | Parallel Internet Site + Monitoring | Full build + 30/60/90 day reporting | TBD |

---

## Free Funnel: AFO Visibility Snapshot

### Public CTA (rename from "Start Free Audit")
Options approved:
- **"Get Your Free AFO Visibility Snapshot"** ← preferred
- "Get Your Free Ideal Visibility Prompt Test"

### What the Free Result Delivers
1. Basic AI-readiness score (0–100, based on cheap checks)
2. 3–5 personalized Ideal Visibility Prompts
3. Self-test instructions for ChatGPT, Gemini, Claude, and Perplexity
4. "What good looks like" — a future-state example response if AFO files were present
5. CTA to book a call or purchase a full audit/install

### Form Fields (updated)
```
name                  (required)
email                 (required)
website_url           (required)
business_name         (required)
business_category     (required) — e.g. "Physical Therapy", "HVAC", "Law Firm"
city_or_service_area  (required) — e.g. "San Juan Capistrano, CA"
top_services          (required) — comma-separated, 1–5 items
ideal_customer        (required) — one sentence description
requested_full_audit  (optional checkbox) — "I want a full audit / call"
```

---

## Existing Worker: Preserved As-Is

`POST /api/audit-signup` remains intact and unchanged. It continues to:
- Validate required fields
- Normalize website URL
- Verify Turnstile token
- Store customer + audit_request in D1
- Send confirmation/admin emails via Resend
- Create a GitHub issue in `agent-feed-optimization`

This endpoint becomes the **intake/request capture** path — used when a visitor explicitly requests a full audit or books a call.

---

## New Endpoint: `/api/visibility-snapshot`

### Purpose
Run a real-time lightweight check and return a snapshot result. No paid LLM or Perplexity calls. Cheap, fast, deterministic.

### Behavior
1. Validate form fields
2. Normalize website URL
3. Enforce Turnstile verification
4. Enforce rate limits (IP / email / domain)
5. Run cheap website checks (see below)
6. Generate Ideal Visibility Prompts from business context
7. Generate AI-readiness score
8. Store snapshot in D1
9. Optionally create GitHub issue if `requested_full_audit: true`
10. Return snapshot result JSON to frontend

### Cheap Website Checks

| Check | What it looks for | Points |
|---|---|---|
| Website reachable | HTTP 200 on root URL | 10 |
| robots.txt present | `/robots.txt` returns 200 | 5 |
| sitemap.xml present | `/sitemap.xml` returns 200 | 5 |
| llms.txt present | `/llms.txt` returns 200 | 20 |
| agent-context.json present | `/agent-context.json` returns 200 | 20 |
| sitemap-agent.xml present | `/sitemap-agent.xml` returns 200 | 10 |
| Homepage title present | `<title>` tag non-empty | 10 |
| Meta description present | `<meta name="description">` present | 5 |
| JSON-LD present | `<script type="application/ld+json">` detected | 10 |
| Contact path detectable | `/contact` or `tel:` or `mailto:` present | 5 |
| **Total possible** | | **100** |

### Score Bands

| Score | Label | Color |
|---|---|---|
| 0–30 | Not AI-Visible | 🔴 Red |
| 31–55 | Partially Visible | 🟠 Orange |
| 56–79 | Mostly Visible | 🟡 Yellow |
| 80–100 | AI-Ready | 🟢 Green |

### Ideal Visibility Prompt Generation (no LLM API)

Prompts are generated deterministically from form inputs using template logic:

| Prompt Type | Template |
|---|---|
| Category Discovery | "Best {business_category} in {city_or_service_area}" |
| Problem/Solution | "Who helps with {top_service_1} near {city_or_service_area}" |
| Local Service Area | "{business_category} serving {city_or_service_area}" |
| Service Comparison | "Compare {business_category} options in {city_or_service_area}" |
| Direct Brand Accuracy | "Tell me about {business_name}" |

User instruction: copy each prompt into ChatGPT, Gemini, Claude, and Perplexity. See if your business appears.

---

## D1 Schema Changes

### Existing Tables (no breaking changes)
`customers` and `audit_requests` remain unchanged.

### Migration: Add columns to `audit_requests`
```sql
ALTER TABLE audit_requests ADD COLUMN business_category TEXT;
ALTER TABLE audit_requests ADD COLUMN service_area TEXT;
ALTER TABLE audit_requests ADD COLUMN top_services TEXT;
ALTER TABLE audit_requests ADD COLUMN ideal_customer TEXT;
ALTER TABLE audit_requests ADD COLUMN requested_full_audit INTEGER DEFAULT 0;
ALTER TABLE audit_requests ADD COLUMN audit_status TEXT DEFAULT 'requested';
ALTER TABLE audit_requests ADD COLUMN audit_tier TEXT DEFAULT 'free_snapshot';
```

### Migration: New `visibility_snapshots` table
```sql
CREATE TABLE IF NOT EXISTS visibility_snapshots (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  audit_request_id TEXT,
  website_url TEXT NOT NULL,
  snapshot_score INTEGER,
  snapshot_json TEXT,
  generated_prompts_json TEXT,
  self_test_status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

### Audit Status Values
`requested` | `snapshot_done` | `call_required` | `paid` | `approved` | `completed`

### Audit Tier Values
`free_snapshot` | `paid_basic` | `pro_install` | `monitoring`

---

## Abuse Protection Plan

| Protection | Mechanism |
|---|---|
| Bot prevention | Turnstile required on all public endpoints |
| IP rate limit | Max 3 snapshots per IP per 24h (KV-based) |
| Email rate limit | Max 1 snapshot per email per 24h |
| Domain rate limit | Max 1 free snapshot per domain per 7 days |
| Full audit gate | No full audit without payment or manual Jared approval |
| LLM call gate | No Perplexity/OpenAI/Anthropic calls in free flow — ever |

---

## Implementation Sequence (Safe Commit Order)

| Commit | Scope | Risk |
|---|---|---|
| **1** | Roadmap/spec reconciliation (this file) | None |
| **2** | D1 migration SQL for snapshot fields + new table | Low — additive only |
| **3** | UI copy + form field updates (no backend change) | Low |
| **4** | `POST /api/visibility-snapshot` — cheap checks only | Medium — new endpoint |
| **5** | Prompt generator module | Low — pure logic |
| **6** | Thank-you/results page update | Low |
| **7** | Rate limiting + abuse controls (KV-based) | Medium |
| **8** | Docs update — free vs paid audit boundary | None |
| **9** | Manual QA checklist | None |
| **10** | Launch readiness checklist update | None |

**Existing `/api/audit-signup` is never touched in this sequence.**

---

## What NOT to Build in the Free Flow

- No calls to OpenAI, Anthropic, Perplexity, or any paid LLM API
- No real-time crawling beyond a single fetch per URL
- No competitive analysis
- No content rewriting
- No PDF generation in the free tier
- No full AFO file installation
- No access to existing customer data

---

## Key URLs (Current)

| Resource | URL |
|---|---|
| Worker endpoint | `https://afo-audit-signup.jaredtechfit.workers.dev/api/audit-signup` |
| Test UI | `https://afo-audit-signup.jaredtechfit.workers.dev/test` |
| Worker source | `parallel-internet-sites/workers/audit-signup/index.js` |
| Audit issues repo | `nothinginfinity/agent-feed-optimization` |

---

*Roadmap authored by Alice — approved by Jared + Brainstorm — 2026-05-15*
