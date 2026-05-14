# ROADMAP.md — Parallel Internet Sites

_version: 1.0 | agent: alice-ops | last-updated: 2026-05-13_

---

## Phase 0 — Repo Scaffold
**Status:** ✅ Complete

- [x] Create `nothinginfinity/parallel-internet-sites` repo
- [x] Push `README.md`, `SPEC.md`, `ROADMAP.md`
- [x] Push `docs/` directory (concept, product-model, architecture, guardrails, afo-integration, monitoring)
- [x] Push `templates/` directory (site template, intake schema, page templates)
- [x] Push `examples/truebuild/` directory
- [x] Push `schemas/` directory
- [x] Push `tests/` directory

---

## Phase 1 — TrueBuild Demo Spec
**Status:** 🔄 In Progress

- [ ] Complete `examples/truebuild/client-intake.example.truebuild.json` with real TrueBuild data
- [ ] Draft `examples/truebuild/content-plan.md` page outline
- [ ] Run baseline prompt tests and record scores in `examples/truebuild/prompt-tests.md`
- [ ] Define target prompts and scoring rubric
- [ ] Review with Jared

---

## Phase 2 — Static Site Template
**Status:** ⏳ Pending

- [ ] Build working `templates/site/index.html` (full HTML, not placeholder)
- [ ] Build `templates/site/pages/` as rendered HTML pages
- [ ] Wire JSON-LD structured data into HTML templates
- [ ] Validate `robots.txt` and `sitemap.xml` format
- [ ] Validate `llms.txt` against emerging spec
- [ ] Test deploy to GitHub Pages or Netlify

---

## Phase 3 — AFO Integration
**Status:** ⏳ Pending

- [ ] Define how `agent-context.json` mirrors/extends `llms.txt`
- [ ] Define how `sitemap-agent.xml` integrates with AFO sitemap layer
- [ ] Document sync workflow between AFO install and Parallel Internet Site
- [ ] Define update triggers (intake change → regenerate agent files)

---

## Phase 4 — Prompt-Test Monitoring
**Status:** ⏳ Pending

- [ ] Build prompt test runner (manual or automated)
- [ ] Define scoring rubric (see `tests/prompt-test-rubric.md`)
- [ ] Establish baseline scores for TrueBuild
- [ ] Set up 30/60/90-day cadence for re-testing
- [ ] Define alert threshold: what triggers a content refresh?

---

## Phase 5 — Client-Ready Generator Workflow
**Status:** ⏳ Pending

- [ ] Build intake → content generation pipeline
- [ ] Template all agent files for variable substitution
- [ ] Build GitHub Action or script: intake JSON → full site scaffold
- [ ] Client review workflow
- [ ] Deployment checklist and handoff doc
