#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dump per-line bbox/x0 + font info for PDF page 630, to detect level-1 vs
level-2 (subentry) indentation before building the annotation ground-truth
extractor."""
import sys

import fitz

sys.stdout.reconfigure(encoding="utf-8")

doc = fitz.open("work/print-readiness/pilot-II/Ramayana_II_12.10.25.pdf")
page = doc[629]
d = page.get_text("dict")
for block in d["blocks"]:
    if "lines" not in block:
        continue
    for line in block["lines"]:
        text = "".join(sp["text"] for sp in line["spans"])
        if not text.strip():
            continue
        x0 = line["bbox"][0]
        fonts = {(sp["font"], round(sp["size"], 1)) for sp in line["spans"]}
        print(f"x0={x0:7.2f} fonts={fonts} | {text!r}")
