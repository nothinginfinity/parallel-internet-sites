#!/usr/bin/env node
/**
 * generate-site.js — Parallel Internet Sites intake → static site generator
 *
 * Usage:
 *   node scripts/generate-site.js [intake-json-path] [output-folder]
 *
 * Defaults (TrueBuild example):
 *   intake : templates/intake/client-intake.example.truebuild.json
 *   output : examples/truebuild/site
 *
 * Other examples:
 *   node scripts/generate-site.js templates/intake/client-intake.example.afo.json examples/afo/site
 *   node scripts/generate-site.js templates/intake/client-intake.example.acme.json examples/acme/site
 */

const fs   = require('fs');
const path = require('path');

const intakePath  = process.argv[2] || 'templates/intake/client-intake.example.truebuild.json';
const outputRoot  = process.argv[3] || 'examples/truebuild/site';
const templateRoot = 'templates/site';

// Load intake JSON
let intake;
try {
  intake = JSON.parse(fs.readFileSync(intakePath, 'utf8'));
} catch (e) {
  console.error(`\n❌  Could not read intake file: ${intakePath}`);
  console.error(`   ${e.message}\n`);
  process.exit(1);
}

// Build a flat UPPERCASE token map from any intake JSON (recursive)
function buildTokenMap(obj, prefix) {
  const map = {};
  for (const [key, val] of Object.entries(obj)) {
    const token = (prefix ? prefix + '_' + key : key).toUpperCase();
    if (Array.isArray(val)) {
      map[token] = val.join(', ');
      val.forEach((item, i) => { map[token + '_' + (i + 1)] = String(item); });
    } else if (val && typeof val === 'object') {
      Object.assign(map, buildTokenMap(val, token));
    } else {
      map[token] = String(val ?? '');
    }
  }
  return map;
}

const tokens = buildTokenMap(intake);

// ── Computed helpers (derived from any intake) ────────────────────────────────
tokens['CURRENT_YEAR']          = String(new Date().getFullYear());
tokens['COMPLIANCE_DISCLAIMER'] = (intake.compliance_disclaimers || []).join(' ');
tokens['DO_NOT_CLAIM_LIST']     = (intake.do_not_claim || []).map(s => `- ${s}`).join('\n');
tokens['SERVICES_SUMMARY']      = intake.services
  ? intake.services.slice(0, 2).join(' and ') + ' and more.'
  : '';
tokens['SERVICES_CARDS']        = (intake.services || []).map(
  s => `<div class="service-card"><h3>${s}</h3></div>`
).join('\n');
tokens['SERVICES_LIST']         = (intake.services || []).join(', ');
tokens['IDEAL_CLIENT_PROFILE']  = intake.target_audience || '';
tokens['CTA_SUPPORTING_TEXT']   = intake.positioning_statement || '';
tokens['POSITIONING_STATEMENT'] = intake.positioning_statement || '';
tokens['BRAND_VOICE']           = intake.brand_voice || '';
tokens['FORM_ACTION_URL']       = intake.cta_url || '';

// Phase 3 AFO cross-domain fields
tokens['CONTENT_ROLE']              = 'knowledge-expansion';
tokens['CANONICAL_IDENTITY_SOURCE'] = intake.main_website_url || '';
tokens['CROSS_DOMAIN_ENTITY_ID']    = (intake.business_name || 'entity')
  .toLowerCase().replace(/\s+/g, '-');
tokens['LAST_SYNCED']               = new Date().toISOString().split('T')[0];

// Comparison page stubs
tokens['COMPARISON_INTRO'] = `Comparing ${intake.business_name} with common alternatives.`;
tokens['ALT_1_NAME'] = (intake.competitors_or_alternatives || [])[0] || 'Alternative 1';
tokens['ALT_2_NAME'] = (intake.competitors_or_alternatives || [])[1] || 'Alternative 2';
['1','2','3','4','5'].forEach(n => {
  tokens[`FEATURE_${n}`]  = tokens[`FEATURE_${n}`]  || `Feature ${n}`;
  tokens[`BIZ_F${n}`]     = tokens[`BIZ_F${n}`]     || '\u2713';
  tokens[`ALT1_F${n}`]    = tokens[`ALT1_F${n}`]    || '\u2014';
  tokens[`ALT2_F${n}`]    = tokens[`ALT2_F${n}`]    || '\u2014';
});
tokens['BIZ_BEST_FOR']          = intake.target_audience || '';
tokens['ALT1_BEST_FOR']         = 'General alternative';
tokens['ALT2_BEST_FOR']         = 'Self-guided approach';
['1','2','3','4'].forEach(n => {
  tokens[`DIFFERENTIATOR_${n}_LABEL`] = tokens[`DIFFERENTIATOR_${n}_LABEL`] || `Differentiator ${n}`;
  tokens[`DIFFERENTIATOR_${n}_DESC`]  = tokens[`DIFFERENTIATOR_${n}_DESC`]  || '';
});
tokens['DIFFERENTIATION_SUMMARY'] = intake.positioning_statement || '';
tokens['COMPARISON_CTA_TEXT']     = intake.primary_cta || 'Get Started';

