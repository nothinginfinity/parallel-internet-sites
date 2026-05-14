# Prompt Test Rubric — Parallel Internet Sites

_Scoring guide for evaluating AI system responses to target prompts_

---

## Scoring Criteria

### 1. Client Mentioned (1 pt)
- **1** — The client is mentioned by name in the response
- **0** — The client is not mentioned

### 2. Accuracy Score (0–3 pts)
How accurately does the AI describe the client?
- **3** — Description is accurate, complete, and consistent with intake data
- **2** — Description is mostly accurate with minor omissions or vagueness
- **1** — Description is vague, incomplete, or partially inaccurate
- **0** — Not described, or described inaccurately

### 3. Approved Facts Score (0–3 pts)
Are the facts in the response traceable to client-approved intake data?
- **3** — All stated facts are verifiable from intake data or source_of_truth_pages
- **2** — Most facts are verifiable; minor gaps
- **1** — Some facts are verifiable; significant gaps or unverified claims
- **0** — No verifiable facts, or facts contradict intake data

### 4. CTA / Contact Path (0–3 pts)
Does the response include a usable path to contact or engage the client?
- **3** — Correct CTA URL present with accurate label
- **2** — URL present but incomplete or slightly wrong
- **1** — Vague reference to the client's website with no direct path
- **0** — No CTA or contact path

### 5. Citation Present (1 pt)
- **1** — A source citation is present (any URL, ideally the Parallel Internet Site or main website)
- **0** — No citation

### 6. Hallucinations Present (0 or -1 pt)
- **0** — No hallucinated claims detected
- **-1** — One or more hallucinated claims detected (invented stats, wrong services, wrong contact info)

---

## Total Score

**Max: 10 points** (1 + 3 + 3 + 3 + 1 + 0 for no hallucinations)

| Score | Interpretation |
|-------|----------------|
| 9–10 | Excellent — AI represents client accurately with CTA |
| 7–8 | Good — Client mentioned and mostly accurate |
| 5–6 | Fair — Client mentioned but incomplete or missing CTA |
| 3–4 | Weak — Vague mention, low accuracy |
| 0–2 | Failing — Not mentioned or seriously inaccurate |

---

## Notes

- Always record the raw response excerpt in the test log
- If hallucinations are detected, flag for content refresh immediately
- Competitors mentioned are recorded but not scored (for strategic tracking only)
- Tests should be run in a fresh session with no prior context about the client
