#!/usr/bin/env python3
"""Build a gazetteer of every place named in the project as GeoJSON.

A gazetteer is a place register, distinct from the journey: each place
appears once (Ayodhyā is start AND end of the route, but one gazetteer
entry). Sources:
  - data/rama-route.json   — route places (on_route: true), deduped
  - data/gazetteer-extra.json — places named in the epic but off the
    drawn route (Mahendragiri, Pampā/Śabarī), (on_route: false)

Writes data/export/gazetteer.geojson (RFC 7946, [lng, lat]). Reusable as
a standalone point layer / gazetteer in any GIS tool. Run after editing
either source; output is committed.
"""
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
ROUTE = ROOT / 'data' / 'rama-route.json'
EXTRA = ROOT / 'data' / 'gazetteer-extra.json'
OUT = ROOT / 'data' / 'export' / 'gazetteer.geojson'

PROP_KEYS = ('label', 'name_iast', 'name_devanagari', 'wikidata',
             'modern_place', 'modern_wikidata', 'canonical_ref', 'source',
             'alt_identification', 'alt_source')


def feature(place, on_route):
    props = {k: place[k] for k in PROP_KEYS if place.get(k)}
    props['on_route'] = on_route
    return {
        'type': 'Feature',
        'geometry': {'type': 'Point', 'coordinates': [place['lng'], place['lat']]},
        'properties': props,
    }


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def main():
    features = []
    seen = set()
    for s in load(ROUTE)['stops']:
        key = (round(s['lat'], 3), round(s['lng'], 3), s.get('label'))
        if key in seen:
            continue
        seen.add(key)
        features.append(feature(s, True))
    for p in load(EXTRA):
        features.append(feature(p, False))

    fc = {
        'type': 'FeatureCollection',
        'name': 'ramayana-gazetteer',
        'note': ('Газетир мест, названных в проекте «Русская Рамаяна». '
                 'Координаты — современные традиционные отождествления, не '
                 'археологически установленные точки.'),
        'features': features,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(fc, f, ensure_ascii=False, indent=2)
        f.write('\n')

    on = sum(1 for x in features if x['properties']['on_route'])
    print(f'{len(features)} places ({on} on-route, {len(features) - on} extra) '
          f'-> {OUT}')


if __name__ == '__main__':
    main()
