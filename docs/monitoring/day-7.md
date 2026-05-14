# Day 7 — Light Check

> **Parallel Internet Sites — Monitoring Template**
> Goal: Confirm the site is indexed and crawlable. Note any early LLM awareness. Do not publish results yet.

---

## Check Metadata

| Field | Value |
|-------|-------|
| Client / Domain | |
| Check date | *(YYYY-MM-DD — should be ~7 days after Day 0)* |
| Days since deployment | |
| Tester | |

---

## Part 1 — Technical Health Check

Confirm all deployed URLs still return 200.

| URL | HTTP status | Change since Day 0? |
|-----|------------|--------------------|
| `https://ai.[domain].com/` | | |
| `https://ai.[domain].com/robots.txt` | | |
| `https://ai.[domain].com/sitemap.xml` | | |
| `https://ai.[domain].com/sitemap-agent.xml` | | |
| `https://ai.[domain].com/llms.txt` | | |
| `https://ai.[domain].com/agent-context.json` | | |
| `https://[domain].com/llms.txt` | | |
| `https://[domain].com/agent-context.json` | | |

---

## Part 2 — Indexing Check

- [ ] Run `site:ai.[domain].com` in Google Search — pages indexed?
- [ ] Run `site:ai.[domain].com` in Bing Search — pages indexed?
- [ ] Check Google Search Console if available

**Google index result:** *(e.g. "3 pages indexed" or "not yet indexed")*
**Bing index result:**

---

## Part 3 — LLM Spot Check

Run **Prompt 1 and Prompt 2 only** (from `day-0-baseline.md`) against **one LLM** (Perplexity recommended — fastest to index new content).

**LLM tested:**
**Prompt 1 response:**
> *(paste)*

**Prompt 2 response:**
> *(paste)*

**Any mention of domain?** Yes / No
**Score change vs. baseline (if any):** *(e.g. +1 visibility point or no change)*

> Do not over-interpret Day 7 results. No mention is normal. One mention is promising but not proof. Document what you observe, nothing more.

---

## Part 4 — Notes & Observations

*(Anything unexpected — unusual crawl behavior, new mentions, changes to the live site)*

---

## Pass Criteria

- [ ] All deployed URLs return 200
- [ ] Site is technically accessible to crawlers (robots.txt does not block)
- [ ] Results documented regardless of LLM mention or no mention

---

## Next Checkpoint

Day 30 check: `docs/monitoring/day-30.md` — scheduled for *(YYYY-MM-DD)*

---

_Day 7 Light Check | `docs/monitoring/day-7.md`_
