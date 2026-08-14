"""packet.py — validate an evidence packet: manifest.json lists every required
member with a sha256; verify every listed file exists, hashes match, and no
required member is missing. See docs/print-readiness for the required-members
list per evidence stage (baseline-2022 / conversion-2026 / pilot-2026).

_Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589)._
"""

import hashlib
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

REQUIRED_MANIFEST_FIELDS = ["packet_id", "handoff", "created", "members"]
REQUIRED_MEMBER_FIELDS = ["path", "sha256"]


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def verify(packet_dir):
    packet_dir = Path(packet_dir)
    manifest_path = packet_dir / "manifest.json"
    lines = [f"# verify-packet: {packet_dir}"]

    if not manifest_path.exists():
        lines.append("FAIL: manifest.json missing")
        return False, "\n".join(lines)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    ok = True

    for field in REQUIRED_MANIFEST_FIELDS:
        if field not in manifest:
            ok = False
            lines.append(f"FAIL: manifest missing required field '{field}'")

    members = manifest.get("members", [])
    if not members:
        ok = False
        lines.append("FAIL: manifest has zero members")

    for m in members:
        for field in REQUIRED_MEMBER_FIELDS:
            if field not in m:
                ok = False
                lines.append(f"FAIL: member entry missing '{field}': {m}")
                continue
        rel = m.get("path")
        if not rel:
            continue
        full = packet_dir / rel
        if not full.exists():
            ok = False
            lines.append(f"FAIL: missing packet member: {rel}")
            continue
        actual = sha256_file(full)
        expected = m.get("sha256")
        if actual != expected:
            ok = False
            lines.append(f"FAIL: checksum mismatch for {rel}: expected {expected}, got {actual}")
        else:
            lines.append(f"PASS: {rel} ({actual[:12]}...)")

    lines.append("PASS: packet verified" if ok else "FAIL: packet verification failed")
    return ok, "\n".join(lines)


def main(argv=None):
    import argparse

    p = argparse.ArgumentParser(description="Verify an evidence packet's manifest + checksums")
    p.add_argument("--packet", required=True)
    args = p.parse_args(argv)
    ok, report = verify(args.packet)
    print(report)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
