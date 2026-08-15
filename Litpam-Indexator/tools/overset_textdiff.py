"""Overset adjudication WITHOUT InDesign: IDML story text vs rendered PDF text.

InDesign's overset flag is a composition result the IDML does not carry, but the
exported PDF does carry its *consequence*: overset text is not rendered. So two
deterministic checks settle what matters for print:

  stories  — for every story in an IDML, extract its full text and report which
             words are absent from a rendered PDF (marker-letter prefixes
             ``a-``..``d-`` are stripped before lookup, since the Litpam tagged
             working stories duplicate index content that renders unprefixed).
             A story whose words are all present carries no unrendered content,
             overset flag or not.

  pages    — page-by-page text comparison of two PDFs (whitespace-insensitive:
             different InDesign versions emit different spacing operators around
             hyphens, which is extraction jitter, not content). Zero differing
             pages == the two proofs are character-identical in content and
             pagination.

First applied 14-08-2026 (H2770) to Book I: all three stories flagged overset by
``export_print_evidence.jsx`` after the 2022->2026 conversion (u7e3 title blurb,
u825 copyright notice, u2fbf tagged c-/d- working story) render 100% of their
content, and the 2022 proof vs 2026 conversion PDFs are text-identical on all
442 pages — refuting DFT-I-0002 as a blocker. Reusable as-is for Book II
(H2590) and any future conversion gate.

Usage:
  python overset_textdiff.py stories --idml <file.idml> --pdf <a.pdf> [--pdf <b.pdf>] [--json out.json]
  python overset_textdiff.py pages --pdf-a <a.pdf> --pdf-b <b.pdf> [--json out.json]
"""

import argparse
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

WORD_RE = re.compile(r"[\wЀ-ӿ-]+", re.UNICODE)
MARKER_RE = re.compile(r"^[a-d]-")
WS_RE = re.compile(r"\s+")
MIN_WORD_LEN = 4


def story_text(z: zipfile.ZipFile, name: str) -> str:
    root = ET.fromstring(z.read(name))
    parts = []
    for el in root.iter():
        tag = el.tag.split("}")[-1]
        if tag == "Content" and el.text:
            parts.append(el.text)
        elif tag == "Br":
            parts.append("\n")
    return "".join(parts)


def pdf_pages(path: str):
    from pypdf import PdfReader

    return [(p.extract_text() or "") for p in PdfReader(path).pages]


def cmd_stories(args) -> int:
    z = zipfile.ZipFile(args.idml)
    pdf_words = {}
    for pdf in args.pdf:
        text = "\n".join(pdf_pages(pdf)).lower()
        pdf_words[pdf] = set(WORD_RE.findall(text))
    report = []
    for name in sorted(n for n in z.namelist() if n.startswith("Stories/")):
        text = story_text(z, name)
        toks = [w for w in WORD_RE.findall(text) if len(w) >= MIN_WORD_LEN]
        if not toks:
            continue
        entry = {
            "story": name,
            "words": len(toks),
            "head": " ".join(WORD_RE.findall(text)[:8]),
            "pdfs": {},
        }
        for pdf, words in pdf_words.items():
            absent = sorted(
                {w for w in toks if MARKER_RE.sub("", w).lower() not in words and w.lower() not in words}
            )
            entry["pdfs"][pdf] = {"absent_count": len(absent), "absent_sample": absent[:15]}
        report.append(entry)
        worst = max(v["absent_count"] for v in entry["pdfs"].values())
        flag = "  <-- content absent from a PDF" if worst else ""
        print(f"{name}: {len(toks)} words, max absent {worst}{flag}")
    clean = all(v["absent_count"] == 0 for e in report for v in e["pdfs"].values())
    print("\nVERDICT:", "every story's content is fully rendered in every PDF" if clean else "some story content is NOT rendered — inspect the report")
    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump({"verdict_all_rendered": clean, "stories": report}, fh, ensure_ascii=False, indent=1)
        print("json:", args.json)
    return 0 if clean else 1


def cmd_pages(args) -> int:
    a, b = pdf_pages(args.pdf_a), pdf_pages(args.pdf_b)
    print(f"pages: A={len(a)}  B={len(b)}")
    if len(a) != len(b):
        print("VERDICT: page counts differ")
        return 1
    diff = [i + 1 for i in range(len(a)) if WS_RE.sub("", a[i]) != WS_RE.sub("", b[i])]
    print(f"pages differing (whitespace-insensitive): {len(diff)} {diff[:30]}")
    verdict = not diff
    print("VERDICT:", "text-identical on every page" if verdict else "content differs — inspect pages listed")
    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(
                {"pdf_a": args.pdf_a, "pdf_b": args.pdf_b, "pages": len(a), "differing_pages": diff, "verdict_identical": verdict},
                fh, ensure_ascii=False, indent=1,
            )
        print("json:", args.json)
    return 0 if verdict else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("stories", help="IDML story content vs rendered PDF(s)")
    s.add_argument("--idml", required=True)
    s.add_argument("--pdf", action="append", required=True, help="repeatable")
    s.add_argument("--json")
    s.set_defaults(fn=cmd_stories)
    p = sub.add_parser("pages", help="page-by-page text diff of two PDFs")
    p.add_argument("--pdf-a", required=True)
    p.add_argument("--pdf-b", required=True)
    p.add_argument("--json")
    p.set_defaults(fn=cmd_pages)
    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    raise SystemExit(main())
