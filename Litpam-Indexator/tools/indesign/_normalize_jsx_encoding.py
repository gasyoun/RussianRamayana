#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Normalize a .jsx file to UTF-8-with-BOM + CRLF, per Litpam-Indexator/CLAUDE.md
convention ('.jsx — UTF-8 с BOM, CRLF (сохранять именно так)'). Idempotent — safe
to re-run after every Edit to the tracked .jsx files.
"""
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")


def normalize(path):
    path = Path(path)
    data = path.read_bytes()
    if data[:3] == b"\xef\xbb\xbf":
        data = data[3:]
    text = data.decode("utf-8").replace("\r\n", "\n").replace("\n", "\r\n")
    path.write_bytes(b"\xef\xbb\xbf" + text.encode("utf-8"))
    print(f"normalized: {path}")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        normalize(p)
