"""conversion_gate.py — compare a baseline (InDesign 2022) audit-idml/audit-pdf pair
against a conversion (InDesign 2026) pair, plus the LIVE export_print_evidence.jsx
report from the conversion run, and render the Step-5 gate verdict + defect ledger
entries per the criteria in IMPLEMENTATION_LITPAM_INDEXATOR_PRINT_READINESS.md §Step 5.

_Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589).
"""

import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")


def parse_evidence_report(report_path):
    lines = Path(report_path).read_text(encoding="utf-8").splitlines()
    parsed = {"sections": [], "fonts": [], "links": [], "overset_stories": [], "scalars": {}}
    for line in lines:
        if "=" not in line and "|" not in line:
            continue
        if line.startswith("SECTION|"):
            parsed["sections"].append(line.split("|")[1:])
        elif line.startswith("FONT|"):
            parsed["fonts"].append(line.split("|")[1:])
        elif line.startswith("LINK|"):
            parsed["links"].append(line.split("|")[1:])
        elif line.startswith("OVERSET_STORY|"):
            parsed["overset_stories"].append(line.split("|")[1:])
        elif "=" in line and "|" not in line.split("=")[0]:
            k, _, v = line.partition("=")
            parsed["scalars"][k] = v
    return parsed


def build_gate_report(
    baseline_idml, conversion_idml, conversion_evidence, volume="I",
    overset_waiver_ids=None, waive_missing_links=False, waiver_note=None,
):
    baseline = json.loads(Path(baseline_idml).read_text(encoding="utf-8"))
    conversion = json.loads(Path(conversion_idml).read_text(encoding="utf-8"))
    evidence = parse_evidence_report(conversion_evidence)
    overset_waiver_ids = set(overset_waiver_ids or [])

    checks = []
    defects = []
    seq = 0

    def add_defect(defect_class, rule, observed, expected, disposition, evidence_note):
        nonlocal seq
        seq += 1
        defects.append(
            {
                "id": f"DFT-{volume}-{seq:04d}",
                "class": defect_class,
                "status": "open" if disposition != "wontfix-exception" else "wontfix-exception",
                "volume": volume,
                "index": None,
                "page": None,
                "rule": rule,
                "observed": observed,
                "expected": expected,
                "disposition": disposition,
                "evidence": evidence_note,
                "found_by": "print_ready.py conversion_gate (H2589)",
            }
        )

    # --- page count ---------------------------------------------------------
    page_ok = baseline["page_count"] == conversion["page_count"]
    checks.append(("page_count", page_ok, baseline["page_count"], conversion["page_count"]))
    if not page_ok:
        add_defect(
            "blocker", "Step5 gate: equal page count",
            conversion["page_count"], baseline["page_count"], "open",
            "audit-idml page_count baseline vs conversion",
        )

    # --- story count ---------------------------------------------------------
    story_ok = baseline["story_list_count"] == conversion["story_list_count"]
    checks.append(("story_count", story_ok, baseline["story_list_count"], conversion["story_list_count"]))

    # --- links: any LINK_MISSING in the LIVE conversion report ---------------
    missing_links = [l for l in evidence["links"] if len(l) > 1 and "MISSING" in l[1]]
    links_ok = len(missing_links) == 0 or waive_missing_links
    checks.append(("links_missing", links_ok, 0, len(missing_links)))
    if missing_links and waive_missing_links:
        add_defect(
            "material",
            "Step5 gate: 0 missing links (WAIVED as pre-existing)",
            f"{len(missing_links)} link(s) LINK_MISSING, waived: "
            + ", ".join(sorted(set(l[0] for l in missing_links))),
            "0 missing links",
            "WAITING",
            (waiver_note or "human-approved missing-links waiver")
            + " — files absent from the entire repo tree; remains WAITING until the "
            "original assets are recovered, but does not gate index mutation.",
        )
    elif missing_links:
        add_defect(
            "material",
            "Step5 gate: 0 missing links",
            f"{len(missing_links)} link(s) report LINK_MISSING in the live 2026 export: "
            + ", ".join(sorted(set(l[0] for l in missing_links))),
            "0 missing links",
            "WAITING",
            "export_print_evidence.jsx LINK|...|LINK_MISSING lines; not present anywhere in the "
            "committed repo tree either (git ls-tree search, 0 hits) — plausibly ALREADY missing "
            "under InDesign 2022 too (this machine cannot open InDesign 2022 live to confirm — see "
            "PR description 'InDesign 2022 COM limitation'), not necessarily conversion-introduced. "
            "A human/Fable call is needed: pre-existing vs conversion drift cannot be settled from "
            "this machine.",
        )

    # --- fonts: any live NOT_FOUND/SUBSTITUTED in the conversion -------------
    bad_fonts = [f for f in evidence["fonts"] if len(f) > 1 and f[1] not in ("INSTALLED",)]
    checks.append(("fonts_ok", len(bad_fonts) == 0, 0, len(bad_fonts)))
    if bad_fonts:
        add_defect(
            "material", "Step5 gate: 0 missing/substituted fonts",
            "; ".join(f"{f[0]}={f[1]}" for f in bad_fonts), "all INSTALLED", "open",
            "export_print_evidence.jsx live FONT|...|status lines",
        )

    # --- overset: any live overset story in the conversion -------------------
    # A waived story id (human-approved whitelist, e.g. tagged working stories
    # whose content demonstrably renders elsewhere) does not fail the check but
    # is still recorded as a wontfix-exception defect for the ledger.
    all_overset = evidence["overset_stories"]
    waived = [o for o in all_overset if o and o[0] in overset_waiver_ids]
    unwaived = [o for o in all_overset if not (o and o[0] in overset_waiver_ids)]
    overset_ok = len(unwaived) == 0
    checks.append(("overset_ok", overset_ok, 0, len(unwaived)))
    if waived:
        add_defect(
            "cosmetic",
            "Step5 gate + ruling 21 fail condition: no clipping/overset (WAIVED)",
            f"{len(waived)} overset story(ies) whitelisted by human waiver: "
            + ", ".join(o[0] for o in waived),
            "0 overset stories",
            "wontfix-exception",
            (waiver_note or "human-approved overset waiver")
            + "; story IDs: " + ", ".join(o[0] for o in waived),
        )
    if not overset_ok:
        add_defect(
            "blocker",
            "Step5 gate + ruling 21 fail condition: no clipping/overset",
            f"{len(unwaived)} overset stories live in 2026, including a story whose "
            f"visible text starts with an alphabetically-sorted index fragment "
            f"('{unwaived[-1][1] if unwaived else ''}') — "
            f"this is very likely the Именной index itself running over its frame after conversion.",
            "0 overset stories",
            "open",
            "export_print_evidence.jsx OVERSET_STORY|id|text-snippet lines; story IDs: "
            + ", ".join(o[0] for o in unwaived),
        )

    overall_pass = page_ok and links_ok and len(bad_fonts) == 0 and overset_ok
    has_waivers = bool(waived) or (bool(missing_links) and waive_missing_links)

    report = {
        "handoff": "H2589",
        "volume": volume,
        "gate": "Step5 conversion gate (2022 baseline -> 2026 conversion)",
        "verdict": ("PASS_WITH_WAIVERS" if has_waivers else "PASS") if overall_pass else "FAIL",
        "waivers": {
            "overset_story_ids": sorted(overset_waiver_ids),
            "missing_links_waived": bool(missing_links) and waive_missing_links,
            "note": waiver_note,
        } if has_waivers else None,
        "checks": [
            {"name": name, "pass": ok, "baseline": b, "conversion": c} for name, ok, b, c in checks
        ],
        "defects": defects,
        "note": (
            "Baseline captured from the already-committed InDesign-2022-native package "
            "(confirmed by its own designmap.xml product_version='17.4(51)' / PDF creator "
            "'Adobe InDesign 17.4 (Windows)'), audited statically via audit-idml/audit-pdf — "
            "NOT a fresh live 2022 re-export. This machine's only registered InDesign COM "
            "ProgID resolves to InDesign 2026 (InDesign 2022 has no distinct registered "
            "ProgID here), so InDesign 2022 cannot be driven live via COM on this machine. "
            "See the H2589 PR description for the full finding."
        ),
    }
    return report


