# Tests — Parallel Internet Sites

This directory contains the testing framework for measuring the effectiveness of Parallel Internet Sites.

## Files

| File | Purpose |
|------|---------|
| `README.md` | This file |
| `prompt-test-rubric.md` | Scoring rubric for prompt tests |

## How to Run a Prompt Test

1. Open each target AI system (Perplexity, ChatGPT, Gemini, Claude, Bing Copilot)
2. Submit the target prompt(s) from `examples/[client]/prompt-tests.md`
3. Record the response in the prompt-tests file
4. Score using the rubric in `prompt-test-rubric.md`
5. Compare to baseline and previous cadence scores

## Scoring Notes

- Run tests in a fresh session (no prior context about the client)
- Use the exact prompt text — do not paraphrase
- Record the AI system version where visible
- Note the date and time of each test
