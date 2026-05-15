# AFO Product Boundary — Free vs Paid

> This document defines what is included in each tier and must be
> reviewed before any changes to the snapshot endpoint or results page.
> Last updated: Commit 10 (May 2026)

---

## Tiers at a Glance

| Tier | Name | Price | Delivery | What they get |
|---|---|---|---|---|
| **Free** | AFO Visibility Snapshot | $0 | Instant (automated) | Score, 10 checks, 5 prompts, self-test instructions |
| **Paid Basic** | AFO Audit Report | Paid | Manual (1–3 days) | Full LLM visibility audit, gap analysis, recommendations |
| **Pro** | AFO File Install | Paid | Manual | llms.txt + agent-context.json + sitemap-agent.xml installed and configured |
| **Growth** | Parallel Internet Site + Monitoring | Paid | Manual | Full PI site build + 30/60/90-day LLM presence monitoring |

---

## Free Tier — What Is Included

The free **AFO Visibility Snapshot** is a lightweight self-test tool. It is NOT a full audit.

**Included:**
- Basic AI-readiness score (0–100)
- 10 cheap website checks (reachable, robots.txt, sitemap.xml, llms.txt, agent-context.json, sitemap-agent.xml, title, meta description, JSON-LD, contact detectable)
- 3–5 personalized Ideal Visibility Prompts
- Self-test instructions for ChatGPT, Gemini, Claude, and Perplexity
- "What good looks like" CTA (future-state framing)
- Option to request a full audit / book a call

**Not included in the free tier:**
- Any paid LLM API calls (OpenAI, Anthropic, Gemini, Perplexity)
- Manual review by a human
- Gap analysis or recommendations
- File installation (llms.txt, agent-context.json, etc.)
- Monitoring or follow-up
- Guaranteed response time

---

## Paid Basic — What Is Included

A real AFO audit is a serious engagement. It requires manual work and should be gated accordingly.

**Trigger:** User requests via `requested_full_audit: true` on the snapshot form OR books a call directly.
**Fulfillment:** Manual — Jared reviews the GitHub issue, approves, and Alice begins the audit job.

**Included:**
- Full LLM visibility audit across ChatGPT, Gemini, Claude, and Perplexity
- Ideal prompt testing with real results
- Gap analysis: what's missing and why
- Prioritized recommendations
- Written report delivered via email or shared doc

---

## Enforcement Rules (Technical)

These rules are enforced in code and must not be removed without explicit product approval:

1. **No LLM API calls in `/api/visibility-snapshot`** — the free endpoint runs only cheap HTTP checks and deterministic prompt generation. No calls to OpenAI, Anthropic, Google, or Perplexity APIs.

2. **No automatic audit fulfillment** — `requested_full_audit: true` creates a GitHub issue only. It does not trigger any automated audit pipeline.

3. **No full audit without payment or manual approval** — the `audit_status` field must be manually advanced from `snapshot_done` → `call_required` → `paid` → `approved` → `completed`. No code advances this automatically.

4. **Rate limiting always on** — the free snapshot is rate-limited by IP, email, and domain. These limits cannot be bypassed without removing the `TURNSTILE_SECRET` check AND modifying `rate-limit.js`.

5. **TrueBuild is demo/sample data only** — TrueBuild entries in D1 are for dogfood/demo purposes. They are not paying customers and should not be used as launch proof unless TrueBuild explicitly opts in.

---

## audit_status State Machine

```
requested        ← set by /api/audit-signup (full audit intake)
snapshot_done    ← set by /api/visibility-snapshot (free flow)
call_required    ← set manually by Jared after reviewing snapshot
paid             ← set manually after payment confirmed
approved         ← set manually by Jared — Alice begins audit job
completed        ← set by Alice after report delivered
```

No automated transitions. Every advance requires a human decision.

---

## audit_tier Values

| Value | Meaning |
|---|---|
| `free_snapshot` | Free visibility snapshot (automated) |
| `paid_basic` | Paid audit report (manual) |
| `pro_install` | AFO file installation (manual) |
| `monitoring` | Parallel Internet Site + 30/60/90 monitoring |

---

## AFO as Customer #1

`agentfeedoptimization.com` is the dogfood customer. All snapshot and audit tooling should be tested against the AFO site first before any external customer receives a snapshot.

The AFO site is the proof target for LLM visibility. If the AFO site itself does not appear in LLM chat for ideal prompts, no external customer should be told otherwise.
