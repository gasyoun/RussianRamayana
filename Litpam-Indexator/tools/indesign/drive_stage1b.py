#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drive_stage1b.py — COM driver for the second half of MANUAL stage [1] (H2776):
markers + merge into the сводная таблица.

1. AddMarker twin: for each IndexList-NNN.indd, prepend "<letter>-" to every
   first-column cell (byte-for-byte the loop AddMarker.jsx's OK-button runs;
   the authorial script is a ScriptUI palette and stays untouched), save, and
   rename to IndexList[<letter>]NNN.indd — markers a/b/c/d per the Розеттская
   таблица (Именной→a, Географ→b, Предметы→c, Флора→d).
2. Rename the receiver IndexList[a]001.indd → IndexList[@]001.indd (the manual
   user step from MergeTwoIndexListTables.jsx's own header).
3. For each of [b]/[c]/[d]: open receiver + donor (exactly two docs, same
   folder), run the AUTHORIAL MergeTwoIndexListTables.jsx unmodified (alerts
   shimmed inside its "MergeIndexListTables" engine), save the receiver.

Запуск:
    python drive_stage1b.py [--workdir <dir>] [--quit]

_Автор инструмента: Dr. Mārcis Gasūns · создан 15-08-2026 (H2776)._
"""

import argparse
import sys
import time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ID_JAVASCRIPT = 1246973031
ID_NEVER_INTERACT = 1699640946
SAVE_OPTIONS_NO = 1852776480

HERE = Path(__file__).resolve().parent
BASE = HERE.parents[1]
MERGE_JSX = BASE / "#Indexing. Ramayana" / "[1. Подготовка таблиц]" / "MergeTwoIndexListTables.jsx"

MARKERS = [("001", "a"), ("002", "b"), ("003", "c"), ("004", "d")]

MERGE_SHIM = (
    '#targetengine "MergeIndexListTables"\r'
    "alert = function (m) { $.global.__alertLog = ($.global.__alertLog || \"\") + m + \" || \"; };\r"
    '"shim-ok"'
)
MERGE_READ = '#targetengine "MergeIndexListTables"\rvar r = $.global.__alertLog || ""; $.global.__alertLog = ""; r'

ADDMARKER_TWIN = """
var doc = app.activeDocument;
var marker = app.scriptArgs.getValue("marker");
var tbl = null;
for (var s = 0; s < doc.stories.length && tbl == null; s++)
    if (doc.stories[s].tables.length > 0) tbl = doc.stories[s].tables[0];
if (tbl == null) throw new Error("no table in " + doc.name);
var col = tbl.columns[0];
var first = String(col.rows[0].cells[0].texts[0].contents);
if (first.indexOf(marker + "-") == 0) {
    "already-marked|rows=" + col.rows.length + "|cols=" + tbl.columns.length;
} else {
    for (var c = 0; c < col.rows.length; c++)
        col.rows[c].cells[0].contents = marker + "-" + col.rows[c].cells[0].contents;
    "rows=" + col.rows.length + "|cols=" + tbl.columns.length;
}
"""


def rename_with_retry(src, dst, tries=15, delay=2.0):
    for i in range(tries):
        try:
            src.rename(dst)
            return
        except PermissionError:
            time.sleep(delay)
    raise PermissionError(f"still locked after {tries * delay:.0f}s: {src}")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--workdir", default=str(BASE / "work" / "print-readiness" / "pilot-I" / "indexlists"))
    p.add_argument("--quit", action="store_true")
    args = p.parse_args(argv)

    workdir = Path(args.workdir).resolve()
    if "work" not in workdir.parts or "print-readiness" not in workdir.parts:
        raise SystemExit("refusing: --workdir must live under work/print-readiness/ (ruling 26)")

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[stage1b] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    # --- 1. markers ---------------------------------------------------------
    for num, letter in MARKERS:
        src = workdir / f"IndexList-{num}.indd"
        dst = workdir / f"IndexList[{letter}]{num}.indd"
        if dst.exists():
            print(f"[stage1b] marker {letter}: {dst.name} already exists — skipping")
            continue
        if not src.exists():
            raise SystemExit(f"[stage1b] missing {src.name} — run drive_stage1.py first")
        doc = app.Open(str(src))
        app.ScriptArgs.SetValue("marker", letter)
        out = app.DoScript(ADDMARKER_TWIN, ID_JAVASCRIPT)
        doc.Save()
        doc.Close(SAVE_OPTIONS_NO)
        rename_with_retry(src, dst)
        print(f"[stage1b] marker {letter}: {src.name} -> {dst.name} ({out})")

    # --- 2. receiver rename -------------------------------------------------
    recv = workdir / "IndexList[@]001.indd"
    a001 = workdir / "IndexList[a]001.indd"
    if not recv.exists():
        rename_with_retry(a001, recv)
        print(f"[stage1b] receiver: {a001.name} -> {recv.name}")

    # --- 3. merges ----------------------------------------------------------
    shim = app.DoScript(MERGE_SHIM, ID_JAVASCRIPT)
    print(f"[stage1b] merge alert shim: {shim}")
    for num, letter in MARKERS[1:]:
        donor = workdir / f"IndexList[{letter}]{num}.indd"
        rdoc = app.Open(str(recv))
        app.Open(str(donor))
        app.ActiveDocument = rdoc
        t0 = time.time()
        try:
            app.DoScript(str(MERGE_JSX), ID_JAVASCRIPT)
        except Exception as e:  # noqa: BLE001
            print(f"[stage1b] merge {letter}: raised {e}")
        alerts = app.DoScript(MERGE_READ, ID_JAVASCRIPT)
        rdoc.Save()
        while app.Documents.Count > 0:
            app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
        ok = "Таблица добавлена" in str(alerts)
        print(f"[stage1b] merge {letter}: {'OK' if ok else 'CHECK'} in {time.time()-t0:.0f}s; alerts: {alerts}")
        if not ok:
            raise SystemExit(f"[stage1b] merge {letter} did not confirm — stopping before further merges")

    if args.quit:
        app.Quit(SAVE_OPTIONS_NO)
    print("[stage1b] done: сводная таблица =", recv)
    return 0


if __name__ == "__main__":
    sys.exit(main())
