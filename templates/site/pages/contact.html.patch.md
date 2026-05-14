# Patch note: contact.html — SERVICES_LIST fix

## Problem

The current `contact.html` template contains a `<select>` element that uses `{{SERVICES_LIST}}` as the source for `<option>` elements. However, the generator renders `{{SERVICES_LIST}}` as a comma-separated string (e.g., `"AFO Audit, Parallel Site Deployment"`) — not as `<option>` elements.

This produces invalid HTML: a `<select>` with a raw text node instead of `<option>` elements.

## Fix

Replace the broken `<select>` pattern with one of two approaches:

### Option A — New token: `{{SERVICES_OPTIONS}}`
Add `SERVICES_OPTIONS` to the generator. The generator emits pre-built `<option>` elements:
```html
<select name="service_interest" id="service_interest">
  {{SERVICES_OPTIONS}}
</select>
```
Generator output for `{{SERVICES_OPTIONS}}`:
```html
<option value="">Select a service…</option>
<option value="afo-audit">AFO Audit</option>
<option value="parallel-site">Parallel Site Deployment</option>
```

### Option B — Static options (recommended for AFO v1)
For the AFO-specific `/start` page, services are not variable — everyone gets an audit. Remove the select entirely and replace with a static confirmation line:
```html
<p class="service-summary">You're requesting: <strong>Free AFO Audit</strong></p>
```

## Action required

- **Option A**: Update `scripts/generate.js` (or equivalent) to add a `SERVICES_OPTIONS` token renderer that converts the services array to `<option>` elements.
- **Option B**: Implemented in `start.html` — the `/start` page does not use a service select at all.

The generic `contact.html` template should be patched to use `{{SERVICES_OPTIONS}}` (Option A) so it renders correctly for all future clients.
