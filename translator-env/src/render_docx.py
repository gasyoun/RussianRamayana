# -*- coding: utf-8 -*-
"""Конвертер листов .md -> .docx с НАСТОЯЩИМИ сносками Word (H764 шаг 4б).

pandoc-синтаксис сносок ([^n]) конвертируется в подлинные Word footnotes, а не
в «(1)» в теле — это и просил хэндофф («настоящие footnotes»). Отдельный шаг,
потому что зависит от внешнего pandoc; gen_sheets.py делает .md всегда.

Запуск:  python render_docx.py [--sargas 1,2]
Автор: Opus 4.8 (`claude-opus-4-8`), H764.
"""
import argparse
import shutil
import subprocess
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SHEETS = Path(__file__).resolve().parents[1] / "sheets"


def run(sargas):
    pandoc = shutil.which("pandoc")
    if not pandoc:
        print("[docx] pandoc не найден в PATH — .docx не собран (нужен pandoc). "
              ".md и .html формы уже готовы.")
        return 1
    rc = 0
    for s in sargas:
        md = SHEETS / f"sarga_{s}.md"
        docx = SHEETS / f"sarga_{s}.docx"
        if not md.exists():
            print(f"[docx] нет {md.name} — сначала gen_sheets.py")
            rc = 1
            continue
        cmd = [pandoc, str(md), "-o", str(docx), "--from", "markdown",
               "--to", "docx", "--wrap", "preserve"]
        p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        if p.returncode != 0:
            print(f"[docx] pandoc упал на {md.name}: {p.stderr.strip()[:300]}")
            rc = 1
        else:
            print(f"[docx] {docx.name} ({docx.stat().st_size} байт, настоящие footnotes)")
    return rc


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--sargas", default="1,2")
    a = ap.parse_args()
    sys.exit(run([int(x) for x in a.sargas.split(",") if x.strip()]))
