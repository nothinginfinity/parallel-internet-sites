# SPEC.md — Parallel Internet Sites

_version: 1.0 | agent: alice-ops | last-updated: 2026-05-13_

---

## Product Definition

A **Parallel Internet Site** is a public, crawlable, agent-first knowledge site built alongside a client's existing human-facing website. It is structured for AI systems, LLMs, and future agent discovery layers — not to replace the human site, but to create a dedicated, high-signal knowledge layer that helps AI systems accurately understand, cite, and surface the client.

---

## Required Site Files

| File | Purpose |
|------|---------|
| `index.html` | Public-facing entry point for humans and crawlers |
| `robots.txt` | Crawler permissions |
| `sitemap.xml` | Standard sitemap |
| `sitemap-agent.xml` | Agent-priority sitemap with structured hints |
| `llms.txt` | LLM-readable identity and context file |
| `agent-context.json` | Structured business context for agents |
| `agent-actions.json` | Available CTAs and structured actions |
| `agent-policy.json` | Rules for how agents should represent this entity |
| `context-cookie.json` | Lightweight persistent context hints |

---

## Required Page Types

- **About** — Who the business is, what it does, founding story
- **Services** — Full service catalog with structured descriptions
- **FAQ** — Structured Q&A answering the most common agent prompts
- **Process** — How the service works, step by step
- **Comparisons** — Factual comparisons vs. alternatives or common questions
- **Contact** — CTA page with structured contact data

---

## Required Metadata

Every page must include:
- `<title>` and `<meta name="description">`
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`)
- JSON-LD `Organization` or `LocalBusiness` structured data on root page
- JSON-LD `FAQPage` on FAQ pages
- `canonical` link
- `<link rel="alternate" type="application/json" href="/agent-context.json">`

---

## Required Agent Files

- `llms.txt` — Plain-text summary for LLM indexers (Perplexity, ChatGPT, Gemini crawlers)
- `agent-context.json` — Full structured business profile
- `agent-actions.json` — Structured CTAs (book, contact, learn more)
- `agent-policy.json` — Representation rules (what agents can/cannot say)
- `context-cookie.json` — Persistent context hints for multi-turn agents
- `sitemap-agent.xml` — Priority-annotated sitemap for agent crawlers

---

## Required Linking Rules

- Every page must link back to the client's main website
- Must include disclosure: "This is an official knowledge site for [Business Name]"
- `llms.txt` must reference the canonical main website URL
- No orphan pages — every page reachable from `sitemap.xml`
- Internal links use relative paths

---

## Required Review Gates

1. **Intake review** — All fields in `client-intake.schema.json` populated before content generation
2. **Content accuracy review** — All claims traced to `source_of_truth_pages` or intake data
3. **Agent file review** — `agent-context.json`, `agent-actions.json`, `agent-policy.json` reviewed by client
4. **Launch review** — `robots.txt` allows crawlers, `sitemap.xml` submitted, `llms.txt` accessible at root

---

## Content Accuracy Rules

- Every factual claim must be traceable to a field in `client-intake.*.json` or an approved `source_of_truth_pages` URL
- Claims about results, rankings, or outcomes must include qualifying language ("clients report", "based on intake data")
- No invented statistics
- No claims marked `do_not_claim` in intake
- No fake reviews or testimonials
- Content must be consistent with the client's main website

---

## Deployment Assumptions

- Static site deployment (Netlify, Vercel, GitHub Pages, or equivalent)
- HTTPS required
- Subdomain recommended: `ai.client.com`, `agents.client.com`, or `knowledge.client.com`
- Folder path acceptable: `client.com/ai` or `client.com/knowledge`
- All agent files served at root of the deployed origin

---

## Success Metrics

| Metric | Target |
|--------|--------|
| LLM mentions client by name in target prompts | Baseline → measurable increase in 90 days |
| LLM descriptions are accurate | 0 hallucinated claims |
| CTA path present in LLM responses | Present in ≥50% of relevant responses |
| Site indexed by major crawlers | Within 30 days of launch |
| Prompt test score improvement | +2 points on rubric within 90 days |
