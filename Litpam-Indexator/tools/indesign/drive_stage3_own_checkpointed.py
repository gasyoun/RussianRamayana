#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drive_stage3_own_checkpointed.py — per-letter checkpointed driver for
index_letter.jsx (H2590). Book-II hit the same InDesign-2026 DOM regression
H2776 already documented for Book I (ProcStoryOrDoс's palette action throws
"Invalid parameter" at line 773 for any letter range that doesn't start at
row 0 — reproduced live on letter 'b'). index_letter.jsx is the already-
vetted additive equivalent (used successfully for Book I's b/c/d, H2776) that
reads table rows directly instead of driving the broken palette UI, so it
sidesteps the regression entirely. This driver:

  - reuses index_letter.jsx UNCHANGED (it is itself an additive wrapper, not
    authorial content — no authorial script touched by this driver either);
  - splices its call + a document save into ONE DoScript invocation per
    letter, so the save survives the orchestrating Python client being
    killed mid-call (same trick as drive_stage3_checkpointed.py);
  - is parameterized (--target/--indexlist/--letters), unlike
    drive_stage3_own.py which hardcodes Book-I's pilot-I paths.

index_letter.jsx drops all EXISTING topics of a letter before adding its own
range, so it must be called ONCE per whole letter, not chunked by row range
(a second chunk call would wipe the first chunk's progress for that letter).

Запуск:
    python drive_stage3_own_checkpointed.py --target <pilot.indd> --indexlist <IndexList[@]NNN.indd>
        [--letters b,c,d] [--log <path>] [--report <txt>] [--quit]

_Автор инструмента: Dr. Mārcis Gasūns · создан 17-08-2026 (H2590)._
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


def build_index_letter_and_save(log_path):
    body = INDEX_LETTER_JSX.read_text(encoding="utf-8")
    if not body.strip().endswith("})();"):
        raise SystemExit("[stage3-own-ckpt] index_letter.jsx shape changed — cannot splice checkpoint save")
    # Turn the file's own top-level `(function () { ... })();` into
    # `var __letterResult = (function () { ... })();` so we can use its
    # return value after appending the save logic, without editing the file.
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
    p.add_argument("--target", required=True, help="обрабатываемый .indd (pilot copy)")
    p.add_argument("--indexlist", required=True, help="IndexList[@]NNN.indd (сводная)")
    p.add_argument("--letters", default="b,c,d", help="letters to (re)build, comma-separated")
    p.add_argument("--log", help="index_letter.jsx per-row not-found log (default: alongside target)")
    p.add_argument("--report", help="write run report here")
    p.add_argument("--quit", action="store_true")
    p.add_argument("--exclude-from-page", type=int, default=None,
                    help="skip grep hits landing on this page number or higher (H2590: excludes the old "
                         "printed index block, which is itself searchable text listing headwords with page "
                         "numbers, causing false-positive self-matches if not excluded)")
    args = p.parse_args(argv)

    target = Path(args.target).resolve()
    ilist = Path(args.indexlist).resolve()
    for f in (target, ilist):
        if "work" not in f.parts or "print-readiness" not in f.parts:
            raise SystemExit(f"refusing: {f} must live under work/print-readiness/ (ruling 26)")
    log_path = Path(args.log).resolve() if args.log else target.parent / "stage3-own-index-log.txt"

    import win32com.client

    app = win32com.client.Dispatch("InDesign.Application")
    print(f"[stage3-own-ckpt] connected: {app.Name} {app.Version}")
    app.ScriptPreferences.UserInteractionLevel = ds.ID_NEVER_INTERACT

    opened = set()
    for i in range(1, app.Documents.Count + 1):
        opened.add(app.Documents.Item(i).Name)
    if target.name not in opened:
        app.Open(str(target))
        print(f"[stage3-own-ckpt] opened: {target.name}")
    if ilist.name not in opened:
        app.Open(str(ilist))
        print(f"[stage3-own-ckpt] opened: {ilist.name}")

    def do_jsx(code, label):
        f = Path(tempfile.gettempdir()) / f"h2590_stage3own_{label}.jsx"
        f.write_bytes(b"\xef\xbb\xbf" + code.replace("\n", "\r\n").encode("utf-8"))
        return app.DoScript(str(f), ds.ID_JAVASCRIPT)

    spans_raw = str(do_jsx(ds.SCAN, "scan"))
    print(f"[stage3-own-ckpt] marker spans: {spans_raw}")
    spans = {}
    for part in spans_raw.split(","):
        letter, _, rng = part.partition(":")
        s, _, e = rng.partition("-")
        if letter == "?":
            raise SystemExit(f"[stage3-own-ckpt] unmarked rows in span {part} — inspect the svodnaya")
        spans[letter] = (int(s), int(e))

    todo = [x.strip() for x in args.letters.split(",") if x.strip()]
    print(f"[stage3-own-ckpt] letters to run: {todo}")

    combined_jsx = build_index_letter_and_save(str(log_path))

    outcomes = []
    for letter in todo:
        s, e = spans[letter]
        app.ScriptArgs.SetValue("letter", letter)
        app.ScriptArgs.SetValue("startRow", str(s))
        app.ScriptArgs.SetValue("endRow", str(e))
        app.ScriptArgs.SetValue("logPath", str(log_path))
        app.ScriptArgs.SetValue("excludeFromPage", str(args.exclude_from_page) if args.exclude_from_page is not None else "")
        t0 = time.time()
        res = str(do_jsx(combined_jsx, f"letter_{letter}"))
        print(f"[stage3-own-ckpt] {letter} (rows {s}-{e}) finished in {(time.time()-t0)/60:.1f} min: {res}")
        outcomes.append((letter, res))
        if "CHECKPOINT-SAVED" not in res:
            raise SystemExit(f"[stage3-own-ckpt] {letter} succeeded but checkpoint save did not confirm — inspect: {res}")

    print(f"[stage3-own-ckpt] ALL requested letters done ({len(outcomes)})")

    while app.Documents.Count > 0:
        app.Documents.Item(1).Close(ds.SAVE_OPTIONS_NO)
    if args.quit:
        app.Quit(ds.SAVE_OPTIONS_NO)

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(
            f"stage3-own-checkpointed run {time.strftime('%Y-%m-%d %H:%M:%S')}\ntarget: {target}\nindexlist: {ilist}\n"
            f"letters: {todo}\nspans: {spans_raw}\n"
            + "\n".join(f"[{ltr}] {r}" for ltr, r in outcomes) + "\n",
            encoding="utf-8",
        )
        print(f"[stage3-own-ckpt] report: {rp}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