// FAQ stubs
tokens['FAQ_WHAT_IS']          = `${intake.business_name} is a ${intake.business_type || 'business'} that offers ${intake.business_description || ''}`;
tokens['FAQ_WHO_IS_FOR']       = intake.target_audience || '';
tokens['FAQ_SERVICES_OVERVIEW']= (intake.services || []).join(', ');
tokens['FAQ_HOW_TO_START']     = `Visit ${intake.cta_url || intake.main_website_url || ''} to get started.`;
tokens['FAQ_Q3']               = (intake.faq_topics || [])[2] || 'How long does the program take?';
tokens['FAQ_A3']               = 'Timelines vary. Contact us for details.';
tokens['FAQ_PRICING_Q']        = 'How much does it cost?';
tokens['FAQ_PRICING_A']        = `Contact us at ${intake.contact_email || intake.cta_url || ''} for pricing.`;
tokens['FAQ_TIMELINE_Q']       = 'How long is the program?';
tokens['FAQ_TIMELINE_A']       = 'Program duration varies by client needs. Contact us to learn more.';
tokens['FAQ_Q4']               = (intake.faq_topics || [])[3] || 'Who is this right for?';
tokens['FAQ_A4']               = intake.target_audience ? `This is designed for: ${intake.target_audience}.` : 'Contact us to find out if this is a fit.';
tokens['FAQ_SCHEMA_ITEMS']     = '';

// Process stubs — derive from intake or fall back to generics
const defaultSteps = [
  ['Discovery',   'We learn about your business, goals, and current situation.'],
  ['Setup',       'We establish the right foundation for your service.'],
  ['Activation',  'Core program or service is activated and configured.'],
  ['Monitoring',  'We track progress and make adjustments.'],
  ['Growth',      'Ongoing support as results develop over time.']
];
['1','2','3','4','5'].forEach((n, i) => {
  tokens[`STEP_${n}_NAME`] = tokens[`STEP_${n}_NAME`] || defaultSteps[i][0];
  tokens[`STEP_${n}_DESC`] = tokens[`STEP_${n}_DESC`] || defaultSteps[i][1];
});
tokens['PROCESS_SCHEMA_STEPS']     = '';
tokens['TIMELINE_OVERVIEW']        = 'Most clients see meaningful progress within the first few months.';
tokens['TIMELINE_PHASE_1_LABEL']   = 'Setup';
tokens['TIMELINE_PHASE_2_LABEL']   = 'Building';
tokens['TIMELINE_PHASE_3_LABEL']   = 'Results';
tokens['TIMELINE_PHASE_1_DESC']    = 'Foundation established and service activated.';
tokens['TIMELINE_PHASE_2_DESC']    = 'Core program running, early results visible.';
tokens['TIMELINE_PHASE_3_DESC']    = 'Results mature and compound over time.';
tokens['ONBOARDING_TIME']          = '48 hours';

// ── Substitution engine ───────────────────────────────────────────────────────
const unmatched = new Set();

function substitute(content) {
  return content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, token) => {
    if (tokens[token] !== undefined) return tokens[token];
    unmatched.add(token);
    return match;
  });
}

function processDir(srcDir, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const outPath = path.join(outDir, entry.name);
    if (entry.isDirectory()) {
      processDir(srcPath, outPath);
    } else {
      const raw      = fs.readFileSync(srcPath, 'utf8');
      const populated = substitute(raw);
      fs.writeFileSync(outPath, populated, 'utf8');
      console.log(`  wrote: ${outPath}`);
    }
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────
console.log(`\n\uD83C\uDFD7  generate-site.js`);
console.log(`   intake   : ${intakePath}`);
console.log(`   template : ${templateRoot}`);
console.log(`   output   : ${outputRoot}\n`);

processDir(templateRoot, outputRoot);

if (unmatched.size > 0) {
  console.warn(`\n\u26A0  Unmatched tokens (${unmatched.size}):`);
  for (const t of [...unmatched].sort()) console.warn(`   {{${t}}}`);
} else {
  console.log('\n\u2705 Zero unmatched tokens \u2014 output is fully populated.');
}
console.log('\nDone.\n');
