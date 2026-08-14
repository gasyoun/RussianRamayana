"""pdf_audit.py — PDF metadata/boxes/fonts/text-hash/contact-sheet inventory.

Uses PyMuPDF (bundled MuPDF; records exact dependency+version per H2589 acceptance —
this is the "bundled Poppler/PDFium" slot from the implementation doc, satisfied by
an equivalent bundled renderer rather than literally Poppler/PDFium).

_Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589)._
"""

import hashlib
import json
import sys
from pathlib import Path

import fitz  # PyMuPDF

DEPENDENCY = {"name": "PyMuPDF", "version": fitz.__doc__.split(":")[0].split()[-1] if fitz.__doc__ else fitz.VersionBind}


def audit(pdf_path, contact_sheet_dir=None, contact_sheet_dpi=72):
    pdf_path = Path(pdf_path)
    doc = fitz.open(pdf_path)

    metadata = dict(doc.metadata or {})
    pages = []
    fonts_seen = {}
    contact_sheets = []

    if contact_sheet_dir:
        contact_sheet_dir = Path(contact_sheet_dir)
        contact_sheet_dir.mkdir(parents=True, exist_ok=True)

    for i, page in enumerate(doc):
        rect = page.rect
        text = page.get_text("text")
        text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()

        page_fonts = []
        for f in page.get_fonts(full=True):
            xref, ext, ftype, basefont, name, encoding, *_ = f
            page_fonts.append(
                {"basefont": basefont, "type": ftype, "encoding": encoding, "embedded": ext != ""}
            )
            fonts_seen.setdefault(basefont, {"type": ftype, "embedded": ext != "", "pages": 0})
            fonts_seen[basefont]["pages"] += 1

        pages.append(
            {
                "index": i,
                "page_number": i + 1,
                "width_pt": rect.width,
                "height_pt": rect.height,
                "rotation": page.rotation,
                "text_length": len(text),
                "text_sha256": text_hash,
                "fonts": page_fonts,
            }
        )

        if contact_sheet_dir:
            zoom = contact_sheet_dpi / 72.0
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
            out = contact_sheet_dir / f"page-{i + 1:04d}.png"
            pix.save(out)
            contact_sheets.append(str(out).replace("\\", "/"))

    doc.close()

    return {
        "pdf_path": str(pdf_path).replace("\\", "/"),
        "dependency": DEPENDENCY,
        "metadata": metadata,
        "page_count": len(pages),
        "pages": pages,
        "fonts_summary": fonts_seen,
        "contact_sheets": contact_sheets,
    }


def write_report(result, output_path=None):
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text + "\n")


def main(argv=None):
    import argparse

    sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description="Standalone PDF structural audit")
    p.add_argument("path")
    p.add_argument("--output")
    p.add_argument("--contact-sheets")
    args = p.parse_args(argv)
    result = audit(args.path, contact_sheet_dir=args.contact_sheets)
    write_report(result, args.output)


if __name__ == "__main__":
    main()
