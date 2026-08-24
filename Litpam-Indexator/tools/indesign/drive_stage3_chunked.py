#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drive_stage3_chunked.py -- row-range-chunked driver for index_letter.jsx (H2590
rebuild). drive_stage3_own_checkpointed.py splices one whole letter into a
single DoScript call; on this machine a single call covering a large letter
(~700+ rows) reproducibly dies partway with a raw COM
"User canceled this action." error from InDesign itself (not from the script;
app.DoScript() throws before returning) -- consistent with InDesign's own
long-running-script watchdog defaulting to Cancel under
ScriptPreferences.UserInteractionLevel = NeverInteract. This driver splits ONE
letter's row range into --chunk-size-row pieces, each its own short DoScript
call + immediate document save, using index_letter.jsx's new `keepExisting`
scriptArg (H2590) so continuation chunks do not wipe the letter's
already-added topics. If a chunk fails, all earlier chunks for this letter are
already saved on disk -- rerun with --start-row set to the failed chunk's
start to resume, no earlier work is lost.

Запуск:
    python drive_stage3_chunked.py --target <pilot.indd> --indexlist <IndexList[@]NNN.indd>
        --letter a [--chunk-size 150] [--start-row N] [--exclude-from-page 630]
        [--log <path>] [--report <txt>] [--quit]

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import argparse
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)

import drive_stage3 as ds  # noqa: E402

HERE = Path(__file__).resolve().parent
INDEX_LETTER_JSX = HERE / "index_letter.jsx"


def build_index_letter_and_save():
    body = INDEX_LETTER_JSX.read_text(encoding="utf-8")
    if not body.strip().endswith("})();"):
        raise SystemExit("[stage3-chunked] index_letter.jsx shape changed -- cannot splice checkpoint save")
    wrapped = "var __letterResult = " + body.strip()
    return (
        wrapped
        + "\n"
        + "var __tdoc = null;\n"
        + "for (var j = 0; j < app.documents.length; j++)\n"
        + '    if (app.documents[j].name.indexOf("IndexList") == -1) __tdoc = app.documents[j];\n'
        + "if (__tdoc == null) throw new Error(\"target doc not found for checkpoint save\");\n"
        + "__tdoc.save();\n"
        + '__letterResult + "|CHECKPOINT-SAVED|topics=" + (__tdoc.indexes.length ? __tdoc.indexes[0].topics.length : 0);\n'
    )


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True)
    p.add_argument("--indexlist", required=True)
    p.add_argument("--letter", required=True, help="single letter to (re)build")
    p.add_argument("--chunk-size", type=int, default=150)
    p.add_argument("--start-row", type=int, default=None, help="resume from this row (skip earlier chunks)")
    p.add_argument("--log")
    p.add_argument("--report")
    p.add_argument("--quit", action="store_true")
    p.add_argument("--exclude-from-page", type=int, default=None)
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    ilist = Path(args.indexlist).resolve()
    for f in (target, ilist):
        if "work" not in f.parts or "print-readiness" not in f.parts:
            raise SystemExit(f"refusing: {f} must live under work/print-readiness/ (ruling 26)")
    log_path = Path(args.log).resolve() if args.log else target.parent / "stage3-chunked-index-log.txt"

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[stage3-chunked] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ds.ID_NEVER_INTERACT

    opened = set()
    for i in range(1, app.Documents.Count + 1):
        opened.add(app.Documents.Item(i).Name)
    if target.name not in opened:
        app.Open(str(target))
        print(f"[stage3-chunked] opened: {target.name}")
    if ilist.name not in opened:
        app.Open(str(ilist))
        print(f"[stage3-chunked] opened: {ilist.name}")

    def do_jsx(code, label):
        f = Path(tempfile.gettempdir()) / f"h2590_stage3chunk_{label}.jsx"
        f.write_bytes(b"\xef\xbb\xbf" + code.replace("\n", "\r\n").encode("utf-8"))
        return app.DoScript(str(f), ds.ID_JAVASCRIPT)

    spans_raw = str(do_jsx(ds.SCAN, "scan"))
    print(f"[stage3-chunked] marker spans: {spans_raw}")
    spans = {}
    for part in spans_raw.split(","):
        letter, _, rng = part.partition(":")
        s, _, e = rng.partition("-")
        if letter == "?":
            raise SystemExit(f"[stage3-chunked] unmarked rows in span {part}")
        spans[letter] = (int(s), int(e))

    s0, e0 = spans[args.letter]
    start_row = args.start_row if args.start_row is not None else s0
    first_chunk = args.start_row is None or args.start_row == s0
    print(f"[stage3-chunked] letter {args.letter}: full span {s0}-{e0}, running from {start_row}"
          f"{' (fresh)' if first_chunk else ' (continuation, keepExisting)'}")

    combined_jsx = build_index_letter_and_save()

    chunk_start = start_row
    chunk_idx = 0
    outcomes = []
    while chunk_start <= e0:
        chunk_end = min(chunk_start + args.chunk_size - 1, e0)
        keep_existing = "" if (first_chunk and chunk_idx == 0) else "1"
        app.ScriptArgs.SetValue("letter", args.letter)
        app.ScriptArgs.SetValue("startRow", str(chunk_start))
        app.ScriptArgs.SetValue("endRow", str(chunk_end))
        app.ScriptArgs.SetValue("logPath", str(log_path))
        app.ScriptArgs.SetValue("excludeFromPage", str(args.exclude_from_page) if args.exclude_from_page is not None else "")
        app.ScriptArgs.SetValue("keepExisting", keep_existing)
        t0 = time.time()
        res = str(do_jsx(combined_jsx, f"{args.letter}_{chunk_start}_{chunk_end}"))
        dt = (time.time() - t0) / 60
        print(f"[stage3-chunked] {args.letter} rows {chunk_start}-{chunk_end} (keepExisting={keep_existing or '0'}) "
              f"finished in {dt:.1f} min: {res}")
        outcomes.append((chunk_start, chunk_end, res))
        if "CHECKPOINT-SAVED" not in res:
            raise SystemExit(f"[stage3-chunked] chunk {chunk_start}-{chunk_end} succeeded but checkpoint save "
                              f"did not confirm -- inspect: {res}. Resume with --start-row {chunk_start}.")
        chunk_start = chunk_end + 1
        chunk_idx += 1

    print(f"[stage3-chunked] ALL chunks done for letter {args.letter} ({len(outcomes)} chunks)")

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(ds.SAVE_OPTIONS_NO)
    if args.quit:
        app.Quit(ds.SAVE_OPTIONS_NO)

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(
            f"stage3-chunked run {time.strftime('%Y-%m-%d %H:%M:%S')}\ntarget: {target}\nindexlist: {ilist}\n"
            f"letter: {args.letter} span: {s0}-{e0} chunk_size: {args.chunk_size}\n"
            + "\n".join(f"[{a}-{b}] {r}" for a, b, r in outcomes) + "\n",
            encoding="utf-8",
        )
        print(f"[stage3-chunked] report: {rp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
