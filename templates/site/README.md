# Site Template

This directory contains the base file template for a Parallel Internet Site.

Copy this entire `site/` directory and replace all placeholder values (marked `{{PLACEHOLDER}}`) with client-specific data from the completed `client-intake.*.json`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Public-facing home page |
| `robots.txt` | Crawler permissions |
| `sitemap.xml` | Standard sitemap |
| `sitemap-agent.xml` | Agent-priority sitemap |
| `llms.txt` | LLM-readable identity file |
| `agent-context.json` | Structured business profile |
| `agent-actions.json` | Available CTAs and actions |
| `agent-policy.json` | Agent representation rules |
| `context-cookie.json` | Persistent context hints |
| `pages/` | Markdown content pages |

## Usage

1. Complete the client intake form (`templates/intake/client-intake.schema.json`)
2. Copy this `site/` directory to your client project folder
3. Replace all `{{PLACEHOLDER}}` values with intake data
4. Build HTML pages from the Markdown templates in `pages/`
5. Deploy to subdomain or folder path
6. Submit `sitemap.xml` and verify `llms.txt` is accessible
