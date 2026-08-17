#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_index.py — стадия [4] шаг 1: «Построить указатель» (H2590), нативный
InDesign Index.generate() через COM вместо клика по панели «Указатель». Метод
и сигнатура подтверждены рефлексией живого API (idx.reflect.methods) и внешней
документацией ExtendScript API — не авторский скрипт, native InDesign feature.

Добавляет новую страницу В КОНЕЦ документа (после всего существующего
контента, включая старый указатель 2025 года — ruling 26 фence: оригинальные
страницы не трогаем) и генерирует индекс туда с autoflowing=true (InDesign сам
создаёт следующие страницы по мере необходимости). Не удаляет и не двигает
ничего существующего — чисто additive шаг. Замена старых страниц указателя на
новые — отдельное редакционное решение после проверки контента.

Запуск:
    python generate_index.py --target <pilot.indd> [--report <txt>] [--quit]
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

GENERATE_JSX = """
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("IndexList") == -1) doc = app.documents[i];
if (doc == null) throw new Error("target doc not found");

var idx = doc.indexes.item(0);
var beforePages = doc.pages.length;

var newPage = doc.pages.add(LocationOptions.AT_END);
// Confirmed via incremental testing (H2590): generate(page) / generate(page,point) /
// generate(page,point,layer) all succeed quickly; the 4th arg (autoflowing=true) is
// where real content-layout work happens (matches MANUAL's ~4 min estimate for
// "Построить указатель") -- NOT an error, just legitimately slow.
var story = idx.generate(newPage, [newPage.marginPreferences.left, newPage.marginPreferences.top], doc.layers.item(0), true, false);

doc.save();

// Read story properties defensively -- an earlier attempt threw "undefined is not
// an object" somewhere after a successful generate(), plausibly from an untested
// property name here rather than from generate() itself.
var afterPages = "?", storyLen = "?", frameCount = "?";
try { afterPages = doc.pages.length; } catch (eP) { afterPages = "ERR:" + eP.message; }
try { storyLen = story.length; } catch (eL) { storyLen = "ERR:" + eL.message; }
try { frameCount = story.textContainers.length; } catch (eF) { frameCount = "ERR:" + eF.message; }

"generated|pages_before=" + beforePages + "|pages_after=" + afterPages +
    "|story_length=" + storyLen + "|story_frames=" + frameCount;
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
    print(f"[generate-index] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
    doc = app.Open(str(target))
    print(f"[generate-index] opened: {doc.Name}")

    f = Path(tempfile.gettempdir()) / "h2590_generate_index.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + GENERATE_JSX.replace("\n", "\r\n").encode("utf-8"))

    t0 = time.time()
    result = str(app.DoScript(str(f), ID_JAVASCRIPT))
    print(f"[generate-index] finished in {(time.time()-t0)/60:.1f} min: {result}")

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
    if args.quit:
        app.Quit(SAVE_OPTIONS_NO)

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(
            f"generate-index run {time.strftime('%Y-%m-%d %H:%M:%S')}\ntarget: {target}\nresult: {result}\n",
            encoding="utf-8",
        )
        print(f"[generate-index] report: {rp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
