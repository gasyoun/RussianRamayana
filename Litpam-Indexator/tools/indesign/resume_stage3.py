#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
resume_stage3.py — возобновить прерванный per-letter прогон стадии [3] (H2776).

Драйвер может быть убит извне, пока InDesign выполняет очередную букву; сам
ExtendScript при этом доезжает до конца, но следующие буквы не стартуют и
документ не сохраняется. Этот скрипт: (1) первым COM-вызовом дожидается
освобождения InDesign (вызов блокируется до конца текущего скрипта);
(2) считает topics по буквенным префиксам и сравнивает с числом Level1-строк
каждого диапазона сводной — полностью покрытая буква пропускается (повторный
прогон дал бы дубли page-references); (3) прогоняет оставшиеся буквы; (4) save.

Запуск:
    python resume_stage3.py --letters auto   (или явно: --letters c,d)
"""

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import drive_stage3 as ds  # noqa: E402

BASE = Path(__file__).resolve().parents[2]
TARGET = BASE / "work" / "print-readiness" / "pilot-I" / "Ramayana_I_pilot_2026.indd"
ILIST = BASE / "work" / "print-readiness" / "pilot-I" / "indexlists" / "IndexList[@]001.indd"
DUMP = BASE / "work" / "print-readiness" / "pilot-I" / "indexlists" / "svodnaya-dump.tsv"

COUNT_TOPICS = ('#targetengine "StoryAndDoc"\n' + """
var tdoc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) tdoc = app.documents[i];
if (tdoc == null) throw new Error("pilot not open");
if (tdoc.indexes.length == 0) { "a=0|b=0|c=0|d=0"; }
else {
    var counts = { a: 0, b: 0, c: 0, d: 0 };
    var tps = tdoc.indexes[0].topics.everyItem().name;
    for (var t = 0; t < tps.length; t++) {
        var nm = String(tps[t]);
        if (nm.length > 1 && nm.charAt(1) == "-" && counts[nm.charAt(0)] !== undefined)
            counts[nm.charAt(0)]++;
    }
    "a=" + counts.a + "|b=" + counts.b + "|c=" + counts.c + "|d=" + counts.d;
}
""")


def level1_counts():
    counts = {"a": 0, "b": 0, "c": 0, "d": 0}
    for line in DUMP.read_text(encoding="utf-8").splitlines():
        parts = line.split("\t")
        if len(parts) >= 3 and parts[1] == "#Level1" and len(parts[2]) > 1 and parts[2][1] == "-":
            letter = parts[2][0]
            if letter in counts:
                counts[letter] += 1
    return counts


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--letters", default="auto")
    args = p.parse_args(argv)

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[resume3] connected: {app.Name} {app.Version}; waiting for engine to be free...")
    app.ScriptPreferences.UserInteractionLevel = ds.ID_NEVER_INTERACT

    def do_jsx(code, label):
        import tempfile

        f = Path(tempfile.gettempdir()) / f"h2776_resume_{label}.jsx"
        f.write_bytes(b"\xef\xbb\xbf" + code.replace("\n", "\r\n").encode("utf-8"))
        return app.DoScript(str(f), ds.ID_JAVASCRIPT)

    t0 = time.time()
    topic_raw = str(do_jsx(COUNT_TOPICS, "count"))  # блокируется, пока идёт текущая буква
    print(f"[resume3] engine free after {(time.time()-t0)/60:.1f} min; topics: {topic_raw}")

    # Пилот открыт (COUNT_TOPICS его нашёл), а сводная после смертей оркестраторов
    # может быть закрыта — переоткрываем; порядок важен: она должна стать
    # documents[0] (последней открытой), чтобы documents[1] остался пилотом.
    opened = {app.Documents.Item(i).Name for i in range(1, app.Documents.Count + 1)}
    if ILIST.name not in opened:
        app.Open(str(ILIST))
        print(f"[resume3] reopened: {ILIST.name}")
    topics = {k: int(v) for k, v in (kv.split("=") for kv in topic_raw.split("|"))}
    lvl1 = level1_counts()
    print(f"[resume3] level1 rows: {lvl1}")

    if args.letters == "auto":
        todo = [ltr for ltr in "abcd" if topics.get(ltr, 0) < max(1, int(lvl1[ltr] * 0.9))]
    else:
        todo = [x.strip() for x in args.letters.split(",") if x.strip()]
    print(f"[resume3] letters to run: {todo or 'NONE (all covered)'}")

    spans_raw = str(do_jsx(ds.SCAN, "scan"))
    spans = {}
    for part in spans_raw.split(","):
        letter, _, rng = part.partition(":")
        s, _, e = rng.partition("-")
        spans[letter] = (int(s), int(e))
    print(f"[resume3] spans: {spans_raw}")

    def do_jsx_retry(code, label, tries=3):
        last = None
        for attempt in range(tries):
            try:
                return do_jsx(code, label)
            except Exception as e:  # noqa: BLE001 — flaky COM/DOM: however it failed, retry
                last = e
                print(f"[resume3] {label} attempt {attempt+1} failed: {e}; retrying in 20s")
                time.sleep(20)
        raise last

    for letter in todo:
        s, e = spans[letter]
        t0 = time.time()
        prep = str(do_jsx_retry(ds.PREPARE % {"start": s, "end": e}, f"prep_{letter}"))
        print(f"[resume3] prepare[{letter}] ({time.time()-t0:.0f}s): {prep[:200]}")
        if "THREW" in prep:
            raise SystemExit(f"[resume3] prepare[{letter}] failed")
        print(f"[resume3] fix-colors[{letter}]:", do_jsx_retry(ds.FIX_COLORS, f"fix_{letter}"))
        t0 = time.time()
        run = str(do_jsx(ds.RUN % {"clear": "false"}, f"run_{letter}"))
        print(f"[resume3] run[{letter}] finished in {(time.time()-t0)/60:.1f} min: {run[:300]}")
        if "THREW" in run:
            raise SystemExit(f"[resume3] run[{letter}] failed — earlier letters kept")

    save = ('#targetengine "StoryAndDoc"\n'
            'var tdoc = null;\n'
            'for (var i = 0; i < app.documents.length; i++)\n'
            '    if (app.documents[i].name.indexOf("pilot") != -1) tdoc = app.documents[i];\n'
            'tdoc.save(); "saved|topics=" + (tdoc.indexes.length ? tdoc.indexes[0].topics.length : 0);')
    print("[resume3]", do_jsx(save, "save"))
    print("[resume3] final topic counts:", do_jsx(COUNT_TOPICS, "count2"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
