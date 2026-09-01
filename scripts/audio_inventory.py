#!/usr/bin/env python3
"""Inventory the 1986 audiobook MP3s: size, SHA-256, ffprobe duration/bitrate.

Default mode outputs JSON to stdout, keyed by book number. Used to populate
data/audio.json and the Internet Archive upload manifest (docs/ia-upload.md).

`--verify` answers a different, cheaper question: does *this* checkout actually
hold every MP3 that data/audio.json claims, byte-for-byte? It needs no ffprobe
and no bin/, so it runs anywhere.

  python scripts/audio_inventory.py --verify

Exit code 0 = all rows present and hash-matched, 1 = anything missing or drifted.

Why it exists: books V and VI are in .gitignore (124 MB / 154 MB, over GitHub's
100 MiB limit), so they live only as untracked files on the machine that holds
them. A census run inside a **linked git worktree** — which never carries
ignored files — reports them absent, and twice (26-08-2026, 28-08-2026) that
false absence was written down as "the archive is incomplete, fetch the files
from Yandex Disk". Run this in the machine's main checkout, not a worktree,
and read the `--verify` table instead of prose.
"""
import argparse
import hashlib
import json
import pathlib
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
FFPROBE = ROOT / 'bin' / 'ffprobe.exe'
AUDIO_JSON = ROOT / 'data' / 'audio.json'


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


def inventory():
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
    return 0


def verify():
    rows = json.loads(AUDIO_JSON.read_text(encoding='utf-8'))
    is_worktree = (ROOT / '.git').is_file()
    if is_worktree:
        print('⚠️  This is a linked git worktree — .gitignore\'d MP3s (books V, VI) '
              'are never checked out here. Absence below proves nothing about the '
              'machine. Re-run in the main checkout.\n', file=sys.stderr)

    print(f'{"id":8} {"present":9} {"size":7} {"sha256":8} file')
    failures = []
    for row in rows:
        path = ROOT / row['file']
        present = path.exists()
        size_ok = sha_ok = False
        if present:
            size_ok = path.stat().st_size == row.get('size_bytes')
            sha_ok = sha256(path) == row.get('sha256')
        if not (present and size_ok and sha_ok):
            failures.append(row['id'])
        mark = lambda ok: '✔' if ok else '✘'  # noqa: E731
        print(f'{row["id"]:8} {mark(present):9} {mark(size_ok):7} {mark(sha_ok):8} {row["file"]}')

    print()
    if failures:
        print(f'FAIL — {len(failures)} of {len(rows)} rows unverified: {", ".join(failures)}')
        return 1
    print(f'OK — all {len(rows)} books present and SHA-256 matched against data/audio.json')
    return 0


parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
parser.add_argument('--verify', action='store_true',
                    help='check this checkout against data/audio.json (no ffprobe needed)')
args = parser.parse_args()

sys.exit(verify() if args.verify else inventory())
