# examples/afo — Nothing Infinity AFO Demo Site

This folder contains the generated Parallel Internet Site for **Nothing Infinity** — the agency behind this repo.

It serves as the second canonical example alongside TrueBuild, demonstrating that the generator is client-agnostic.

---

## What this is

A fully populated static Parallel Internet Site for Nothing Infinity, generated from:
- **Intake:** `templates/intake/client-intake.example.afo.json`
- **Templates:** `templates/site/`
- **Output:** `examples/afo/site/`

---

## Generate or regenerate this site

```bash
node scripts/generate-site.js templates/intake/client-intake.example.afo.json examples/afo/site
```

Run from the repo root. No npm install required.

---

## Deploy target

`https://ai.nothinginfinity.com` (subdomain, not yet live)

Follow `docs/deployment-pack-v1.md` for full deployment steps.

---

## Relationship to TrueBuild example

| | TrueBuild | Nothing Infinity (AFO) |
|---|---|---|
| **Intake file** | `client-intake.example.truebuild.json` | `client-intake.example.afo.json` |
| **Output folder** | `examples/truebuild/site/` | `examples/afo/site/` |
| **Deploy target** | `ai.truebuild.com` | `ai.nothinginfinity.com` |
| **Industry** | Business credit / Financial services | AI automation / AFO |
| **Client status** | First client demo | Agency own-brand demo |

---

## Generate the site now

```bash
node scripts/generate-site.js templates/intake/client-intake.example.afo.json examples/afo/site
```

Output will appear in `examples/afo/site/` with zero unmatched tokens.
