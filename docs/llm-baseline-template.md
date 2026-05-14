# LLM Baseline Visibility Test — Template

> **Parallel Internet Sites — Baseline Template**
> Version: 1.0 | Created: 2026-05-14 | Author: alice
>
> Copy this file to `examples/[client]/prompt-tests/day-0-baseline.md` and fill it in **before any deployment.**
> This is the zero-point of the experiment. It cannot be recreated after the fact.

---

## Metadata

| Field | Value |
|-------|-------|
| Client / Domain | *(e.g. agentfeedoptimization.com)* |
| Test date | *(YYYY-MM-DD)* |
| Test time | *(HH:MM timezone)* |
| Tester | *(name or agent ID)* |
| Deployment status | **PRE-DEPLOYMENT — no AFO files installed** |
| Notes | *(any context — e.g. "domain is 8 months old, no existing llms.txt")* |

---

## LLMs Tested

Run at minimum: **ChatGPT, Perplexity, Gemini.**
Run all 5 if possible: ChatGPT, Perplexity, Gemini, Claude, Bing Copilot.

| LLM | Version / Model | Date tested | Tester |
|-----|----------------|-------------|--------|
| ChatGPT | *(e.g. GPT-4o, 2026-05-14)* | | |
| Perplexity | *(e.g. Sonar Pro)* | | |
| Gemini | *(e.g. Gemini 1.5 Pro)* | | |
| Claude | *(e.g. Claude 3.5 Sonnet)* | | |
| Bing Copilot | *(e.g. GPT-4 Turbo)* | | |

---

## Prompt Set

Use **all prompts below** consistently across every LLM and every test interval. Do not modify prompts between intervals — consistency is what makes the before/after comparison valid.

### Prompt 1 — Category discovery
> *(Replace with the client's relevant category question)*
> Example for AFO: "What tools or services help businesses optimize how AI systems understand and describe them?"

**Prompt 1 text:**
```
[INSERT CATEGORY DISCOVERY PROMPT HERE]
```

### Prompt 2 — Direct brand query
> Ask directly about the business by name.

**Prompt 2 text:**
```
[INSERT DIRECT BRAND QUERY HERE — e.g. "What is Agent Feed Optimization?"]
```

### Prompt 3 — Problem-solution prompt
> Describe the problem the business solves, ask for solutions.

**Prompt 3 text:**
```
[INSERT PROBLEM-SOLUTION PROMPT HERE]
```

### Prompt 4 — Comparison prompt (optional)
> Ask how this type of service compares to alternatives.

**Prompt 4 text:**
```
[INSERT COMPARISON PROMPT HERE — optional, skip if not applicable]
```

---

## Scoring Rubric

Score each dimension **0–3** per LLM per prompt. Record the raw response text in the Results section below.

| Dimension | 0 | 1 | 2 | 3 |
|-----------|---|---|---|---|
| **Visibility** | Not mentioned at all | Mentioned only when directly named | Mentioned in relevant category responses | Proactively cited as a top result |
| **Accuracy** | Not testable (not mentioned) OR severely wrong | Partially correct but with errors | Mostly correct, minor gaps | Fully accurate, traceable to source material |
| **Citation** | No citation or link | Mentioned without link | Link present but indirect | Direct link to domain cited |
| **Discoverability** | Does not appear in any relevant query | Appears in 1 of 4 prompts | Appears in 2–3 of 4 prompts | Appears in all relevant prompts |

**Max score per LLM:** 12 (4 dimensions × 3 max each)
**Aggregate max (5 LLMs):** 60

> **Expectation for pre-deployment baseline:** Total score likely 0–5. A score of 0 is normal and expected for a domain with no AFO files. The baseline establishes the floor, not a failure.

---

## Results

### ChatGPT

**Prompt 1 response:**
> *(paste response here — verbatim)*

**Prompt 2 response:**
> *(paste response here)*

**Prompt 3 response:**
> *(paste response here)*

**Prompt 4 response (optional):**
> *(paste response here or N/A)*

**Scores:**

| Dimension | Score (0–3) | Notes |
|-----------|-------------|-------|
| Visibility | | |
| Accuracy | | |
| Citation | | |
| Discoverability | | |
| **Total** | **/12** | |

---

### Perplexity

**Prompt 1 response:**
> *(paste response here)*

**Prompt 2 response:**
> *(paste response here)*

**Prompt 3 response:**
> *(paste response here)*

**Prompt 4 response (optional):**
> *(paste response here or N/A)*

**Scores:**

| Dimension | Score (0–3) | Notes |
|-----------|-------------|-------|
| Visibility | | |
| Accuracy | | |
| Citation | | |
| Discoverability | | |
| **Total** | **/12** | |

---

### Gemini

**Prompt 1 response:**
> *(paste response here)*

**Prompt 2 response:**
> *(paste response here)*

**Prompt 3 response:**
> *(paste response here)*

**Prompt 4 response (optional):**
> *(paste response here or N/A)*

**Scores:**

| Dimension | Score (0–3) | Notes |
|-----------|-------------|-------|
| Visibility | | |
| Accuracy | | |
| Citation | | |
| Discoverability | | |
| **Total** | **/12** | |

---

### Claude *(optional)*

**Prompt 1 response:**
> *(paste or N/A)*

**Prompt 2 response:**
> *(paste or N/A)*

**Prompt 3 response:**
> *(paste or N/A)*

**Prompt 4 response (optional):**
> *(paste or N/A)*

**Scores:**

| Dimension | Score (0–3) | Notes |
|-----------|-------------|-------|
| Visibility | | |
| Accuracy | | |
| Citation | | |
| Discoverability | | |
| **Total** | **/12* (optional)* | |

---

### Bing Copilot *(optional)*

**Prompt 1 response:**
> *(paste or N/A)*

**Prompt 2 response:**
> *(paste or N/A)*

**Prompt 3 response:**
> *(paste or N/A)*

**Prompt 4 response (optional):**
> *(paste or N/A)*

**Scores:**

| Dimension | Score (0–3) | Notes |
|-----------|-------------|-------|
| Visibility | | |
| Accuracy | | |
| Citation | | |
| Discoverability | | |
| **Total** | **/12* (optional)* | |

---

## Aggregate Baseline Score

| LLM | Visibility | Accuracy | Citation | Discoverability | Total |
|-----|-----------|----------|----------|----------------|-------|
| ChatGPT | | | | | /12 |
| Perplexity | | | | | /12 |
| Gemini | | | | | /12 |
| Claude *(opt)* | | | | | /12 |
| Bing Copilot *(opt)* | | | | | /12 |
| **TOTAL** | | | | | **/60** |

**Baseline summary (1-2 sentences):**
> *(Write a plain-language summary of the baseline — e.g. "Domain is invisible across all 5 LLMs pre-deployment. Direct brand query returns no result from any model. Score: 0/60.")*

---

## Next Step

Do not deploy until this file is committed to the repo with date and scores recorded.

Once committed: proceed to `docs/afo-customer-1-runbook.md` Step 2 (or `docs/deployment-pack-v1.md` for other clients).

---

_LLM Baseline Visibility Test Template v1.0 | `docs/llm-baseline-template.md`_
