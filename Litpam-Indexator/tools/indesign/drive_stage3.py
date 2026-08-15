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

# Регенерация: старый индекс 2025 сносится ЦЕЛИКОМ до прогона (авторская ветка
# «Удалить все имеющиеся записи» зовёт docIndex.update()/topics.everyItem().remove()
# на живом старом индексе — на нём COM-прогон падает Invalid parameter; после
# полного remove() theAction сам создаёт свежий индекс через indexes.add()).
PURGE = """#targetengine "StoryAndDoc"
var tdoc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("IndexList") == -1) tdoc = app.documents[i];
if (tdoc == null) throw new Error("target doc not found");
// Index не имеет remove() — вычищаем topics; update() старого индекса пропускаем.
var report = "indexes=" + tdoc.indexes.length;
if (tdoc.indexes.length > 0) {
    var ix = tdoc.indexes[0];
    var nt = ix.topics.length;
    try { ix.topics.everyItem().remove(); report += "|topicsRemoved=" + nt; }
    catch (e) {
        // поштучно с хвоста — устойчивее на битых topic-ссылках 2025 года
        var removed = 0;
        for (var t = ix.topics.length - 1; t >= 0; t--) {
            try { ix.topics[t].remove(); removed++; } catch (e2) {}
        }
        report += "|topicsRemovedOneByOne=" + removed + "|left=" + ix.topics.length;
    }
}
"purged|" + report;
"""

# InDesign-2026 DOM-регрессия: rows.everyItem().cells[0].contents возвращает
# ПЛОСКИЙ список ячеек (row0cell0, row0cell1, ...), поэтому авторский сбор букв
# в getDataAction обрывается на второй ячейке первой строки и letAr содержит
# только букву первой выделенной строки. Обход БЕЗ правки авторского кода:
# стадия [3] гонится четырьмя однобуквенными диапазонами — в каждом прогоне
# letAr = [своя буква], её цвет создаётся и все строки диапазона его получают.
SCAN = ('#targetengine "StoryAndDoc"\n' + """
var idoc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("IndexList") != -1) idoc = app.documents[i];
if (idoc == null) throw new Error("IndexList doc not open");
var tbl = null;
for (var s = 0; s < idoc.stories.length && tbl == null; s++)
    if (idoc.stories[s].tables.length > 0) tbl = idoc.stories[s].tables[0];
var n = tbl.rows.length;
var spans = [];
var cur = "", start = -1;
for (var r = 0; r < n; r++) {
    var t = String(tbl.rows[r].cells[0].texts[0].contents);
    var m = (t.length > 1 && t.charAt(1) == "-") ? t.charAt(0) : "?";
    if (m != cur) {
        if (cur != "") spans.push(cur + ":" + start + "-" + (r - 1));
        cur = m; start = r;
    }
}
if (cur != "") spans.push(cur + ":" + start + "-" + (n - 1));
spans.join(",");
""")

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
// rows.itemByRange().select() падает Invalid parameter в 2026 — выделяем тот же
// диапазон через плоскую коллекцию ячеек (rows у полученного Cell-выделения есть).
var nCols = tbl.columns.length;
tbl.cells.itemByRange(%(start)s * nCols, %(end)s * nCols + nCols - 1).select();
var btn = _byText("Подготовить задание на работу с текстом");
if (btn == null) throw new Error("stGetData button not found in palette tree");
$.global.__alertLog = "";
var verdict = "prepared";
try { btn.onClick(); }
catch (e) { verdict = "prepare-THREW|line=" + e.line + "|msg=" + e.message; }
verdict + "|range=%(start)s-%(end)s|alerts=" + ($.global.__alertLog || "");
""")

# Ещё одна DOM-регрессия 2026: rows.everyItem().cells[0].contents возвращает
# массив ПУСТЫХ строк, поэтому авторский сбор букв даёт letAr=[] и dataLines[*]
# остаются без .color (usedColorNames пуст) — прогон падает на строке 773
# (fillColor по несуществующему цвету). dataLines — engine-глобал: чиним его
# ПОСЛЕ prepare, ДО run — цвета предсоздаём по авторской палитре colorsRGB.
FIX_COLORS = ('#targetengine "StoryAndDoc"\n' + """
var tdoc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("IndexList") == -1 && app.documents[i].name.indexOf("pilot") != -1)
        tdoc = app.documents[i];
if (tdoc == null) throw new Error("pilot doc not found");
var letters = ["a", "b", "c", "d"];
var made = [], present = [];
for (var q = 0; q < letters.length; q++) {
    var L = letters[q];
    var cname = "IndexColor-" + L + "-[@]001";
    if (tdoc.colors.itemByName(cname).isValid) { present.push(cname); continue; }
    var r = 255, g = 0, b = 0;
    for (var c = 0; c < colorsRGB.length; c++)
        if (colorsRGB[c].letter == L) { r = colorsRGB[c].r; g = colorsRGB[c].g; b = colorsRGB[c].b; }
    tdoc.colors.add({ name: cname, model: ColorModel.SPOT, space: ColorSpace.RGB, colorValue: [Number(r), Number(g), Number(b)] });
    made.push(cname);
}
"colors|made=[" + made.join(",") + "]|present=[" + present.join(",") + "]";
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
cbClear.value = false; // старый индекс уже снесён PURGE-шагом целиком (%(clear)s)
var rbAdd = (rbAdd1 != null) ? rbAdd1 : rbAdd2;
rbAdd.value = true;
if (rbDel != null) rbDel.value = false;
act.enabled = true;
$.global.__alertLog = "";
var verdict = "action-done";
try { act.onClick(); }
catch (e) {
    verdict = "action-THREW|line=" + e.line + "|msg=" + e.message + "|file=" + (e.fileName || "?");
}
verdict + "|alerts=" + ($.global.__alertLog || "");
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

    if not args.no_clear:
        print("[stage3] purge:", do_jsx(PURGE, "purge"))

    spans_raw = str(do_jsx(SCAN, "scan"))
    print(f"[stage3] marker spans: {spans_raw}")
    spans = []
    for part in spans_raw.split(","):
        letter, _, rng = part.partition(":")
        s, _, e = rng.partition("-")
        if letter == "?":
            raise SystemExit(f"[stage3] unmarked rows in span {part} — inspect the svodnaya")
        spans.append((letter, int(s), int(e)))

    t_all = time.time()
    outcomes = []
    for letter, s, e in spans:
        t0 = time.time()
        prep = str(do_jsx(PREPARE % {"start": s, "end": e}, f"prepare_{letter}"))
        print(f"[stage3] prepare[{letter}] ({time.time()-t0:.0f}s): {prep[:200]}")
        if "THREW" in prep:
            raise SystemExit(f"[stage3] prepare[{letter}] failed — stopping before mutation")
        print(f"[stage3] fix-colors[{letter}]:", do_jsx(FIX_COLORS, f"fix_{letter}"))
        t0 = time.time()
        run = str(do_jsx(RUN % {"clear": "false"}, f"run_{letter}"))
        print(f"[stage3] run[{letter}] finished in {(time.time()-t0)/60:.1f} min: {run[:300]}")
        outcomes.append((letter, run))
        if "THREW" in run:
            raise SystemExit(f"[stage3] run[{letter}] failed — see report; earlier letters kept")
    dt = time.time() - t_all
    run = " ||| ".join(f"[{ltr}] {r}" for ltr, r in outcomes)
    prep = spans_raw
    print(f"[stage3] ALL letters done in {dt/60:.1f} min")

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
