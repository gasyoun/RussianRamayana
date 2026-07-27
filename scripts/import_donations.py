#!/usr/bin/env python3
"""Import a Boosty/Patreon-style donation export into the private ledger and
republish only the public aggregates in data/fundraising/summary.json.

Per roadmap.md ("Следующие шаги" → автоматический импорт донатов) and
architecture.md §Учёт пожертвований: raw platform exports carry donor names
and must never be published. This script normalizes an export into the
private ledger schema (date/platform/amount/currency/amount_rub/fee/
net_amount_rub/donor_name/public_name/anonymous/reward_level/comment/
source_id), merges it into a private CSV ledger (gitignored, never
committed), and republishes ONLY the aggregate counters
(onetime.collected_rub/donor_count, monthly.pledged_rub/supporter_count,
updated_at) into the public summary.json.

Column layouts below are best-effort profiles for Boosty/Patreon exports —
no real export has landed in this repo yet (synthetic-fixture only, see
tests/fixtures/). Re-check header names against a real export the first
time one is available and adjust PLATFORM_PROFILES accordingly.

Usage:
    python scripts/import_donations.py <export.csv> [--platform boosty|patreon|generic|auto]
                                        [--ledger PATH] [--summary PATH]
                                        [--fx-usd RATE] [--fx-eur RATE] [--dry-run]
"""
import argparse
import csv
import datetime
import hashlib
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_LEDGER = ROOT / 'donations_private.csv'
DEFAULT_SUMMARY = ROOT / 'data' / 'fundraising' / 'summary.json'
DEFAULT_PAYMENT_METHODS = ROOT / 'data' / 'payment-methods.json'
DEFAULT_LEVELS = ROOT / 'data' / 'fundraising' / 'levels.json'

LEDGER_FIELDS = [
    'date', 'platform', 'amount', 'currency', 'amount_rub', 'fee',
    'net_amount_rub', 'donor_name', 'public_name', 'anonymous',
    'reward_level', 'comment', 'source_id',
]

TRUTHY = {'да', 'yes', 'true', '1', 'y'}


def _truthy(value):
    return str(value or '').strip().lower() in TRUTHY


def _num(value, default=0.0):
    text = str(value or '').strip().replace(' ', '').replace(',', '.')
    if not text:
        return default
    return float(text)


def _row_hash(row):
    payload = '|'.join(str(v) for v in row.values())
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()[:16]


def map_generic(row, _fx):
    """Rows already in ledger shape (e.g. hand-entered Sber statement lines)."""
    amount = _num(row.get('amount'))
    amount_rub = _num(row.get('amount_rub'), default=amount)
    fee = _num(row.get('fee'))
    net = _num(row.get('net_amount_rub'), default=amount_rub - fee)
    donor_name = (row.get('donor_name') or '').strip()
    anonymous = _truthy(row.get('anonymous'))
    return {
        'date': (row.get('date') or '').strip(),
        'platform': (row.get('platform') or '').strip().lower(),
        'amount': amount,
        'currency': (row.get('currency') or 'RUB').strip().upper(),
        'amount_rub': amount_rub,
        'fee': fee,
        'net_amount_rub': net,
        'donor_name': donor_name,
        'public_name': 'Аноним' if anonymous else (row.get('public_name') or donor_name),
        'anonymous': anonymous,
        'reward_level': (row.get('reward_level') or '').strip(),
        'comment': (row.get('comment') or '').strip(),
        'source_id': (row.get('source_id') or '').strip() or _row_hash(row),
    }


def map_boosty(row, fx):
    amount = _num(row.get('Сумма'))
    fee = _num(row.get('Комиссия'))
    currency = 'RUB'
    donor_name = (row.get('Подписчик') or '').strip()
    anonymous = _truthy(row.get('Аноним'))
    return {
        'date': (row.get('Дата') or '').strip(),
        'platform': 'boosty',
        'amount': amount,
        'currency': currency,
        'amount_rub': round(amount * fx.get(currency, 1.0), 2),
        'fee': round(fee * fx.get(currency, 1.0), 2),
        'net_amount_rub': round((amount - fee) * fx.get(currency, 1.0), 2),
        'donor_name': donor_name,
        'public_name': 'Аноним' if anonymous else donor_name,
        'anonymous': anonymous,
        'reward_level': (row.get('Уровень') or '').strip(),
        'comment': (row.get('Сообщение') or '').strip(),
        'source_id': (row.get('ID') or '').strip() or _row_hash(row),
    }


def map_patreon(row, fx):
    currency = (row.get('Currency') or 'USD').strip().upper()
    amount = _num(row.get('Amount'))
    fee = _num(row.get('Fee'))
    rate = fx.get(currency)
    if rate is None:
        raise ValueError(
            f"no FX rate supplied for currency {currency!r} "
            f"(pass --fx-{currency.lower()} RATE)")
    donor_name = (row.get('Patron') or row.get('Name') or '').strip()
    anonymous = _truthy(row.get('Incognito'))
    return {
        'date': (row.get('Charge Date') or row.get('Date') or '').strip(),
        'platform': 'patreon',
        'amount': amount,
        'currency': currency,
        'amount_rub': round(amount * rate, 2),
        'fee': round(fee * rate, 2),
        'net_amount_rub': round((amount - fee) * rate, 2),
        'donor_name': donor_name,
        'public_name': 'Аноним' if anonymous else donor_name,
        'anonymous': anonymous,
        'reward_level': (row.get('Reward Title') or row.get('Tier') or '').strip(),
        'comment': (row.get('Message') or '').strip(),
        'source_id': (row.get('Charge Id') or row.get('Id') or '').strip() or _row_hash(row),
    }


