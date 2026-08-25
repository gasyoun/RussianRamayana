#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
insert_null_anchor_see_ref.py -- handles the one SEE_REFS_INSERTIONS_v2.json
entry whose anchor_topic is null (H2590 rebuild): "шудры см. варны", section
c -- alphabetically last alias in its section, so there is no following
topic to anchor before. Inserted as the last paragraph of section c, i.e.
immediately before section d's header paragraph. Kept as its own tiny script
(rather than folded into stage4_replay_see_refs.py) since it is a one-off
positional rule, not a name-based lookup like the other 114.

Запуск:
    python insert_null_anchor_see_ref.py --target <pilot.indd> --before-header "<d-section title>" --line "шудры см. варны"

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import argparse
import sys
import tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ID_JAVASCRIPT = 1246973031

JSX_TEMPLATE = r"""
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
var story = doc.stories[doc.stories.length - 1];
var target = "__BEFORE_HEADER__";
var line = "__LINE__";
var inserted = false;
for (var p = 0; p < story.paragraphs.length; p++) {
    if (story.paragraphs[p].appliedParagraphStyle.name == "Общее название указателя" &&
        String(story.paragraphs[p].contents).indexOf(target) == 0) {
        story.paragraphs[p].insertionPoints[0].contents = line + "\r";
        inserted = true;
        break;
    }
}
doc.save();
"inserted=" + inserted + "|storyLength=" + story.length + "|paragraphs=" + story.paragraphs.length;
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--target", required=True)
    ap.add_argument("--before-header", required=True)
    ap.add_argument("--line", required=True)
    args = ap.parse_args()

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print("connected", app.Name, app.Version)
    jsx = JSX_TEMPLATE.replace("__BEFORE_HEADER__", args.before_header).replace("__LINE__", args.line)
    f = Path(tempfile.gettempdir()) / "h2590_insert_null_anchor.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + jsx.replace("\n", "\r\n").encode("utf-8"))
    res = app.DoScript(str(f), ID_JAVASCRIPT)
    print(res)


if __name__ == "__main__":
    main()
