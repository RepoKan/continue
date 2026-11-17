#!/usr/bin/env python3
import pathlib
import re
import sys

REQUIRED_HEADINGS = [
    "# KTC Payment Change Review",
    "## Executive summary",
    "## Inspection identity",
    "## Findings",
    "## Validation matrix",
    "## Rollback",
    "## Evidence gaps",
    "## Final verdict",
]

VERDICTS = [
    "READY TO APPLY",
    "HOLD - IMPACT NOT PROVEN",
    "BLOCK - BUSINESS RULE VIOLATION",
    "NO CHANGE REQUIRED",
]


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: validate_review_report.py <report.md>", file=sys.stderr)
        return 2

    path = pathlib.Path(sys.argv[1])
    if not path.is_file():
        print(f"error: file not found: {path}", file=sys.stderr)
        return 2

    text = path.read_text(encoding="utf-8")
    errors = []

    for heading in REQUIRED_HEADINGS:
        if heading not in text:
            errors.append(f"missing heading: {heading}")

    found = [v for v in VERDICTS if re.search(rf"(?m)^\s*{re.escape(v)}\s*$", text)]
    if len(found) != 1:
        errors.append("final verdict must contain exactly one allowed verdict on its own line")

    if "HOLD - IMPACT NOT PROVEN" in text and "## Evidence gaps" not in text:
        errors.append("HOLD verdict requires an Evidence gaps section")

    if errors:
        print("INVALID")
        for item in errors:
            print(f"- {item}")
        return 1

    print("VALID")
    print(f"verdict: {found[0]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
