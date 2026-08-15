#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
resolve_overset.py — COM driver for resolve_overset.jsx (H2776, step-6 pilot prep).

Opens the pilot working copy (NEVER a 2025 original — the path must live under
Litpam-Indexator/work/print-readiness/), optionally saves it under a new versioned
name first, runs resolve_overset.jsx in report mode, then (with --fix) in fix mode
(threading pasteboard extension frames into the waived overset stories), re-reports,
and saves the document. The MANUAL stages [1]/[3] refuse to run while any story
overflows; this clears that guard without touching page geometry or deleting text.

Запуск:
    python resolve_overset.py --target <pilot.indd> [--save-as <versioned.indd>]
        [--fix] [--story-ids 2019,2085,12223] --report <report.txt> [--quit]

_Автор инструмента: Dr. Mārcis Gasūns · создан 15-08-2026 (H2776)._
"""

import argparse
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ID_JAVASCRIPT = 1246973031  # idScriptLanguage.idJavascript (from InDesign's own .tlb)
ID_NEVER_INTERACT = 1699640946  # idUserInteractionLevels.idNeverInteract
SAVE_OPTIONS_NO = 1852776480  # idSaveOptions.idNo — explicit doc.Save() is used instead of Close(idYes)

JSX = Path(__file__).resolve().parent / "resolve_overset.jsx"


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True, help="pilot .indd under work/print-readiness/")
    p.add_argument("--save-as", help="save the opened doc under this versioned name first")
    p.add_argument("--fix", action="store_true", help="thread pasteboard extension frames (mutates the pilot copy)")
    p.add_argument("--story-ids", default="", help="comma-separated numeric story ids to fix; empty = all overflowing")
    p.add_argument("--report", required=True, help="report txt path")
    p.add_argument("--quit", action="store_true")
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    if "work" not in target.parts or "print-readiness" not in target.parts:
        raise SystemExit(
            "refusing: --target must be a working copy under Litpam-Indexator/work/print-readiness/ "
            "(the 2025 originals are fenced, ruling 26)"
        )

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[resolve_overset] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    doc = app.Open(str(target))
    print(f"[resolve_overset] opened: {target}")
    if args.save_as:
        save_as = Path(args.save_as).resolve()
        save_as.parent.mkdir(parents=True, exist_ok=True)
        doc.Save(str(save_as))
        print(f"[resolve_overset] saved versioned pilot copy: {save_as}")

    report_path = Path(args.report).resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)

    def run_jsx(mode, rpath):
        app.ScriptArgs.SetValue("mode", mode)
        app.ScriptArgs.SetValue("storyIds", args.story_ids)
        app.ScriptArgs.SetValue("reportPath", str(rpath))
        out = app.DoScript(str(JSX), ID_JAVASCRIPT)
        print(f"[resolve_overset] jsx ({mode}):\n{out}")
        return str(out)

    pre = run_jsx("report", str(report_path.with_suffix(".pre.txt")))
    if args.fix:
        run_jsx("fix", str(report_path))
        post = run_jsx("report", str(report_path.with_suffix(".post.txt")))
        doc.Save()
        doc.Close(SAVE_OPTIONS_NO)
        print("[resolve_overset] document saved and closed (pilot copy)")
        still = "OVERSET_STORY" in post
        if still:
            print("[resolve_overset] WARNING: stories still overset after fix — see post report")
    else:
        doc.Close(SAVE_OPTIONS_NO)
        print("[resolve_overset] document closed without saving (report-only)")
        still = "OVERSET_STORY" in pre

    if args.quit:
        app.Quit(SAVE_OPTIONS_NO)
        print("[resolve_overset] application quit")
    return 1 if (args.fix and still) else 0


if __name__ == "__main__":
    sys.exit(main())
