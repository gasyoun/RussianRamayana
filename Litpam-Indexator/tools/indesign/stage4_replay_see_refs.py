#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
stage4_replay_see_refs.py -- stage[4] "См." insertion, REPLAY mode (H2590
rebuild). The 19-08-2026 продолжение 4 session already did the hard editorial
work once: extracted 115 verified alias->target pairs as ground truth from
the checked 2025 print (pymupdf, manual correction of 6 line-wrap artifacts,
2 exclusions), and computed each insertion's position as an anchor_topic --
the level-1 topic (WITH its still-present a-/b-/c-/d- prefix, since See-refs
insertion happens BEFORE the prefix-strip step) that alphabetically follows
the alias. That anchor_topic is a stable NAME, unlike the same run's raw
insert_before_para_idx numbers, which are only valid for that exact session's
paragraph layout. This script replays by re-locating each anchor by name in
the CURRENT document and inserting the preserved "Alias см. Target" line(s)
as plain text immediately before it -- no re-derivation, no re-adjudication.

Processes anchors in reverse document order (last paragraph first) so each
insertion never shifts the position of an anchor not yet processed.

Запуск:
    python stage4_replay_see_refs.py --target <pilot.indd> --insertions <SEE_REFS_INSERTIONS_v2.json> [--report <txt>]

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

JSX_TEMPLATE = r"""
var groups = __GROUPS__; // [{anchor: "a-Анаранья", lines: ["Анала см. Агни", ...]}, ...]
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
if (doc == null) throw new Error("pilot doc not open");
var story = doc.stories[doc.stories.length - 1];

// index anchor name -> group, for O(1) lookup while scanning
var byAnchor = {};
for (var g = 0; g < groups.length; g++) byAnchor[groups[g].anchor] = groups[g];
var remaining = groups.length;

var inserted = 0, matchedAnchors = 0;
var notFound = [];
for (var p = story.paragraphs.length - 1; p >= 0 && remaining > 0; p--) {
    var para = story.paragraphs[p];
    var txt = String(para.contents);
    for (var anchor in byAnchor) {
        if (!byAnchor.hasOwnProperty(anchor)) continue;
        if (txt.indexOf(anchor + "  ") == 0 || txt.indexOf(anchor + "\r") == 0 || txt == anchor) {
            var lines = byAnchor[anchor].lines;
            var block = lines.join("\r") + "\r";
            para.insertionPoints[0].contents = block;
            inserted += lines.length;
            matchedAnchors++;
            delete byAnchor[anchor];
            remaining--;
            break;
        }
    }
}
for (var a2 in byAnchor) if (byAnchor.hasOwnProperty(a2)) notFound.push(a2);

doc.save();
"insertedLines=" + inserted + "|matchedAnchors=" + matchedAnchors + "|notFoundAnchors=" + notFound.join(";") +
    "|storyLength=" + story.length + "|paragraphs=" + story.paragraphs.length + "|overflows=" + story.textContainers[story.textContainers.length-1].overflows;
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--target", required=True)
    ap.add_argument("--insertions", required=True)
    ap.add_argument("--report")
    args = ap.parse_args()

    data = json.load(open(args.insertions, encoding="utf-8"))
    items = data["insertions"]
    groups_map = {}
    for it in items:
        groups_map.setdefault(it["anchor_topic"], []).append(it["line"])
    groups = [{"anchor": k, "lines": v} for k, v in groups_map.items()]
    total_lines = sum(len(g["lines"]) for g in groups)
    print(f"[replay-see-refs] {len(items)} insertions -> {len(groups)} unique anchors, {total_lines} lines total")

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[replay-see-refs] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    target = Path(args.target).resolve()
    opened = {app.Documents.Item(i).Name for i in range(1, app.Documents.Count + 1)}
    if target.name not in opened:
        app.Open(str(target))
        print("[replay-see-refs] opened:", target.name)

    groups_js = json.dumps(groups, ensure_ascii=False)
    jsx = JSX_TEMPLATE.replace("__GROUPS__", groups_js)
    f = Path(tempfile.gettempdir()) / "h2590_replay_see_refs.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + jsx.replace("\n", "\r\n").encode("utf-8"))
    t0 = time.time()
    res = str(app.DoScript(str(f), ID_JAVASCRIPT))
    print(f"[replay-see-refs] finished in {(time.time()-t0):.1f}s: {res}")

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(f"stage4_replay_see_refs run {time.strftime('%Y-%m-%d %H:%M:%S')}\n{res}\n", encoding="utf-8")
        print("[replay-see-refs] report:", rp)


if __name__ == "__main__":
    main()
