#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prepare_workspace.py — additive workspace preparer for InDesign print-readiness
evidence capture (H2589 Step 4). Copies a source package folder into one or more
local working directories (outside Git, under Litpam-Indexator/work/print-readiness/)
and confirms every file's SHA-256 survived the copy. The original package is never
opened for writing and never mutated.

Запуск:
    python prepare_workspace.py --source <package-dir> --dest <dest-dir> [--dest <dest-dir> ...]

_Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589).
"""

import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def hash_tree(root):
    root = Path(root)
    hashes = {}
    for p in sorted(root.rglob("*")):
        if p.is_file():
            hashes[str(p.relative_to(root)).replace("\\", "/")] = sha256_file(p)
    return hashes


def prepare(source, dest):
    source = Path(source)
    dest = Path(dest)
    if not source.is_dir():
        raise FileNotFoundError(f"source package dir not found: {source}")
    if dest.exists() and any(dest.iterdir()):
        raise FileExistsError(f"dest already exists and is non-empty (refusing to overwrite): {dest}")

    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, dest)

    source_hashes = hash_tree(source)
    dest_hashes = hash_tree(dest)

    mismatches = []
    for rel, sha in source_hashes.items():
        if dest_hashes.get(rel) != sha:
            mismatches.append(rel)
    missing_in_dest = set(source_hashes) - set(dest_hashes)
    extra_in_dest = set(dest_hashes) - set(source_hashes)

    ok = not mismatches and not missing_in_dest and not extra_in_dest
    return {
        "source": str(source).replace("\\", "/"),
        "dest": str(dest).replace("\\", "/"),
        "file_count": len(source_hashes),
        "ok": ok,
        "hash_mismatches": mismatches,
        "missing_in_dest": sorted(missing_in_dest),
        "extra_in_dest": sorted(extra_in_dest),
        "source_hashes": source_hashes,
    }


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--source", required=True)
    p.add_argument("--dest", required=True, action="append")
    p.add_argument("--manifest", help="write a combined JSON manifest here")
    args = p.parse_args(argv)

    results = []
    for dest in args.dest:
        result = prepare(args.source, dest)
        status = "OK" if result["ok"] else "MISMATCH"
        print(f"{status}: {result['source']} -> {result['dest']} ({result['file_count']} files)")
        if not result["ok"]:
            print("  hash_mismatches:", result["hash_mismatches"])
            print("  missing_in_dest:", result["missing_in_dest"])
            print("  extra_in_dest:", result["extra_in_dest"])
        results.append(result)

    if args.manifest:
        Path(args.manifest).parent.mkdir(parents=True, exist_ok=True)
        Path(args.manifest).write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")

    return 0 if all(r["ok"] for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
