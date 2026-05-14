# Day 30 — Serious Check

> **Parallel Internet Sites — Monitoring Template**
> Goal: First publishable before/after comparison. Run full rubric against all 5 LLMs.

---

## Check Metadata

| Field | Value |
|-------|-------|
| Client / Domain | |
| Check date | *(YYYY-MM-DD — should be ~30 days after Day 0)* |
| Days since deployment | |
| Tester | |

---

## Part 1 — Technical Health Check

| URL | HTTP status | Any issues? |
|-----|------------|-------------|
| `https://ai.[domain].com/` | | |
| `https://ai.[domain].com/llms.txt` | | |
| `https://ai.[domain].com/agent-context.json` | | |
| `https://[domain].com/llms.txt` | | |
| `https://[domain].com/agent-context.json` | | |

---

## Part 2 — Full LLM Rubric

Run all 4 prompts (from `day-0-baseline.md`) against all 5 LLMs.
Use the same scoring rubric (Visibility / Accuracy / Citation / Discoverability, 0–3 each).

### ChatGPT

| Dimension | Day 0 score | Day 30 score | Delta |
|-----------|-------------|--------------|-------|
| Visibility | | | |
| Accuracy | | | |
| Citation | | | |
| Discoverability | | | |
| **Total** | /12 | /12 | |

Response notes:
> *(Notable quotes or observations from responses)*

---

### Perplexity

| Dimension | Day 0 score | Day 30 score | Delta |
|-----------|-------------|--------------|-------|
| Visibility | | | |
| Accuracy | | | |
| Citation | | | |
| Discoverability | | | |
| **Total** | /12 | /12 | |

Response notes:
> *(Notable quotes or observations)*

---

### Gemini

| Dimension | Day 0 score | Day 30 score | Delta |
|-----------|-------------|--------------|-------|
| Visibility | | | |
| Accuracy | | | |
| Citation | | | |
| Discoverability | | | |
| **Total** | /12 | /12 | |

Response notes:
> *(Notable quotes or observations)*

---

### Claude *(optional)*

| Dimension | Day 0 score | Day 30 score | Delta |
|-----------|-------------|--------------|-------|
| Visibility | | | |
| Accuracy | | | |
| Citation | | | |
| Discoverability | | | |
| **Total** | /12 | /12 | |

---

### Bing Copilot *(optional)*

| Dimension | Day 0 score | Day 30 score | Delta |
|-----------|-------------|--------------|-------|
| Visibility | | | |
| Accuracy | | | |
| Citation | | | |
| Discoverability | | | |
| **Total** | /12 | /12 | |

---

## Part 3 — Aggregate Comparison

| LLM | Day 0 Total | Day 30 Total | Delta | % Change |
|-----|-------------|--------------|-------|----------|
| ChatGPT | /12 | /12 | | |
| Perplexity | /12 | /12 | | |
| Gemini | /12 | /12 | | |
| Claude *(opt)* | /12 | /12 | | |
| Bing Copilot *(opt)* | /12 | /12 | | |
| **TOTAL** | /60 | /60 | | |

---

## Part 4 — Narrative Summary

*(2–4 sentences summarizing what changed, what didn't, and what it means. Be honest — no spin.)*

Example: "At Day 30, Perplexity returned AFO in response to Prompt 1 for the first time (Visibility +1). ChatGPT, Gemini, Claude, and Bing showed no change. Direct brand query (Prompt 2) returned a result in Perplexity only — partially accurate, no citation. No claims of ranking improvement are warranted yet."

---

## Pass Criteria

- [ ] Full rubric run on at minimum ChatGPT, Perplexity, Gemini
- [ ] Scores recorded with delta vs. Day 0
- [ ] Narrative summary written
- [ ] File committed to repo before publishing any results externally

---

## Next Checkpoint

Day 60–90 check: `docs/monitoring/day-60-90.md` — scheduled for *(YYYY-MM-DD)*

---

_Day 30 Serious Check | `docs/monitoring/day-30.md`_
