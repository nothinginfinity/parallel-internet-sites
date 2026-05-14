# Scripts

## generate-site.js — Intake → Static Site Generator

Takes a populated client intake JSON and outputs a fully populated static site folder by substituting all `{{PLACEHOLDER}}` tokens in the templates.

### Requirements
- Node.js 16+ (stdlib only — no npm install needed)

### Usage

```bash
# Default: uses TrueBuild example intake
node scripts/generate-site.js

# Custom intake file
node scripts/generate-site.js templates/intake/client-intake.example.truebuild.json
```

### Input
- **Intake JSON:** `templates/intake/client-intake.example.truebuild.json` (or any path passed as argv[2])
- **Templates:** `templates/site/` (all files, including subdirectories)

### Output
- **`examples/truebuild/site/`** — mirrors `templates/site/` with all `{{TOKEN}}` placeholders replaced
- Files written are logged to stdout
- Any unmatched tokens (not found in intake) are logged as warnings but do not cause failure

### Token mapping
The script builds a flat uppercase token map from the intake JSON keys (e.g. `business_name` → `{{BUSINESS_NAME}}`). Arrays are joined with `, ` and each item is also exposed as `{{KEY_1}}`, `{{KEY_2}}`, etc. Computed helpers (e.g. `{{CURRENT_YEAR}}`, `{{COMPLIANCE_DISCLAIMER}}`, `{{SERVICES_CARDS}}`) are derived automatically from intake fields.

### Exit codes
- `0` — success (with or without unmatched token warnings)

### Generated output
The `examples/truebuild/site/` folder is **generated output** — do not hand-edit it. Re-run the script to regenerate after editing templates or intake JSON.
