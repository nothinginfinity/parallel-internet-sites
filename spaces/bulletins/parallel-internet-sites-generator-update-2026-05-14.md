# Bulletin BLT-016 — Generator Update: Multi-Client Reusable
**For:** Jared + Brainstorm review
**Date:** 2026-05-14
**Status:** ✅ Read — Brainstorm decisions logged below
**Prepared by:** Alice
**Supersedes:** BLT-015 (marked read — archived)
**Repo:** https://github.com/nothinginfinity/parallel-internet-sites

---

## Brainstorm Response — 2026-05-14T07:14:00Z

**Overall:** Approved.

1. **Multi-client generator patch** — approved. Fixes the main repeatability issue from BLT-015. Repo is now a real reusable product template, not just a TrueBuild demo.
2. **AFO intake approval gate** — AFO / Nothing Infinity goes through the same approval gate as a client site before deployment. Same standard applied.
3. **AFO intake wording edits** (applied in this commit):
   - `"LLM entity profile setup"` → `"LLM-readable entity profile setup"`
   - `"How can a small business get mentioned by ChatGPT, Gemini, or Perplexity?"` → `"How can a small business improve the chances that ChatGPT, Gemini, or Perplexity accurately understand and mention it?"`
4. **Deployment sequence** — **AFO first, then TrueBuild.** Reason: AFO is self-owned, lower-risk, and gives a clean live case study before client deployment.
5. **BLT-015 decisions still hold.** TrueBuild still has three hard gates: DNS, form action URL, and Jared/client content approval.

---

## What Changed Since BLT-015

BLT-015 closed with a yellow-green status: technically ready, not public-launch ready. One architectural pivot was made before deployment planning proceeds.

**The generator script (`scripts/generate-site.js`) is now multi-client reusable.**

Previously, the output path was hardcoded to `examples/truebuild/site`. TrueBuild was the only possible output target. That has been patched.

---

## The Change

### Before
```bash
node scripts/generate-site.js
# Always output to: examples/truebuild/site
# No way to generate for any other client
```

### After
```bash
node scripts/generate-site.js [intake-json-path] [output-folder]

# TrueBuild (default — unchanged)
node scripts/generate-site.js

# Nothing Infinity / AFO (new)
node scripts/generate-site.js templates/intake/client-intake.example.afo.json examples/afo/site

# Any future client
node scripts/generate-site.js templates/intake/client-intake.example.acme.json examples/acme/site
```

Both arguments are optional. Default behavior is unchanged for TrueBuild.

---

## Files Delivered

| File | Type | What changed |
|---|---|---|
| `scripts/generate-site.js` | Patched | `argv[2]` = intake path, `argv[3]` = output folder. All stub fallbacks generic. Hard exit on bad intake. |
| `scripts/README.md` | Updated | Three usage examples documented. Token map fully documented. |
| `templates/intake/client-intake.example.afo.json` | New + edited | Brainstorm wording edits applied. |
| `examples/afo/README.md` | New | Documents AFO example, how to generate it, side-by-side with TrueBuild. |

---

## Current State of the Repo

| Component | Status | Notes |
|---|---|---|
| Repo scaffold (42 files) | ✅ Done | |
| TrueBuild intake (28 fields) | ✅ Done | |
| AFO / Nothing Infinity intake | ✅ Done + approved | Brainstorm wording edits applied |
| Static site template (7 HTML) | ✅ Done | |
| AFO integration (Phase 3) | ✅ Done | |
| Baseline prompt tests (Phase 4) | ✅ Done | TrueBuild: 2/50 pre-deployment |
| Generator script (Phase 5) | ✅ Done | Multi-client |
| Deployment Pack v1 | ⚠️ In progress | alice-ops MSG-OPS-006 |
| comparisons.html review | ⚠️ In progress | alice-review MSG-REV-004 |

### Deployment sequence (locked)
1. 🟢 **AFO / `ai.nothinginfinity.com`** — deploy first (self-owned, lower-risk, live case study)
2. 🟡 **TrueBuild / `ai.truebuild.com`** — deploy after (pending 3 hard gates)

---

*Bulletin prepared by Alice — 2026-05-14T07:10:00Z*
*Brainstorm response logged — 2026-05-14T07:14:00Z*
*File: `spaces/bulletins/parallel-internet-sites-generator-update-2026-05-14.md`*
*Ref: BLT-016*
