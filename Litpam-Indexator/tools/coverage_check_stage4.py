#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
coverage_check_stage4.py — стадия [4] интегритет-чек (H2590): для каждого
топика индекса сравнивает число страничных ссылок в исходном объекте
Index.Topics (источник истины) с числом отдельных номеров страниц, реально
напечатанных в тексте сгенерированной/обработанной истории указателя (после
ProcNumberLines). Расхождение = потерянный локатор в печатном тексте
(рулинг 29 — блокер по DEFECT_POLICY.md, даже если сам объект Topic цел).

Запуск:
    python coverage_check_stage4.py --target <pilot.indd> --json <out.json>
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)

ID_JAVASCRIPT = 1246973031
ID_NEVER_INTERACT = 1699640946
SAVE_OPTIONS_NO = 1852776480

# Dumps, per top-level (Level1) topic: its name, its Topics.PageReferences
# count (source of truth), and the raw printed text line for that topic
# (everything from the topic name to the next Level1 topic's start), so the
# Python side can count numbers actually present in print vs. references
# recorded in the data model. Pure read, no document mutation.
DUMP_JSX = """
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("IndexList") == -1) doc = app.documents[i];
if (doc == null) throw new Error("target doc not found");

var ix = doc.indexes.item(0);
var story = doc.stories.item(doc.stories.length - 1);
var fullText = story.contents;

var lines = [];
for (var i = 1; i <= ix.topics.length; i++) {
    try {
        var t = ix.topics.item(i);
        var name = String(t.name);
        var refCount = t.pageReferences.length;
        lines.push(name + "\\t" + refCount);
    } catch (e) {
        lines.push("__ERROR__\\t" + i + ":" + e.message);
    }
}
lines.join("\\n") + "\\n===TEXT===\\n" + fullText;
"""


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True)
    p.add_argument("--json", required=True)
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    if "work" not in target.parts or "print-readiness" not in target.parts:
        raise SystemExit(f"refusing: {target} must live under work/print-readiness/ (ruling 26)")

    import win32com.client
    import tempfile

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[coverage-check] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
    doc = app.Open(str(target))
    print(f"[coverage-check] opened: {doc.Name}")

    f = Path(tempfile.gettempdir()) / "h2590_coverage_dump.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + DUMP_JSX.replace("\n", "\r\n").encode("utf-8"))
    result = str(app.DoScript(str(f), ID_JAVASCRIPT))

    doc.Close(SAVE_OPTIONS_NO)
    print("[coverage-check] closed without saving (read-only)")

    topics_part, _, text_part = result.partition("===TEXT===")
    topic_refcounts = {}
    topic_errors = []
    for line in topics_part.strip().splitlines():
        name, _, cnt = line.rpartition("\t")
        if not name:
            continue
        if name == "__ERROR__":
            topic_errors.append(cnt)
            continue
        topic_refcounts[name] = int(cnt)
    if topic_errors:
        print(f"[coverage-check] {len(topic_errors)} topic read errors (non-fatal): {topic_errors[:5]}")

    # Split the printed text into per-topic-name segments: a line starting
    # with "<letter>-<name>" up to the next such marker (topic names are
    # letter-prefixed by ForIndex.jsxinc convention: a/b/c/d).
    segments = re.split(r"(?=[abcd]-)", text_part)
    printed_numbers = {}
    for seg in segments:
        m = re.match(r"([abcd]-[^\r\n]*?)\s+([\d, –—-]+)", seg)
        if not m:
            continue
        name = m.group(1).strip()
        nums_str = m.group(2)
        # count distinct page numbers: split on comma, then split ranges on dash variants
        nums = set()
        for part in nums_str.split(","):
            part = part.strip()
            rng = re.split(r"[–—-]", part)
            if len(rng) == 2 and rng[0].isdigit() and rng[1].isdigit():
                for n in range(int(rng[0]), int(rng[1]) + 1):
                    nums.add(n)
            elif part.isdigit():
                nums.add(int(part))
        printed_numbers[name] = len(nums)

    mismatches = []
    for name, ref_count in topic_refcounts.items():
        printed = printed_numbers.get(name)
        if printed is None:
            mismatches.append({"topic": name, "ref_count": ref_count, "printed_count": None, "note": "not found in printed text"})
        elif printed != ref_count:
            mismatches.append({"topic": name, "ref_count": ref_count, "printed_count": printed})

    report = {
        "tool": "coverage_check_stage4.py (H2590)",
        "topics_total": len(topic_refcounts),
        "mismatches_total": len(mismatches),
        "mismatches": mismatches,
    }
    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[coverage-check] topics={len(topic_refcounts)} mismatches={len(mismatches)} -> {args.json}")
    return 0 if not mismatches else 1


if __name__ == "__main__":
    sys.exit(main())
