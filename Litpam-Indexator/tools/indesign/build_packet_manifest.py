#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build_packet_manifest.py — write manifest.json for an evidence packet directory
so tools/print_ready.py verify-packet can validate it (H2589).

Запуск:
    python build_packet_manifest.py --packet-dir <dir> --packet-id <id> [--exclude manifest.json]
"""
import argparse
import datetime
import hashlib
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--packet-dir", required=True)
    p.add_argument("--packet-id", required=True)
    args = p.parse_args(argv)

    packet_dir = Path(args.packet_dir)
    members = []
    for f in sorted(packet_dir.rglob("*")):
        if f.is_file() and f.name != "manifest.json":
            members.append(
                {"path": str(f.relative_to(packet_dir)).replace("\\", "/"), "sha256": sha256_file(f)}
            )

    manifest = {
        "packet_id": args.packet_id,
        "handoff": "H2589",
        "created": datetime.date.today().isoformat(),
        "members": members,
    }
    (packet_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"manifest.json written for {len(members)} members -> {packet_dir / 'manifest.json'}")


if __name__ == "__main__":
    main()
