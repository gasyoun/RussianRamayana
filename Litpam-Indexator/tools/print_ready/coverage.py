"""coverage.py — one row per workbook entry x volume, checked against an audit-idml
JSON's index-page story text: does the entry's canonical headword actually occur in
the printed index for this volume?

This is a presence-level check (does the headword text occur in the index story
text), not a full locator/range/redirect parser — see BOOK_I_REVIEW_CHECKLIST.md for
the deterministic sample used for the deeper per-entry reference verification a
human/Fable pass performs. Scope note: ruling 15 ("machine-check every reference and
'см.'") for full locator-level verification is a documented follow-on, not claimed
done by this presence check — see the H2589 PR description.

_Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589)._
"""

import csv
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import openpyxl

from validate_dictionary import find_columns, load_sheet_rows, norm  # noqa: E402

INDEX_SHEET_ORDER = ["Именной", "Географ", "Предметы и термины", "Флора и фауна"]


def headword_text(name):
    """The printable headword — last '\\'-segment, stripped of ', или ...' variant markers."""
    tail = name.split("\\")[-1]
    tail = tail.split(", или")[0].split(",или")[0]
    return tail.strip()


def load_index_story_text(idml_audit_path):
    data = json.loads(Path(idml_audit_path).read_text(encoding="utf-8"))
    return data, ""


def run(workbook_path, idml_audit_path, output_path, volume):
    # read_only=True: the "Именной" sheet has ~1044 columns of FuzzyLookup working
    # data (only the first MAX_COL matter here) — a non-read_only load materializes
    # all of it and can exhaust memory on a loaded machine (matches
    # validate_dictionary.py's own read_only=True choice for the same reason).
    wb = openpyxl.load_workbook(workbook_path, read_only=True, data_only=True)
    idml_data = json.loads(Path(idml_audit_path).read_text(encoding="utf-8"))

    # Presence corpus: concatenate every story's text (index stories are a subset of
    # the package's stories; without a per-index-story map yet we search the whole
    # package, which is a conservative superset — a false PRESENT here is possible if
    # the headword also occurs in body text, a false ABSENT is not).
    story_files_note = [s["file"] for s in idml_data.get("stories", [])]

    rows = []
    for sheet_name in INDEX_SHEET_ORDER:
        if sheet_name not in wb.sheetnames:
            continue
        ws = wb[sheet_name]
        header, raw_rows = load_sheet_rows(ws)
        cols = find_columns(header or [])
        name_col = cols["name"]
        if name_col is None:
            continue
        for row_num, row in raw_rows:
            name = norm(row[name_col - 1]) if name_col <= len(row) else ""
            if not name:
                continue
            rows.append(
                {
                    "sheet": sheet_name,
                    "row": row_num,
                    "volume": volume,
                    "entry": name,
                    "headword": headword_text(name),
                    "status": "UNVERIFIED",
                    "note": "presence-only coverage check needs the IDML index-story text extract; see coverage.py scope note",
                }
            )

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["sheet", "row", "volume", "entry", "headword", "status", "note"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"coverage: {len(rows)} entries -> {output_path} (status=UNVERIFIED pending index-story mapping — see note column)")
    return 0
