#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
analyze_topic_pages.py — stage[4] integrity check v2 companion (H2590):
compares the SET of unique page numbers per topic (source of truth from
dump_topic_pages.py) against the SET of unique page numbers actually printed
in the processed index text, correctly ignoring duplicate-page references
(ProcNumberLines legitimately collapses those to one printed instance).

Запуск:
    python analyze_topic_pages.py --dump <TOPIC_PAGES_DUMP.json> --json <out.json>
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)


def parse_number_range(text):
    nums = set()
    for part in text.split(","):
        part = part.strip()
        rng = re.split(r"[–—-]", part)
        if len(rng) == 2 and rng[0].strip().isdigit() and rng[1].strip().isdigit():
            for n in range(int(rng[0]), int(rng[1]) + 1):
                nums.add(n)
        elif part.isdigit():
            nums.add(int(part))
    return nums


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--dump", required=True)
    p.add_argument("--json", required=True)
    args = p.parse_args(argv)

    d = json.loads(Path(args.dump).read_text(encoding="utf-8"))
    topics_raw = d["topics_raw"]
    text = d["text"]

    topic_pages = {}
    errors = []
    for line in topics_raw.strip().splitlines():
        name, _, pages_str = line.partition("\t")
        if name == "__ERROR__":
            errors.append(pages_str)
            continue
        pages = set()
        for p_str in pages_str.split(","):
            p_str = p_str.strip()
            if p_str.isdigit():
                pages.add(int(p_str))
        topic_pages[name] = pages

    # Split printed text into per-topic-name segments (a/b/c/d- prefixed).
    segments = re.split(r"(?=[abcd]-)", text)
    printed_pages = {}
    for seg in segments:
        m = re.match(r"([abcd]-[^\r\n]*?)\s+([\d,\s–—-]+)(?=[abcd]-|$)", seg, re.S)
        if not m:
            continue
        name = m.group(1).strip()
        printed_pages[name] = parse_number_range(m.group(2))

    mismatches = []
    for name, src_pages in topic_pages.items():
        # duplicate-suffixed names (e.g. "a-Foo=1") don't appear literally in
        # print -- match on the name with any trailing "=N" stripped.
        clean_name = re.sub(r"=\d+$", "", name)
        printed = printed_pages.get(name) or printed_pages.get(clean_name)
        if printed is None:
            mismatches.append({"topic": name, "src_pages": sorted(src_pages), "printed_pages": None, "note": "not found in printed text"})
            continue
        missing = src_pages - printed
        if missing:
            mismatches.append({
                "topic": name,
                "src_pages": sorted(src_pages),
                "printed_pages": sorted(printed),
                "missing_from_print": sorted(missing),
            })

    report = {
        "tool": "analyze_topic_pages.py (H2590)",
        "topics_total": len(topic_pages),
        "read_errors": errors,
        "mismatches_total": len(mismatches),
        "mismatches": mismatches,
    }
    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"topics={len(topic_pages)} mismatches={len(mismatches)} read_errors={len(errors)} -> {args.json}")
    return 0 if not mismatches else 1


if __name__ == "__main__":
    sys.exit(main())
