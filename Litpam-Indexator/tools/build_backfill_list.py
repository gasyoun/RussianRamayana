#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_backfill_list.py — вывести из union-diff'а H2776 точный список терминов
2025 года, отсутствующих в словнике (рулинг МГ 15-08-2026: backfill вариант (а)).

Фильтры (классы из SVODNAYA_VS_2025_STAGE1_COMPARISON.md):
  - половинки переносов: сегмент кончается на дефис/открытую скобку ИЛИ начинается
    со строчного обрывка без пробела и <5 букв; парные половинки не восстанавливаем
    автоматически — их термины и так присутствуют в словнике в полной форме;
  - сплиты буквицы («г омер» → «гомер»): чинится склейкой, затем обычная проверка;
  - различия формы записи: термин считается ПРИСУТСТВУЮЩИМ, если его нормализованная
    форма — подстрока какой-либо ячейки «Имя»/«Что искать» словника (и наоборот).

Остаток — кандидаты backfill; каждому назначается лист по указателю 2025 (a/b/c/d).

Запуск:
    python build_backfill_list.py --json <svodnaya-vs-2025.json> --out <backfill-candidates.json>
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import openpyxl  # noqa: E402

BASE = Path(__file__).resolve().parents[1]
WORKBOOK = BASE / "xls" / "derived" / "Указатель_к_Рамаяне_1_2_2026_08_15.xlsx"
SHEET_BY_MARKER = {"a": "Именной", "b": "Географ", "c": "Предметы и термины", "d": "Флора и фауна"}


def norm(t):
    return re.sub(r"\s+", " ", t.replace("ё", "е").replace("Ё", "Е")).casefold().strip()


def name_variants(name):
    """Все формы, под которыми это имя словника может выступать заголовком:
    сегменты по «;», «, » и « или », каждый — с вариантами без скобок/содержимого скобок,
    плюс хвост иерархии «Родитель\\Дитя» → «Дитя»."""
    out = set()
    base = name.split("\\")[-1]
    for seg in re.split(r";|,\s+|\s+или\s+", base):
        seg = seg.strip().strip("«»\"")
        if not seg:
            continue
        forms = {seg, re.sub(r"\s*\([^)]*\)", "", seg), re.sub(r"[()]", "", seg)}
        for f in forms:
            f = f.strip()
            if f:
                out.add(norm(f))
    return out


def workbook_nameset():
    wb = openpyxl.load_workbook(WORKBOOK, data_only=True)
    names = set()
    for sheet in SHEET_BY_MARKER.values():
        ws = wb[sheet]
        for row in ws.iter_rows(min_row=2, values_only=True):
            if row and row[0] and str(row[0]).strip():
                names |= name_variants(str(row[0]))
    return names


def looks_like_fragment(t):
    if re.search(r"[-–—]$", t):
        return "hyphen-wrap head"
    if len(t) <= 4 and " " not in t:
        return "wrap tail fragment"
    if t.startswith("(") or t.endswith(")") and "(" not in t:
        return "stray parenthetical fragment"
    if re.match(r"^[а-я]{1,3}\)?$", t):
        return "wrap tail fragment"
    return None


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--json", required=True, help="svodnaya-vs-2025.json")
    p.add_argument("--out", required=True)
    args = p.parse_args(argv)

    d = json.loads(Path(args.json).read_text(encoding="utf-8"))
    names = workbook_nameset()

    def present_in_workbook(term):
        return bool(name_variants(term) & names)

    candidates = []
    excluded = []
    seen = set()
    for marker in "abcd":
        for raw in d["indexes"][marker]["missing_in_new"]:
            term = raw.strip()
            # склейка сплита буквицы: "г омер" -> "гомер"
            m = re.match(r"^([а-яё]) ([а-яё]+)$", term)
            if m:
                term = m.group(1) + m.group(2)
            frag = looks_like_fragment(term)
            if frag:
                excluded.append({"term": raw, "index": marker, "reason": frag})
                continue
            if present_in_workbook(term):
                excluded.append({"term": raw, "index": marker, "reason": "present in workbook (form difference)"})
                continue
            key = norm(term)
            if key in seen:
                continue
            seen.add(key)
            candidates.append({"term": term, "index": marker, "sheet": SHEET_BY_MARKER[marker], "source_raw": raw})

    out = {"ruling": "MG 15-08-2026: backfill вариант (а)", "candidates": candidates, "excluded": excluded}
    Path(args.out).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"candidates: {len(candidates)}  excluded: {len(excluded)}")
    for c in candidates:
        print(f"  [{c['index']}] {c['term']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
