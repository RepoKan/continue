---
title: KKS Delegated Governance and Secondary Owner Role R1
description: Public-safe governance rules for owner-approved delegated administration, role registration, API scope controls, and change evidence.
status: proposed-for-review
effective: pending-approval-and-merge
---

# KKS Delegated Governance and Secondary Owner Role R1

Rule marker: `KKS-DELEGATED-GOVERNANCE-R1`.

## Authority and scope

This document defines a **governance designation**, not a platform role or an entitlement. A documented "Secondary Owner" designation never grants native Notion workspace ownership, organization administration, Okta privileges, GitHub permissions, MCP tool access, or API credentials by itself.

An authenticated Owner may approve a specifically identified person or service principal for limited delegated tasks. Each platform must separately enforce its native roles, API scopes, license requirements, and access controls. An unsupported native role must be recorded as **NOT AVAILABLE** rather than simulated.

This public rule does not alter existing repository branch protection, payment/Production controls, private-workspace separation, or critical-action approvals. It supplements the project inheritance and public data boundary policies.

## Canonical private registration

Maintain the authoritative role registry only in the approved **private** governance tier, under its existing access-control inheritance, after verifying the parent and actual sharing settings. A page label or filtered database view is not an access boundary.

Required three-column identity matrix:
1. **Role Name** — Owner, Secondary Owner, or Service Integration.
2. **Okta Operator** — verified operator or service principal reference, or `UNVERIFIED`.
3. **Operator ID** — verified directory identity, or `UNVERIFIED`.

Additional controlled fields: responsibilities, delegate identity type, platform, native role, requested scopes, approved scopes, grantor, authorization evidence, effective date, expiry/review date, current status, revocation owner, and readback receipt. Never invent Okta IDs, roles, or native permissions.

## Responsibility matrix

| Governance role | Responsibilities | Limits |
| --- | --- | --- |
| Owner | Approves scope, delegated identities, critical changes, credential custody, reviews, revocation and incident response | Must still use platform-native authentication and authorization |
| Secondary Owner | Performs specifically approved governance documentation, audit/evidence work, scoped integration administration, and authorized read-only monitoring | Cannot self-promote, expand scope, bypass approval gates, or claim all-API access |
| Service Integration | Executes approved operations with least-privilege credentials and auditable service identity | No blanket administration; credentials remain in an approved secret manager |

## Controlled change procedure

1. Resolve the exact workspace/repository, current authenticated principal, parent page, and authoritative revision.
2. Confirm Owner approval naming the delegate, target platform, requested operation, exact scopes, and expiration/review point.
3. Check that the target platform supports the requested native role and each API operation; verify plan/entitlement, service identity, and scope independently.
4. Record the intended change and its evidence in the approved **private** journal before mutation. Keep credentials and private account IDs out of public GitHub.
5. Apply only supported, approved, least-privilege operations. Never infer that activating MCP enables all APIs.
6. Read back the actual platform state; distinguish `CONFIRMED`, `NOT RUN`, `GAP`, `HOLD`, and `BLOCKED_AUTH`.
7. Log each change point: operation ID, UTC time, target class, before/after state, authorization reference, executor, outcome, verification receipt, and rollback/revocation instructions.
8. Require fresh action-specific approval for critical role, permission, credential, organization settings, repository protection, merge, and Production changes.

## Rename and identity safety

A workspace display name and a delegate identity are separate objects. Before any rename or role assignment, verify the exact object type and immutable platform ID. A workspace cannot receive a user role. A governance role registration cannot substitute for a native permission grant.

## MCP and Admin API

MCP connection health, workspace identity, API entitlement, endpoint availability, and granted scopes are separate checks. Restrict API access to the minimum necessary endpoints and use an approved secure credential manager. Never store tokens, signing keys, or credential values in governance pages or Git history. A credit-usage endpoint is `NOT VERIFIED` until a real authorized read confirms availability and fields.

## Evidence, privacy and rollback

Private evidence must remain in the approved private Notion/secure store. Public GitHub may contain only this generalized procedure and non-sensitive status summaries. If destination identity, inherited sharing, entitlement, or native role cannot be verified, hold the mutation and preserve a private pending record. Rollback must revoke native grants and credentials separately; editing a Notion role-registration page does not revoke platform access.

## Adoption

This revision is a **proposed governance change** until reviewed and merged under the repository's normal approval workflow. No workspace rename, Secondary Owner promotion, organization-admin grant, or all-API activation is implied by publishing this file.
