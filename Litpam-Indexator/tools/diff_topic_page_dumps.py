#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
diff_topic_page_dumps.py -- compares two dump_topic_pages.py JSON outputs by
per-topic SET of unique page numbers (H2590 rebuild). Character-count
checkpoints (storyLength) are NOT reliable across separate ProcNumberLines
runs on this machine -- confirmed non-deterministic by exact-total-length
differing (e.g. 49843 vs 49619 vs 49742 chars) across three otherwise
identical rebuild attempts, while the underlying topic/page-reference DATA
was byte-identical every time per this comparison. Use this, not storyLength,
as the correctness oracle for any stage[3]/stage[4] edit that should be
purely additive/presentational.

Запуск:
    python diff_topic_page_dumps.py <dump_a.json> <dump_b.json>

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import json
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")


def load(path):
    d = json.load(open(path, encoding="utf-8"))
    raw = d["topics_raw"]
    out = {}
    for line in raw.split("\n"):
        if not line.strip():
            continue
        name, _, rest = line.partition("\t")
        pages = set()
        for tok in rest.split(","):
            tok = tok.strip()
            if not tok:
                continue
            try:
                pages.add(int(tok))
            except ValueError:
                continue
        out[name] = pages
    return out


def main():
    a_path, b_path = sys.argv[1], sys.argv[2]
    am = load(a_path)
    bm = load(b_path)
    print("a topics:", len(am), "b topics:", len(bm))

    only_a = set(am) - set(bm)
    only_b = set(bm) - set(am)
    print("only in a:", len(only_a))
    print("only in b:", len(only_b))
    if only_a:
        print("  sample only_a:", sorted(only_a)[:15])
    if only_b:
        print("  sample only_b:", sorted(only_b)[:15])

    diffs = []
    for name in sorted(set(am) & set(bm)):
        pa, pb = am[name], bm[name]
        if pa != pb:
            diffs.append((name, pa - pb, pb - pa))

    print("topics with differing page SETS:", len(diffs))
    for name, missing_in_b, extra_in_b in diffs[:40]:
        print(" -", repr(name), "missing_in_b=", sorted(missing_in_b), "extra_in_b=", sorted(extra_in_b))


if __name__ == "__main__":
    main()
