#!/usr/bin/env python3
"""Export the Rama route to GeoJSON for reuse in other GIS/mapping tools.

Reads data/rama-route.json, writes data/export/rama-route.geojson — a
FeatureCollection (WGS84, RFC 7946) with:
  - one Point feature per stop (region stops use their centroid);
  - one Polygon feature for any stop flagged "is_region" (e.g. Daṇḍaka);
  - one LineString feature for the journey, in stop order.

GeoJSON uses [longitude, latitude] order. Run after editing the route;
output is committed. The localization_note is carried as a top-level
foreign member so consumers see the "traditional identification" caveat.
"""
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'data' / 'rama-route.json'
OUT = ROOT / 'data' / 'export' / 'rama-route.geojson'

PROP_KEYS = ('label', 'name', 'name_iast', 'name_devanagari', 'num', 'book',
             'canonical_ref', 'wikidata', 'modern_place', 'modern_wikidata',
             'source', 'alt_identification', 'alt_source')


def props(stop):
    return {k: stop[k] for k in PROP_KEYS if stop.get(k)}


def main():
    with open(SRC, encoding='utf-8') as f:
        route = json.load(f)
    stops = route['stops']

    features = []
    for s in stops:
        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [s['lng'], s['lat']]},
            'properties': props(s),
        })
        if s.get('is_region') and s.get('polygon'):
            ring = [[lng, lat] for lat, lng in s['polygon']]
            if ring[0] != ring[-1]:
                ring.append(ring[0])  # GeoJSON polygons must be closed
            features.append({
                'type': 'Feature',
                'geometry': {'type': 'Polygon', 'coordinates': [ring]},
                'properties': {**props(s), 'feature_role': 'region'},
            })

    features.append({
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': [[s['lng'], s['lat']] for s in stops],
        },
        'properties': {'name': 'Путешествие Рамы', 'feature_role': 'route'},
    })

    fc = {
        'type': 'FeatureCollection',
        'name': 'rama-route',
        'note': route.get('localization_note', ''),
        'features': features,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(fc, f, ensure_ascii=False, indent=2)
        f.write('\n')

    points = sum(1 for x in features if x['geometry']['type'] == 'Point')
    polys = sum(1 for x in features if x['geometry']['type'] == 'Polygon')
    print(f'{len(features)} features ({points} points, {polys} polygons, '
          f'1 route) -> {OUT}')


if __name__ == '__main__':
    main()
