---
name: Error Message Quality
description: Ensure error handling surfaces actionable messages to users
---

# Error Message Quality Check

Review this pull request for error handling quality. The most common user-facing issues in this codebase are generic "Unknown error" messages and swallowed error details that prevent users from diagnosing problems themselves.

## What to Check

1. **Catch blocks that discard error details** - Look for `catch` blocks that re-throw or return a generic message without including the original error's message, status code, or context.

2. **HTTP status codes without user-friendly mapping** - When making API calls (especially to LLM providers), ensure that common HTTP errors produce distinct, actionable messages:

   - `401` → "Invalid API key" (not "Unknown error")
   - `402` → "Insufficient funds or quota exceeded"
   - `403` → "Access denied - check your API key permissions"
   - `429` → "Rate limited - please wait and retry"
   - `5xx` → "Provider service error - try again later"

3. **Silent failures** - Look for empty catch blocks, caught errors that are only logged but not surfaced, or promise rejections that are swallowed.

4. **Error messages that lack context** - Error messages should include what operation failed and what the user can do about it, not just the raw error string.

## Review Scope and Output — GOV-007, GOV-008, GOV-009, GOV-016

- Do not duplicate reporting when the changed path demonstrably propagates the error to a useful boundary.
- Test helpers and development-only logging are not user-facing behavior unless they change coverage or expose sensitive data.
- An intentional silent catch needs a verified reason and safe fallback; a comment alone does not prove safety.

## Scope

Start with the diff and trace only the callers/consumers needed to establish the user-visible error path. Do not audit unrelated code. This is a findings-only review: do not edit, commit, push, or change the PR. Report path, trigger, lost context, user impact, severity, and focused recommendation. Mark the gate `NOT APPLICABLE` only when the changed path has no relevant error boundary.
