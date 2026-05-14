# Architecture — Deployment Options

_docs/architecture.md | version: 1.0_

---

## Deployment Options

### Option A — Subdomain (Recommended)

Deploy the Parallel Internet Site on a subdomain of the client's main domain:

```
ai.client.com
agents.client.com
knowledge.client.com
```

**Pros:**
- Clear separation from human-facing site
- Full control over all agent files at root
- Crawlers treat it as a related but distinct entity
- Clean disclosure: "ai.truebuild.com — Official AI Knowledge Site for TrueBuild"

**Cons:**
- Requires DNS access
- Subdomain authority starts lower (mitigated by internal linking from main domain)

---

### Option B — Folder Path

Deploy as a subfolder of the main domain:

```
client.com/ai
client.com/knowledge
client.com/agents
```

**Pros:**
- Inherits main domain authority immediately
- Simpler deployment for some hosting setups

**Cons:**
- Agent files must be at `client.com/ai/llms.txt` — not at root
- Some crawlers expect `llms.txt` at root only
- Less clean separation

---

## Static Site Deployment

Parallel Internet Sites are static by default:
- No server-side rendering required
- Deploy to: Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any static host
- All agent JSON files served as static assets
- HTTPS required

---

## Canonical Links

Every page must include:
```html
<link rel="canonical" href="https://ai.client.com/page-path">
```

The Parallel Internet Site is NOT a duplicate of the main site — it is complementary content. However, if any content overlaps, the canonical must point to the preferred version.

---

## sitemap-agent.xml

In addition to a standard `sitemap.xml`, deploy a `sitemap-agent.xml` that includes priority annotations and page-type hints for agent crawlers:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:agent="https://afo-spec.org/sitemap-agent/1.0">
  <url>
    <loc>https://ai.client.com/</loc>
    <priority>1.0</priority>
    <agent:type>home</agent:type>
  </url>
  <url>
    <loc>https://ai.client.com/faq</loc>
    <priority>0.9</priority>
    <agent:type>faq</agent:type>
  </url>
</urlset>
```

---

## llms.txt

Deploy `llms.txt` at the root of the deployed origin. Follow the emerging llms.txt spec:
- Plain text
- Business name, description, main website URL
- Key services
- Canonical contact and CTA
- Link to `agent-context.json` for structured data

---

## Structured JSON Files

All agent files are static JSON served at the root:

| File | MIME type | Purpose |
|------|-----------|---------|
| `agent-context.json` | `application/json` | Full business profile |
| `agent-actions.json` | `application/json` | Available CTAs |
| `agent-policy.json` | `application/json` | Representation rules |
| `context-cookie.json` | `application/json` | Persistent context hints |

---

## JSON-LD

Embed JSON-LD structured data in HTML pages where useful:
- `Organization` or `LocalBusiness` on root page
- `FAQPage` on FAQ pages
- `Service` on service pages
- `HowTo` on process pages

JSON-LD complements agent JSON files — it helps crawlers that parse HTML but not custom JSON files.
