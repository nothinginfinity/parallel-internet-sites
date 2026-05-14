# Day 0 — Deployment Record

> **Parallel Internet Sites — Monitoring Template**
> Fill in immediately after deployment. This is the anchor timestamp for the entire experiment.

---

## Deployment Metadata

| Field | Value |
|-------|-------|
| Client / Domain | |
| Parallel site URL | `https://ai.[domain].com` |
| Deploy date | *(YYYY-MM-DD)* |
| Deploy time | *(HH:MM timezone)* |
| Deployed by | |
| Host | *(Cloudflare Pages / Netlify / GitHub Pages)* |
| Commit SHA | *(git SHA of the deployed build)* |

---

## URLs Deployed

### Parallel site

| URL | HTTP status | Verified? |
|-----|------------|----------|
| `https://ai.[domain].com/` | | |
| `https://ai.[domain].com/pages/about.html` | | |
| `https://ai.[domain].com/pages/services.html` | | |
| `https://ai.[domain].com/pages/faq.html` | | |
| `https://ai.[domain].com/pages/process.html` | | |
| `https://ai.[domain].com/pages/comparisons.html` | | |
| `https://ai.[domain].com/pages/contact.html` | | |
| `https://ai.[domain].com/robots.txt` | | |
| `https://ai.[domain].com/sitemap.xml` | | |
| `https://ai.[domain].com/sitemap-agent.xml` | | |
| `https://ai.[domain].com/llms.txt` | | |
| `https://ai.[domain].com/agent-context.json` | | |

### Main domain AFO files

| URL | HTTP status | Verified? |
|-----|------------|----------|
| `https://[domain].com/llms.txt` | | |
| `https://[domain].com/agent-context.json` | | |
| `https://[domain].com/sitemap-agent.xml` | | |

---

## Baseline Score (from day-0-baseline.md)

| LLM | Total score (pre-deploy) |
|-----|-------------------------|
| ChatGPT | /12 |
| Perplexity | /12 |
| Gemini | /12 |
| Claude *(opt)* | /12 |
| Bing Copilot *(opt)* | /12 |
| **Aggregate** | **/60** |

---

## Notes

*(Any deployment issues, DNS propagation delays, decisions made at deploy time)*

---

## Next Checkpoint

Day 7 check: `docs/monitoring/day-7.md` — scheduled for *(YYYY-MM-DD)*

---

_Day 0 Deployment Record | `docs/monitoring/day-0-deploy.md`_
