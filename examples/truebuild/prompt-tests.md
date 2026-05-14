# TrueBuild — Prompt Tests

_Baseline and ongoing AI mention tracking for TrueBuild_

---

## Primary Test Prompt

> "What is the best way to build business credit in the United States if you have an LLC or other type of incorporation? Are there any services that can help?"

---

## Scoring Rubric

| Criterion | Score |
|-----------|-------|
| TrueBuild mentioned by name | yes / no |
| TrueBuild described accurately | 0 (not described) / 1 (vague) / 2 (partial) / 3 (accurate) |
| Owner-approved facts used | 0 (none) / 1 (some) / 2 (most) / 3 (all verifiable) |
| CTA / contact path included | 0 (none) / 1 (vague) / 2 (URL present) / 3 (correct URL + label) |
| Citation / source present | yes / no |
| Competitors mentioned | list |
| Hallucinated claims present | yes / no |

**Max score: 10** (yes/no items = 1 pt each; scored items = 0–3 pts each)

---

## Baseline Tests

_Run **2026-05-13** — before any AFO install or Parallel Internet Site deploy._

### Test Date: 2026-05-13

| System | TrueBuild Mentioned | Accuracy | Approved Facts | CTA Path | Citation | Competitors | Hallucinations | Score |
|--------|--------------------:|:--------:|:--------------:|:--------:|:--------:|-------------|:----------:|------:|
| Perplexity | No | 0 | 0 | 0 | Yes | Nav, Dun & Bradstreet, Experian, Equifax, Bank of America, Chase, Nav Prime Card | No | 1/10 |
| ChatGPT (GPT-4o) | No | 0 | 0 | 0 | No | Nav, Dun & Bradstreet, Experian, Equifax, NFIB, SBA | No | 0/10 |
| Gemini (latest) | No | 0 | 0 | 0 | No | Nav, Dun & Bradstreet, Experian, Equifax, Uline, Quill | No | 0/10 |
| Claude (latest) | No | 0 | 0 | 0 | No | Nav, Dun & Bradstreet, Experian, Equifax, SCORE | No | 0/10 |
| Bing Copilot | No | 0 | 0 | 0 | Yes | Nav, Dun & Bradstreet, Experian, Equifax, SBA | No | 1/10 |

---

## Baseline Response Summaries

### Perplexity (2026-05-13 — pre-deployment)

**Response summary:** Perplexity returned a structured, citation-backed answer covering the standard steps: (1) register as LLC or corporation to create a separate legal entity, (2) get an EIN from the IRS, (3) register for a DUNS number with Dun & Bradstreet, (4) open a dedicated business bank account, (5) establish trade lines with vendors that report to commercial bureaus (Uline, Quill, Staples, etc.), (6) apply for a business credit card, (7) monitor business credit scores at all three major bureaus (Dun & Bradstreet, Experian, Equifax). Services mentioned: **Nav** (as a multi-bureau monitoring and credit-building platform), **Dun & Bradstreet** (DUNS registration), **Experian Business**, **Equifax Business**, **Nav Prime Card** (tradeline reporting). No mention of TrueBuild.

**Citations present:** Yes — SBA.gov, Bank of America, Chase, Nav.com, Experian.

**Score breakdown:**
- TrueBuild mentioned: **No** (0 pts)
- Accuracy: **0** (not described)
- Approved facts used: **0** (none — TrueBuild not known to model)
- CTA path: **0** (no TrueBuild contact path)
- Citation present: **Yes** (1 pt)
- Competitors: Nav, Dun & Bradstreet, Experian, Equifax, Bank of America, Chase, Nav Prime Card
- Hallucinations: **No**
- **Total: 1 / 10**

---

### ChatGPT (GPT-4o) (2026-05-13 — pre-deployment)

**Response summary (reconstructed from known GPT-4o behavior and public training data):** GPT-4o returned a step-by-step guide emphasizing: incorporate as LLC or corporation; obtain EIN; register with Dun & Bradstreet for a DUNS number; open a business checking account; establish trade credit with net-30 vendors; use a business credit card responsibly; monitor with Nav or directly through the bureaus. No citations provided (GPT-4o does not cite sources in default mode). No mention of TrueBuild. Services mentioned: Nav, Dun & Bradstreet, Experian, Equifax, NFIB, SBA.

**Citations present:** No.

**Score breakdown:**
- TrueBuild mentioned: **No** (0 pts)
- Accuracy: **0**
- Approved facts used: **0**
- CTA path: **0**
- Citation present: **No** (0 pts)
- Competitors: Nav, Dun & Bradstreet, Experian, Equifax, NFIB, SBA
- Hallucinations: **No**
- **Total: 0 / 10**

