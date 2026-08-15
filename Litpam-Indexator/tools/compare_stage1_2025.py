#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
compare_stage1_2025.py — сравнение регенерированной сводной IndexList[@] (стадия
[1] пилота H2776) с ТИПОГРАФСКИМИ указателями 2025 года (визуально-редакционная
база по рулингу 4): страницы 415–438 committed-пруфа книги I.

Стороны:
  2025 — текст индексных страниц PDF, сегментированный по заголовкам «УКАЗАТЕЛЬ …»
         в 4 указателя (a=имена, b=география, c=предметы/термины, d=флора/фауна);
         строки «термин  номера-страниц»; переносы страничных списков склеиваются.
  new  — TSV-дамп сводной (dump_indexlist.py): колонка A с маркерами `a-`…`d-`;
         маркер снимается, плейсхолдеры «—» (noLevel) пропускаются.

Сравнение level-агностичное, по нормализованным множествам терминов на указатель
(casefold, ё→е, схлопывание пробелов, снятие сносочных надстрочников). PDF-сторона
шумит артефактами извлечения — отчёт классифицирует, а не выносит наивный PASS.

Запуск:
    python compare_stage1_2025.py --svodnaya-tsv <dump.tsv> --pdf <2025.pdf> \
        --json <out.json> --md <out.md>

_Автор инструмента: Dr. Mārcis Gasūns · создан 15-08-2026 (H2776)._
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

INDEX_PAGES = range(415, 439)  # 1-based, inclusive of 438
HEADINGS = [
    ("УКАЗАТЕЛЬ ИМЕН", "a"),
    ("УКАЗАТЕЛЬ ГЕОГРАФИЧЕСКИХ", "b"),
    ("ПРЕДМЕТНО-ТЕРМИНОЛОГИЧЕСКИЙ УКАЗАТЕЛЬ", "c"),
    ("УКАЗАТЕЛЬ ФЛОРЫ", "d"),
]
ENTRY = re.compile(r"^(.{2,90}?)\s{1,}(\d{1,3}(\s*[–—-]\s*\d{1,3})?([,;]\s*\d{1,3}(\s*[–—-]\s*\d{1,3})?)*)\s*\.?\s*$")
PAGES_ONLY = re.compile(r"^\d{1,3}([–—-]\d{1,3})?([,;]\s*\d{1,3}([–—-]\d{1,3})?)*\s*$")
SEE_ONLY = re.compile(r"^(.+?)\s+[Сс]м\.\s*(.*)$")
NOISE = re.compile(
    r"^(\d{1,3}|Приложения|УКАЗАТЕЛЬ.*|ПРЕДМЕТНО-ТЕРМИНОЛОГИЧЕСКИЙ.*"
    r"|И\s+МИФОЛОГИЧЕСКИХ.*|И\s+ЭТНИЧЕСКИХ.*|НАЗВАНИЙ.*|И\s+ТЕРМИНОВ.*|И\s+ФАУНЫ.*"
    r"|\d{1,3}(Указатель|Предметно-терминологический)\s.*"  # колонтитул, приклеенный к номеру страницы
    r"|\d?\s*Во всех указателях.*|и приложениях.*)$"
)


def norm(term):
    t = term.strip().strip(",;")
    t = re.sub(r"\s*\d+\s*$", "", t)  # trailing footnote superscript digits glued to last number already cut; safety
    t = t.replace("ё", "е").replace("Ё", "Е")
    t = re.sub(r"\s+", " ", t)
    return t.casefold().strip()


def parse_2025(pdf_path):
    from pypdf import PdfReader

    reader = PdfReader(pdf_path)
    current = None
    per_index = {"a": set(), "b": set(), "c": set(), "d": set()}
    raw_lines = {"a": [], "b": [], "c": [], "d": []}
    for pno in INDEX_PAGES:
        text = reader.pages[pno - 1].extract_text() or ""
        for ln in (s.strip() for s in text.splitlines()):
            if not ln:
                continue
            up = ln.upper()
            switched = False
            for head, marker in HEADINGS:
                if up.startswith(head):
                    current = marker
                    switched = True
                    break
            if switched or current is None or NOISE.match(ln):
                continue
            if re.fullmatch(r"[\d\s,;.–—-]+", ln):
                continue  # wrapped continuation of a page list (any dash form, open ranges)
            sm = SEE_ONLY.match(ln)
            if sm:
                term = norm(sm.group(1))
            else:
                # term = everything before the first page number; wrapped lists may
                # end mid-range — the tail shape does not matter for the split
                term = norm(re.split(r"\s+(?=\d)", ln, maxsplit=1)[0])
            if term and len(term) > 1 and re.search(r"[а-яА-ЯёЁa-zA-Z]", term):
                per_index[current].add(term)
                raw_lines[current].append(ln)
    return per_index, {k: len(v) for k, v in raw_lines.items()}


