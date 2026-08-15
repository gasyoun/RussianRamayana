#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prep_goldenfish_drill.py — подготовить workspace дрилла Golden Fish для обкатки
drive_stage3.py (H2776): скопировать учебные IDML, конвертировать cp1251
Slovnik.txt в TSV для build_indexlist_table.jsx (термин\tформы; уровни `\`
сохраняются в термине — их разбирает UseReadyTable).

Запуск:
    python prep_goldenfish_drill.py [--workdir <dir>]
"""

import argparse
import shutil
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parents[2]
DRILL_SRC = BASE / "#Indexing. Ramayana" / "Info" / "Учебные примеры (Drill examples)" / "Golden Fish Story"


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--workdir", default=str(BASE / "work" / "print-readiness" / "drill-goldenfish"))
    args = p.parse_args(argv)
    wd = Path(args.workdir).resolve()
    if "work" not in wd.parts or "print-readiness" not in wd.parts:
        raise SystemExit("refusing: workdir must live under work/print-readiness/")
    wd.mkdir(parents=True, exist_ok=True)

    for name in ("Golden Fish.idml", "IndexStyles.idml"):
        if not (wd / name).exists():
            shutil.copy2(DRILL_SRC / name, wd / name)
            print("copied:", name)

    slovnik = (DRILL_SRC / "Slovnik.txt").read_text(encoding="cp1251")
    lines = [ln.rstrip() for ln in slovnik.splitlines() if ln.strip()]
    tsv = wd / "src-goldenfish.tsv"
    tsv.write_text("\n".join(f"{ln}\t" for ln in lines) + "\n", encoding="utf-8")
    print(f"slovnik: {len(lines)} строк -> {tsv}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
