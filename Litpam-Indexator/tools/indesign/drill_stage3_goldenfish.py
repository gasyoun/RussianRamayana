#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drill_stage3_goldenfish.py — обкатка drive_stage3.py на учебном примере Golden
Fish перед боевой стадией [3] (H2776). Готовит drill-workspace end-to-end:

  1. Golden Fish.idml → Golden Fish.indd (цель индексирования);
  2. IndexList из Slovnik-TSV: build_indexlist_table.jsx → авторский
     UseReadyTable.v.7.jsx (shim в его engine) → IndexList-001.indd;
  3. drive_stage3.main() на этой паре (без маркеров — одиночный IndexList).

Запуск: python drill_stage3_goldenfish.py  (после prep_goldenfish_drill.py)

_Автор инструмента: Dr. Mārcis Gasūns · создан 15-08-2026 (H2776)._
"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import drive_stage3  # noqa: E402

ID_JAVASCRIPT = 1246973031
ID_NEVER_INTERACT = 1699640946
SAVE_OPTIONS_NO = 1852776480

HERE = Path(__file__).resolve().parent
BASE = HERE.parents[1]
WD = BASE / "work" / "print-readiness" / "drill-goldenfish"
BUILD_JSX = HERE / "build_indexlist_table.jsx"
USE_READY = BASE / "#Indexing. Ramayana" / "[1. Подготовка таблиц]" / "UseReadyTable.v.7.jsx"

SHIM = (
    '#targetengine "UseReadyTable"\r'
    "alert = function (m) { $.global.__alertLog = ($.global.__alertLog || \"\") + m + \" || \"; };\r"
    '"shim-ok"'
)
READ = '#targetengine "UseReadyTable"\rvar r = $.global.__alertLog || ""; $.global.__alertLog = ""; r'


def main():
    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[drill] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT
    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)

    target_indd = WD / "Golden Fish.indd"
    if not target_indd.exists():
        d = app.Open(str(WD / "Golden Fish.idml"))
        d.Save(str(target_indd))
        d.Close(SAVE_OPTIONS_NO)
        print("[drill] Golden Fish.idml -> .indd")

    ilist = WD / "IndexList-001.indd"
    if not ilist.exists():
        print("[drill] shim:", app.DoScript(SHIM, ID_JAVASCRIPT))
        src = WD / "Source-goldenfish.indd"
        if src.exists():
            src.unlink()
        app.ScriptArgs.SetValue("tsvPath", str(WD / "src-goldenfish.tsv"))
        app.ScriptArgs.SetValue("saveAsPath", str(src))
        print("[drill] table:", app.DoScript(str(BUILD_JSX), ID_JAVASCRIPT))
        t0 = time.time()
        try:
            app.DoScript(str(USE_READY), ID_JAVASCRIPT)
        except Exception as e:  # noqa: BLE001
            print(f"[drill] UseReadyTable raised: {e}")
        print(f"[drill] UseReadyTable {time.time()-t0:.0f}s; alerts: {app.DoScript(READ, ID_JAVASCRIPT)}")
        while app.Documents.Count > 0:
            app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
        if not ilist.exists():
            raise SystemExit("[drill] IndexList-001.indd not produced")

    return drive_stage3.main(
        [
            "--target", str(target_indd),
            "--indexlist", str(ilist),
            "--report", str(WD / "stage3-drill-report.txt"),
        ]
    )


if __name__ == "__main__":
    sys.exit(main())
