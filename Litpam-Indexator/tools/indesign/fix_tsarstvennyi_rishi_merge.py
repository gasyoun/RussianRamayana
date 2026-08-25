#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_tsarstvennyi_rishi_merge.py -- manual completion of the one
HOMONYM_MERGE_PLAN.json group stage4_replay_homonym_merge.py cannot match
automatically (H2590 rebuild): "царственный риши" has 8 "=N"-suffixed
variants in the original plan, but this rebuild's InDesign auto-
uniquification renders the 8th as "царственный риши (мудрец)" instead of
"=7" -- same page locator ("21") as the other 7, confirmed by direct
inspection before merging. Reusable in case a future rebuild hits the exact
same InDesign auto-naming choice again.

Запуск:
    python fix_tsarstvennyi_rishi_merge.py --target <pilot.indd>

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import argparse
import sys
import tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ID_JAVASCRIPT = 1246973031

JSX = r"""
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
var story = doc.stories[doc.stories.length - 1];
var matches = [];
for (var p = 0; p < story.paragraphs.length; p++) {
    var txt = String(story.paragraphs[p].contents);
    if (txt.indexOf("царственный риши") == 0) matches.push(story.paragraphs[p]);
}
var report = "found=" + matches.length;
if (matches.length == 8) {
    matches[0].contents = "царственный риши  21\r";
    for (var m = matches.length - 1; m >= 1; m--) matches[m].remove();
    report += "|merged=true";
} else {
    report += "|merged=false (expected 8)";
}
doc.save();
report + "|storyLength=" + story.length + "|paragraphs=" + story.paragraphs.length;
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--target", required=True)
    args = ap.parse_args()

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print("connected", app.Name, app.Version)
    f = Path(tempfile.gettempdir()) / "h2590_fix_tsarstvennyi.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + JSX.replace("\n", "\r\n").encode("utf-8"))
    res = app.DoScript(str(f), ID_JAVASCRIPT)
    print(res)


if __name__ == "__main__":
    main()
