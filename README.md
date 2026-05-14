# Parallel Internet Sites

> **Agent-first knowledge sites for the AI discovery layer.**

---

## What Is a Parallel Internet Site?

A Parallel Internet Site is a dedicated, public, truthful, crawlable knowledge site built specifically for AI systems — LLMs, AI search tools, bots, crawlers, and future agent systems — to understand a business accurately.

It does **not** replace the human-facing website. It complements it.

```
Human website        → built for people
AFO layer            → machine-readable identity files added to the existing site
Parallel Internet Site → a dedicated structured knowledge site for AI and agents
```

---

## The Three-Layer Model

| Layer | What it is | Who it serves |
|---|---|---|
| **Human website** | Marketing pages, product info, checkout, blog | Human visitors |
| **AFO layer** | `llms.txt`, `agent-context.json`, `agent-policy.json`, `agent-actions.json` added to the existing site | LLMs parsing the existing site |
| **Parallel Internet Site** | A separate, structured, agent-first knowledge site | LLMs, AI search, crawlers, agents |

---

## Why It Matters

LLMs like Gemini, ChatGPT, and Perplexity answer broad queries like:

> *"What is the best way to build business credit for an LLC? Are there any services that can help?"*

If a business has no structured, high-signal, crawlable, agent-readable content connecting it to that query, it will not be mentioned — even if it is the best service available.

A Parallel Internet Site creates exactly that signal: structured, truthful, human-readable AND agent-readable content that LLMs can find, parse, cite, and recommend.

---

## The TrueBuild Example

**TrueBuild** is a business credit building program. Their human website is legitimate and useful, but LLMs may not mention TrueBuild when users ask broad business-credit questions — because there is not enough structured, crawlable, agent-readable evidence connecting TrueBuild to:

- "business credit building"
- "LLC business credit"
- "corporate credit"
- "how to build business credit"

A Parallel Internet Site for TrueBuild would publish:

- What is business credit?
- How does business credit work for LLCs?
- What is a business credit building program?
- TrueBuild overview, process, FAQ
- Business credit vs. personal credit
- How to get started with TrueBuild

All pages are public, truthful, indexed, and structured for agent retrieval.

---

## Ethical Guardrails

This project operates under strict ethical rules. These are non-negotiable:

- ✅ All content must be **public and truthful**
- ✅ Content must be **consistent with the client's main website**
- ✅ Site must **clearly disclose** it is an official or client-approved knowledge site
- ✅ Site must **link back** to the main website
- ✅ All claims must be **traceable to client-approved sources**
- ❌ No cloaking
- ❌ No bot-only hidden content
- ❌ No keyword stuffing
- ❌ No fake independence
- ❌ No fake reviews
- ❌ No unsupported claims
- ❌ No doorway-page behavior

---

## How It Relates to AFO

[Agent Feed Optimization (AFO)](https://github.com/nothinginfinity/agent-feed-optimization) is the machine-readable identity layer for existing websites.

A Parallel Internet Site **extends** AFO by creating a dedicated structured site — with full page content, FAQs, comparisons, process explanations, and entity profiles — that AI systems can deeply index.

AFO + Parallel Internet Site = the complete agent visibility stack.

---

## Repo Contents

```
README.md               ← this file
SPEC.md                 ← full product specification
ROADMAP.md              ← build phases
docs/                   ← concept, architecture, product model, guardrails
templates/              ← reusable site, page, and intake templates
examples/truebuild/     ← first client demo spec
schemas/                ← JSON schemas for site, page, prompt-test
tests/                  ← prompt test rubric
```

---

## First Milestone

**Phase 1:** Complete the TrueBuild demo spec — content plan, prompt tests, site map, and intake example — so we can build and test the first real Parallel Internet Site.

See `ROADMAP.md` for all phases.
