#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drive_stage3.py — COM driver for MANUAL stage [3] «Индексирование» (H2776,
рулинг МГ 15-08-2026 «гони стадию [3]»).

Runs the AUTHORIAL ProcStoryOrDoс[09.10.2023].jsx unmodified. The script is a
ScriptUI palette living in persistent engine "StoryAndDoc"; its buttons are
plain function properties there, so after loading the palette we drive it from
the same engine: select the whole IndexList table → stGetData.onClick()
(готовит задание + цвета) → mode «Файл» (inDoc), «Удалить все имеющиеся записи
в индексе» is set by assigning startClearIndex.value=true (assignment does NOT
fire the confirm dialog; only a human click would) → theAction.onClick().
Alerts are shimmed into $.global.__alertLog beforehand.

Запуск:
    python drive_stage3.py --target <volume.indd> --indexlist <IndexList.indd>
        [--report <txt>] [--no-clear] [--quit]

_Автор инструмента: Dr. Mārcis Gasūns · создан 15-08-2026 (H2776)._
"""

import argparse
import sys
import tempfile
import time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ID_JAVASCRIPT = 1246973031
ID_NEVER_INTERACT = 1699640946
SAVE_OPTIONS_NO = 1852776480

HERE = Path(__file__).resolve().parent
BASE = HERE.parents[1]
PROC_JSX = BASE / "#Indexing. Ramayana" / "[3. Индексирование]" / "ProcStoryOrDoс[09.10.2023].jsx"  # «с» кириллическая

SHIM = (
    '#targetengine "StoryAndDoc"\r'
    "alert = function (m) { $.global.__alertLog = ($.global.__alertLog || \"\") + m + \" || \"; };\r"
    '"shim-ok"'
)
READ_ALERTS = '#targetengine "StoryAndDoc"\rvar r = $.global.__alertLog || ""; $.global.__alertLog = ""; r'

# Вся палитра создаётся ВНУТРИ myScriptWindow() — кнопки/флажки живут в её
# замыкании, не в engine-глобалах. Достаём их обходом ScriptUI-дерева myWin
# (само окно — engine-глобал) по видимым надписям; obj.onClick() дёргает
# замыкание со всем его состоянием (dataLines, getDataAction, ...).
FINDERS = """
function _walk(el, out) {
    if (el == null) return;
    var kids = el.children;
    if (kids == null) return;
    for (var i = 0; i < kids.length; i++) {
        out.push(kids[i]);
        _walk(kids[i], out);
    }
}
function _byText(txt) {
    var all = [];
    _walk(myWin, all);
    for (var i = 0; i < all.length; i++) {
        try { if (all[i].text == txt) return all[i]; } catch (e) {}
    }
    return null;
}
"""

PREPARE = ('#targetengine "StoryAndDoc"\n' + FINDERS + """
var idoc = null, tdoc = null;
for (var i = 0; i < app.documents.length; i++) {
    if (app.documents[i].name.indexOf("IndexList") != -1) idoc = app.documents[i];
    else tdoc = app.documents[i];
}
if (idoc == null || tdoc == null) throw new Error("need IndexList + target docs open");
app.activeDocument = idoc;
var tbl = null;
for (var s = 0; s < idoc.stories.length && tbl == null; s++)
    if (idoc.stories[s].tables.length > 0) tbl = idoc.stories[s].tables[0];
