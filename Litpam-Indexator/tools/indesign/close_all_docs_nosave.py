#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
close_all_docs_nosave.py -- recovery utility (H2590 rebuild). Closes every
document open in the running InDesign COM instance without saving, so a
subsequent driver script (drive_stage3_chunked.py etc.) opens each target
fresh instead of colliding with a stale/partially-edited document left open
by a previous failed run. Never overwrites the on-disk .indd -- only discards
in-memory unsaved edits.

Запуск:
    python close_all_docs_nosave.py

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import win32com.client

SAVE_OPTIONS_NO = 1852776480


def main():
    app = win32com.client.Dispatch("InDesign.Application")
    print("connected", app.Name, app.Version)
    while app.Documents.Count > 0:
        d = app.Documents.Item(1)
        print("closing", d.Name)
        d.Close(SAVE_OPTIONS_NO)
    print("docs open now:", app.Documents.Count)


if __name__ == "__main__":
    main()
