#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drive_proc_number_lines.py — стадия [4] шаг 2: «Оформление номеров страниц в
указателе» (H2590), авторский `ProcNumberLines[3-4,6-8].jsx` через COM, тем же
методом, что уже проверен на `ProcStoryOrDoс`/`UseReadyTable` (H2589/H2776):
alert-шим в persistent engine `ProcNumberLine` + программный клик по
`myOKButon.onClick()` вместо ручного клика в палитре. Авторский .jsx НЕ меняется.

Простой прогон без «особого диапазона страниц» (полужирные ссылки примечаний
из §7.3 spec — `notes_bold_page_ranges` для книги II ещё не измерен, п.23
ruling: обратимый default, можно повторить позже с диапазонами, когда они
будут измерены).

Выделяет последнюю историю документа (сгенерированный «Сводный указатель»)
целиком перед запуском — скрипт требует непустого текстового выделения.

Запуск:
    python drive_proc_number_lines.py --target <pilot.indd> [--report <txt>] [--quit]
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

PROC_NUM_LINES_JSX = (
    Path(__file__).resolve().parents[2]
    / "#Indexing. Ramayana"
    / "[4. Оформление указателя]"
    / "[Оформление номеров страниц в указателе]"
    / "ProcNumberLines[3-4,6-8].jsx"
)

SHIM = (
    '#targetengine "ProcNumberLine"\r'
    "alert = function (m) { $.global.__alertLog = ($.global.__alertLog || \"\") + m + \" || \"; };\r"
    '"shim-ok"'
)
READ_ALERTS = '#targetengine "ProcNumberLine"\rvar r = $.global.__alertLog || ""; $.global.__alertLog = ""; r'

SELECT_LAST_STORY = """
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("IndexList") == -1) doc = app.documents[i];
if (doc == null) throw new Error("target doc not found");
var story = doc.stories.item(doc.stories.length - 1);
story.texts.item(0).select();
"selected|story=" + story.id + "|chars=" + story.characters.length;
"""

# ProcNumberLines' palette builds its UI at top-level script scope, then relies
# on app.doScript(procNums, ...) inside myOKButon.onClick -- clicking the
# button programmatically (not a real mouse click) triggers the exact same
# code path the human operator would, in the SAME persistent engine.
CLICK_PROCESS = (
    '#targetengine "ProcNumberLine"\r'
    'if (typeof myOKButon === "undefined") throw new Error("palette not loaded — run PROC_NUM_LINES_JSX first");\r'
    'myOKButon.onClick();\r'
    '"clicked"'
)

CHECK_AND_SAVE = """
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("IndexList") == -1) doc = app.documents[i];
doc.save();
var story = doc.stories.item(doc.stories.length - 1);
"saved|story_chars=" + story.characters.length + "|head=" + story.contents.substr(0, 300);
"""


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True)
    p.add_argument("--report")
    p.add_argument("--quit", action="store_true")
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    if "work" not in target.parts or "print-readiness" not in target.parts:
        raise SystemExit(f"refusing: {target} must live under work/print-readiness/ (ruling 26)")

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[proc-num-lines] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
    doc = app.Open(str(target))
    print(f"[proc-num-lines] opened: {doc.Name}")

    def do_jsx(code, label):
        f = Path(tempfile.gettempdir()) / f"h2590_procnum_{label}.jsx"
        f.write_bytes(b"\xef\xbb\xbf" + code.replace("\n", "\r\n").encode("utf-8"))
        return app.DoScript(str(f), ID_JAVASCRIPT)

    print("[proc-num-lines] select-last-story:", do_jsx(SELECT_LAST_STORY, "select"))
    print("[proc-num-lines] shim:", do_jsx(SHIM.replace("\r", "\n"), "shim"))

    t0 = time.time()
    app.DoScript(str(PROC_NUM_LINES_JSX), ID_JAVASCRIPT)
    print(f"[proc-num-lines] palette loaded ({time.time()-t0:.0f}s)")

    t0 = time.time()
    click_result = str(do_jsx(CLICK_PROCESS.replace("\r", "\n"), "click"))
    alerts = str(do_jsx(READ_ALERTS.replace("\r", "\n"), "readalerts"))
    print(f"[proc-num-lines] click+process finished in {(time.time()-t0)/60:.1f} min: {click_result} | alerts={alerts}")

    save_result = str(do_jsx(CHECK_AND_SAVE, "save"))
    print(f"[proc-num-lines] {save_result}")

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
    if args.quit:
        app.Quit(SAVE_OPTIONS_NO)

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(
            f"proc-number-lines run {time.strftime('%Y-%m-%d %H:%M:%S')}\ntarget: {target}\n"
            f"click_result: {click_result}\nalerts: {alerts}\n{save_result}\n",
            encoding="utf-8",
        )
        print(f"[proc-num-lines] report: {rp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