PLATFORM_PROFILES = {
    'generic': (LEDGER_FIELDS, map_generic),
    'boosty': (['Дата', 'Сумма', 'Подписчик'], map_boosty),
    'patreon': (['Patron', 'Amount', 'Charge Date'], map_patreon),
}


def detect_platform(fieldnames):
    header = set(fieldnames or [])
    for name, (signature, _mapper) in PLATFORM_PROFILES.items():
        if set(signature) <= header:
            return name
    raise ValueError(
        f'could not auto-detect platform from header {sorted(header)}; '
        f'pass --platform explicitly')


def parse_export(path, platform, fx):
    with open(path, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        if platform == 'auto':
            platform = detect_platform(reader.fieldnames)
        _signature, mapper = PLATFORM_PROFILES[platform]
        rows = [mapper(row, fx) for row in reader]
    return platform, rows


def load_ledger(path):
    if not path.exists():
        return {}
    with open(path, encoding='utf-8', newline='') as f:
        return {row['source_id']: row for row in csv.DictReader(f)}


def write_ledger(path, rows_by_id):
    ordered = sorted(rows_by_id.values(), key=lambda r: (r['date'], r['source_id']))
    with open(path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=LEDGER_FIELDS)
        writer.writeheader()
        for row in ordered:
            writer.writerow({k: row.get(k, '') for k in LEDGER_FIELDS})


def load_platform_types(path):
    if not path.exists():
        return {}
    with open(path, encoding='utf-8') as f:
        methods = json.load(f).get('methods', [])
    return {m['id']: m.get('type', 'one-time') for m in methods}


def aggregate(rows_by_id, platform_types):
    buckets = {
        'one-time': {'net_rub': 0.0, 'donors': set()},
        'subscription': {'net_rub': 0.0, 'donors': set()},
    }
    for row in rows_by_id.values():
        bucket = platform_types.get(row['platform'], 'one-time')
        b = buckets.setdefault(bucket, {'net_rub': 0.0, 'donors': set()})
        b['net_rub'] += float(row.get('net_amount_rub') or 0)
        donor_key = (row.get('donor_name') or row['source_id']).strip().lower()
        b['donors'].add(donor_key)
    return buckets


def update_summary(summary_path, buckets, updated_at):
    with open(summary_path, encoding='utf-8') as f:
        summary = json.load(f)
    onetime = buckets.get('one-time', {'net_rub': 0.0, 'donors': set()})
    monthly = buckets.get('subscription', {'net_rub': 0.0, 'donors': set()})
    summary['onetime']['collected_rub'] = round(onetime['net_rub'])
    summary['onetime']['donor_count'] = len(onetime['donors'])
    summary['monthly']['pledged_rub'] = round(monthly['net_rub'])
    summary['monthly']['supporter_count'] = len(monthly['donors'])
    summary['updated_at'] = updated_at
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
        f.write('\n')
    return summary


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('export_csv', type=pathlib.Path)
    parser.add_argument('--platform', choices=['auto', *PLATFORM_PROFILES], default='auto')
    parser.add_argument('--ledger', type=pathlib.Path, default=DEFAULT_LEDGER)
    parser.add_argument('--summary', type=pathlib.Path, default=DEFAULT_SUMMARY)
    parser.add_argument('--payment-methods', type=pathlib.Path, default=DEFAULT_PAYMENT_METHODS)
    parser.add_argument('--fx-usd', type=float, default=None)
    parser.add_argument('--fx-eur', type=float, default=None)
    parser.add_argument('--updated-at', default=None, help='override date stamp, YYYY-MM-DD (tests)')
    parser.add_argument('--dry-run', action='store_true', help='parse and report, write nothing')
    args = parser.parse_args(argv)

    fx = {'RUB': 1.0}
    if args.fx_usd is not None:
        fx['USD'] = args.fx_usd
    if args.fx_eur is not None:
        fx['EUR'] = args.fx_eur

    platform, new_rows = parse_export(args.export_csv, args.platform, fx)

    ledger = load_ledger(args.ledger)
    for row in new_rows:
        ledger[row['source_id']] = row

    platform_types = load_platform_types(args.payment_methods)
    buckets = aggregate(ledger, platform_types)
    updated_at = args.updated_at or datetime.date.today().isoformat()

    print(f'platform={platform} parsed={len(new_rows)} ledger_total={len(ledger)}')
    for name, b in buckets.items():
        print(f'  {name}: net_rub={round(b["net_rub"])} donors={len(b["donors"])}')

    if args.dry_run:
        return 0

    write_ledger(args.ledger, ledger)
    update_summary(args.summary, buckets, updated_at)
    print(f'wrote ledger -> {args.ledger}')
    print(f'wrote summary -> {args.summary}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
