# scripts/README.md — Parallel Internet Sites Generator

## Overview

`generate-site.js` is a Node.js script (stdlib only, no npm install required) that reads a client intake JSON file and generates a fully populated static Parallel Internet Site by substituting all `{{TOKEN}}` placeholders in `templates/site/`.

---

## Usage

```bash
node scripts/generate-site.js [intake-json-path] [output-folder]
```

| Argument | Default | Description |
|---|---|---|
| `intake-json-path` | `templates/intake/client-intake.example.truebuild.json` | Path to the client intake JSON file |
| `output-folder` | `examples/truebuild/site` | Destination folder for the generated site |

Both arguments are optional. Omit both to regenerate the TrueBuild example.

---

## Examples

### TrueBuild (default)
```bash
node scripts/generate-site.js
# or explicitly:
node scripts/generate-site.js templates/intake/client-intake.example.truebuild.json examples/truebuild/site
```

### AFO (nothinginfinity agency site)
```bash
node scripts/generate-site.js templates/intake/client-intake.example.afo.json examples/afo/site
```

### Any new client
```bash
node scripts/generate-site.js templates/intake/client-intake.example.acme.json examples/acme/site
```

---

## How It Works

1. Reads the intake JSON from `intake-json-path`
2. Builds a flat `UPPERCASE_TOKEN` map from all intake fields (recursive — nested objects become `PARENT_CHILD` tokens)
3. Injects computed helpers: `{{CURRENT_YEAR}}`, `{{SERVICES_CARDS}}`, `{{CROSS_DOMAIN_ENTITY_ID}}`, Phase 3 AFO tokens, FAQ stubs, process step stubs, comparison stubs
4. Recursively walks `templates/site/` and all subdirectories
5. Substitutes all `{{TOKEN}}` occurrences in every file
6. Writes output to the specified output folder, mirroring the `templates/site/` folder structure
7. Warns on any unmatched tokens (does not fail — unmatched tokens are left as-is so they are visible)
8. Exits 0 on success

---

## Token Mapping

All top-level intake fields are mapped automatically:

| Intake field | Token |
|---|---|
| `business_name` | `{{BUSINESS_NAME}}` |
| `main_website_url` | `{{MAIN_WEBSITE_URL}}` |
| `parallel_site_url` | `{{PARALLEL_SITE_URL}}` |
| `business_type` | `{{BUSINESS_TYPE}}` |
| `contact_email` | `{{CONTACT_EMAIL}}` |
| `services` (array) | `{{SERVICES}}` (comma-joined), `{{SERVICES_1}}`, `{{SERVICES_2}}`, … |
| _(all other fields)_ | `{{FIELD_NAME_UPPERCASE}}` |

Computed helpers injected automatically regardless of intake content:

| Token | Source |
|---|---|
| `{{CURRENT_YEAR}}` | `new Date().getFullYear()` |
| `{{COMPLIANCE_DISCLAIMER}}` | `compliance_disclaimers[]` joined |
| `{{DO_NOT_CLAIM_LIST}}` | `do_not_claim[]` as bullet list |
| `{{SERVICES_SUMMARY}}` | First 2 services + "and more." |
| `{{SERVICES_CARDS}}` | Services as `<div class="service-card">` blocks |
| `{{SERVICES_LIST}}` | Services comma-joined |
| `{{IDEAL_CLIENT_PROFILE}}` | `target_audience` |
| `{{CTA_SUPPORTING_TEXT}}` | `positioning_statement` |
| `{{FORM_ACTION_URL}}` | `cta_url` |
| `{{CONTENT_ROLE}}` | `"knowledge-expansion"` (Phase 3 AFO) |
| `{{CANONICAL_IDENTITY_SOURCE}}` | `main_website_url` |
| `{{CROSS_DOMAIN_ENTITY_ID}}` | `business_name` slugified |
| `{{LAST_SYNCED}}` | Current date (ISO) |
| `{{COMPARISON_INTRO}}` | Derived from `business_name` |
| `{{ALT_1_NAME}}` / `{{ALT_2_NAME}}` | First 2 entries of `competitors_or_alternatives[]` |
| FAQ tokens (`{{FAQ_WHAT_IS}}`, etc.) | Derived from intake fields |
| Process step tokens (`{{STEP_1_NAME}}`, etc.) | Default 5-step stubs (override via intake) |

---

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Success — output written, zero or more unmatched token warnings |
| `1` | Fatal error — intake JSON not found or not valid JSON |

---

## Adding a New Client

1. Copy `templates/intake/client-intake.schema.json` and fill in all fields for the new client
2. Save as `templates/intake/client-intake.example.[clientname].json`
3. Run: `node scripts/generate-site.js templates/intake/client-intake.example.[clientname].json examples/[clientname]/site`
4. Check output for unmatched token warnings
5. Spot-check `index.html`, `llms.txt`, and `agent-context.json`
6. Follow `docs/deployment-pack-v1.md` for deployment steps
