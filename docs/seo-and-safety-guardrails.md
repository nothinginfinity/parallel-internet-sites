# SEO & Safety Guardrails

_docs/seo-and-safety-guardrails.md | version: 1.0_

---

## Why Guardrails Matter

Parallel Internet Sites are designed to help AI systems understand a business accurately. This only works — ethically and practically — if the sites are honest, transparent, and consistent with the client's main website.

Shortcuts like cloaking or keyword stuffing will eventually be penalized by AI systems, search engines, and users alike. The competitive advantage of a Parallel Internet Site comes from quality, accuracy, and structure — not manipulation.

---

## Mandatory Guardrails

### No Cloaking
Do not serve different content to crawlers vs. human visitors. The same HTML that humans see must be what crawlers index. Agent JSON files are additive — they do not replace or contradict the visible content.

### No Hidden Bot-Only Content
Do not hide content behind CSS `display: none` or JavaScript rendering tricks intended for bots only. All content must be visible to human visitors.

### No Doorway Pages
Do not create thin pages designed only to rank for a query with no useful content. Every page must provide genuine value to a human reader.

### No Unsupported Claims
Every factual claim — statistics, rankings, outcomes, certifications — must be traceable to:
- A field in the client's `client-intake.*.json`
- An approved `source_of_truth_pages` URL
- A publicly verifiable source

If a claim cannot be sourced, it must not appear on the site.

### No Fake Reviews or Testimonials
Do not fabricate reviews, testimonials, or social proof. If client testimonials are used, they must be real, attributed, and approved by the client.

### No Fake Third-Party Comparison Claims
Do not create fake "independent" comparison pages that are actually client-controlled. If the site is client-approved, it must disclose that clearly.

### No Claims in `do_not_claim`
If the client's intake data includes a `do_not_claim` list, those claims must never appear anywhere on the site.

### All Content Public and Client-Approved
Every page on the Parallel Internet Site must be:
- Publicly accessible (no login walls)
- Reviewed and approved by the client before launch
- Consistent with the client's main website

### All Claims Traceable
Maintain a content audit trail: for each factual claim on the site, document the source field or URL. This audit trail is internal but must exist.

---

## Disclosure Requirements

Every Parallel Internet Site must include:

1. **Page-level disclosure** (footer or header): "This is an official knowledge site for [Business Name]. [Link to main website]."
2. **`agent-policy.json` disclosure**: `"site_type": "official-knowledge-site"` and `"approved_by": "[Business Name]"`
3. **`llms.txt` disclosure**: Clear statement that this site is operated by or on behalf of the named business

---

## What to Do When in Doubt

If a content decision is unclear:
1. Check: Is this claim in the intake data or a source_of_truth page?
2. Check: Would a reasonable person see this as misleading?
3. If uncertain: **do not publish the claim.** Flag it for client review instead.
