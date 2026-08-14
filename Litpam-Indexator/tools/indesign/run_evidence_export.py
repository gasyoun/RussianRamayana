#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_evidence_export.py — COM driver for export_print_evidence.jsx (H2589 Step 4/5).

Drives whichever InDesign version the machine's generic "InDesign.Application"
COM ProgID currently resolves to (the most-recently-installed/registered version —
confirmed on this machine to be InDesign 2026; InDesign 2022 registers NO distinct
COM ProgID here, so it cannot be driven this way — see PLAN doc's H2589 PR
description for that environment finding and the baseline adaptation it required).

Opens target_path read-only-in-intent (never calls Document.save), sets scriptArgs,
runs export_print_evidence.jsx via DoScript, and closes the document WITHOUT saving.
The idJavascript enum value (1246973031) was read directly out of InDesign's own
registered type library (`Resources for Visual Basic.tlb`), not guessed.

Запуск:
    python run_evidence_export.py --target <indd-or-idml> --output-dir <dir> --base-name <name>
        [--save-as <new-versioned-path>] [--pdf-preset "[High Quality Print]"] [--quit]

_Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589).
"""

import argparse
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ID_JAVASCRIPT = 1246973031  # idScriptLanguage.idJavascript, read from InDesign's own .tlb
ID_NEVER_INTERACT = 1699640946  # idUserInteractionLevels.idNeverInteract, read from InDesign's own .tlb


def run(target_path, output_dir, base_name, script_path, save_as=None, pdf_preset="[High Quality Print]", quit_app=False):
    import win32com.client

    target_path = Path(target_path).resolve()
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    script_path = Path(script_path).resolve()

    app = win32com.client.Dispatch("InDesign.Application")
    app_version = app.Version
    print(f"[run_evidence_export] connected: {app.Name} {app_version}")

    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT
    print("[run_evidence_export] UserInteractionLevel set to idNeverInteract (no modal dialogs)")

    doc = app.Open(str(target_path))
    print(f"[run_evidence_export] opened: {target_path}")

    save_as_path = None
    if save_as:
        save_as_path = Path(save_as).resolve()
        save_as_path.parent.mkdir(parents=True, exist_ok=True)
        doc.Save(str(save_as_path))
        print(f"[run_evidence_export] saved conversion-only copy: {save_as_path}")

    app.ScriptArgs.SetValue("outputDir", str(output_dir))
    app.ScriptArgs.SetValue("baseName", base_name)
    app.ScriptArgs.SetValue("pdfPreset", pdf_preset)

    report_path_from_script = app.DoScript(str(script_path), ID_JAVASCRIPT)
    print(f"[run_evidence_export] jsx returned: {report_path_from_script}")

    SAVE_OPTIONS_NO = 1852776480  # idSaveOptions.idNo, read from InDesign's own .tlb — never save the original doc on close
    doc.Close(SAVE_OPTIONS_NO)
    print("[run_evidence_export] document closed without saving")

    if quit_app:
        app.Quit(SAVE_OPTIONS_NO)
        print("[run_evidence_export] application quit")

    report_path = output_dir / f"{base_name}.report.txt"
    return {
        "app_version": app_version,
        "target_path": str(target_path).replace("\\", "/"),
        "save_as_path": str(save_as_path).replace("\\", "/") if save_as_path else None,
        "report_path": str(report_path).replace("\\", "/"),
    }


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True)
    p.add_argument("--output-dir", required=True)
    p.add_argument("--base-name", required=True)
    p.add_argument(
        "--script",
        default=str(Path(__file__).resolve().parent / "export_print_evidence.jsx"),
    )
    p.add_argument("--save-as", help="if given, Save As this path immediately after opening (conversion-only resave)")
    p.add_argument("--pdf-preset", default="[High Quality Print]")
    p.add_argument("--quit", action="store_true", help="quit the InDesign application after export")
    args = p.parse_args(argv)

    result = run(
        args.target,
        args.output_dir,
        args.base_name,
        args.script,
        save_as=args.save_as,
        pdf_preset=args.pdf_preset,
        quit_app=args.quit,
    )
    print(result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
