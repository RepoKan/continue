---
title: Public Repository Data Boundary R1
description: Defines what K Knowledge Supporting may place in the public repository and how sensitive evidence must be excluded or sanitized.
---

# Public Repository Data Boundary R1

## Boundary

Treat every committed byte, branch, pull request, issue, review, comment,
workflow log, and artifact in `RepoKan/continue` as public.

## Content that must stay out

Do not place any of the following in the repository or a public GitHub surface:

- credentials, API keys, tokens, signing material, private keys, or usable
  certificate secrets;
- private endpoints, internal network details, confidential host configuration,
  or access instructions;
- customer or cardholder data, payment keys, PIN data, unmasked account numbers,
  or Production transaction payloads;
- confidential Production source, specifications, database contents, crash
  dumps, or unredacted logs;
- secrets embedded in screenshots, fixtures, examples, generated files,
  archives, metadata, or command output.

Secret names and generalized interfaces may be documented when they reveal no
usable value or confidential topology.

## Before a write

1. Review the complete proposed diff or payload, including generated and binary
   files.
2. Remove sensitive material before it enters Git history or an external draft.
3. Replace necessary examples with synthetic values that cannot be mistaken for
   real credentials or customer data.
4. Keep sensitive evidence in the approved private evidence store and reference
   only a safe identifier when one exists.
5. If safe publication cannot be proven, stop the public write and report
   `HOLD` with the missing evidence or approved destination.

Deleting sensitive content in a later commit does not remove it from history.
If sensitive material is published, stop further distribution and follow the
project's credential rotation and incident process.
