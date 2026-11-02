#!/usr/bin/env python3
"""Validate packaged copies of project-owned Continue skills."""

from __future__ import annotations

import hashlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / ".continue/skills"
PLUGIN_ROOT = ROOT / "plugins"
PACKAGE_METADATA = {"agents/openai.yaml"}


def fail(message: str) -> None:
    print(f"INVALID: {message}", file=sys.stderr)
    raise SystemExit(1)


def files_below(root: Path) -> set[str]:
    return {
        path.relative_to(root).as_posix()
        for path in root.rglob("*")
        if path.is_file()
    }


def main() -> None:
    if not SOURCE_ROOT.is_dir():
        fail("missing .continue/skills")
    skills = sorted(
        path.name
        for path in SOURCE_ROOT.iterdir()
        if path.is_dir() and (path / "SKILL.md").is_file()
    )
    if not skills:
        fail("no project-owned skills found")

    for name in skills:
        source = SOURCE_ROOT / name
        package_candidates = sorted(
            path
            for path in PLUGIN_ROOT.glob(f"*/skills/{name}")
            if (path / "SKILL.md").is_file()
        )
        if len(package_candidates) != 1:
            fail(f"expected exactly one packaged skill for {name}; found {len(package_candidates)}")
        packaged = package_candidates[0]

        source_files = files_below(source)
        packaged_files = files_below(packaged)
        package_extras = packaged_files - source_files
        missing = source_files - packaged_files
        if missing:
            fail(f"missing packaged files for {name}: {sorted(missing)}")
        if not package_extras <= PACKAGE_METADATA:
            fail(f"unexpected package-only files for {name}: {sorted(package_extras - PACKAGE_METADATA)}")

        for relative in sorted(source_files):
            source_bytes = (source / relative).read_bytes()
            package_bytes = (packaged / relative).read_bytes()
            if source_bytes != package_bytes:
                fail(f"byte drift for {name}/{relative}")
            digest = hashlib.sha256(source_bytes).hexdigest()
            print(f"SHA256 {name}/{relative} {digest}")

        print(f"VALID: {name} packaged mirror ({len(source_files)} shared files)")

    print(f"VALID: {len(skills)} project-owned packaged skill mirrors")


if __name__ == "__main__":
    main()
