#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_notes_bold_locators.py -- §7.3 bold-locator PASS/FAIL check, now that
notes_bold_page_ranges is measured for book II (H2590 rebuild). For every
numeric locator in the pilot's Сводный указатель story that falls inside the
configured range, checks whether that specific number run carries a bold
character style/font style. Reports counts only -- this is a defect-finding
check, not a fixer (per DEFECT_POLICY.md: unintended-looking formatting gets
verified against spec, not silently "corrected" by heuristic).

Запуск:
    python check_notes_bold_locators.py --target <pilot.indd> --range-start 497 --range-end 664 [--report <txt>]

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

JSX_TEMPLATE = r"""
var rangeStart = __START__;
var rangeEnd = __END__;
var doc = null;
for (var i = 0; i < app.documents.length; i++)
    if (app.documents[i].name.indexOf("pilot") != -1) doc = app.documents[i];
var story = doc.stories[doc.stories.length - 1];
var text = String(story.contents);

var re = /\d+/g;
var m;
var inRange = 0, bold = 0, notBold = 0;
var samples = [];
while ((m = re.exec(text)) !== null) {
    var num = parseInt(m[0], 10);
    if (num < rangeStart || num > rangeEnd) continue;
    // guard against false positives from years/counts unrelated to locators
    // is weak here (plain regex over story text) -- report is advisory.
    inRange++;
    var idx = m.index;
    var ch = story.characters.item(idx);
    var isBold = false;
    try {
        var fs = String(ch.fontStyle);
        isBold = fs.toLowerCase().indexOf("bold") != -1;
    } catch (e) {}
    if (isBold) bold++; else { notBold++; if (samples.length < 20) samples.push(m[0] + "@" + idx); }
}
"inRange=" + inRange + "|bold=" + bold + "|notBold=" + notBold + "|samples=" + samples.join(",");
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--target", required=True)
    ap.add_argument("--range-start", type=int, required=True)
    ap.add_argument("--range-end", type=int, required=True)
    ap.add_argument("--report")
    args = ap.parse_args()

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[check-bold] connected: {app.Name} {app.Version}")

    target = Path(args.target).resolve()
    opened = {app.Documents.Item(i).Name for i in range(1, app.Documents.Count + 1)}
    if target.name not in opened:
        app.Open(str(target))

    jsx = JSX_TEMPLATE.replace("__START__", str(args.range_start)).replace("__END__", str(args.range_end))
    f = Path(tempfile.gettempdir()) / "h2590_check_bold.jsx"
    f.write_bytes(b"\xef\xbb\xbf" + jsx.replace("\n", "\r\n").encode("utf-8"))
    t0 = time.time()
    res = str(app.DoScript(str(f), ID_JAVASCRIPT))
    print(f"[check-bold] finished in {(time.time()-t0):.1f}s: {res}")

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(f"check_notes_bold_locators run {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
                       f"range: {args.range_start}-{args.range_end}\n{res}\n", encoding="utf-8")
        print("[check-bold] report:", rp)


if __name__ == "__main__":
    main()