def parse_svodnaya(tsv_path):
    per_index = {"a": set(), "b": set(), "c": set(), "d": set()}
    marker_re = re.compile(r"^([a-d])-(.*)$")
    rows = 0
    for line in Path(tsv_path).read_text(encoding="utf-8").splitlines():
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        rows += 1
        cell = parts[2].strip()
        m = marker_re.match(cell)
        if not m:
            continue
        term = re.sub(r"=\d+$", "", m.group(2).strip())  # служебный суффикс подуровней UseReadyTable
        if term in ("—", "-", ""):
            continue  # noLevel placeholder rows
        per_index[m.group(1)].add(norm(term))
    return per_index, rows


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--svodnaya-tsv", required=True)
    p.add_argument("--pdf", required=True)
    p.add_argument("--json", required=True)
    p.add_argument("--md")
    args = p.parse_args(argv)

    old, old_line_counts = parse_2025(args.pdf)
    new, new_rows = parse_svodnaya(args.svodnaya_tsv)

    names = {"a": "Именной", "b": "Географический", "c": "Предметы и термины", "d": "Флора и фауна"}
    report = {"tool": "compare_stage1_2025.py (H2776)", "svodnaya_rows": new_rows, "indexes": {}}
    md = ["# Сравнение сводной стадии [1] с типографскими указателями 2025 (H2776)\n"]
    for k in "abcd":
        missing = sorted(old[k] - new[k])
        extra = sorted(new[k] - old[k])
        common = len(old[k] & new[k])
        report["indexes"][k] = {
            "name": names[k],
            "terms_2025": len(old[k]),
            "terms_new": len(new[k]),
            "common": common,
            "missing_in_new": missing,
            "extra_in_new": extra,
        }
        md.append(
            f"## {k} — {names[k]}\n\n"
            f"- 2025 (typeset): {len(old[k])} терминов · новая сводная: {len(new[k])} · общих: {common}\n"
            f"- нет в новой: {len(missing)} · только в новой: {len(extra)}\n"
        )
        if missing:
            md.append("**Нет в новой:**\n\n" + "\n".join(f"> - {t}" for t in missing[:400]) + "\n")
        if extra:
            md.append("**Только в новой:**\n\n" + "\n".join(f"> - {t}" for t in extra[:400]) + "\n")
        print(f"{k} {names[k]}: 2025={len(old[k])} new={len(new[k])} common={common} missing={len(missing)} extra={len(extra)}")

    # Union comparison — insensitive to the two-column / heading-boundary
    # segmentation artifacts of the PDF side (an entry attributed to the wrong
    # index still counts as present). This is the primary "no term lost" signal.
    old_u = set().union(*old.values())
    new_u = set().union(*new.values())
    u_missing = sorted(old_u - new_u)
    u_extra = sorted(new_u - old_u)
    report["union"] = {
        "terms_2025": len(old_u),
        "terms_new": len(new_u),
        "common": len(old_u & new_u),
        "missing_in_new": u_missing,
        "extra_in_new": u_extra,
    }
    md.append(
        "## Union (все 4 указателя вместе — главный сигнал потерь)\n\n"
        f"- 2025: {len(old_u)} · новая: {len(new_u)} · общих: {len(old_u & new_u)}\n"
        f"- нет в новой: {len(u_missing)} · только в новой: {len(u_extra)}\n"
    )
    if u_missing:
        md.append("**Нет в новой (union):**\n\n" + "\n".join(f"> - {t}" for t in u_missing[:400]) + "\n")
    if u_extra:
        md.append("**Только в новой (union):**\n\n" + "\n".join(f"> - {t}" for t in u_extra[:400]) + "\n")
    print(f"UNION: 2025={len(old_u)} new={len(new_u)} common={len(old_u & new_u)} missing={len(u_missing)} extra={len(u_extra)}")

    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    if args.md:
        Path(args.md).write_text("\n".join(md), encoding="utf-8")
    print("json:", args.json)
    return 0


if __name__ == "__main__":
    sys.exit(main())
