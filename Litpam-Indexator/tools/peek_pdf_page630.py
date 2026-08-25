#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dump raw text of PDF page 630 (1-based) from the pilot-II print copy, to inspect
the printed annotation/gloss convention (§7.1) before building an extraction script."""
import sys

import fitz

sys.stdout.reconfigure(encoding="utf-8")

doc = fitz.open("work/print-readiness/pilot-II/Ramayana_II_12.10.25.pdf")
page = doc[629]  # 0-indexed page 630
print(page.get_text("text"))
