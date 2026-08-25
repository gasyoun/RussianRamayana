#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
stage4_headers_splitstory.py -- stage[4] "Сборка и оформление" step 3+4
combined (H2590 rebuild), reusable replay of the 19-08-2026 продолжение
1+2+3 narrative:

1. SplitStory-equivalent: each of the 4 native "Index Section Head"
   single-letter paragraphs (A/B/C/D, already inserted by Index.generate()
   at the a-/b-/c-/d- topic-name boundaries) gets startParagraph =
   StartParagraph.NEXT_PAGE, its text replaced with the matching
   config/print-readiness.json indexes_order title (sentence case, as
   printed in the 2025 original), and its style changed to "Общее название
   указателя". The paragraph immediately after each header is reset to
   startParagraph = ANYWHERE (undoes nothing on a fresh rebuild, kept for
   parity/idempotency with the original session which needed it as a
   correction).
2. The native auto-inserted "Сводный указатель" (para[0], style
   "Колонтитул") paragraph is removed -- not part of the print contract,
   which specifies 4 separate section headers, not one umbrella title
   (MG ruling 19-08-2026).

Purely presentational: no topic/page-reference data is touched. Verify with
dump_topic_pages.py + analyze_topic_pages.py before/after -- the page-set
per topic must be unchanged.

Запуск:
    python stage4_headers_splitstory.py --target <pilot.indd> --config <print-readiness.json> [--report <txt>]

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import argparse
import json
import sys
import tempfile
import time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)

ID_JAVASCRIPT = 1246973031
ID_NEVER_INTERACT = 1699640946
SAVE_OPTIONS_NO = 1852776480


def sentence_case(s):
    s = s.strip()
    if not s:
        return s
    return s[0].upper() + s[1:].lower()


JSX_TEMPLATE = r"""
var titles = __TITLES__;
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
if (doc == null) throw new Error("pilot doc not open");
var story = doc.stories[doc.stories.length - 1];

// remove native auto "Сводный указатель" header if present as first paragraph
var removedSvodnaya = false;
if (story.paragraphs.length > 0) {
    var p0 = story.paragraphs[0];
    if (p0.appliedParagraphStyle.name == "Колонтитул" && String(p0.contents).indexOf("Сводный указатель") == 0) {
        p0.remove();
        removedSvodnaya = true;
    }
}

var headerStyle = doc.paragraphStyles.itemByName("Общее название указателя");
if (!headerStyle.isValid) throw new Error('paragraph style "Общее название указателя" not found');

// Capture live paragraph OBJECT REFERENCES (not indices -- indices go stale
// the moment an earlier header's .contents write changes that paragraph's
// character count, which shifts every later index by however much the new
// title text differs in length from the single letter it replaces; a fixed
// index captured before any edit then points at the wrong paragraph for
// header 2+, silently corrupting whatever body text happens to sit there.
// Object references stay bound to the same paragraph across such edits).
var headerParas = [];
for (var p = 0; p < story.paragraphs.length; p++) {
    if (story.paragraphs[p].appliedParagraphStyle.name == "Index Section Head") {
        headerParas.push(story.paragraphs[p]);
    }
}
if (headerParas.length != titles.length)
    throw new Error("expected " + titles.length + " Index Section Head paragraphs, found " + headerParas.length);

var headed = 0;
for (var h = 0; h < headerParas.length; h++) {
    // .contents replaces the WHOLE paragraph range including its trailing
    // paragraph mark when the assigned string has none -- that silently
    // MERGES this paragraph with the next one (H2590 rebuild: caught this
    // live, it wrote the title text straight into the following article's
    // paragraph and changed that merged paragraph's style, while the actual
    // "Index Section Head" letter paragraph for B/C/D was left untouched).
    // Keep the explicit \r so the paragraph boundary survives the write.
    headerParas[h].contents = titles[h] + "\r";
    headerParas[h].appliedParagraphStyle = headerStyle;
    headerParas[h].startParagraph = StartParagraph.NEXT_PAGE;
    headed++;
}
// re-scan by style AFTER all header edits landed, to reset the paragraph
// immediately following each header to ANYWHERE
var resetNext = 0;
for (var p2 = 0; p2 < story.paragraphs.length; p2++) {
    if (story.paragraphs[p2].appliedParagraphStyle == headerStyle) {
        if (p2 + 1 < story.paragraphs.length) {
            story.paragraphs[p2 + 1].startParagraph = StartParagraph.ANYWHERE;
            resetNext++;
        }
    }
}

doc.save();
"removedSvodnaya=" + removedSvodnaya + "|headed=" + headed + "|resetNext=" + resetNext +
    "|storyLength=" + story.length + "|paragraphs=" + story.paragraphs.length;
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--target", required=True)
    ap.add_argument("--config", default="config/print-readiness.json")
    ap.add_argument("--report")
    args = ap.parse_args()

    cfg = json.load(open(args.config, encoding="utf-8"))
    order = cfg["indexes_order"]
    titles = [sentence_case(item["title"]) for item in sorted(order, key=lambda x: x["n"])]
    print("[stage4-headers] titles:", titles)

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[stage4-headers] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    target = Path(args.target).resolve()
    opened = {app.Documents.Item(i).Name for i in range(1, app.Documents.Count + 1)}
    if target.name not in opened:
        app.Open(str(target))
        print("[stage4-headers] opened:", target.name)

    titles_js = json.dumps(titles, ensure_ascii=False)
    jsx = JSX_TEMPLATE.replace("__TITLES__", titles_js)
    f = Path(tempfile.gettempdir()) / "h2590_stage4_headers.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + jsx.replace("\n", "\r\n").encode("utf-8"))
    t0 = time.time()
    res = str(app.DoScript(str(f), ID_JAVASCRIPT))
    print(f"[stage4-headers] finished in {(time.time()-t0):.1f}s: {res}")

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(f"stage4_headers_splitstory run {time.strftime('%Y-%m-%d %H:%M:%S')}\n{res}\n", encoding="utf-8")
        print("[stage4-headers] report:", rp)


if __name__ == "__main__":
    main()
