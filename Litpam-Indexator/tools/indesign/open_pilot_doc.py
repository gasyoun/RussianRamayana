#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
open_pilot_doc.py -- opens a .indd in the running InDesign COM instance if
not already open (H2590 rebuild). Small reusable helper so ad-hoc
verification/replay scripts in this rebuild don't each need their own
inline open-if-needed boilerplate.

Запуск:
    python open_pilot_doc.py <path.indd>

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import win32com.client


def main():
    if len(sys.argv) < 2:
        raise SystemExit("usage: open_pilot_doc.py <path.indd>")
    target = Path(sys.argv[1]).resolve()
    app = win32com.client.Dispatch("InDesign.Application")
    print("connected", app.Name, app.Version)
    opened = {app.Documents.Item(i).Name for i in range(1, app.Documents.Count + 1)}
    if target.name in opened:
        print("already open:", target.name)
    else:
        app.Open(str(target))
        print("opened:", target.name)


if __name__ == "__main__":
    main()
