#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dump_topic_pages.py — стадия [4] интегритет-чек v2 (H2590): для каждого
Level1-топика собирает МНОЖЕСТВО (не число) реальных номеров страниц из
Index.Topics[*].PageReferences (через ReferencedPage.Name -- номер колонцифры),
дедуплицируя дубли на одной странице (как это по контракту делает и печатный
указатель) -- v1 (coverage_check_stage4.py) сравнивал сырое ЧИСЛО ссылок, что
ложно флагует легитимную дедупликацию ProcNumberLines как «потерю».

Запуск:
    python dump_topic_pages.py --target <pilot.indd> --json <out.json>
"""

import argparse
import json
import sys
import tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)

ID_JAVASCRIPT = 1246973031
ID_NEVER_INTERACT = 1699640946
SAVE_OPTIONS_NO = 1852776480

DUMP_JSX = """
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("IndexList") == -1) doc = app.documents[i];
if (doc == null) throw new Error("target doc not found");

var ix = doc.indexes.item(0);
var story = doc.stories.item(doc.stories.length - 1);
var fullText = story.contents;

var lines = [];
for (var i = 1; i <= ix.topics.length; i++) {
    try {
        var t = ix.topics.item(i);
        var name = String(t.name);
        var pages = [];
        for (var j = 1; j <= t.pageReferences.length; j++) {
            try {
                var pr = t.pageReferences.item(j);
                var pageName = "NOPAGE";
                try {
                    if (pr.sourceText.parentTextFrames.length > 0 && pr.sourceText.parentTextFrames[0].parentPage != null)
                        pageName = String(pr.sourceText.parentTextFrames[0].parentPage.name);
                } catch (eN) { pageName = "ERR:" + eN.message; }
                pages.push(pageName);
            } catch (eR) { pages.push("REFERR"); }
        }
        lines.push(name + "\\t" + pages.join(","));
    } catch (e) {
        lines.push("__ERROR__\\t" + i + ":" + e.message);
    }
}
lines.join("\\n") + "\\n===TEXT===\\n" + fullText;
"""


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True)
    p.add_argument("--json", required=True)
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    if "work" not in target.parts or "print-readiness" not in target.parts:
        raise SystemExit(f"refusing: {target} must live under work/print-readiness/ (ruling 26)")

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[dump-topic-pages] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(SAVE_OPTIONS_NO)
    doc = app.Open(str(target))
    print(f"[dump-topic-pages] opened: {doc.Name}")

    f = Path(tempfile.gettempdir()) / "h2590_dump_topic_pages.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + DUMP_JSX.replace("\n", "\r\n").encode("utf-8"))
    result = str(app.DoScript(str(f), ID_JAVASCRIPT))

    doc.Close(SAVE_OPTIONS_NO)
    print("[dump-topic-pages] closed without saving (read-only)")

    topics_part, _, text_part = result.partition("===TEXT===")
    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(
        json.dumps({"topics_raw": topics_part, "text": text_part}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(f"[dump-topic-pages] -> {args.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
