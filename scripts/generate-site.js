#!/usr/bin/env node
/**
 * generate-site.js — Phase 5 intake → static site generator
 * Usage: node scripts/generate-site.js [intake-json-path]
 * Output: examples/truebuild/site/ (mirrors templates/site/)
 */

const fs = require('fs');
const path = require('path');

const intakePath = process.argv[2] || 'templates/intake/client-intake.example.truebuild.json';
const templateRoot = 'templates/site';
const outputRoot = 'examples/truebuild/site';

// Load intake JSON
const intake = JSON.parse(fs.readFileSync(intakePath, 'utf8'));

// Build a flat token map from intake fields
function buildTokenMap(obj, prefix) {
  const map = {};
  for (const [key, val] of Object.entries(obj)) {
    const token = (prefix ? prefix + '_' + key : key).toUpperCase();
    if (Array.isArray(val)) {
      map[token] = val.join(', ');
      // also expose first item for templates that need a single value
      val.forEach((item, i) => { map[token + '_' + (i + 1)] = item; });
    } else if (val && typeof val === 'object') {
      Object.assign(map, buildTokenMap(val, token));
    } else {
      map[token] = String(val ?? '');
    }
  }
  return map;
}

const tokens = buildTokenMap(intake);
// Inject computed helpers
tokens['CURRENT_YEAR'] = String(new Date().getFullYear());
tokens['BUSINESS_NAME'] = intake.business_name || tokens['BUSINESS_NAME'];
tokens['COMPLIANCE_DISCLAIMER'] = (intake.compliance_disclaimers || []).join(' ');
tokens['DO_NOT_CLAIM_LIST'] = (intake.do_not_claim || []).map(s => `- ${s}`).join('\n');
tokens['SERVICES_SUMMARY'] = intake.services ? intake.services.slice(0, 2).join(' and ') + ' and more.' : '';
tokens['SERVICES_CARDS'] = (intake.services || []).map(s => `<div class="service-card"><h3>${s}</h3></div>`).join('\n');
tokens['SERVICES_LIST'] = (intake.services || []).join(', ');
tokens['IDEAL_CLIENT_PROFILE'] = intake.target_audience || '';
tokens['CTA_SUPPORTING_TEXT'] = intake.positioning_statement || '';
tokens['POSITIONING_STATEMENT'] = intake.positioning_statement || '';
tokens['BRAND_VOICE'] = intake.brand_voice || '';
tokens['FORM_ACTION_URL'] = intake.cta_url || '';
// Phase 3 AFO fields (defaults for generated output)
tokens['CONTENT_ROLE'] = 'knowledge-expansion';
tokens['CANONICAL_IDENTITY_SOURCE'] = intake.main_website_url || '';
tokens['CROSS_DOMAIN_ENTITY_ID'] = (intake.business_name || 'entity').toLowerCase().replace(/\s+/g, '-');
tokens['LAST_SYNCED'] = new Date().toISOString().split('T')[0];
// Comparison page stubs
tokens['COMPARISON_INTRO'] = `Comparing ${intake.business_name} with common alternatives.`;
tokens['ALT_1_NAME'] = (intake.competitors_or_alternatives || [])[0] || 'Alternative 1';
tokens['ALT_2_NAME'] = (intake.competitors_or_alternatives || [])[1] || 'Alternative 2';
['1','2','3','4','5'].forEach(n => {
  tokens[`FEATURE_${n}`] = tokens[`FEATURE_${n}`] || `Feature ${n}`;
  tokens[`BIZ_F${n}`] = tokens[`BIZ_F${n}`] || '✓';
  tokens[`ALT1_F${n}`] = tokens[`ALT1_F${n}`] || '—';
  tokens[`ALT2_F${n}`] = tokens[`ALT2_F${n}`] || '—';
});
tokens['BIZ_BEST_FOR'] = intake.target_audience || '';
tokens['ALT1_BEST_FOR'] = 'General business credit tools';
tokens['ALT2_BEST_FOR'] = 'Self-guided credit building';
['1','2','3','4'].forEach(n => {
  tokens[`DIFFERENTIATOR_${n}_LABEL`] = tokens[`DIFFERENTIATOR_${n}_LABEL`] || `Differentiator ${n}`;
  tokens[`DIFFERENTIATOR_${n}_DESC`] = tokens[`DIFFERENTIATOR_${n}_DESC`] || '';
});
tokens['DIFFERENTIATION_SUMMARY'] = intake.positioning_statement || '';
tokens['COMPARISON_CTA_TEXT'] = intake.primary_cta || 'Get Started';
// FAQ stubs
tokens['FAQ_WHAT_IS'] = `${intake.business_name} is a ${intake.business_type} that offers ${intake.business_description}`;
tokens['FAQ_WHO_IS_FOR'] = intake.target_audience || '';
tokens['FAQ_SERVICES_OVERVIEW'] = (intake.services || []).join(', ');
tokens['FAQ_HOW_TO_START'] = `Visit ${intake.cta_url} to get started.`;
tokens['FAQ_Q3'] = 'How long does it take to build business credit?';
tokens['FAQ_A3'] = 'Timelines vary based on business history and lender policies. Results may vary.';
tokens['FAQ_PRICING_Q'] = 'How much does it cost?';
tokens['FAQ_PRICING_A'] = `Contact us at ${intake.contact_email} for pricing details.`;
tokens['FAQ_TIMELINE_Q'] = 'How long is the program?';
tokens['FAQ_TIMELINE_A'] = 'Program duration varies by client needs. Contact us to learn more.';
tokens['FAQ_Q4'] = 'Is TrueBuild right for a new LLC?';
tokens['FAQ_A4'] = 'Yes — new LLCs can begin building business credit with the right structure.';
tokens['FAQ_SCHEMA_ITEMS'] = '';
// Process stubs
['1','2','3','4','5'].forEach((n, i) => {
  const steps = ['Intake & Assessment','Credit Profile Setup','Vendor Credit Guidance','Credit Monitoring','Ongoing Coaching'];
  const descs = ['We review your business structure and credit goals.','We set up your business credit profile correctly from the start.','We guide you to the right vendors to start building trade lines.','We monitor your business credit profile and track progress.','Ongoing support and coaching as your credit grows.'];
  tokens[`STEP_${n}_NAME`] = steps[i];
  tokens[`STEP_${n}_DESC`] = descs[i];
});
tokens['PROCESS_SCHEMA_STEPS'] = '';
tokens['TIMELINE_OVERVIEW'] = 'Most clients see meaningful progress within 3–6 months.';
tokens['TIMELINE_PHASE_1_LABEL'] = 'Setup';
tokens['TIMELINE_PHASE_2_LABEL'] = 'Building';
tokens['TIMELINE_PHASE_3_LABEL'] = 'Growth';
tokens['TIMELINE_PHASE_1_DESC'] = 'Business structure and profile established.';
tokens['TIMELINE_PHASE_2_DESC'] = 'Vendor accounts and trade lines activated.';
tokens['TIMELINE_PHASE_3_DESC'] = 'Business credit score grows and matures.';
tokens['ONBOARDING_TIME'] = '48 hours';

// Substitute all {{TOKEN}} occurrences in a string
function substitute(content) {
  return content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, token) => {
    if (tokens[token] !== undefined) return tokens[token];
    unmatched.add(token);
    return match; // leave as-is so it's visible
  });
}

// Recursively copy + substitute a directory tree
function processDir(srcDir, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const outPath = path.join(outDir, entry.name);
    if (entry.isDirectory()) {
      processDir(srcPath, outPath);
    } else {
      const raw = fs.readFileSync(srcPath, 'utf8');
      const populated = substitute(raw);
      fs.writeFileSync(outPath, populated, 'utf8');
      console.log(`  wrote: ${outPath}`);
    }
  }
}

const unmatched = new Set();
console.log(`\n🏗  generate-site.js`);
console.log(`   intake : ${intakePath}`);
console.log(`   output : ${outputRoot}\n`);

processDir(templateRoot, outputRoot);

if (unmatched.size > 0) {
  console.warn(`\n⚠  Unmatched tokens (${unmatched.size}):`);
  for (const t of [...unmatched].sort()) console.warn(`   {{${t}}}`);
} else {
  console.log('\n✅ Zero unmatched tokens — output is fully populated.');
}
console.log('\nDone.\n');
