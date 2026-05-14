# Product Model — Service Tiers

_docs/product-model.md | version: 1.0_

---

## Overview

The Parallel Internet Sites product is structured in three tiers, each building on the last. Clients can enter at any tier and upgrade.

---

## Tier 1 — AFO Install

**What it is:** Add the AFO machine-readable identity layer to the client's existing website.

**Deliverables:**
- `llms.txt` — deployed at `client.com/llms.txt`
- `agent-context.json` — deployed at `client.com/agent-context.json`
- `agent-actions.json` — deployed at `client.com/agent-actions.json`
- `agent-policy.json` — deployed at `client.com/agent-policy.json`
- `context-cookie.json` — deployed at `client.com/context-cookie.json`
- `sitemap-agent.xml` — deployed at `client.com/sitemap-agent.xml`
- Updated `robots.txt` referencing agent sitemap
- Client intake and review session

**Outcome:** The existing site becomes machine-readable. AI crawlers have structured, accurate, policy-governed data about the client.

---

## Tier 2 — AFO + Parallel Internet Site

**What it is:** Everything in Tier 1, plus a dedicated agent-first knowledge site deployed on a subdomain or folder path.

**Deliverables:**
- All Tier 1 deliverables
- Full Parallel Internet Site (static deploy) at `ai.client.com` or `client.com/ai`
- Full page set: About, Services, FAQ, Process, Comparisons, Contact
- All agent files at site root
- JSON-LD structured data on all pages
- `sitemap.xml` and `sitemap-agent.xml` submitted to major crawlers
- Baseline prompt test report

**Outcome:** The client has a dedicated, AI-optimized public knowledge layer. LLM mentions and citation rates measurably increase.

---

## Tier 3 — AFO + Parallel Internet Site + Monitoring

**What it is:** Everything in Tier 2, plus ongoing prompt-test monitoring and content refresh cycles.

**Deliverables:**
- All Tier 2 deliverables
- 30/60/90-day prompt test reports
- AI mention tracking (Perplexity, ChatGPT, Gemini)
- Citation accuracy audit
- Quarterly content refresh based on monitoring results
- Competitor mention tracking
- Hallucination alert: flag and correct any inaccurate AI claims about client

**Outcome:** Continuous improvement loop. Client maintains accurate, prominent AI visibility over time.

---

## Pricing (TBD)

Pricing is not defined in this spec. See Jared for current pricing discussion.
