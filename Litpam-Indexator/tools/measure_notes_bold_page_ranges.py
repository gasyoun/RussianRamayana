#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
measure_notes_bold_page_ranges.py -- measures config/print-readiness.json's
still-null notes_bold_page_ranges (§7.3) for one volume by scanning the
baseline 2025 PDF for the running heads/section titles "Примечания" and
"Приложения" (or "Приложение") and reporting the first/last PDF page each
title appears on. §7.3's own semantics are the published footnote's rule:
every locator pointing into notes/appendix pages prints bold -- this script
only measures the page RANGE those sections occupy, it does not touch bold
formatting itself.

Запуск:
    python measure_notes_bold_page_ranges.py <baseline.pdf>

_Автор инструмента: Dr. Mārcis Gasūns · создан 25-08-2026 (H2590 rebuild)._
"""

import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import fitz  # pymupdf


def main():
    path = sys.argv[1]
    doc = fitz.open(path)
    hits = {"Примечания": [], "Приложение": []}
    for i in range(len(doc)):
        text = doc[i].get_text()
        for key in hits:
            if key in text:
                hits[key].append(i + 1)  # 1-indexed PDF page number
    for key, pages in hits.items():
        if pages:
            print(f"{key}: pages {min(pages)}-{max(pages)} ({len(pages)} hits), sample pages {pages[:5]}...{pages[-5:]}")
        else:
            print(f"{key}: no hits")
    doc.close()


if __name__ == "__main__":
    main()
