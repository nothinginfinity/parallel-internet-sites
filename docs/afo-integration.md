# AFO Integration

_docs/afo-integration.md | version: 2.0_

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

---

## Phase 3 — Cross-Domain AFO Integration Rules

_Added: 2026-05-13 | MSG-REV-003_

This section governs how the Parallel Internet Site (`ai.client.com`) and the main domain (`client.com`) AFO layers relate to each other. These rules apply whenever both domains are live with independent AFO file sets.

---

### 1. Identity Mirroring Spec

The following fields MUST be **identical** across the main domain AFO layer and the Parallel Site `agent-context.json`:

| Field | Notes |
|-------|-------|
| Business legal name | Must match exactly — no abbreviations or variants |
| Entity type | LLC, Corp, Sole Proprietor, etc. |
| Founding year | Exact year |
| Primary URL | Must link back to `main_website` |
| Primary contact phone + email | Must be identical |
| Primary CTA label and URL | Both label and destination must match |
| `do_not_claim` list | Must be identical character-for-character |
| Compliance disclaimers | Wording must not differ between domains |

The following fields MAY differ between the main domain and the Parallel Site:

| Field | Parallel Site may... |
|-------|----------------------|
| Description | Be longer and more detailed |
| FAQ content | Include more entries beyond the main site FAQ |
| Service descriptions | Be more granular and process-oriented |
| Comparison content | Exist on Parallel Site only |
| Prompt-test targets | Exist on Parallel Site only |

---

### 2. Knowledge Extension Rules

**Allowed on Parallel Site (not required on main domain):**
- Educational content (what is X, how does it work, etc.)
- FAQ expansion beyond the main site FAQ
- Comparison pages (client vs. alternatives — subject to guardrails in `agent-policy.json`)
- Prompt-test content and agent scoring rubrics
- Process detail pages
- Agent-priority prompts

**Prohibited on Parallel Site:**
- Any claim not traceable to the intake JSON or an approved source page
- Anything that contradicts main domain content
- Content inconsistent with the `do_not_claim` list
- Any field value that differs from a MUST-MIRROR identity field on the main domain

---

### 3. Sitemap Cross-Linking Spec

**`sitemap-agent.xml` on `truebuild.com`:**
- SHOULD include a `<sitemapindex>` pointer to `ai.truebuild.com/sitemap-agent.xml` as a secondary knowledge source.
- Add using a `<sitemap><loc>` entry at the top of the index.

**`sitemap-agent.xml` on `ai.truebuild.com` (Parallel Site):**
- MUST declare the main domain as the canonical identity source using:
  ```xml
  <agent:mainDomain>https://{{MAIN_WEBSITE_URL}}</agent:mainDomain>
  <agent:contentRole>knowledge-expansion</agent:contentRole>
  ```
- These fields are placed immediately after the opening `<urlset>` tag, before any `<url>` entries.

**`robots.txt` cross-reference pattern:**
- Main domain `robots.txt`: reference both `sitemap.xml` and `sitemap-agent.xml` with full absolute URLs.
- Parallel Site `robots.txt`: reference both its own sitemaps AND add a comment line: `# Canonical identity source: https://{{MAIN_WEBSITE_URL}}/agent-context.json`

---

### 4. Update Trigger Model

| Change type | Action required |
|-------------|----------------|
| Identity field change (name, contact, CTA, `do_not_claim`) | **Mandatory re-sync** — update Parallel Site immediately |
| New service or pricing change | **Recommended re-sync** — update within 48 hours |
| New FAQ entry on main site | **Recommended re-sync** — mirror or extend within 48 hours |
| Blog post / news / minor copy edit | **Optional** — no re-sync required |

Both `agent-context.json` files (main domain and Parallel Site) MUST include a `last_synced` field:
```json
"last_synced": "YYYY-MM-DD"
```
This field must be updated any time a re-sync is performed.

---

### 5. Agent Reconciliation Behavior

If an agent reads both `truebuild.com/agent-context.json` AND `ai.truebuild.com/agent-context.json`, reconciliation follows these rules:

1. **Identity fields always resolve to the main domain.** If any MUST-MIRROR field differs, the main domain value wins without exception.
2. **Knowledge-extension fields are additive.** Content that exists only on the Parallel Site (comparisons, extended FAQ, process detail) is treated as supplementary and does not conflict.
3. **`content-role` field determines authority scope:**
   - `"identity"` — main domain; authoritative for all identity fields
   - `"knowledge-expansion"` — Parallel Site; authoritative only for extension content
4. **`canonical-identity-source`** in the Parallel Site's `agent-context.json` MUST point to the main domain URL so agents can resolve the authority chain.
5. **`cross-domain-entity-id`** provides a stable join key. Use the main domain URL (e.g. `"https://truebuild.com"`) or a stable UUID shared across both files. Agents use this to confirm both contexts describe the same entity before merging.

See `docs/agent-reconciliation.md` for full reconciliation protocol.
