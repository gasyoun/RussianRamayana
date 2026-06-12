#!/usr/bin/env python3
"""Inventory the 1986 audiobook MP3s: size, SHA-256, ffprobe duration/bitrate.

Outputs JSON to stdout, keyed by book number. Used to populate data/audio.json
and the Internet Archive upload manifest (docs/ia-upload.md).
"""
import hashlib
import json
import pathlib
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
FFPROBE = ROOT / 'bin' / 'ffprobe.exe'


def probe(path):
    out = subprocess.run(
        [str(FFPROBE), '-v', 'error', '-show_entries',
         'format=duration,bit_rate', '-of', 'json', str(path)],
        capture_output=True, text=True, encoding='utf-8', check=True)
    fmt = json.loads(out.stdout)['format']
    return float(fmt['duration']), int(fmt.get('bit_rate', 0))


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def hms(seconds):
    s = int(round(seconds))
    return f'{s // 3600:02d}:{s % 3600 // 60:02d}:{s % 60:02d}'


result = {}
for path in sorted(ROOT.glob('Рамаяна 1986. Книга *.[mM][pP]3')):
    num = int(path.name.split('.')[1].split()[1])
    dur, br = probe(path)
    result[num] = {
        'file': path.name,
        'size_bytes': path.stat().st_size,
        'sha256': sha256(path),
        'duration': hms(dur),
        'bitrate_kbps': round(br / 1000),
    }

print(json.dumps(result, ensure_ascii=False, indent=2))
