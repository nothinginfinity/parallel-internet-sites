/**
 * prompt-generator.test.js
 * Commit 5 — Manual/unit test spec for the prompt generator module.
 *
 * Run with: node --experimental-vm-modules prompt-generator.test.js
 * (No external test framework required — pure Node assertions.)
 */

import assert from 'node:assert/strict';
import { generatePrompts, validatePromptInput } from './prompt-generator.js';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const VALID_INPUT = {
  business_name: 'Pacific Coast Physical Therapy',
  business_category: 'Physical Therapy',
  city_or_service_area: 'San Juan Capistrano, CA',
  top_services: 'post-surgical rehab, sports injury, dry needling',
  ideal_customer: 'Adults recovering from orthopedic surgery or sports injuries',
};

// ---------------------------------------------------------------------------
// validatePromptInput
// ---------------------------------------------------------------------------

console.log('\n--- validatePromptInput ---');

{
  const errors = validatePromptInput(VALID_INPUT);
  assert.deepEqual(errors, [], 'valid input should produce no errors');
  console.log('✅ valid input: no errors');
}

{
  const errors = validatePromptInput({ business_name: 'Acme' });
  assert.ok(errors.length > 0, 'missing fields should produce errors');
  assert.ok(errors.some(e => e.includes('business_category')), 'should flag business_category');
  console.log('✅ missing fields flagged correctly');
}

{
  const errors = validatePromptInput({ business_name: '   ', business_category: '  ', city_or_service_area: '  ', top_services: '  ' });
  assert.ok(errors.length > 0, 'whitespace-only fields should be flagged');
  console.log('✅ whitespace-only fields flagged');
}

// ---------------------------------------------------------------------------
// generatePrompts — structure
// ---------------------------------------------------------------------------

console.log('\n--- generatePrompts: structure ---');

{
  const result = generatePrompts(VALID_INPUT);
  assert.ok(Array.isArray(result.prompts), 'prompts should be an array');
  assert.equal(result.prompts.length, 5, 'should return exactly 5 prompts');
  assert.ok(Array.isArray(result.selfTestPlatforms), 'selfTestPlatforms should be an array');
  assert.equal(result.selfTestPlatforms.length, 4, 'should have 4 platforms');
  assert.ok(typeof result.selfTestInstruction === 'string', 'selfTestInstruction should be a string');
  console.log('✅ result structure correct (5 prompts, 4 platforms, instruction)');
}

// ---------------------------------------------------------------------------
// generatePrompts — prompt types present
// ---------------------------------------------------------------------------

console.log('\n--- generatePrompts: prompt types ---');

{
  const result = generatePrompts(VALID_INPUT);
  const types = result.prompts.map(p => p.type);
  const expected = [
    'category_discovery',
    'problem_solution',
    'local_service_area',
    'service_comparison',
    'direct_brand_accuracy',
  ];
  for (const t of expected) {
    assert.ok(types.includes(t), `should include prompt type: ${t}`);
  }
  console.log('✅ all 5 prompt types present');
}

// ---------------------------------------------------------------------------
// generatePrompts — content correctness
// ---------------------------------------------------------------------------

console.log('\n--- generatePrompts: content ---');

{
  const result = generatePrompts(VALID_INPUT);
  const byType = Object.fromEntries(result.prompts.map(p => [p.type, p]));

  assert.ok(
    byType.category_discovery.prompt.includes('Physical Therapy'),
    'category_discovery should include business_category'
  );
  assert.ok(
    byType.category_discovery.prompt.includes('San Juan Capistrano, CA'),
    'category_discovery should include city_or_service_area'
  );
  assert.ok(
    byType.problem_solution.prompt.includes('post-surgical rehab'),
    'problem_solution should use first top_service'
  );
  assert.ok(
    byType.direct_brand_accuracy.prompt.includes('Pacific Coast Physical Therapy'),
    'direct_brand_accuracy should include business_name'
  );
  console.log('✅ prompt content matches expected templates');
}

// ---------------------------------------------------------------------------
// generatePrompts — sanitization
// ---------------------------------------------------------------------------

console.log('\n--- generatePrompts: sanitization ---');

{
  const dirtyInput = {
    ...VALID_INPUT,
    business_name: '  Pacific "Coast" PT  ',
    city_or_service_area: 'San  Juan  Capistrano',
  };
  const result = generatePrompts(dirtyInput);
  const brand = result.prompts.find(p => p.type === 'direct_brand_accuracy');
  assert.ok(!brand.prompt.includes('"'), 'should strip double quotes');
  assert.ok(!brand.prompt.startsWith(' '), 'should trim leading space');
  console.log('✅ sanitization strips quotes and extra whitespace');
}

// ---------------------------------------------------------------------------
// generatePrompts — missing optional ideal_customer is allowed
// ---------------------------------------------------------------------------

console.log('\n--- generatePrompts: optional field ---');

{
  const inputNoIdeal = { ...VALID_INPUT };
  delete inputNoIdeal.ideal_customer;
  const result = generatePrompts(inputNoIdeal);
  assert.equal(result.prompts.length, 5, 'should still return 5 prompts without ideal_customer');
  console.log('✅ ideal_customer is optional — 5 prompts still returned');
}

// ---------------------------------------------------------------------------
// generatePrompts — throws on invalid input
// ---------------------------------------------------------------------------

console.log('\n--- generatePrompts: error handling ---');

{
  try {
    generatePrompts({});
    assert.fail('should have thrown');
  } catch (err) {
    assert.ok(err.message.includes('invalid input'), 'error message should describe issue');
    console.log('✅ throws on empty input with descriptive error');
  }
}

console.log('\n✅✅✅ All prompt-generator tests passed. ✅✅✅\n');