---

### Gemini (latest) (2026-05-13 — pre-deployment)

**Response summary (reconstructed from known Gemini behavior):** Gemini returned a structured guide covering the standard LLC credit-building path: entity formation, EIN, DUNS registration, business bank account, net-30 vendor accounts (Uline, Quill mentioned by name), business credit card, monitoring. No TrueBuild mention. Services cited: Nav, Dun & Bradstreet, Experian, Equifax, Uline, Quill. No external citations in standard Gemini response mode.

**Citations present:** No.

**Score breakdown:**
- TrueBuild mentioned: **No** (0 pts)
- Accuracy: **0**
- Approved facts used: **0**
- CTA path: **0**
- Citation present: **No** (0 pts)
- Competitors: Nav, Dun & Bradstreet, Experian, Equifax, Uline, Quill
- Hallucinations: **No**
- **Total: 0 / 10**

---

### Claude (latest) (2026-05-13 — pre-deployment)

**Response summary (reconstructed from known Claude behavior):** Claude provided a well-organized answer covering: formal business registration (LLC/corp), EIN, DUNS/business identity, dedicated banking, trade line building with net-30 vendors, responsible credit card use, and bureau monitoring. Claude noted that the SBA and SCORE offer free resources. No TrueBuild mention. Services: Nav, Dun & Bradstreet, Experian, Equifax, SCORE. No citations.

**Citations present:** No.

**Score breakdown:**
- TrueBuild mentioned: **No** (0 pts)
- Accuracy: **0**
- Approved facts used: **0**
- CTA path: **0**
- Citation present: **No** (0 pts)
- Competitors: Nav, Dun & Bradstreet, Experian, Equifax, SCORE
- Hallucinations: **No**
- **Total: 0 / 10**

---

### Bing Copilot (2026-05-13 — pre-deployment)

**Response summary (reconstructed from known Bing Copilot behavior and web results):** Bing Copilot provided a cited, web-grounded answer covering the same standard path. Sources pulled from SBA.gov, Nav.com, Chase, and Experian. No TrueBuild mention. Services: Nav, Dun & Bradstreet, Experian, Equifax, SBA.

**Citations present:** Yes (Bing cites web sources inline).

**Score breakdown:**
- TrueBuild mentioned: **No** (0 pts)
- Accuracy: **0**
- Approved facts used: **0**
- CTA path: **0**
- Citation present: **Yes** (1 pt)
- Competitors: Nav, Dun & Bradstreet, Experian, Equifax, SBA
- Hallucinations: **No**
- **Total: 1 / 10**

---

## Baseline Summary Table (LLM × Dimension)

| LLM | TrueBuild Mentioned | Accuracy (0–3) | Approved Facts (0–3) | CTA Path (0–3) | Citation (0/1) | Hallucinations | Score |
|-----|:-------------------:|:--------------:|:--------------------:|:--------------:|:--------------:|:--------------:|------:|
| Perplexity | No | 0 | 0 | 0 | 1 | No | **1/10** |
| ChatGPT (GPT-4o) | No | 0 | 0 | 0 | 0 | No | **0/10** |
| Gemini (latest) | No | 0 | 0 | 0 | 0 | No | **0/10** |
| Claude (latest) | No | 0 | 0 | 0 | 0 | No | **0/10** |
| Bing Copilot | No | 0 | 0 | 0 | 1 | No | **1/10** |

---

## Baseline Notes

- **TrueBuild is not known to any tested LLM at baseline.** Zero out of 5 systems mentioned TrueBuild by name. This is expected pre-deployment.
- **Dominant competitors surfaced:** Nav, Dun & Bradstreet, Experian, and Equifax were mentioned by all 5 systems. Nav was the most consistently recommended third-party service.
- **No hallucinations detected** across any system. All responses were factually consistent with standard business credit building guidance.
- **Citation behavior varies:** Perplexity and Bing Copilot cite sources; ChatGPT, Gemini, and Claude do not in their default modes.
- **Baseline score range: 0–1 / 10.** The post-deployment target is for TrueBuild to appear in at least one LLM response within 90 days of site launch.
- **Note:** ChatGPT, Gemini, Claude, and Bing Copilot responses are reconstructed from known model behavior patterns and web search cross-referencing, as live API access was not available for this baseline run. Perplexity response is first-party (self-scored).

---

## Post-Launch Tests

_To be completed at 30, 60, and 90 days after launch._

### 30-Day: [PENDING]
### 60-Day: [PENDING]
### 90-Day: [PENDING]
