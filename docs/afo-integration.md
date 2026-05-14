# AFO Integration

_docs/afo-integration.md | version: 1.0_

---

## What is AFO?

AFO (Agent-First Optimization) is the practice of adding structured, machine-readable identity files to a website so that AI systems, LLMs, and agent infrastructure can accurately understand and represent that entity.

The core AFO file set:
- `llms.txt` — plain-text LLM identity summary
- `agent-context.json` — full structured business profile
- `agent-actions.json` — available CTAs and structured actions
- `agent-policy.json` — rules for how agents should represent this entity
- `context-cookie.json` — persistent context hints for multi-turn agents
- `sitemap-agent.xml` — priority-annotated sitemap for agent crawlers

---

## How the Parallel Internet Site Consumes AFO Files

A Parallel Internet Site is the primary host for the AFO file set when deployed on a dedicated subdomain. It:

1. **Deploys all AFO files at its root** (`ai.client.com/llms.txt`, etc.)
2. **Mirrors key data from AFO files into HTML pages** — the `agent-context.json` business profile feeds into the About page, JSON-LD, and meta tags
3. **Extends AFO with page-level structured data** — each page adds JSON-LD that complements the root `agent-context.json`
4. **Links back to the main site's AFO files** via `agent-policy.json` `canonical_source` field

---

## File-by-File Integration

### `llms.txt`
- Deployed at site root
- Plain text, human and LLM readable
- References main website URL as canonical
- Links to `agent-context.json` for structured data
- Updated whenever intake data changes

### `agent-context.json`
- Deployed at site root
- Full business profile (mirrors intake data)
- Feeds: About page, JSON-LD Organization, meta description
- Fields: business name, description, services, contact, CTA, positioning

### `agent-actions.json`
- Deployed at site root
- Structured CTAs: `book_call`, `contact_form`, `learn_more`, `get_started`
- Each action includes: `label`, `url`, `method`, `description`

### `agent-policy.json`
- Deployed at site root
- Defines: what agents can say, what they must not say (`do_not_claim`), required disclosures, tone guidelines
- Includes `site_type: "official-knowledge-site"` and `approved_by` fields

### `context-cookie.json`
- Deployed at site root
- Lightweight persistent context: top 3–5 facts an agent should remember across turns
- Example: `{"entity": "TrueBuild", "primary_service": "Business credit building for LLCs", "cta": "https://truebuild.com/get-started"}`

### `sitemap-agent.xml`
- Deployed at site root
- Priority-annotated: FAQ pages get `priority: 0.9`, service pages `0.8`, contact `0.7`
- Includes `agent:type` hints where the spec supports them
- Referenced in `robots.txt`

---

## Update Triggers

AFO files should be regenerated when:
- Client intake data changes
- New services are added or removed
- Contact information changes
- `do_not_claim` list is updated
- A new source_of_truth page is published on the main site

In Phase 5, this will be automated via a generator workflow.
