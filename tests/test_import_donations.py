"""Synthetic-fixture tests for scripts/import_donations.py.

No real Boosty/Patreon export exists in this repo yet, so these tests exercise
the normalizer against hand-built fixtures under tests/fixtures/ that mimic
each platform's expected column layout (see the docstring in
scripts/import_donations.py for the caveat on those layouts).
"""
import json
import pathlib
import subprocess
import sys

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
FIXTURES = pathlib.Path(__file__).resolve().parent / 'fixtures'
SCRIPT = ROOT / 'scripts' / 'import_donations.py'

sys.path.insert(0, str(ROOT / 'scripts'))
import import_donations as imp  # noqa: E402


def _base_summary():
    return {
        'onetime': {'goal_rub': 1000000, 'collected_rub': 0, 'donor_count': 0},
        'monthly': {'goal_rub': 166000, 'pledged_rub': 0, 'supporter_count': 0},
        'updated_at': '2026-05-14',
    }


def _write_summary(path, data=None):
    path.write_text(json.dumps(data or _base_summary(), ensure_ascii=False), encoding='utf-8')


def test_boosty_import_updates_monthly_bucket_only(tmp_path):
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)

    rc = imp.main([
        str(FIXTURES / 'boosty_export_sample.csv'),
        '--platform', 'boosty',
        '--ledger', str(ledger),
        '--summary', str(summary),
        '--updated-at', '2026-06-15',
    ])
    assert rc == 0

    rows = list(imp.csv.DictReader(ledger.open(encoding='utf-8')))
    assert len(rows) == 3
    assert {r['source_id'] for r in rows} == {'boosty-tx-001', 'boosty-tx-002', 'boosty-tx-003'}

    result = json.loads(summary.read_text(encoding='utf-8'))
    # Boosty is a subscription-type platform (data/payment-methods.json) ->
    # goes to the monthly bucket, one-time bucket stays untouched.
    assert result['onetime']['collected_rub'] == 0
    assert result['onetime']['donor_count'] == 0
    assert result['monthly']['pledged_rub'] == 950 + 4750 + 950
    assert result['monthly']['supporter_count'] == 2  # Иван Петров, Анна Смирнова
    assert result['updated_at'] == '2026-06-15'
    # goal_rub fields must survive untouched
    assert result['onetime']['goal_rub'] == 1000000
    assert result['monthly']['goal_rub'] == 166000

    # privacy: no donor name ever reaches the public aggregate file
    dumped = json.dumps(result, ensure_ascii=False)
    assert 'Иван Петров' not in dumped
    assert 'Анна Смирнова' not in dumped


def test_ledger_never_contains_only_aggregates_but_full_rows(tmp_path):
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)

    imp.main([
        str(FIXTURES / 'boosty_export_sample.csv'),
        '--ledger', str(ledger), '--summary', str(summary),
        '--updated-at', '2026-06-15',
    ])
    rows = list(imp.csv.DictReader(ledger.open(encoding='utf-8')))
    assert {r['donor_name'] for r in rows} == {'Иван Петров', 'Анна Смирнова'}
    anon_row = next(r for r in rows if r['source_id'] == 'boosty-tx-002')
    assert anon_row['anonymous'] == 'True'
    assert anon_row['public_name'] == 'Аноним'


def test_rerunning_same_export_is_idempotent(tmp_path):
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)

    for _ in range(2):
        imp.main([
            str(FIXTURES / 'boosty_export_sample.csv'),
            '--ledger', str(ledger), '--summary', str(summary),
            '--updated-at', '2026-06-15',
        ])

    rows = list(imp.csv.DictReader(ledger.open(encoding='utf-8')))
    assert len(rows) == 3
    result = json.loads(summary.read_text(encoding='utf-8'))
    assert result['monthly']['pledged_rub'] == 950 + 4750 + 950
    assert result['monthly']['supporter_count'] == 2


def test_patreon_import_requires_fx_rate(tmp_path):
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)

    with pytest.raises(ValueError, match='fx-usd'):
        imp.main([
            str(FIXTURES / 'patreon_export_sample.csv'),
            '--platform', 'patreon',
            '--ledger', str(ledger), '--summary', str(summary),
        ])


def test_patreon_import_converts_currency_with_fx_rate(tmp_path):
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)

    rc = imp.main([
        str(FIXTURES / 'patreon_export_sample.csv'),
        '--platform', 'patreon',
        '--ledger', str(ledger), '--summary', str(summary),
        '--fx-usd', '90',
        '--updated-at', '2026-06-15',
    ])
    assert rc == 0

    result = json.loads(summary.read_text(encoding='utf-8'))
    # (10-0.5)*90 + (20-1)*90 = 855 + 1710
    assert result['monthly']['pledged_rub'] == 855 + 1710
    assert result['monthly']['supporter_count'] == 2
    assert result['onetime']['collected_rub'] == 0


def test_generic_export_updates_onetime_bucket(tmp_path):
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)

    rc = imp.main([
        str(FIXTURES / 'generic_export_sample.csv'),
        '--platform', 'generic',
        '--ledger', str(ledger), '--summary', str(summary),
        '--updated-at', '2026-06-15',
    ])
    assert rc == 0

    result = json.loads(summary.read_text(encoding='utf-8'))
    # sber is a one-time-type platform -> onetime bucket only
    assert result['onetime']['collected_rub'] == 3000
    assert result['onetime']['donor_count'] == 1
    assert result['monthly']['pledged_rub'] == 0


def test_auto_detects_platform_from_header(tmp_path):
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)

    rc = imp.main([
        str(FIXTURES / 'generic_export_sample.csv'),
        '--ledger', str(ledger), '--summary', str(summary),
        '--updated-at', '2026-06-15',
    ])
    assert rc == 0
    result = json.loads(summary.read_text(encoding='utf-8'))
    assert result['onetime']['collected_rub'] == 3000


def test_cli_end_to_end_matches_acceptance_command(tmp_path):
    """python scripts/import_donations.py <fixture.csv> ... (the literal DoD command)."""
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)

    proc = subprocess.run(
        [sys.executable, str(SCRIPT), str(FIXTURES / 'boosty_export_sample.csv'),
         '--platform', 'boosty', '--ledger', str(ledger), '--summary', str(summary),
         '--updated-at', '2026-06-15'],
        cwd=ROOT, capture_output=True, text=True, encoding='utf-8', check=True,
    )
    assert proc.returncode == 0
    assert ledger.exists()
    result = json.loads(summary.read_text(encoding='utf-8'))
    assert result['monthly']['pledged_rub'] > 0


def test_dry_run_writes_nothing(tmp_path):
    ledger = tmp_path / 'ledger.csv'
    summary = tmp_path / 'summary.json'
    _write_summary(summary)
    original = summary.read_text(encoding='utf-8')

    imp.main([
        str(FIXTURES / 'boosty_export_sample.csv'),
        '--ledger', str(ledger), '--summary', str(summary), '--dry-run',
    ])
    assert not ledger.exists()
    assert summary.read_text(encoding='utf-8') == original
