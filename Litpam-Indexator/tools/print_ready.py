#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
print_ready.py — deterministic print-readiness tooling for Litpam-Indexator (H2589).

Subcommands:
  repair-workbook   reversible, ledgered correction of validate_dictionary.py findings
  audit-idml        IDML (zip-of-XML) structural inventory, no InDesign required
  audit-pdf         PDF metadata/boxes/fonts/text-hash/contact-sheet inventory
  coverage          one row per workbook entry x volume, checked against IDML audits
  verify-packet     validate an evidence packet's manifest + checksums

Nothing here mutates the original 2025 InDesign packages or the source workbook —
see docs/print-readiness/DEFECT_POLICY.md and PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md
for the contract this tool implements.

_Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589)._
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

from print_ready import repair as repair_mod  # noqa: E402
from print_ready import idml_audit  # noqa: E402
from print_ready import pdf_audit  # noqa: E402
from print_ready import coverage as coverage_mod  # noqa: E402
from print_ready import packet as packet_mod  # noqa: E402
from print_ready import conversion_gate as gate_mod  # noqa: E402


def cmd_repair_workbook(args):
    ledger = repair_mod.repair_workbook(args.source, args.output, args.ledger)
    md_path = Path(args.ledger).with_suffix(".md")
    md_path.write_text(repair_mod.format_ledger_md(ledger), encoding="utf-8")
    print(
        f"repair-workbook: {ledger['operation_count']} dispositions "
        f"({ledger['fixed_count']} fixed, {ledger['waiting_count']} WAITING) "
        f"-> {args.output}\nledger: {args.ledger}\nledger (md): {md_path}"
    )
    return 0


def cmd_audit_idml(args):
    result = idml_audit.audit(args.path)
    out = Path(args.output) if args.output else None
    idml_audit.write_report(result, out)
    print(f"audit-idml: {args.path} -> {out or '(stdout above)'}")
    return 0


def cmd_audit_pdf(args):
    result = pdf_audit.audit(args.path, contact_sheet_dir=args.contact_sheets)
    out = Path(args.output) if args.output else None
    pdf_audit.write_report(result, out)
    print(f"audit-pdf: {args.path} -> {out or '(stdout above)'}")
    return 0


def cmd_coverage(args):
    rc = coverage_mod.run(args.workbook, args.idml_audit, args.output, volume=args.volume)
    return rc


def cmd_verify_packet(args):
    ok, report = packet_mod.verify(args.packet)
    print(report)
    return 0 if ok else 1


def cmd_conversion_gate(args):
    report = gate_mod.build_gate_report(
        args.baseline_idml_audit, args.conversion_idml_audit, args.conversion_evidence_report, args.volume
    )
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"conversion-gate: verdict={report['verdict']} defects={len(report['defects'])} -> {args.output}")
    return 0 if report["verdict"] == "PASS" else 1


def build_parser():
    p = argparse.ArgumentParser(prog="print_ready.py", description=__doc__)
    sub = p.add_subparsers(dest="command", required=True)

    rw = sub.add_parser("repair-workbook", help="reversible workbook repair with ledger")
    rw.add_argument("--source", required=True)
    rw.add_argument("--output", required=True)
    rw.add_argument("--ledger", required=True)
    rw.set_defaults(func=cmd_repair_workbook)

    ai = sub.add_parser("audit-idml", help="IDML structural inventory")
    ai.add_argument("path")
    ai.add_argument("--output")
    ai.set_defaults(func=cmd_audit_idml)

    ap = sub.add_parser("audit-pdf", help="PDF metadata/boxes/fonts/hash inventory")
    ap.add_argument("path")
    ap.add_argument("--output")
    ap.add_argument("--contact-sheets", help="directory to write contact-sheet PNGs into")
    ap.set_defaults(func=cmd_audit_pdf)

    cv = sub.add_parser("coverage", help="workbook entry x volume coverage/reference check")
    cv.add_argument("--workbook", required=True)
    cv.add_argument("--idml-audit", required=True, help="JSON produced by audit-idml")
    cv.add_argument("--output", required=True)
    cv.add_argument("--volume", required=True, choices=["I", "II"])
    cv.set_defaults(func=cmd_coverage)

    vp = sub.add_parser("verify-packet", help="validate an evidence packet")
    vp.add_argument("--packet", required=True)
    vp.set_defaults(func=cmd_verify_packet)

    cg = sub.add_parser("conversion-gate", help="Step5 baseline-vs-conversion gate verdict + defects")
    cg.add_argument("--baseline-idml-audit", required=True)
    cg.add_argument("--conversion-idml-audit", required=True)
    cg.add_argument("--conversion-evidence-report", required=True)
    cg.add_argument("--volume", default="I")
    cg.add_argument("--output", required=True)
    cg.set_defaults(func=cmd_conversion_gate)

    return p


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
