#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
stage4_replay_homonym_merge.py -- stage[4] step 6, REPLAY mode (H2590
rebuild). The 19-08-2026 session found 43 headwords whose InDesign-internal
"=N" uniqueness suffix (Index.Topics requires unique names; the shared
dictionary applies the same epithet to several different characters) all
happen to carry IDENTICAL page-locator lists across their N variants -- MG
ruling: merge into one printed line per headword (no locators lost, since
the sets are identical). HOMONYM_MERGE_PLAN.json preserves that already-made
editorial call as {headword, new_text, keep_para_idx, delete_para_idxs} --
but the para_idx numbers are only valid for the ORIGINAL session's exact
paragraph layout, and this rebuild's paragraph count already diverges from
it (confirmed non-deterministic ProcNumberLines formatting, see
diff_topic_page_dumps.py's docstring). This script replays by headword NAME
instead: for each group, finds every CURRENT paragraph whose text starts
with "<headword>=<digit>", verifies the count matches the plan's recorded
variant count (1 keep + len(delete_para_idxs)), rewrites the first match's
text to new_text and removes the rest -- deleting from the end of each
group's match list first so within-group index shifts never bite.

Запуск:
    python stage4_replay_homonym_merge.py --target <pilot.indd> --plan <HOMONYM_MERGE_PLAN.json> [--report <txt>]

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
var groups = __GROUPS__; // [{headword, newText, expectedCount}, ...]
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
if (doc == null) throw new Error("pilot doc not open");
var story = doc.stories[doc.stories.length - 1];

var results = [];
var totalMerged = 0, totalDeleted = 0, mismatches = [];

for (var g = 0; g < groups.length; g++) {
    var hw = groups[g].headword;
    var matches = [];
    for (var p = 0; p < story.paragraphs.length; p++) {
        var txt = String(story.paragraphs[p].contents);
        if (txt.indexOf(hw + "=") == 0) {
            // require a digit right after '=' to avoid accidental prefix collisions
            var afterEq = txt.charAt(hw.length + 1);
            if (afterEq >= "0" && afterEq <= "9") matches.push(story.paragraphs[p]);
        }
    }
    if (matches.length != groups[g].expectedCount) {
        mismatches.push(hw + ":expected=" + groups[g].expectedCount + ",found=" + matches.length);
        continue;
    }
    matches[0].contents = groups[g].newText + "\r";
    for (var m = matches.length - 1; m >= 1; m--) {
        matches[m].remove();
        totalDeleted++;
    }
    totalMerged++;
}

doc.save();
"merged=" + totalMerged + "|deleted=" + totalDeleted + "|mismatches=" + mismatches.join(";") +
    "|storyLength=" + story.length + "|paragraphs=" + story.paragraphs.length;
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--target", required=True)
    ap.add_argument("--plan", required=True)
    ap.add_argument("--report")
    args = ap.parse_args()

    data = json.load(open(args.plan, encoding="utf-8"))
    groups = []
    for g in data["plan"]:
        groups.append({
            "headword": g["headword"],
            "newText": g["new_text"],
            "expectedCount": len(g["delete_para_idxs"]) + 1,
        })
    print(f"[replay-homonym-merge] {len(groups)} groups from plan")

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[replay-homonym-merge] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ID_NEVER_INTERACT

    target = Path(args.target).resolve()
    opened = {app.Documents.Item(i).Name for i in range(1, app.Documents.Count + 1)}
    if target.name not in opened:
        app.Open(str(target))
        print("[replay-homonym-merge] opened:", target.name)

    groups_js = json.dumps(groups, ensure_ascii=False)
    jsx = JSX_TEMPLATE.replace("__GROUPS__", groups_js)
    f = Path(tempfile.gettempdir()) / "h2590_replay_homonym_merge.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + jsx.replace("\n", "\r\n").encode("utf-8"))
    t0 = time.time()
    res = str(app.DoScript(str(f), ID_JAVASCRIPT))
    print(f"[replay-homonym-merge] finished in {(time.time()-t0):.1f}s: {res}")

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(f"stage4_replay_homonym_merge run {time.strftime('%Y-%m-%d %H:%M:%S')}\n{res}\n", encoding="utf-8")
        print("[replay-homonym-merge] report:", rp)


if __name__ == "__main__":
    main()
