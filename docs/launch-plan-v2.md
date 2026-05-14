# Launch Plan v2 — AFO-First Strategy

> **Parallel Internet Sites — Launch Plan**
> Version: 2.0 | Updated: 2026-05-14 | Author: alice (MSG from Jared/Brainstorm)
>
> **Pivot from v1:** AFO is Customer #1 (dogfood). TrueBuild is Customer #2 (post-dogfood).

---

## Strategic Rationale

We eat our own cooking first.

The AFO domain (`ai.agentfeedoptimization.com` or equivalent) serves as the first live, real-world deployment of the Parallel Internet Site system. This gives us:

- A real baseline of (likely near-zero) LLM visibility before AFO files are installed
- A live experiment showing how long it takes a domain to gain visibility, accuracy, and citation improvements after AFO installation
- A honest, reproducible proof-of-concept we can share with future clients — including TrueBuild
- Full ownership of the test: we can run whatever audit and monitoring process we want on our own domain without client approval gates

**Honesty principle (non-negotiable):** We make no claims of guaranteed LLM ranking. We only measure and report:
- Visibility (does the domain appear at all in LLM responses?)
- Accuracy (are claims about AFO factually correct when it does appear?)
- Citation (does the LLM cite or link to the AFO domain?)
- Discoverability (does the LLM recommend AFO when asked a relevant question?)

Improvement claims must be traceable to before/after data. No projected outcomes, no implied guarantees.

---

## Customer Sequencing

| # | Customer | Domain | Status | Notes |
|---|----------|--------|--------|-------|
| 0 | nothinginfinity (internal demo) | `ai.nothinginfinity.com` | Waiting on DNS | Previously planned as first deploy — now secondary demo only |
| **1** | **AFO (dogfood)** | `ai.agentfeedoptimization.com` *(or chosen subdomain)* | **Active — first real deploy** | Self-audit + live experiment. See `docs/afo-customer-1-runbook.md` |
| 2 | TrueBuild | `ai.truebuild.com` | On hold — 3 gates open | Deploys after AFO experiment reaches Day 7. See `docs/deployment-pack-v1.md` |

---

## AFO Customer #1 — Launch Sequence

### Phase A — Baseline (before any AFO files installed)
1. Run `docs/llm-baseline-template.md` against the AFO domain — record current LLM visibility
2. Document baseline in `examples/afo/prompt-tests/day-0-baseline.md`
3. Confirm baseline score is recorded and dated before any files are deployed

### Phase B — Audit
1. Run the AFO self-audit process on the AFO domain using `docs/afo-customer-1-runbook.md`
2. Produce the standard audit report output
3. Generate the intake JSON: `templates/intake/client-intake.afo.json`

### Phase C — Generate & Deploy
1. Run `node scripts/generate-site.js templates/intake/client-intake.afo.json`
2. Confirm zero unmatched token warnings
3. Deploy to Cloudflare Pages (preferred for AFO — see runbook) or Netlify
4. Verify all URLs return 200 per `docs/deployment-pack-v1.md` Section 5
5. Install main-domain AFO files on primary domain
6. Record Day 0 deployment timestamp

### Phase D — Monitor
Run monitoring templates at each interval:
- `docs/monitoring/day-0-deploy.md` — immediately post-deploy
- `docs/monitoring/day-7.md` — Day 7
- `docs/monitoring/day-30.md` — Day 30
- `docs/monitoring/day-60-90.md` — Day 60–90

---

## TrueBuild Customer #2 — Status

TrueBuild deployment is preserved and ready. Three gates remain open (all Jared action):

1. `ai.truebuild.com` DNS — create and point
2. Form action URL wired into `contact.html`
3. Jared content approval on all rendered pages

TrueBuild deploys **after AFO reaches Day 7** — by then we will have real before/after data to reference in the TrueBuild deployment conversation.

---

## What Does Not Change

- Deployment Pack v1 (`docs/deployment-pack-v1.md`) is the standard human deployment guide for all customers — AFO and TrueBuild both follow it
- Generator script, templates, and intake JSON format unchanged
- Prompt test rubric and scoring dimensions unchanged
- Honesty principle: no guaranteed ranking claims, ever

---

_Launch Plan v2 | `docs/launch-plan-v2.md`_
