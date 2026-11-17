---
name: Input Validation
description: Ensure user-facing inputs have proper validation and error feedback
---

# Input Validation Check

Review this pull request for input validation quality. The most common user issues in this codebase stem from malformed API keys, blank inputs, and missing configuration values that produce confusing downstream errors.

## What to Check

1. **API keys and secrets** - Any code that accepts API keys, tokens, or credentials should:

   - Reject obviously invalid values (empty strings, whitespace-only, placeholder text like "your-api-key-here")
   - Validate format where possible (e.g., OpenAI keys start with `sk-`, Anthropic keys start with `sk-ant-`)
   - Provide a clear error message before making a network request with a bad key

2. **Configuration values** - New or modified config parsing should:

   - Validate required fields are present and non-empty
   - Validate types (e.g., numbers are actually numbers, URLs are valid URLs)
   - Provide clear error messages that name the specific field and expected format
   - Not crash the entire config loading process for a single invalid value

3. **User text inputs** - New or modified UI inputs should:

   - Handle empty/whitespace-only submissions gracefully
   - Sanitize inputs that will be used in file paths, URLs, or shell commands
   - Not allow submission of invalid data that will fail silently later

4. **URL and endpoint validation** - When users provide custom URLs (e.g., for self-hosted LLM endpoints):
   - Validate URL format
   - Handle missing protocol (add `https://` if missing)
   - Provide feedback before attempting connection

## Review Scope and Output — GOV-007, GOV-008, GOV-009, GOV-015, GOV-016

- Start with the changed input boundary and trace only the callers, consumers, and transformations needed to establish whether validation is enforced.
- Do not assume internal callers are trusted unless a verified boundary enforces the invariant. Treat configuration, agent definitions, and policy changes as behavior changes when they affect validation or access.
- Test fixtures are not production input, but changes to test helpers may affect whether a boundary is meaningfully exercised.
- Report existing validation only when you can point to the enforcing code and its coverage. Do not request duplicate validation for a value already constrained at the relevant boundary.
- Operate findings-only during review. Do not edit, commit, push, or change the PR. For each gap, give the path, boundary, malformed case, consequence, severity, and a focused recommendation.
- Use `NOT APPLICABLE` only when the diff and traced data flow show no relevant input boundary; otherwise report the missing evidence.
