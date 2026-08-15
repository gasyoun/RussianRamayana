#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dump_indexlist.py — COM driver for dump_indexlist.jsx (H2776): read-only TSV dump
of an IndexList table (row, paragraph style, колонка A, колонка B).

Запуск:
    python dump_indexlist.py --target <IndexList.indd> --out <dump.tsv> [--quit]

_Автор инструмента: Dr. Mārcis Gasūns · создан 15-08-2026 (H2776)._
"""

import argparse
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ID_JAVASCRIPT = 1246973031
ID_NEVER_INTERACT = 1699640946
SAVE_OPTIONS_NO = 1852776480
JSX = Path(__file__).resolve().parent / "dump_indexlist.jsx"


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--quit", action="store_true")
    args = p.parse_args(argv)

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT
    app.ScriptArgs.SetValue("targetPath", str(Path(args.target).resolve()))
    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    app.ScriptArgs.SetValue("outPath", str(out_path))
    res = app.DoScript(str(JSX), ID_JAVASCRIPT)
    print(f"[dump_indexlist] {Path(args.target).name}: {res} -> {out_path}")
    if args.quit:
        app.Quit(SAVE_OPTIONS_NO)
    return 0


if __name__ == "__main__":
    sys.exit(main())
