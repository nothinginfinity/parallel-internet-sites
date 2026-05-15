/**
 * prompt-generator.js
 * Commit 5 — AFO Visibility Snapshot
 *
 * Generates 3–5 personalized Ideal Visibility Prompts from form inputs.
 * Deterministic. No LLM API calls. No external network calls.
 *
 * Usage:
 *   import { generatePrompts } from './prompt-generator.js';
 *   const result = generatePrompts(input);
 */

/**
 * @typedef {Object} PromptInput
 * @property {string} business_name
 * @property {string} business_category
 * @property {string} city_or_service_area
 * @property {string} top_services   — comma-separated string, 1–5 items
 * @property {string} ideal_customer — one-sentence description
 */

/**
 * @typedef {Object} GeneratedPrompt
 * @property {string} type        — prompt type identifier
 * @property {string} label       — human-readable label
 * @property {string} prompt      — the actual prompt text to copy into an LLM
 * @property {string} description — short explanation of what this prompt tests
 */

/**
 * @typedef {Object} PromptResult
 * @property {GeneratedPrompt[]} prompts
 * @property {string[]}          selfTestPlatforms
 * @property {string}            selfTestInstruction
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Safely normalizes a free-text string for use in a prompt:
 * - Trims whitespace
 * - Collapses internal runs of whitespace to a single space
 * - Strips characters that could break prompt formatting
 */
function sanitize(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/["'`\\]/g, '');
}

/**
 * Parses the top_services comma-separated string into a clean array.
 * Returns up to 5 items. Falls back to empty array.
 */
function parseServices(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

/**
 * Picks the first service from the list, or falls back to the business_category.
 */
function primaryService(services, category) {
  return services.length > 0 ? services[0] : category;
}

// ---------------------------------------------------------------------------
// Prompt templates
// ---------------------------------------------------------------------------

/**
 * Each template function receives a context object and returns a GeneratedPrompt.
 * All are deterministic — same input always produces same output.
 */
const PROMPT_TEMPLATES = [
  {
    type: 'category_discovery',
    label: 'Category Discovery',
    description:
      'Tests whether AI recommends your business category when someone is looking for what you do in your area.',
    build({ business_category, city_or_service_area }) {
      return `Best ${business_category} in ${city_or_service_area}`;
    },
  },
  {
    type: 'problem_solution',
    label: 'Problem / Solution',
    description:
      'Tests whether AI surfaces your business when a prospect describes the problem your primary service solves.',
    build({ services, business_category, city_or_service_area }) {
      const service = primaryService(services, business_category);
      return `Who helps with ${service} near ${city_or_service_area}`;
    },
  },
  {
    type: 'local_service_area',
    label: 'Local Service Area',
    description:
      'Tests whether AI knows your business serves this specific area — important for local SEO and LLM geo-indexing.',
    build({ business_category, city_or_service_area }) {
      return `${business_category} serving ${city_or_service_area}`;
    },
  },
  {
    type: 'service_comparison',
    label: 'Service Comparison',
    description:
      'Tests whether AI includes your business when a prospect is comparison-shopping options in your area.',
    build({ business_category, city_or_service_area }) {
      return `Compare ${business_category} options in ${city_or_service_area}`;
    },
  },
  {
    type: 'direct_brand_accuracy',
    label: 'Direct Brand Accuracy',
    description:
      'Tests whether AI knows your business by name and describes it accurately — the baseline brand test.',
    build({ business_name }) {
      return `Tell me about ${business_name}`;
    },
  },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates PromptInput fields. Returns an array of error strings.
 * Empty array = valid.
 */
export function validatePromptInput(input) {
  const errors = [];
  const required = [
    'business_name',
    'business_category',
    'city_or_service_area',
    'top_services',
  ];
  for (const field of required) {
    if (!input[field] || typeof input[field] !== 'string' || !input[field].trim()) {
      errors.push(`${field} is required`);
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generates 3–5 Ideal Visibility Prompts from sanitized business context.
 *
 * @param {PromptInput} rawInput
 * @returns {PromptResult}
 * @throws {Error} if required fields are missing
 */
export function generatePrompts(rawInput) {
  // Validate
  const errors = validatePromptInput(rawInput);
  if (errors.length > 0) {
    throw new Error(`generatePrompts: invalid input — ${errors.join(', ')}`);
  }

  // Sanitize all inputs
  const business_name = sanitize(rawInput.business_name);
  const business_category = sanitize(rawInput.business_category);
  const city_or_service_area = sanitize(rawInput.city_or_service_area);
  const services = parseServices(rawInput.top_services).map(sanitize);

  const ctx = {
    business_name,
    business_category,
    city_or_service_area,
    services,
  };

  // Build all 5 prompts
  const prompts = PROMPT_TEMPLATES.map(template => ({
    type: template.type,
    label: template.label,
    prompt: template.build(ctx),
    description: template.description,
  }));

  return {
    prompts,
    selfTestPlatforms: ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'],
    selfTestInstruction:
      'Copy each prompt above and paste it into ChatGPT, Gemini, Claude, and Perplexity. ' +
      'Note whether your business appears by name in the response. ' +
      'If it does not appear, your business is not yet AI-visible for that query.',
  };
}
