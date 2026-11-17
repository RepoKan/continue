#!/usr/bin/env python3
"""Regression checks for the complete set of stable governance rule IDs."""

import contextlib
import importlib.util
import io
from pathlib import Path
import re
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
POLICY = (ROOT / ".continue/rules/engineering-governance.md").read_text(encoding="utf-8")
PAYMENT = (ROOT / ".continue/rules/payment-production-governance.md").read_text(encoding="utf-8")


def validate(policy: str) -> tuple[int, str]:
    spec = importlib.util.spec_from_file_location(
        "governance_validator", ROOT / "scripts/validate-governance-rules.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    output = io.StringIO()
    with tempfile.TemporaryDirectory() as directory:
        module.ROOT = Path(directory)
        module.POLICY = module.ROOT / ".continue/rules/engineering-governance.md"
        module.PAYMENT_RULE = module.ROOT / ".continue/rules/payment-production-governance.md"
        module.POLICY.parent.mkdir(parents=True)
        module.POLICY.write_text(policy, encoding="utf-8")
        module.PAYMENT_RULE.write_text(PAYMENT.replace("GOV-028", "GOV-006"), encoding="utf-8")
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            try:
                module.main()
            except SystemExit as error:
                return error.code, output.getvalue()
    return 0, output.getvalue()


class StableRuleIdsTest(unittest.TestCase):
    def test_accepts_all_28_rules(self):
        status, output = validate(POLICY)
        self.assertEqual(status, 0, output)
        self.assertIn("28 unique rules", output)

    def test_rejects_removing_a_rule_and_its_registry_row(self):
        policy = re.sub(
            r"^### GOV-028 — .*?(?=^## Dependency registry)",
            "",
            POLICY,
            flags=re.MULTILINE | re.DOTALL,
        )
        policy = re.sub(r"^\| GOV-028 \|.*\n", "", policy, flags=re.MULTILINE)
        policy = policy.replace("GOV-028", "GOV-006")
        status, output = validate(policy)
        self.assertNotEqual(status, 0, "A matching 27-rule policy and registry must fail")
        self.assertIn("GOV-028", output)

    def test_rejects_an_unexpected_rule_even_with_a_valid_registry_row(self):
        policy = POLICY.replace(
            "## Dependency registry",
            "### GOV-029 — Unexpected rule\n\n"
            "**Accept when:** true. **Otherwise:** HOLD.\n\n## Dependency registry",
        ).replace(
            "## Required decision record",
            "| GOV-029 | QA | P2 | — |\n\n## Required decision record",
        )
        status, output = validate(policy)
        self.assertNotEqual(status, 0, "A matching 29-rule policy and registry must fail")
        self.assertIn("GOV-029", output)

    def test_rejects_duplicate_headings(self):
        policy = POLICY.replace("## Dependency registry", "### GOV-028 — Duplicate\n\n## Dependency registry")
        status, output = validate(policy)
        self.assertNotEqual(status, 0)
        self.assertIn("duplicate GOV rule headings", output)


if __name__ == "__main__":
    unittest.main()
