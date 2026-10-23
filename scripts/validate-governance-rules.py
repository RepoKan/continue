#!/usr/bin/env python3
"""Validate stable IDs, role metadata, and the dependency graph for governance rules."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POLICY = ROOT / ".continue/rules/engineering-governance.md"
PAYMENT_RULE = ROOT / ".continue/rules/payment-production-governance.md"
ROLES = {"PO", "GS", "SR", "PV", "IM", "QA", "IR", "RM"}
PRIORITIES = {"P0", "P1", "P2"}
RULE_HEADING = re.compile(r"^### (GOV-\d{3}) — .+$", re.MULTILINE)
REGISTRY_ROW = re.compile(
    r"^\|\s*(GOV-\d{3})\s*\|\s*([A-Z]{2})\s*\|\s*(P\d)\s*\|\s*(.*?)\s*\|$",
    re.MULTILINE,
)
GOV_REF = re.compile(r"GOV-\d{3}")
RULE_ID = re.compile(r"GOV-\d{3}")


def fail(message: str) -> None:
    print(f"INVALID: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if not POLICY.is_file():
        fail(f"missing canonical policy: {POLICY.relative_to(ROOT)}")
    policy = POLICY.read_text(encoding="utf-8")
    frontmatter = policy.split("---", 2)
    if len(frontmatter) < 3 or not re.search(r"^alwaysApply:\s*true\s*$", frontmatter[1], re.M):
        fail("canonical governance rule must declare alwaysApply: true")
    if "Priority classifies urgency and stage, not authority, applicability, or permission to skip a rule." not in policy:
        fail("priority semantics must state that priority cannot waive or redefine a rule")
    if "A dependency means its scope and disposition must be evaluated" not in policy:
        fail("dependency semantics must define evaluation and conditional N/A behavior")
    if "it never changes a check's `FAIL`, `NOT RUN`, `HOLD`, or `UNDETERMINED` result into `PASS`" not in policy:
        fail("CI exception semantics must not allow a failed or missing check to become PASS")
    if "If two applicable normative requirements at the same authority level cannot both be met" not in policy:
        fail("same-authority conflict handling must be explicit")
    if "`A` in the registry means the single role accountable" not in policy:
        fail("accountable-role semantics must distinguish accountability from approval/execution")
    if "It cannot waive applicable law, mandatory higher-authority security/privacy/domain obligations" not in policy:
        fail("repository exceptions must not waive higher-authority mandatory obligations")

    headings = RULE_HEADING.findall(policy)
    if not headings:
        fail("no GOV rule headings found")
    if len(headings) != len(set(headings)):
        fail("duplicate GOV rule headings")

    sections: dict[str, str] = {}
    matches = list(RULE_HEADING.finditer(policy))
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(policy)
        sections[match.group(1)] = policy[match.end() : end]

    roles_start = policy.find("## Roles, accountability, and decision order")
    canonical_start = policy.find("## Canonical rules")
    role_section = policy[roles_start:canonical_start] if 0 <= roles_start < canonical_start else ""
    declared_roles = set(re.findall(r"^\|\s*`([A-Z]{2})`\s+—", role_section, re.M))
    if declared_roles != ROLES:
        fail(f"role table mismatch: missing={sorted(ROLES-declared_roles)}, extra={sorted(declared_roles-ROLES)}")
    priority_text = policy[canonical_start:policy.find("### GOV-001")]
    if not all(f"`{priority}`" in priority_text for priority in PRIORITIES):
        fail("priority semantics must define P0, P1, and P2")

    for rule_id, body in sections.items():
        if "**Accept when:**" not in body or "**Otherwise:**" not in body:
            fail(f"{rule_id} must state acceptance and failure behavior")
        if re.search(r"^\*\*(?:A|Priority|Depends on):\*\*", body, re.M):
            fail(f"{rule_id} duplicates metadata owned by the dependency registry")

    registry_start = policy.find("## Dependency registry")
    if registry_start < 0:
        fail("missing dependency registry")
    registry_text = policy[registry_start:]
    registry: dict[str, tuple[str, str, set[str]]] = {}
    registry_lines = [line for line in registry_text.splitlines() if line.lstrip().startswith("| GOV-")]
    for line in registry_lines:
        match = REGISTRY_ROW.fullmatch(line)
        if not match:
            fail(f"malformed dependency registry row: {line}")
        rule_id, role, priority, dependency_text = match.groups()
        if rule_id in registry:
            fail(f"duplicate dependency registry row {rule_id}")
        if dependency_text.strip() in {"—", "none", "None"}:
            dependencies = set()
        else:
            dependency_tokens = [item.strip() for item in dependency_text.split(",")]
            if any(not RULE_ID.fullmatch(item) for item in dependency_tokens):
                fail(f"{rule_id} has malformed dependency list {dependency_text!r}")
            if len(dependency_tokens) != len(set(dependency_tokens)):
                fail(f"{rule_id} repeats a dependency")
            dependencies = set(dependency_tokens)
        registry[rule_id] = (role, priority, dependencies)

    if set(registry) != set(sections):
        fail(f"registry/headings differ: missing={sorted(set(sections)-set(registry))}, extra={sorted(set(registry)-set(sections))}")
    for rule_id, (role, priority, dependencies) in registry.items():
        if role not in ROLES:
            fail(f"{rule_id} has unknown accountable role {role}")
        if priority not in PRIORITIES:
            fail(f"{rule_id} has unknown priority {priority}")
        unknown = dependencies - set(sections)
        if unknown:
            fail(f"{rule_id} references unknown dependencies {sorted(unknown)}")

    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(rule_id: str) -> None:
        if rule_id in visiting:
            fail(f"dependency cycle includes {rule_id}")
        if rule_id in visited:
            return
        visiting.add(rule_id)
        for dependency in registry[rule_id][2]:
            visit(dependency)
        visiting.remove(rule_id)
        visited.add(rule_id)

    for rule_id in registry:
        visit(rule_id)

    payment = PAYMENT_RULE.read_text(encoding="utf-8") if PAYMENT_RULE.is_file() else ""
    payment_frontmatter = payment.split("---", 2)
    if len(payment_frontmatter) < 3 or not re.search(r"^alwaysApply:\s*true\s*$", payment_frontmatter[1], re.M):
        fail("payment governance must be loaded so its conditional domain scope can be evaluated")

    unknown_refs: set[str] = set()
    for folder in (ROOT / ".continue/agents", ROOT / ".continue/checks", ROOT / ".continue/rules", ROOT / ".continue/skills"):
        if not folder.exists():
            continue
        for path in folder.rglob("*.md"):
            if path == POLICY:
                continue
            unknown_refs |= set(GOV_REF.findall(path.read_text(encoding="utf-8"))) - set(sections)
    if unknown_refs:
        fail(f"adapter references unknown GOV IDs: {sorted(unknown_refs)}")

    print(f"VALID: {len(sections)} unique rules; registry roles/priorities resolve; all references resolve; dependency graph is acyclic")


if __name__ == "__main__":
    main()
