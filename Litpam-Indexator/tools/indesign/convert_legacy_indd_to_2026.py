#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
convert_legacy_indd_to_2026.py -- one-time Save-As conversion for a pilot
.indd copy (H2590 rebuild). A plain filesystem copy of an InDesign
2022-format .indd (e.g. Ramayana_II_12.10.25.indd -> Ramayana_II_pilot_2026.indd)
opens in InDesign 2026 as a version-converted-in-memory document with NO
FullName -- Document.FullName throws "Unsaved documents have no full name."
A bare Document.save() call later (e.g. the checkpoint save spliced by
drive_stage3_chunked.py / drive_stage3_own_checkpointed.py) then fails with
the misleading raw COM error "User canceled this action." (InDesign's
NeverInteract auto-declining the implicit Save-As it needs). Root-caused
25-08-2026 during the H2590 book-II pilot rebuild after the original session's
gitignored work/ state was lost with a removed worktree -- prepare_workspace.py
(H2589) sidesteps this because it only copies READ-ONLY original packages, not
pilot working copies. Run this ONCE right after copying/renaming a pilot .indd,
before any stage3/stage4 driver touches it.

Запуск:
    python convert_legacy_indd_to_2026.py <path-to-pilot.indd>

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import win32com.client

ID_NEVER_INTERACT = 1699640946


def main():
    if len(sys.argv) < 2:
        raise SystemExit("usage: convert_legacy_indd_to_2026.py <path-to-pilot.indd>")
    target = Path(sys.argv[1]).resolve()

    app = win32com.client.Dispatch("InDesign.Application")
    print("connected", app.Name, app.Version)
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    opened = None
    for i in range(1, app.Documents.Count + 1):
        d = app.Documents.Item(i)
        if d.Name == target.name:
            opened = d
            break
    if opened is None:
        opened = app.Open(str(target))
        print("opened", target.name)

    try:
        fn = opened.FullName
        print("already has full name -- no conversion needed:", fn)
    except Exception:
        print("Save As ->", str(target))
        opened.Save(str(target))
        print("saved. full name now:", opened.FullName, "modified:", opened.Modified)


if __name__ == "__main__":
    main()
