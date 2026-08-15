#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
analyze_stage3_log.py — разбор лога стадии [3] (H2776): классификация терминов
«не найдено» по указателям + сверка с колонкой «Есть ли в тексте» словника и с
типографскими указателями 2025 (термин, который 2025 печатал со страницами, но
мы не нашли — потенциальный дефект grep-запроса; термин без вхождений в обоих —
норма общего двухтомного словника).

Запуск:
    python analyze_stage3_log.py --log <stage3-index-log.txt> --json <out.json> --md <out.md>
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parents[1]
CMP = BASE / "artifacts" / "print-readiness" / "book-I" / "pilot-2026" / "stage1" / "svodnaya-vs-2025.json"
NAMES = {"a": "Именной", "b": "Географический", "c": "Предметы и термины", "d": "Флора и фауна"}


def norm(t):
    t = re.sub(r"=\d+$", "", t.strip())
    t = re.sub(r"\s+", " ", t.replace("ё", "е"))
    return t.casefold()


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--log", required=True)
    p.add_argument("--json", required=True)
    p.add_argument("--md")
    args = p.parse_args(argv)

    not_found = []
    other = []
    for ln in Path(args.log).read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s+([a-d])-(.+?) \[ не найдено \]$", ln)
        if m:
            not_found.append((m.group(1), m.group(2)))
        elif ln.strip() and not ln.startswith("index_letter"):
            other.append(ln.strip())

    # Полного списка 2025 в json нет (хранится только diff): термин «не найдено»,
    # который значился «только в новой» (extra_in_new) — 2025 его НЕ печатал →
    # отсутствие вхождений ожидаемо (общий словник, вероятно только том II).
    # Прочие «не найдено» были common с 2025 → 2025 печатал их со страницами →
    # подозрение на дефект grep-запроса или регрессию поиска.
    cmp_data = json.loads(CMP.read_text(encoding="utf-8"))
    u = cmp_data["union"]
    extra_new = set(u["extra_in_new"])

    classified = {"printed_2025_but_not_found_now": [], "no_hits_expected_vol2_only": [], "other_lines": other}
    for letter, term in not_found:
        t = norm(term)
        if t in extra_new:
            classified["no_hits_expected_vol2_only"].append(f"[{letter}] {term}")
        else:
            classified["printed_2025_but_not_found_now"].append(f"[{letter}] {term}")

    by_letter = {}
    for letter, term in not_found:
        by_letter.setdefault(letter, []).append(term)

    report = {
        "tool": "analyze_stage3_log.py (H2776)",
        "not_found_total": len(not_found),
        "by_letter": {k: len(v) for k, v in by_letter.items()},
        "suspect_printed_2025": classified["printed_2025_but_not_found_now"],
        "expected_no_hits": classified["no_hits_expected_vol2_only"],
        "other_log_lines": other,
    }
    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")

    if args.md:
        md = ["# Разбор log стадии [3] — пилот книги I (H2776)\n"]
        md.append(f"Всего «не найдено»: {len(not_found)} · по указателям: " +
                  ", ".join(f"{k}={len(v)}" for k, v in sorted(by_letter.items())) + "\n")
        md.append(f"## Подозрительные (в diff стадии [1] не значились «только в новой» — вероятно, печатались в 2025): {len(classified['printed_2025_but_not_found_now'])}\n")
        md += [f"> - {t}" for t in classified["printed_2025_but_not_found_now"]]
        md.append(f"\n## Ожидаемые (термины «только в новой» — общий словник, вероятно только том II): {len(classified['no_hits_expected_vol2_only'])}\n")
        md += [f"> - {t}" for t in classified["no_hits_expected_vol2_only"]]
        if other:
            md.append("\n## Прочие строки лога (STYLE?/GREP-ERR/REF-ERR)\n")
            md += [f"> - {t}" for t in other]
        Path(args.md).write_text("\n".join(md) + "\n", encoding="utf-8")

    print(f"not_found={len(not_found)} by_letter={report['by_letter']}")
    print(f"suspect={len(classified['printed_2025_but_not_found_now'])} expected={len(classified['no_hits_expected_vol2_only'])} other={len(other)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
