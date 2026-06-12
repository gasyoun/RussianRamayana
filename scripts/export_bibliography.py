#!/usr/bin/env python3
"""Export the edition catalog to standard bibliographic formats.

Reads data/editions.json and data/retellings.json, writes:
  data/export/bibliography.csl.json  (CSL-JSON, for Zotero/citeproc)
  data/export/bibliography.bib       (BibTeX/biblatex)

Only entries with a known year are exported (unpublished volumes have none).
Identifier fields (isbn, wikidata, viaf), when present in the source JSON,
are carried through. Run after any catalog change; outputs are committed.
"""
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'export'


def load(name):
    with open(ROOT / 'data' / name, encoding='utf-8') as f:
        return json.load(f)


def csl_name(full):
    # "П. А. Гринцер" / "В.Г. Эрман" -> family="Гринцер", given="П. А."
    parts = full.rsplit(' ', 1)
    if len(parts) == 2:
        return {'family': parts[1], 'given': parts[0]}
    return {'literal': full}


def to_csl(entry, role):
    year = entry.get('year')
    item = {
        'id': entry['id'],
        'type': 'book',
        'title': entry['title'],
        'publisher': entry.get('publisher', ''),
        'issued': {'date-parts': [[int(year)]]},
        'language': 'ru',
    }
    person = entry.get('translator') or entry.get('author')
    if person:
        item[role] = [csl_name(person)]
    if entry.get('series'):
        item['collection-title'] = entry['series']
    if entry.get('isbn'):
        item['ISBN'] = entry['isbn']
    if entry.get('url'):
        item['URL'] = entry['url']
    if entry.get('description'):
        item['note'] = entry['description']
    return item


def bib_escape(s):
    return s.replace('&', r'\&').replace('%', r'\%')


def to_bibtex(item, role_field):
    lines = [f'@book{{{item["id"]},']
    person = item.get('translator') or item.get('author')
    if person:
        name = person[0]
        full = (f'{name["family"]}, {name["given"]}'
                if 'family' in name else name['literal'])
        lines.append(f'  {role_field} = {{{bib_escape(full)}}},')
    lines.append(f'  title = {{{bib_escape(item["title"])}}},')
    if item.get('publisher'):
        lines.append(f'  publisher = {{{bib_escape(item["publisher"])}}},')
    lines.append(f'  year = {{{item["issued"]["date-parts"][0][0]}}},')
    if item.get('collection-title'):
        lines.append(f'  series = {{{bib_escape(item["collection-title"])}}},')
    if item.get('ISBN'):
        lines.append(f'  isbn = {{{item["ISBN"]}}},')
    if item.get('URL'):
        lines.append(f'  url = {{{item["URL"]}}},')
    lines.append('  language = {russian},')
    lines.append('}')
    return '\n'.join(lines)


csl = []
bib = []
for entry in load('editions.json'):
    if not entry.get('year'):
        continue
    item = to_csl(entry, 'translator')
    csl.append(item)
    bib.append(to_bibtex(item, 'translator'))
for entry in load('retellings.json'):
    if not entry.get('year'):
        continue
    item = to_csl(entry, 'author')
    csl.append(item)
    bib.append(to_bibtex(item, 'author'))

OUT.mkdir(parents=True, exist_ok=True)
with open(OUT / 'bibliography.csl.json', 'w', encoding='utf-8') as f:
    json.dump(csl, f, ensure_ascii=False, indent=2)
    f.write('\n')
with open(OUT / 'bibliography.bib', 'w', encoding='utf-8') as f:
    f.write('% Русская Рамаяна — каталог изданий. Генерируется\n'
            '% scripts/export_bibliography.py из data/editions.json и\n'
            '% data/retellings.json — не редактировать вручную.\n\n')
    f.write('\n\n'.join(bib))
    f.write('\n')

print(f'CSL-JSON: {len(csl)} entries -> {OUT / "bibliography.csl.json"}')
print(f'BibTeX:   {len(bib)} entries -> {OUT / "bibliography.bib"}')
