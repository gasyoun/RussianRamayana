#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
stage4_strip_letter_prefixes.py -- stage[4] step 5 (H2590 rebuild): removes
the internal a-/b-/c-/d- service prefixes InDesign's Index model needs
(unique-per-letter-section topic names) but the print contract forbids
(§7.6: "ни одного служебного префикса a-...d- в печати"). The original
19-08-2026 session found HideShowNumber.v.2.jsx targets a DIFFERENT pattern
(trailing homonym disambiguator numbers, not leading letter markers) and used
a document-wide GREP find/change instead -- reused verbatim here, since it's
a native, well-tested InDesign feature operating on the whole story at once
(not a custom paragraph-index loop, so none of the index-staleness class of
bug from the headers step applies).

Запуск:
    python stage4_strip_letter_prefixes.py --target <pilot.indd> [--report <txt>]

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

JSX = r"""
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
if (doc == null) throw new Error("pilot doc not open");
var story = doc.stories[doc.stories.length - 1];

var before = story.length;
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findChangeGrepOptions.includeFootnotes = false;
app.findGrepPreferences.findWhat = "^[abcd]-";
app.changeGrepPreferences.changeTo = "";
var found = story.findGrep();
var count = found.length;
story.changeGrep();
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;

doc.save();
"matches=" + count + "|storyLengthBefore=" + before + "|storyLengthAfter=" + story.length +
    "|paragraphs=" + story.paragraphs.length;
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--target", required=True)
    ap.add_argument("--report")
    args = ap.parse_args()

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[strip-prefixes] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    target = Path(args.target).resolve()
    opened = {app.Documents.Item(i).Name for i in range(1, app.Documents.Count + 1)}
    if target.name not in opened:
        app.Open(str(target))
        print("[strip-prefixes] opened:", target.name)

    f = Path(tempfile.gettempdir()) / "h2590_strip_prefixes.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + JSX.replace("\n", "\r\n").encode("utf-8"))
    t0 = time.time()
    res = str(app.DoScript(str(f), ID_JAVASCRIPT))
    print(f"[strip-prefixes] finished in {(time.time()-t0):.1f}s: {res}")

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(f"stage4_strip_letter_prefixes run {time.strftime('%Y-%m-%d %H:%M:%S')}\n{res}\n", encoding="utf-8")
        print("[strip-prefixes] report:", rp)


if __name__ == "__main__":
    main()