def main(argv=None):
    import argparse

    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--baseline-idml-audit", required=True)
    p.add_argument("--conversion-idml-audit", required=True)
    p.add_argument("--conversion-evidence-report", required=True)
    p.add_argument("--volume", default="I")
    p.add_argument("--output", required=True)
    p.add_argument(
        "--waive-overset-story-id", action="append", default=[],
        help="story id whose overset is human-waived (repeatable)",
    )
    p.add_argument(
        "--waive-missing-links", action="store_true",
        help="treat LINK_MISSING as pre-existing WAITING, not a gate failure",
    )
    p.add_argument("--waiver-note", default=None, help="who approved the waiver, when, evidence link")
    args = p.parse_args(argv)

    if (args.waive_overset_story_id or args.waive_missing_links) and not args.waiver_note:
        p.error("--waiver-note is required when any waiver flag is used")

    report = build_gate_report(
        args.baseline_idml_audit, args.conversion_idml_audit, args.conversion_evidence_report,
        args.volume,
        overset_waiver_ids=args.waive_overset_story_id,
        waive_missing_links=args.waive_missing_links,
        waiver_note=args.waiver_note,
    )
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"conversion_gate: verdict={report['verdict']} defects={len(report['defects'])} -> {args.output}")
    return 0 if report["verdict"].startswith("PASS") else 1


if __name__ == "__main__":
    sys.exit(main())
