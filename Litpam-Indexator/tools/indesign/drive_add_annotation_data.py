#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drive_add_annotation_data.py -- stage[4] "AddAnnotationData" (H2590 rebuild,
the one genuinely new remaining item -- никакая предыдущая сессия его не
делала). Drives the authorial AddAnnotationData.v.3.jsx palette headlessly,
same method already proven in this codebase for UseReadyTable.v.7.jsx
(drive_stage1.py) and ProcNumberLines[3-4,6-8].jsx (drive_proc_number_lines.py):
load the script into its own #targetengine, then call its onClick handlers
directly instead of a real mouse click. Uses the "defaultView" branch --
"Аннотационные сведения оформляются установками указателя" -- no surrounding
dash/bracket markers, matching config §7.1's plain "headword annotation.
locators" printed convention (INDEX_STYLE_SPEC.md §7.1).

Two documents must be open when the palette's action fires: the pilot .indd
(cursor as an InsertionPoint inside the Сводный указатель story) and a
2-column term/annotation table doc (cursor as an InsertionPoint inside its
first cell) -- built here via the already-proven build_indexlist_table.jsx
(H2776) from a term<TAB>annotation TSV (build_annotation_source_tsv.py).

Запуск:
    python drive_add_annotation_data.py --target <pilot.indd> --tsv <annotations.tsv> [--report <txt>]

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import argparse
import sys
import tempfile
import time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)

ID_JAVASCRIPT = 1246973031
ID_NEVER_INTERACT = 1699640946
SAVE_OPTIONS_NO = 1852776480

HERE = Path(__file__).resolve().parent
BUILD_TABLE_JSX = HERE / "build_indexlist_table.jsx"
ADD_ANNOTATION_JSX = (
    Path(__file__).resolve().parents[2]
    / "#Indexing. Ramayana"
    / "[4. Оформление указателя]"
    / "[Добавление аннотированных данных]"
    / "AddAnnotationData.v.3.jsx"
)

SHIM = (
    '#targetengine "AddAnnotationData"\r'
    "alert = function (m) { $.global.__alertLog = ($.global.__alertLog || \"\") + m + \" || \"; };\r"
    '"shim-ok"'
)
READ_ALERTS = '#targetengine "AddAnnotationData"\rvar r = $.global.__alertLog || ""; $.global.__alertLog = ""; r'

SELECT_PILOT_INSERTION = """
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
if (doc == null) throw new Error("pilot doc not open");
var story = doc.stories.item(doc.stories.length - 1);
story.insertionPoints.item(0).select();
"selected|doc=" + doc.name + "|story=" + story.id;
"""

RESELECT_TABLE_INSERTION = """
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("AnnotationTable") != -1) doc = app.documents[i];
if (doc == null) throw new Error("annotation table doc not open");
var tbl = doc.stories.item(0).tables.item(0);
tbl.rows.item(0).cells.item(0).texts.item(0).insertionPoints.item(0).select();
"selected|doc=" + doc.name + "|rows=" + tbl.rows.length;
"""

CLICK_IN_LIST = (
    '#targetengine "AddAnnotationData"\r'
    'if (typeof inList === "undefined") throw new Error("palette not loaded");\r'
    "inList.onClick();\r"
    '"inList.value=" + inList.value + "|inList.text=" + inList.text;'
)

CLICK_IN_TABLE = (
    '#targetengine "AddAnnotationData"\r'
    "inTable.onClick();\r"
    '"inTable.value=" + inTable.value + "|inTable.text=" + inTable.text + "|termins=" + termins.length;'
)

SET_DEFAULT_VIEW_AND_ACTION = (
    '#targetengine "AddAnnotationData"\r'
    "defaultView.value = true;\r"
    "defaultView.onClick();\r"
    "action.onClick();\r"
    '"action-done|action.enabled=" + action.enabled;'
)

CHECK_AND_SAVE = """
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
doc.save();
var story = doc.stories.item(doc.stories.length - 1);
"saved|story_chars=" + story.characters.length + "|paragraphs=" + story.paragraphs.length;
"""


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True)
    p.add_argument("--tsv", required=True)
    p.add_argument("--table-save-as", default=None)
    p.add_argument("--report")
    p.add_argument("--quit", action="store_true")
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    if "work" not in target.parts or "print-readiness" not in target.parts:
        raise SystemExit(f"refusing: {target} must live under work/print-readiness/ (ruling 26)")
    tsv = Path(args.tsv).resolve()
    table_save_as = Path(args.table_save_as).resolve() if args.table_save_as else target.parent / "AnnotationTable.indd"

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[add-annot] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)

    def do_jsx(code, label):
        f = Path(tempfile.gettempdir()) / f"h2590_addannot_{label}.jsx"
        f.write_bytes(b"\xef\xbb\xbf" + code.replace("\n", "\r\n").encode("utf-8"))
        return app.DoScript(str(f), ID_JAVASCRIPT)

    app.ScriptArgs.SetValue("tsvPath", str(tsv))
    app.ScriptArgs.SetValue("saveAsPath", str(table_save_as))
    build_res = str(app.DoScript(str(BUILD_TABLE_JSX), ID_JAVASCRIPT))
    print(f"[add-annot] annotation table built: {build_res}")

    doc = app.Open(str(target))
    print(f"[add-annot] opened pilot: {doc.Name}")

    print("[add-annot] select-pilot-insertion:", do_jsx(SELECT_PILOT_INSERTION, "select_pilot"))
    print("[add-annot] shim:", do_jsx(SHIM.replace("\r", "\n"), "shim"))

    t0 = time.time()
    app.DoScript(str(ADD_ANNOTATION_JSX), ID_JAVASCRIPT)
    print(f"[add-annot] palette loaded ({time.time()-t0:.0f}s)")

    print("[add-annot] click inList:", do_jsx(CLICK_IN_LIST.replace("\r", "\n"), "in_list"))
    print("[add-annot] reselect table insertion:", do_jsx(RESELECT_TABLE_INSERTION, "select_table"))
    print("[add-annot] click inTable:", do_jsx(CLICK_IN_TABLE.replace("\r", "\n"), "in_table"))

    t0 = time.time()
    action_res = str(do_jsx(SET_DEFAULT_VIEW_AND_ACTION.replace("\r", "\n"), "action"))
    alerts = str(do_jsx(READ_ALERTS.replace("\r", "\n"), "readalerts"))
    print(f"[add-annot] action finished in {(time.time()-t0)/60:.1f} min: {action_res} | alerts={alerts}")

    save_result = str(do_jsx(CHECK_AND_SAVE, "save"))
    print(f"[add-annot] {save_result}")

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
    if args.quit:
        app.Quit(SAVE_OPTIONS_NO)

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(
            f"add-annotation-data run {time.strftime('%Y-%m-%d %H:%M:%S')}\ntarget: {target}\ntsv: {tsv}\n"
            f"build_res: {build_res}\naction_res: {action_res}\nalerts: {alerts}\n{save_result}\n",
            encoding="utf-8",
        )
        print(f"[add-annot] report: {rp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
