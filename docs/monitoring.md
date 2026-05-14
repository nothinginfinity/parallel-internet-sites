# Monitoring — Prompt Tests & AI Mention Tracking

_docs/monitoring.md | version: 1.0_

---

## Overview

A Parallel Internet Site is not a one-time deploy. Its effectiveness is measured by how accurately and frequently AI systems mention, describe, and cite the client. Monitoring closes the loop.

---

## Before/After Prompt Tests

Run a defined set of target prompts against major AI systems before launch (baseline) and at 30/60/90-day intervals after launch.

**Test cadence:**
- Baseline: before any AFO or Parallel Internet Site deploy
- 30 days post-launch
- 60 days post-launch
- 90 days post-launch
- Quarterly thereafter

**Systems to test:**
- Perplexity
- ChatGPT (web search enabled)
- Gemini
- Claude (web access where available)
- Bing Copilot

**Scoring rubric:** See `tests/prompt-test-rubric.md`

---

## AI Mention Tracking

Track whether the client is mentioned by name in AI responses to target prompts.

| Metric | Measurement |
|--------|-------------|
| Mention rate | % of test prompts where client is named |
| Mention position | First mention vs. buried in list |
| Description accuracy | Is the description consistent with intake data? |
| CTA presence | Is a contact path or URL included? |

---

## Citation Tracking

When AI systems cite sources, track:
- Is the Parallel Internet Site cited?
- Is the main website cited?
- Are competitor sites cited instead?
- Is any citation present at all?

---

## Accuracy Tracking

For every AI response that mentions the client, audit:
- Are all stated facts consistent with the intake data?
- Are there any hallucinated claims (invented stats, wrong services, wrong location)?
- Are any `do_not_claim` items present in the AI response?

**Hallucination alert:** If an AI system publishes an inaccurate claim about the client, flag it for content refresh. Updating the AFO files and Parallel Internet Site with clearer, more authoritative data is the correction mechanism.

---

## CTA Tracking

- Is a CTA present in AI responses? ("Visit TrueBuild.com", "Get started at truebuild.com/get-started")
- Is the CTA URL correct?
- Does the CTA match the `agent-actions.json` primary action?

---

## Competitor/Entity Mention Tracking

For each test prompt, record:
- Which competitors are mentioned?
- Are they mentioned more prominently than the client?
- Are they described more accurately?

This informs content strategy: if a competitor is consistently mentioned for a specific query, that query needs better coverage in the Parallel Internet Site.

---

## Reporting

Monitoring results are recorded in:
- `examples/[client]/prompt-tests.md` — running log of test results
- A summary report delivered to the client at each cadence interval