if (tbl == null) throw new Error("no table in IndexList doc");
tbl.select();
var btn = _byText("Подготовить задание на работу с текстом");
if (btn == null) throw new Error("stGetData button not found in palette tree");
$.global.__alertLog = "";
btn.onClick();
"prepared|rows=" + tbl.rows.length + "|alerts=" + ($.global.__alertLog || "");
""")

RUN = ('#targetengine "StoryAndDoc"\n' + FINDERS + """
var rbDoc = _byText("Файл");
var rbStory = _byText("Материал");
var cbClear = _byText("Удалить все имеющиеся записи в индексе");
var rbAdd1 = _byText("Добавить к имеющимся записям индекса новые");
var rbAdd2 = _byText("Очистить индекс и добавить в него выделенные записи");
var rbDel = _byText("Удалить из индекса выбранную запись");
var act = _byText("Обработать выбранный текст в соответствии с заданием");
if (act == null || rbDoc == null) throw new Error("palette controls not found");
rbDoc.value = true;
rbStory.value = false;
cbClear.value = %(clear)s; // присваивание НЕ вызывает confirm-диалог
var rbAdd = (rbAdd1 != null) ? rbAdd1 : rbAdd2;
rbAdd.value = true;
if (rbDel != null) rbDel.value = false;
act.enabled = true;
$.global.__alertLog = "";
act.onClick();
"action-done|alerts=" + ($.global.__alertLog || "");
""")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True, help="обрабатываемый .indd (pilot copy)")
    p.add_argument("--indexlist", required=True, help="IndexList[@]NNN.indd (сводная)")
    p.add_argument("--report", help="write run report here")
    p.add_argument("--no-clear", action="store_true", help="не удалять существующие записи индекса")
    p.add_argument("--quit", action="store_true")
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    ilist = Path(args.indexlist).resolve()
    for f in (target, ilist):
        if "work" not in f.parts or "print-readiness" not in f.parts:
            raise SystemExit(f"refusing: {f} must live under work/print-readiness/ (ruling 26)")

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[stage3] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)

    # Палитра при загрузке требует РОВНО ОДИН открытый документ (guard в её
    # преамбуле, строки 43-45) — обрабатываемый; IndexList открываем после,
    # как это делает операторская кнопка «Загрузить таблицу».
    app.Open(str(target))
    print(f"[stage3] opened target: {target.name}")

    def do_jsx(code, label):
        """DoScript(строка) с кириллицей/переводами строк нестабилен — пишем
        времянку UTF-8-BOM+CRLF и передаём путь."""
        f = Path(tempfile.gettempdir()) / f"h2776_stage3_{label}.jsx"
        f.write_bytes(b"\xef\xbb\xbf" + code.replace("\n", "\r\n").encode("utf-8"))
        return app.DoScript(str(f), ID_JAVASCRIPT)

    print("[stage3] shim:", do_jsx(SHIM.replace("\r", "\n"), "shim"))
    t0 = time.time()
    app.DoScript(str(PROC_JSX), ID_JAVASCRIPT)  # палитра загружена в engine
    print(f"[stage3] palette loaded ({time.time()-t0:.0f}s)")

    app.Open(str(ilist))
    print(f"[stage3] opened indexlist: {ilist.name}")

    t0 = time.time()
    prep = do_jsx(PREPARE, "prepare")
    print(f"[stage3] prepare ({time.time()-t0:.0f}s): {prep}")
    if "|dataLines=0" in str(prep):
        raise SystemExit("[stage3] task is EMPTY (dataLines=0) — inspect alerts above")

    t0 = time.time()
    run = do_jsx(RUN % {"clear": "false" if args.no_clear else "true"}, "run")
    dt = time.time() - t0
    print(f"[stage3] theAction finished in {dt/60:.1f} min: {str(run)[:400]}")

    # Сохраняем обработанный документ (авторский скрипт этого не делает).
    for i in range(1, app.Documents.Count + 1):
        d = app.Documents.Item(i)
        if d.Name == target.name:
            d.Save()
            print(f"[stage3] saved: {d.Name}")
    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
    if args.quit:
        app.Quit(SAVE_OPTIONS_NO)

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(
            f"stage3 run {time.strftime('%Y-%m-%d %H:%M:%S')}\ntarget: {target}\nindexlist: {ilist}\n"
            f"prepare: {prep}\naction ({dt/60:.1f} min): {run}\n",
            encoding="utf-8",
        )
        print(f"[stage3] report: {rp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
