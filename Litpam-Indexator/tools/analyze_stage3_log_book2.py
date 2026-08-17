#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
analyze_stage3_log_book2.py — разбор лога стадии [3] книги II (H2590), по
методу analyze_stage3_log.py (H2776), но с другой базой сравнения: у книги II
нет отдельного stage1-diff-против-2025 файла (в отличие от книги I), поэтому
базой служит СОБСТВЕННЫЙ не-найденный список книги I
(artifacts/print-readiness/book-I/pilot-2026/stage3/stage3-index-log.txt).

Термин, «не найденный» в книге II, но НЕ входящий в список «не найдено» книги
I (т.е. книга I его нашла — значит, термин реально встречается в тексте книги
I), классифицируется как ОЖИДАЕМЫЙ: общий двухтомный словник, термин
принадлежит книге I. Термин, «не найденный» в ОБЕИХ книгах, классифицируется
как ПОДОЗРИТЕЛЬНЫЙ: не встречается ни в одном текстовом теле — либо
редакционная запись без прямых вхождений (кросс-ссылка), либо дефект
grep-запроса, нуждается в ручной проверке.

Запуск:
    python analyze_stage3_log_book2.py --log <stage3-own-index-log.txt> --json <out.json> --md <out.md>
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parents[1]
BOOK1_LOG = BASE / "artifacts" / "print-readiness" / "book-I" / "pilot-2026" / "stage3" / "stage3-index-log.txt"
NAMES = {"a": "Именной", "b": "Географический", "c": "Предметы и термины", "d": "Флора и фауна"}


def norm(t):
    t = re.sub(r"=\d+$", "", t.strip())
    t = re.sub(r"\s+", " ", t.replace("ё", "е"))
    return t.casefold()


def parse_not_found(path):
    not_found = []
    other = []
    for ln in Path(path).read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s+([a-d])-(.+?) \[ не найдено \]$", ln)
        if m:
            not_found.append((m.group(1), m.group(2)))
        elif ln.strip() and not ln.startswith("index_letter"):
            other.append(ln.strip())
    return not_found, other


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--log", required=True)
    p.add_argument("--json", required=True)
    p.add_argument("--md")
    args = p.parse_args(argv)

    not_found, other = parse_not_found(args.log)
    book1_not_found, _ = parse_not_found(BOOK1_LOG)
    book1_terms = {norm(term) for _letter, term in book1_not_found}

    classified = {"suspect_not_found_in_either_book": [], "expected_book1_has_it": []}
    for letter, term in not_found:
        t = norm(term)
        if t in book1_terms:
            classified["suspect_not_found_in_either_book"].append(f"[{letter}] {term}")
        else:
            classified["expected_book1_has_it"].append(f"[{letter}] {term}")

    by_letter = {}
    for letter, term in not_found:
        by_letter.setdefault(letter, []).append(term)

    report = {
        "tool": "analyze_stage3_log_book2.py (H2590)",
        "not_found_total": len(not_found),
        "by_letter": {k: len(v) for k, v in by_letter.items()},
        "suspect_not_found_in_either_book": classified["suspect_not_found_in_either_book"],
        "expected_book1_has_it": classified["expected_book1_has_it"],
        "other_log_lines": other,
    }
    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")

    if args.md:
        md = ["# Разбор log стадии [3] — пилот книги II (H2590)\n"]
        md.append(f"Всего «не найдено»: {len(not_found)} · по указателям: " +
                  ", ".join(f"{k}={len(v)}" for k, v in sorted(by_letter.items())) + "\n")
        md.append(
            "База сравнения: собственный список «не найдено» книги I "
            "([stage3-index-log.txt](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/stage3/stage3-index-log.txt)) "
            "— термин, которого книга I тоже не нашла, подозрителен (не встречается ни в одном теле текста); "
            "термин, который книга I НАШЛА, для книги II ожидаем (принадлежит тексту книги I).\n"
        )
        md.append(f"## Подозрительные (не найдены ни в книге I, ни в книге II): {len(classified['suspect_not_found_in_either_book'])}\n")
        md += [f"> - {t}" for t in classified["suspect_not_found_in_either_book"]]
        md.append(f"\n## Ожидаемые (книга I их нашла — термин принадлежит тексту книги I): {len(classified['expected_book1_has_it'])}\n")
        md += [f"> - {t}" for t in classified["expected_book1_has_it"]]
        if other:
            md.append("\n## Прочие строки лога (STYLE?/GREP-ERR/REF-ERR)\n")
            md += [f"> - {t}" for t in other]
        Path(args.md).write_text("\n".join(md) + "\n", encoding="utf-8")

    print(f"not_found={len(not_found)} by_letter={report['by_letter']}")
    print(
        f"suspect={len(classified['suspect_not_found_in_either_book'])} "
        f"expected={len(classified['expected_book1_has_it'])} other={len(other)}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
