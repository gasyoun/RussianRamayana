#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drive_stage3_checkpointed.py — per-letter checkpointed variant of drive_stage3.py
(H2590). Book-II's stage [3] run ran for several hours without a checkpoint, and
drive_stage3.py only saves the target document once, at the very end -- an
interruption anywhere loses all progress on every letter, not just the current
one. This driver saves the target document after EACH letter's RUN step
completes, so a kill (accidental or deliberate) only costs the letter in
progress, not the whole run. Reuses drive_stage3's PURGE/SCAN/PREPARE/
FIX_COLORS/RUN ExtendScript verbatim (imported, not copied) -- no authorial
script touched, same additive-wrapper contract as H2776.

Запуск:
    python drive_stage3_checkpointed.py --target <pilot.indd> --indexlist <IndexList[@]NNN.indd>
        [--letters a,b,c,d] [--report <txt>] [--quit]

_Автор инструмента: Dr. Mārcis Gasūns · создан 16-08-2026 (H2590)._
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

# RUN's own tail is a bare expression (verdict + "|alerts=" + ...) which is what
# DoScript returns. Splicing a save directly after it — inside the SAME
# #targetengine block, SAME DoScript call — means the save fires as part of the
# single blocking ExtendScript execution InDesign runs server-side, so it
# survives the orchestrating Python client being killed mid-RUN (measured: a
# 2h+ RUN reliably outlasts this session's background-task timeout; a save
# issued as a SEPARATE later DoScript call never gets a chance to fire).
RUN_TAIL_MARKER = 'verdict + "|alerts=" + ($.global.__alertLog || "");'


