#!/usr/bin/env python3
"""
Inspect an Android project directory or archive and emit a concise review baseline.

Usage:
  python scripts/inspect_android_project.py /path/to/project-or-archive --out /mnt/data/audit

Outputs:
  android_project_audit.json
  android_project_audit.md

The script intentionally uses only Python standard libraries. It does not build the
project, modify source files, or print detected secret values.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

ANDROID_NS = "http://schemas.android.com/apk/res/android"
SKIP_DIRS = {
    ".git", ".gradle", ".idea", ".kotlin", "build", "captures", "node_modules",
    ".externalNativeBuild", ".cxx", "out", "dist", "tmp", "temp"
}
TEXT_EXTS = {
    ".kt", ".kts", ".java", ".xml", ".gradle", ".properties", ".toml", ".pro",
    ".txt", ".md", ".json", ".yaml", ".yml", ".aidl", ".c", ".cpp", ".h", ".hpp"
}
MAX_TEXT_BYTES = 1_500_000
MAX_SCAN_FILES = 12000
SECRET_PATTERNS = [
    re.compile(r"(?i)\b(api[_-]?key|secret|signkey|private[_-]?key|password|passwd|token)\b\s*[:=]"),
    re.compile(r"(?i)\b(merchant[_-]?id|terminal[_-]?id|tid|mid)\b\s*[:=]"),
    re.compile(r"(?i)-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"),
]
PAN_LIKE_PATTERN = re.compile(r"(?<!\d)(?:\d[ -]?){13,19}(?!\d)")


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def rel(path: Path, root: Path) -> str:
    try:
        return path.relative_to(root).as_posix()
    except ValueError:
        return path.as_posix()


def is_safe_member(name: str) -> bool:
    # Prevent archive traversal.
    if name.startswith("/") or name.startswith("\\"):
        return False
    parts = Path(name).parts
    return ".." not in parts


def extract_archive(input_path: Path, out_dir: Path) -> Tuple[Path, Dict[str, Any]]:
    archive_info: Dict[str, Any] = {"input_type": "archive", "archive": input_path.name, "extracted": False}
    extract_dir = out_dir / "extracted_project"
    if extract_dir.exists():
        shutil.rmtree(extract_dir)
    extract_dir.mkdir(parents=True, exist_ok=True)

    lower = input_path.name.lower()
    if lower.endswith(".zip"):
        with zipfile.ZipFile(input_path) as zf:
            names = zf.namelist()
            archive_info["entries"] = len(names)
            unsafe = [n for n in names if not is_safe_member(n)]
            if unsafe:
                raise RuntimeError(f"unsafe archive paths detected, example: {unsafe[0]}")
            zf.extractall(extract_dir)
            archive_info["extracted"] = True
        return extract_dir, archive_info

    if lower.endswith((".tar", ".tar.gz", ".tgz", ".tar.bz2", ".tbz2", ".tar.xz", ".txz")):
        with tarfile.open(input_path) as tf:
            members = tf.getmembers()
            archive_info["entries"] = len(members)
            unsafe = [m.name for m in members if not is_safe_member(m.name)]
            if unsafe:
                raise RuntimeError(f"unsafe archive paths detected, example: {unsafe[0]}")
            tf.extractall(extract_dir)
            archive_info["extracted"] = True
        return extract_dir, archive_info

    if lower.endswith(".rar"):
        commands = [
            ["bsdtar", "-xf", str(input_path), "-C", str(extract_dir)],
            ["unar", "-q", "-o", str(extract_dir), str(input_path)],
            ["unrar", "x", "-o+", str(input_path), str(extract_dir)],
            ["7z", "x", f"-o{extract_dir}", str(input_path)],
        ]
        errors: List[str] = []
        for cmd in commands:
            if shutil.which(cmd[0]) is None:
                continue
            proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            if proc.returncode == 0:
                archive_info["extracted"] = True
                archive_info["extractor"] = cmd[0]
                return extract_dir, archive_info
            errors.append(f"{cmd[0]} exit {proc.returncode}: {proc.stdout[-500:]}")
        raise RuntimeError("rar archive provided but no working extractor was available. " + " | ".join(errors))

    raise RuntimeError(f"unsupported archive type: {input_path.name}")


def select_project_root(base: Path) -> Path:
    if (base / "settings.gradle").exists() or (base / "settings.gradle.kts").exists():
        return base

    candidates: List[Tuple[int, Path]] = []
    for path in base.rglob("settings.gradle*"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        depth = len(path.relative_to(base).parts)
        candidates.append((depth, path.parent))
    if candidates:
        return sorted(candidates, key=lambda x: (x[0], len(str(x[1]))))[0][1]

    for path in base.rglob("build.gradle*"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        parent = path.parent
        if (parent / "app" / "src" / "main" / "AndroidManifest.xml").exists() or (parent / "src" / "main" / "AndroidManifest.xml").exists():
            return parent

    # Common archive shape: one top-level directory containing the project.
    children = [p for p in base.iterdir() if p.is_dir()]
    if len(children) == 1:
        return select_project_root(children[0])
    return base


def iter_project_files(root: Path) -> Iterable[Path]:
    count = 0
    for current, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        current_path = Path(current)
        for name in files:
            if count >= MAX_SCAN_FILES:
                return
            path = current_path / name
            count += 1
            yield path


def read_text(path: Path, limit: int = MAX_TEXT_BYTES) -> Optional[str]:
    if path.suffix.lower() not in TEXT_EXTS and not path.name.endswith((".gradle", ".kts")):
        return None
    try:
        data = path.read_bytes()[:limit]
    except OSError:
        return None
    if b"\x00" in data[:4096]:
        return None
    return data.decode("utf-8", errors="replace")


def first_match(patterns: List[str], text: str) -> Optional[str]:
    for pat in patterns:
        match = re.search(pat, text, re.MULTILINE)
        if match:
            return match.group(1).strip().strip('"\'')
    return None


def all_matches(patterns: List[str], text: str) -> List[str]:
    values: List[str] = []
    for pat in patterns:
        values.extend([m.strip().strip('"\'') for m in re.findall(pat, text, re.MULTILINE)])
    return sorted(set(v for v in values if v))


def parse_gradle(root: Path, text_by_file: Dict[str, str]) -> Dict[str, Any]:
    gradle: Dict[str, Any] = {
        "files": [],
        "modules": [],
        "plugins": [],
        "dependencies": [],
        "local_aars": [],
        "versions": {},
        "android": {},
        "compose": {},
        "properties_of_interest": {},
    }
    for rel_path, text in text_by_file.items():
        if not (rel_path.endswith(("build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts", "libs.versions.toml", "gradle.properties"))):
            continue
        gradle["files"].append(rel_path)
        if rel_path.endswith(("settings.gradle", "settings.gradle.kts")):
            gradle["modules"].extend(all_matches([r"include\s*\(?\s*['\"](:[^'\"]+)['\"]"], text))
        if rel_path.endswith(("build.gradle", "build.gradle.kts")):
            gradle["plugins"].extend(all_matches([
                r"id\s*\(?\s*['\"]([^'\"]+)['\"]",
                r"kotlin\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",
            ], text))
            gradle["dependencies"].extend(all_matches([
                r"(?:implementation|api|compileOnly|runtimeOnly|kapt|ksp|androidTestImplementation|testImplementation)\s*\(?\s*['\"]([^'\"]+)['\"]",
                r"(?:implementation|api|compileOnly|runtimeOnly)\s+files\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",
                r"(?:implementation|api|compileOnly|runtimeOnly)\s*\(?\s*fileTree\s*\([^\)]*include\s*=\s*\[[^\]]*['\"]([^'\"]+\.aar)['\"]",
            ], text))
            gradle["local_aars"].extend(all_matches([r"['\"]([^'\"]+\.aar)['\"]"], text))
            for key, patterns in {
                "compileSdk": [r"compileSdk(?:Version)?\s*=?\s*(\d+)"],
                "minSdk": [r"minSdk(?:Version)?\s*=?\s*(\d+)"],
                "targetSdk": [r"targetSdk(?:Version)?\s*=?\s*(\d+)"],
                "applicationId": [r"applicationId\s*=?\s*['\"]([^'\"]+)['\"]"],
                "namespace": [r"namespace\s*=?\s*['\"]([^'\"]+)['\"]"],
                "versionCode": [r"versionCode\s*=?\s*(\d+)"],
                "versionName": [r"versionName\s*=?\s*['\"]([^'\"]+)['\"]"],
            }.items():
                value = first_match(patterns, text)
                if value and key not in gradle["android"]:
                    gradle["android"][key] = value

            agp = first_match([r"id\s*\(?\s*['\"]com\.android\.(?:application|library)['\"]\s*\)?\s*version\s*['\"]([^'\"]+)['\"]"], text)
            if agp:
                gradle["versions"].setdefault("android_gradle_plugin", agp)
            kotlin = first_match([
                r"id\s*\(?\s*['\"]org\.jetbrains\.kotlin\.android['\"]\s*\)?\s*version\s*['\"]([^'\"]+)['\"]",
                r"kotlin\s*\(\s*['\"]android['\"]\s*\)\s*version\s*['\"]([^'\"]+)['\"]",
            ], text)
            if kotlin:
                gradle["versions"].setdefault("kotlin", kotlin)
            compose_compiler = first_match([r"kotlinCompilerExtensionVersion\s*=?\s*['\"]([^'\"]+)['\"]"], text)
            if compose_compiler:
                gradle["compose"]["kotlinCompilerExtensionVersion"] = compose_compiler
            if re.search(r"buildFeatures\s*\{[^}]*compose\s*(?:=\s*)?true", text, re.DOTALL) or "org.jetbrains.kotlin.plugin.compose" in text:
                gradle["compose"]["enabled"] = True
        if rel_path.endswith("gradle.properties"):
            for line in text.splitlines():
                if not line.strip() or line.strip().startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                if key in {"android.useAndroidX", "android.enableJetifier", "org.gradle.jvmargs", "kotlin.code.style", "android.nonTransitiveRClass"}:
                    gradle["properties_of_interest"][key] = value.strip()

    for key in ("modules", "plugins", "dependencies", "local_aars", "files"):
        gradle[key] = sorted(set(gradle[key]))
    return gradle


def parse_manifest(root: Path, text_by_file: Dict[str, str]) -> Dict[str, Any]:
    manifests = [p for p in root.rglob("AndroidManifest.xml") if not any(part in SKIP_DIRS for part in p.parts)]
    result: Dict[str, Any] = {"files": [rel(p, root) for p in manifests], "main": None}
    if not manifests:
        return result
    main = root / "app" / "src" / "main" / "AndroidManifest.xml"
    manifest = main if main.exists() else manifests[0]
    text = read_text(manifest) or ""
    details: Dict[str, Any] = {"path": rel(manifest, root)}
    try:
        import xml.etree.ElementTree as ET
        xml_root = ET.fromstring(text)
        details["package"] = xml_root.attrib.get("package")
        permissions = []
        for child in xml_root.findall("uses-permission"):
            name = child.attrib.get(f"{{{ANDROID_NS}}}name") or child.attrib.get("android:name") or child.attrib.get("name")
            if name:
                permissions.append(name)
        details["uses_permissions"] = sorted(set(permissions))
        app = xml_root.find("application")
        if app is not None:
            details["application_name"] = app.attrib.get(f"{{{ANDROID_NS}}}name") or app.attrib.get("android:name")
            details["allow_backup"] = app.attrib.get(f"{{{ANDROID_NS}}}allowBackup") or app.attrib.get("android:allowBackup")
            activities = []
            for act in app.findall("activity"):
                name = act.attrib.get(f"{{{ANDROID_NS}}}name") or act.attrib.get("android:name")
                exported = act.attrib.get(f"{{{ANDROID_NS}}}exported") or act.attrib.get("android:exported")
                activities.append({"name": name, "exported": exported})
            details["activities"] = activities[:50]
    except Exception:
        details["package"] = first_match([r"<manifest[^>]*\bpackage=['\"]([^'\"]+)['\"]"], text)
        details["uses_permissions"] = all_matches([r"<uses-permission[^>]*android:name=['\"]([^'\"]+)['\"]"], text)
        details["allow_backup"] = first_match([r"<application[^>]*android:allowBackup=['\"]([^'\"]+)['\"]"], text)
    result["main"] = details
    return result


def inspect_sources(root: Path, text_by_file: Dict[str, str], file_sizes: Dict[str, int]) -> Dict[str, Any]:
    source: Dict[str, Any] = {
        "compose_files": [],
        "sunmi_files": [],
        "serial_transport_files": [],
        "payment_domain_files": [],
        "database_files": [],
        "config_files": [],
        "risk_files": [],
        "pan_like_test_data_files": [],
        "large_files": [],
        "top_packages": [],
    }
    package_counter: Counter[str] = Counter()
    for rel_path, text in text_by_file.items():
        lower = rel_path.lower()
        if lower.endswith((".kt", ".java")):
            for pkg in re.findall(r"^\s*package\s+([\w.]+)", text, re.MULTILINE):
                package_counter[pkg] += 1
        if lower.endswith(".kt") and any(token in text for token in ("@Composable", "setContent", "collectAsState", "remember {", "mutableStateOf")):
            source["compose_files"].append(rel_path)
        if re.search(r"(?i)com\.sunmi|sunmipaykernel|mEMVOptV2|mReadCardOptV2|mSecurityOptV2|PayLib|SUNMI|printerOptV2|bindPaySDK", text):
            source["sunmi_files"].append(rel_path)
        if re.search(r"(?i)SerialPort|/dev/tty|baudrate|baudRate|jniLibs|libserial_port|cradle|dock", text):
            source["serial_transport_files"].append(rel_path)
        if re.search(r"(?i)purchase|settlement|reversal|refund|void|flexi|forever|proud|alipay|n2n|iso8583|edc|ecr|pinblock|dukpt|emv", text):
            source["payment_domain_files"].append(rel_path)
        if any(token in text for token in ("@Entity", "RoomDatabase", "@Dao", "SQLiteOpenHelper", "DataStore")):
            source["database_files"].append(rel_path)
        if lower.endswith(("config.toml", "libs.versions.toml", ".properties", ".json", ".yaml", ".yml")) or "config.toml" in lower:
            source["config_files"].append(rel_path)
        if any(p.search(text) for p in SECRET_PATTERNS):
            source["risk_files"].append(rel_path)
        if PAN_LIKE_PATTERN.search(text) and not lower.endswith((".md", ".txt")):
            source["pan_like_test_data_files"].append(rel_path)

    for rel_path, size in file_sizes.items():
        if size > 5 * 1024 * 1024:
            source["large_files"].append({"path": rel_path, "size_bytes": size})

    for key, value in list(source.items()):
        if isinstance(value, list) and key != "large_files":
            source[key] = sorted(set(value))[:100]
    source["top_packages"] = [{"package": p, "files": c} for p, c in package_counter.most_common(20)]
    return source


def make_recommendations(audit: Dict[str, Any]) -> List[Dict[str, str]]:
    recs: List[Dict[str, str]] = []
    gradle = audit.get("gradle", {})
    android = gradle.get("android", {})
    manifest = ((audit.get("manifest") or {}).get("main") or {})
    source = audit.get("source", {})

    def add(area: str, severity: str, message: str) -> None:
        recs.append({"area": area, "severity": severity, "message": message})

    if not gradle.get("files"):
        add("build", "high", "no gradle build files were detected; verify the uploaded archive contains the Android project root.")
    if "compileSdk" not in android:
        add("build", "medium", "compileSdk was not detected; inspect module build.gradle before attempting an APK build.")
    if "targetSdk" not in android:
        add("build", "medium", "targetSdk was not detected; confirm target API and Android compatibility requirements.")
    if source.get("compose_files") and not gradle.get("compose", {}).get("enabled"):
        add("compose", "high", "compose source files were found but compose build features/plugin were not detected in Gradle.")
    if source.get("sunmi_files") and not any("sunmi" in d.lower() or "paylib" in d.lower() for d in gradle.get("dependencies", []) + gradle.get("local_aars", [])):
        add("sunmi", "medium", "sunmi references were found but no obvious sunmi/paylib dependency was detected; verify local aar or maven dependency.")
    if manifest.get("allow_backup") in {None, "true", "True"}:
        add("security", "medium", "android:allowBackup is missing or true; payment apps usually require explicit backup policy review.")
    if source.get("risk_files"):
        add("security", "high", f"possible hardcoded secrets or payment identifiers detected in {len(source['risk_files'])} file(s); inspect and move values to secure configuration.")
    if source.get("pan_like_test_data_files"):
        add("pci", "high", f"pan-like numeric data detected in {len(source['pan_like_test_data_files'])} source/config file(s); confirm values are masked test data and never log/store real PAN.")
    if source.get("serial_transport_files"):
        add("architecture", "medium", "serial transport code detected; keep byte transport, protocol framing, and payment business logic separated.")
    if not any(str(p).endswith("gradlew") or str(p).endswith("gradlew.bat") for p in audit.get("key_files", [])):
        add("build", "medium", "gradle wrapper was not detected; reproducible builds should include gradlew and wrapper metadata.")
    return recs


def write_markdown(audit: Dict[str, Any], out_path: Path) -> None:
    lines: List[str] = []
    lines.append("# Android Project Audit")
    lines.append("")
    lines.append(f"Generated: {audit['generated_at']}")
    lines.append(f"Project root: `{audit.get('project_root', '')}`")
    lines.append("")
    summary = audit.get("summary", {})
    lines.append("## Summary")
    lines.append("")
    for key in ["total_files", "total_size_bytes", "kotlin_files", "java_files", "xml_files", "gradle_files"]:
        lines.append(f"- {key}: {summary.get(key, 0)}")
    lines.append("")

    gradle = audit.get("gradle", {})
    lines.append("## Build Configuration")
    lines.append("")
    android = gradle.get("android", {})
    if android:
        for key, value in android.items():
            lines.append(f"- {key}: `{value}`")
    if gradle.get("versions"):
        for key, value in gradle["versions"].items():
            lines.append(f"- {key}: `{value}`")
    if gradle.get("compose"):
        lines.append(f"- compose: `{gradle['compose']}`")
    if gradle.get("modules"):
        lines.append(f"- modules: {', '.join('`' + m + '`' for m in gradle['modules'])}")
    lines.append("")

    manifest = ((audit.get("manifest") or {}).get("main") or {})
    lines.append("## Manifest")
    lines.append("")
    if manifest:
        for key in ["path", "package", "application_name", "allow_backup"]:
            if key in manifest:
                lines.append(f"- {key}: `{manifest.get(key)}`")
        perms = manifest.get("uses_permissions") or []
        if perms:
            lines.append("- permissions: " + ", ".join(f"`{p}`" for p in perms[:30]))
    else:
        lines.append("- no manifest details detected")
    lines.append("")

    source = audit.get("source", {})
    lines.append("## Source Signals")
    lines.append("")
    signals = [
        ("compose_files", "Compose files"),
        ("sunmi_files", "Sunmi/PaySDK files"),
        ("serial_transport_files", "Serial/cradle transport files"),
        ("payment_domain_files", "Payment-domain files"),
        ("database_files", "Database files"),
        ("config_files", "Configuration files"),
        ("risk_files", "Possible secret/config risk files"),
        ("pan_like_test_data_files", "PAN-like data files"),
    ]
    for key, label in signals:
        values = source.get(key) or []
        lines.append(f"### {label} ({len(values)})")
        if values:
            for item in values[:20]:
                lines.append(f"- `{item}`")
        else:
            lines.append("- none detected")
        lines.append("")

    lines.append("## Recommendations")
    lines.append("")
    recs = audit.get("recommendations") or []
    if recs:
        for rec in recs:
            lines.append(f"- **{rec['severity'].upper()} / {rec['area']}**: {rec['message']}")
    else:
        lines.append("- no automatic recommendations generated; perform manual code and build review next.")
    lines.append("")

    lines.append("## Next Review Steps")
    lines.append("")
    lines.append("1. inspect the files named in high-risk recommendations before editing code.")
    lines.append("2. run a clean gradle build with stacktrace and capture the first real compiler/runtime error.")
    lines.append("3. apply minimal patches, then rebuild and repeat until the APK assembles.")
    lines.append("4. perform device validation on the target Sunmi/EDC hardware before calling the APK production-ready.")
    lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Inspect an Android project directory or archive.")
    parser.add_argument("input", help="Android project directory or .zip/.tar/.rar archive")
    parser.add_argument("--out", default="android_project_audit_out", help="output directory")
    args = parser.parse_args(argv)

    input_path = Path(args.input).expanduser().resolve()
    out_dir = Path(args.out).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        print(f"input not found: {input_path}", file=sys.stderr)
        return 2

    archive_info: Dict[str, Any] = {"input_type": "directory"}
    try:
        if input_path.is_file():
            base, archive_info = extract_archive(input_path, out_dir)
        else:
            base = input_path
        root = select_project_root(base)
    except Exception as exc:
        print(f"failed to prepare project: {exc}", file=sys.stderr)
        return 3

    file_exts: Counter[str] = Counter()
    file_sizes: Dict[str, int] = {}
    text_by_file: Dict[str, str] = {}
    key_files: List[str] = []
    total_size = 0

    for path in iter_project_files(root):
        relative = rel(path, root)
        try:
            size = path.stat().st_size
        except OSError:
            size = 0
        total_size += size
        file_sizes[relative] = size
        suffix = path.suffix.lower() or "[no_ext]"
        file_exts[suffix] += 1
        if path.name in {"settings.gradle", "settings.gradle.kts", "build.gradle", "build.gradle.kts", "gradlew", "gradlew.bat", "gradle.properties", "libs.versions.toml", "AndroidManifest.xml", "proguard-rules.pro", "config.toml"}:
            key_files.append(relative)
        text = read_text(path)
        if text is not None:
            text_by_file[relative] = text

    gradle = parse_gradle(root, text_by_file)
    manifest = parse_manifest(root, text_by_file)
    source = inspect_sources(root, text_by_file, file_sizes)
    summary = {
        "total_files": len(file_sizes),
        "total_size_bytes": total_size,
        "kotlin_files": file_exts.get(".kt", 0) + file_exts.get(".kts", 0),
        "java_files": file_exts.get(".java", 0),
        "xml_files": file_exts.get(".xml", 0),
        "gradle_files": sum(1 for p in file_sizes if p.endswith((".gradle", ".gradle.kts"))),
        "extensions": dict(file_exts.most_common(25)),
    }
    audit: Dict[str, Any] = {
        "audit_version": "1.0.0",
        "generated_at": now_iso(),
        "input": str(input_path),
        "project_root": str(root),
        "archive_info": archive_info,
        "summary": summary,
        "key_files": sorted(set(key_files)),
        "gradle": gradle,
        "manifest": manifest,
        "source": source,
    }
    audit["recommendations"] = make_recommendations(audit)

    json_path = out_dir / "android_project_audit.json"
    md_path = out_dir / "android_project_audit.md"
    json_path.write_text(json.dumps(audit, indent=2, ensure_ascii=False), encoding="utf-8")
    write_markdown(audit, md_path)
    print(f"wrote {json_path}")
    print(f"wrote {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
