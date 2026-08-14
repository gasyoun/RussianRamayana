"""idml_audit.py — static structural inventory of an IDML package (zip-of-XML).

No InDesign required: IDML is a deterministic XML export, so page geometry, section
starts, fonts, links and story text hashes are all readable offline. This is the
tool used for Step 4/5's baseline-vs-conversion structural comparison; LIVE facts
that only InDesign itself knows at runtime (actual overset state, missing-font
resolution, preflight errors) come from export_print_evidence.jsx instead — see
docs/print-readiness/ for the split of responsibility.

_Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589)._
"""

import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

DESIGNMAP_VERSION_RE = re.compile(r'<\?aid[^>]*product="([^"]+)"[^>]*\?>')
CONTENT_RE = re.compile(r"<Content>(.*?)</Content>", re.DOTALL)


def _local(tag):
    return tag.split("}", 1)[-1] if "}" in tag else tag


def _read(z, name):
    return z.read(name).decode("utf-8")


def audit(idml_path):
    idml_path = Path(idml_path)
    z = zipfile.ZipFile(idml_path)
    names = z.namelist()

    designmap = _read(z, "designmap.xml")
    m = DESIGNMAP_VERSION_RE.search(designmap)
    product_version = m.group(1) if m else None
    dm_root = ET.fromstring(designmap)
    dom_version = dm_root.attrib.get("DOMVersion")
    story_list = dm_root.attrib.get("StoryList", "").split()

    sections = []
    for sec in dm_root.iter():
        if _local(sec.tag) == "Section":
            sections.append(
                {
                    "self": sec.attrib.get("Self"),
                    "name": sec.attrib.get("Name"),
                    "marker": sec.attrib.get("Marker"),
                    "page_number_start": sec.attrib.get("PageNumberStart"),
                    "page_number_type": sec.attrib.get("PageNumberType"),
                    "included_document_page_start": sec.attrib.get("IncludeSectionPrefix"),
                }
            )

    pages = []
    spread_names = sorted(n for n in names if n.startswith("Spreads/") and n.endswith(".xml"))
    for sname in spread_names:
        root = ET.fromstring(_read(z, sname))
        for el in root.iter():
            if _local(el.tag) == "Page":
                pages.append(
                    {
                        "spread_file": sname,
                        "self": el.attrib.get("Self"),
                        "name": el.attrib.get("Name"),
                        "geometric_bounds": el.attrib.get("GeometricBounds"),
                        "applied_master": el.attrib.get("AppliedMaster"),
                    }
                )

    fonts = []
    if "Resources/Fonts.xml" in names:
        froot = ET.fromstring(_read(z, "Resources/Fonts.xml"))
        for el in froot.iter():
            if _local(el.tag) == "FontFamily":
                family = el.attrib.get("Name")
                for f in el:
                    if _local(f.tag) == "Font":
                        fonts.append(
                            {
                                "family": family,
                                "name": f.attrib.get("Name"),
                                "postscript_name": f.attrib.get("PostScriptName"),
                                "font_type": f.attrib.get("FontType"),
                                "status": f.attrib.get("Status"),
                            }
                        )

    links = []
    for sname in spread_names:
        data = _read(z, sname)
        for lm in re.finditer(r"<Link\b[^>]*>", data):
            attrs = dict(re.findall(r'(\w+)="([^"]*)"', lm.group(0)))
            links.append(
                {
                    "spread_file": sname,
                    "link_resource_uri": attrs.get("LinkResourceURI"),
                    "stored_state": attrs.get("StoredState"),
                    "link_resource_modified": attrs.get("LinkResourceModified"),
                }
            )

    stories = []
    story_files = sorted(n for n in names if n.startswith("Stories/") and n.endswith(".xml"))
    for sfile in story_files:
        raw = _read(z, sfile)
        content_segments = CONTENT_RE.findall(raw)
        text = "".join(content_segments)
        h = hashlib.sha256(text.encode("utf-8")).hexdigest()
        stories.append(
            {
                "file": sfile,
                "self": Path(sfile).stem.replace("Story_", ""),
                "text_length": len(text),
                "text_sha256": h,
                "in_story_list": Path(sfile).stem.replace("Story_", "") in story_list,
            }
        )

    z.close()

    return {
        "idml_path": str(idml_path).replace("\\", "/"),
        "product_version": product_version,
        "dom_version": dom_version,
        "story_list_count": len(story_list),
        "page_count": len(pages),
        "spread_count": len(spread_names),
        "sections": sections,
        "pages": pages,
        "fonts": fonts,
        "links": links,
        "stories": stories,
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
    p = argparse.ArgumentParser(description="Standalone IDML structural audit")
    p.add_argument("path")
    p.add_argument("--output")
    args = p.parse_args(argv)
    result = audit(args.path)
    write_report(result, args.output)


if __name__ == "__main__":
    main()
