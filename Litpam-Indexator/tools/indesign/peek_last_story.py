#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
peek_last_story.py -- prints every paragraph of the pilot doc's last story
(Сводный указатель) whose text contains a given substring, or the first N
long paragraphs if no substring is given (H2590 rebuild verification aid).

Запуск:
    python peek_last_story.py [needle] [--limit N]

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import sys
import tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import win32com.client

ID_JAVASCRIPT = 1246973031

needle = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else ""
limit = 25

JSX = r"""
var needle = "__NEEDLE__";
var limit = __LIMIT__;
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
var story = doc.stories[doc.stories.length - 1];
var out = [];
var shown = 0;
for (var p = 0; p < story.paragraphs.length && shown < limit; p++) {
    var txt = String(story.paragraphs[p].contents);
    if (needle == "" ? txt.length > 40 : txt.indexOf(needle) != -1) {
        out.push(p + "\t" + txt.replace(/\r/g, "\\r"));
        shown++;
    }
}
out.join("\n");
"""

app = win32com.client.Dispatch("InDesign.Application")
jsx = JSX.replace("__NEEDLE__", needle).replace("__LIMIT__", str(limit))
f = Path(tempfile.gettempdir()) / "h2590_peek_last_story.jsx"
f.write_bytes(b"\xef\xbb\xbf" + jsx.replace("\n", "\r\n").encode("utf-8"))
res = app.DoScript(str(f), ID_JAVASCRIPT)
print(res)
