#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drive_stage3_own.py — стадия [3] через additive-индексатор index_letter.jsx
(H2776): санкционированный «additive equivalent wrapper» после того, как три
DOM-регрессии InDesign 2026 сломали headless-прогон авторской палитры (repro:
everyItem().cells flatten · пустые contents на everyItem-цепочках ·
rows.itemByRange().select() → Invalid parameter; см. stage3-run-report).

Букву `a` (761 topic), сделанную авторской палитрой до регрессии, НЕ пересобираем
по умолчанию (--letters auto пропускает буквы с покрытием ≥90 % Level1-строк);
index_letter.jsx сам идемпотентен (redo буквы сносит её topics).

Запуск: python drive_stage3_own.py [--letters auto|b,c,d]
"""

import argparse
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import drive_stage3 as ds  # noqa: E402
from resume_stage3 import COUNT_TOPICS, ILIST, TARGET, level1_counts  # noqa: E402

HERE = Path(__file__).resolve().parent
JSX = HERE / "index_letter.jsx"
LOG = TARGET.parent / "stage3-index-log.txt"


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--letters", default="auto")
    args = p.parse_args(argv)

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[own3] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ds.ID_NEVER_INTERACT

    def do_jsx(code, label):
        f = Path(tempfile.gettempdir()) / f"h2776_own_{label}.jsx"
        f.write_bytes(b"\xef\xbb\xbf" + code.replace("\n", "\r\n").encode("utf-8"))
        return app.DoScript(str(f), ds.ID_JAVASCRIPT)

    opened = {app.Documents.Item(i).Name for i in range(1, app.Documents.Count + 1)}
    if TARGET.name not in opened:
        app.Open(str(TARGET))
        print(f"[own3] opened: {TARGET.name}")
    if ILIST.name not in opened:
        app.Open(str(ILIST))
        print(f"[own3] opened: {ILIST.name}")

    topic_raw = str(do_jsx(COUNT_TOPICS, "count"))
    print(f"[own3] topics before: {topic_raw}")
    topics = {k: int(v) for k, v in (kv.split("=") for kv in topic_raw.split("|"))}
    lvl1 = level1_counts()
    if args.letters == "auto":
        todo = [x for x in "abcd" if topics.get(x, 0) < max(1, int(lvl1[x] * 0.9))]
    else:
        todo = [x.strip() for x in args.letters.split(",") if x.strip()]
    print(f"[own3] letters: {todo}; level1 rows: {lvl1}")

    spans_raw = str(do_jsx(ds.SCAN, "scan"))
    spans = {}
    for part in spans_raw.split(","):
        letter, _, rng = part.partition(":")
        s, _, e = rng.partition("-")
        spans[letter] = (s, e)
    print(f"[own3] spans: {spans_raw}")

    for letter in todo:
        s, e = spans[letter]
        app.ScriptArgs.SetValue("letter", letter)
        app.ScriptArgs.SetValue("startRow", s)
        app.ScriptArgs.SetValue("endRow", e)
        app.ScriptArgs.SetValue("logPath", str(LOG))
        t0 = time.time()
        res = app.DoScript(str(JSX), ds.ID_JAVASCRIPT)
        print(f"[own3] {letter}: {res} ({(time.time()-t0)/60:.1f} min)")

    save = ('#targetengine "StoryAndDoc"\n'
            'var tdoc = null;\n'
            'for (var i = 0; i < app.documents.length; i++)\n'
            '    if (app.documents[i].name.indexOf("pilot") != -1) tdoc = app.documents[i];\n'
            'tdoc.save(); "saved|topics=" + (tdoc.indexes.length ? tdoc.indexes[0].topics.length : 0);')
    print("[own3]", do_jsx(save, "save"))
    print("[own3] final:", do_jsx(COUNT_TOPICS, "count2"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