def build_run_and_save(run_template, clear_flag):
    run_body = run_template % {"clear": clear_flag}
    if RUN_TAIL_MARKER not in run_body:
        raise SystemExit("[stage3-ckpt] drive_stage3.RUN shape changed — cannot splice checkpoint save")
    run_prefix, _, _ = run_body.partition(RUN_TAIL_MARKER)
    return (
        run_prefix
        + 'var __runResult = verdict + "|alerts=" + ($.global.__alertLog || "");\n'
        + "var __tdoc = null;\n"
        + "for (var j = 0; j < app.documents.length; j++)\n"
        + '    if (app.documents[j].name.indexOf("IndexList") == -1) __tdoc = app.documents[j];\n'
        + "if (__tdoc == null) throw new Error(\"target doc not found for checkpoint save\");\n"
        + "__tdoc.save();\n"
        + '__runResult + "|CHECKPOINT-SAVED|topics=" + (__tdoc.indexes.length ? __tdoc.indexes[0].topics.length : 0);\n'
    )


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", required=True, help="обрабатываемый .indd (pilot copy)")
    p.add_argument("--indexlist", required=True, help="IndexList[@]NNN.indd (сводная)")
    p.add_argument("--letters", default=None, help="only these letters, comma-separated (default: all spans found)")
    p.add_argument("--max-rows", type=int, default=None, help="diagnostic: truncate each letter's span to its first N rows (measures per-row cost on a small slice)")
    p.add_argument("--chunk-size", type=int, default=None, help="process each letter's span in sequential chunks of this many rows, checkpoint-saving after every chunk (finer-grained than one save per whole letter)")
    p.add_argument("--start-offset", type=int, default=0, help="skip this many rows from the start of each letter's span before beginning (resume mid-letter)")
    p.add_argument("--report", help="write run report here")
    p.add_argument("--no-clear", action="store_true", help="не удалять существующие записи индекса")
    p.add_argument("--quit", action="store_true")
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    ilist = Path(args.indexlist).resolve()
    for f in (target, ilist):
        if "work" not in f.parts or "print-readiness" not in f.parts:
            raise SystemExit(f"refusing: {f} must live under work/print-readiness/ (ruling 26)")

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[stage3-ckpt] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ds.ID_NEVER_INTERACT

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(ds.SAVE_OPTIONS_NO)

    app.Open(str(target))
    print(f"[stage3-ckpt] opened target: {target.name}")

    def do_jsx(code, label):
        f = Path(tempfile.gettempdir()) / f"h2590_stage3ckpt_{label}.jsx"
        f.write_bytes(b"\xef\xbb\xbf" + code.replace("\n", "\r\n").encode("utf-8"))
        return app.DoScript(str(f), ds.ID_JAVASCRIPT)

    print("[stage3-ckpt] shim:", do_jsx(ds.SHIM.replace("\r", "\n"), "shim"))
    t0 = time.time()
    app.DoScript(str(ds.PROC_JSX), ds.ID_JAVASCRIPT)
    print(f"[stage3-ckpt] palette loaded ({time.time()-t0:.0f}s)")

    app.Open(str(ilist))
    print(f"[stage3-ckpt] opened indexlist: {ilist.name}")

    if not args.no_clear:
        print("[stage3-ckpt] purge:", do_jsx(ds.PURGE, "purge"))

    spans_raw = str(do_jsx(ds.SCAN, "scan"))
    print(f"[stage3-ckpt] marker spans: {spans_raw}")
    spans = {}
    for part in spans_raw.split(","):
        letter, _, rng = part.partition(":")
        s, _, e = rng.partition("-")
        if letter == "?":
            raise SystemExit(f"[stage3-ckpt] unmarked rows in span {part} — inspect the svodnaya")
        spans[letter] = (int(s), int(e))

    todo = [x.strip() for x in args.letters.split(",")] if args.letters else list(spans.keys())
    print(f"[stage3-ckpt] letters to run: {todo}")

    outcomes = []
    for letter in todo:
        s, e = spans[letter]
        s = s + args.start_offset
        if args.max_rows is not None:
            e = min(e, spans[letter][0] + args.start_offset + args.max_rows - 1)
        if s > e:
            print(f"[stage3-ckpt] {letter}: --start-offset {args.start_offset} already past span end — skipping")
            continue

        chunk_size = args.chunk_size or (e - s + 1)
        chunk_bounds = []
        cs = s
        while cs <= e:
            ce = min(e, cs + chunk_size - 1)
            chunk_bounds.append((cs, ce))
            cs = ce + 1
        print(f"[stage3-ckpt] {letter}: span {s}-{e} in {len(chunk_bounds)} chunk(s) of up to {chunk_size} rows")

        for ci, (cs, ce) in enumerate(chunk_bounds, start=1):
            t0 = time.time()
            prep = str(do_jsx(ds.PREPARE % {"start": cs, "end": ce}, f"prepare_{letter}_{ci}"))
            print(f"[stage3-ckpt] prepare[{letter} chunk {ci}/{len(chunk_bounds)}, rows {cs}-{ce}] ({time.time()-t0:.0f}s): {prep[:200]}")
            if "THREW" in prep:
                raise SystemExit(f"[stage3-ckpt] prepare[{letter} chunk {ci}] failed — stopping before mutation")
            print(f"[stage3-ckpt] fix-colors[{letter} chunk {ci}]:", do_jsx(ds.FIX_COLORS, f"fix_{letter}_{ci}"))
            t0 = time.time()
            # RUN + save spliced into ONE DoScript call (see build_run_and_save) so the
            # save fires inside InDesign's own execution even if this Python process
            # is killed while blocked waiting on this call to return.
            run_and_save_jsx = build_run_and_save(ds.RUN, "false")
            run = str(do_jsx(run_and_save_jsx, f"run_save_{letter}_{ci}"))
            print(f"[stage3-ckpt] run+save[{letter} chunk {ci}/{len(chunk_bounds)}] finished in {(time.time()-t0)/60:.1f} min: {run[:300]}")
            outcomes.append((f"{letter}[{cs}-{ce}]", run))
            if "THREW" in run:
                raise SystemExit(f"[stage3-ckpt] run[{letter} chunk {ci}] failed — see report; earlier chunks/letters kept")
            if "CHECKPOINT-SAVED" not in run:
                raise SystemExit(f"[stage3-ckpt] run[{letter} chunk {ci}] succeeded but checkpoint save did not confirm — inspect: {run}")

    dt_total = sum(1 for _ in outcomes)
    run_summary = " ||| ".join(f"[{ltr}] {r}" for ltr, r in outcomes)
    print(f"[stage3-ckpt] ALL requested letters done ({dt_total})")

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(ds.SAVE_OPTIONS_NO)
    if args.quit:
        app.Quit(ds.SAVE_OPTIONS_NO)

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(
            f"stage3-checkpointed run {time.strftime('%Y-%m-%d %H:%M:%S')}\ntarget: {target}\nindexlist: {ilist}\n"
            f"letters: {todo}\nspans: {spans_raw}\nresults ({dt_total}): {run_summary}\n",
            encoding="utf-8",
        )
        print(f"[stage3-ckpt] report: {rp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
