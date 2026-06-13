#!/usr/bin/env python3
"""Validate every data/*.json file.

Two layers:
  1. Parse check — every JSON file must be well-formed UTF-8 JSON. This alone
     catches the failure mode that silently breaks a page (a trailing comma,
     a bad escape) before it reaches production.
  2. Schema check — if data/schema/<basename>.schema.json exists, the file is
     validated against it (JSON Schema draft 2020-12). Files without a schema
     pass with a "parse-only" note, so new data files never break CI before a
     schema is written for them.

Generated outputs (data/export/) and the schemas themselves are skipped.
Exit code is non-zero if any file fails. Run locally: python scripts/validate_data.py
"""
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
SCHEMA_DIR = DATA / 'schema'
SKIP_DIRS = {'export', 'schema'}

try:
    import jsonschema
except ImportError:
    jsonschema = None


def load_schema(basename):
    path = SCHEMA_DIR / f'{basename}.schema.json'
    if not path.exists():
        return None
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def main():
    files = sorted(
        p for p in DATA.rglob('*.json')
        if not any(part in SKIP_DIRS for part in p.relative_to(DATA).parts)
    )
    if not files:
        print('::error::no data/*.json files found')
        return 1

    failures = 0
    schema_checked = 0
    parse_only = 0
    for path in files:
        rel = path.relative_to(ROOT).as_posix()
        try:
            with open(path, encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            print(f'::error file={rel}::invalid JSON: {e}')
            failures += 1
            continue

        schema = load_schema(path.stem)
        if schema is None:
            print(f'  ok (parse-only)   {rel}')
            parse_only += 1
            continue
        if jsonschema is None:
            print(f'::error::jsonschema not installed — cannot validate {rel}')
            failures += 1
            continue
        try:
            jsonschema.validate(data, schema)
            print(f'  ok (schema)       {rel}')
            schema_checked += 1
        except jsonschema.ValidationError as e:
            loc = '/'.join(str(p) for p in e.absolute_path) or '(root)'
            print(f'::error file={rel}::schema violation at {loc}: {e.message}')
            failures += 1

    print(f'\n{len(files)} files: {schema_checked} schema-validated, '
          f'{parse_only} parse-only, {failures} failed')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
