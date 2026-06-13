#!/usr/bin/env python3
"""Check that outbound links in the site resolve (guards against link rot).

Scans *.html, data/**/*.json and datapackage.json for http(s) URLs, dedupes,
and requests each (HEAD, falling back to GET) with a browser User-Agent.
2xx/3xx = OK. 4xx/5xx/timeout = reported.

Some scholarly hosts block bots (HEAD 403 / 405); those are reported as REVIEW,
not failures, and a small allowlist of known bot-hostile hosts is downgraded.
Exit code is non-zero if genuine dead links are found — but the CI job runs
this non-blocking (link rot is a warning, not a build breaker; external sites
go down transiently).

Usage: python scripts/check_links.py
"""
import concurrent.futures
import pathlib
import re
import sys
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
URL_RE = re.compile(r'https?://[^\s"\'<>)\]]+')
# Hosts that routinely block automated HEAD/GET — non-2xx here is not a dead link.
BOT_HOSTILE = ('academia.edu', 'jstor.org', 'cambridge.org', 'exoticindiaart.com',
               'vk.com', 'livelib.ru', 'ozon.ru', 'labirint.ru', 'moscowbooks.ru')
# Infrastructure / namespace URLs that aren't content links — skip entirely.
SKIP_HOSTS = ('fonts.googleapis.com', 'fonts.gstatic.com', 'tile.openstreetmap.org',
              'www.w3.org')
UA = ('Mozilla/5.0 (compatible; RussianRamayana-linkcheck/1.0; '
      '+https://github.com/gasyoun/RussianRamayana)')


def collect_urls():
    urls = {}
    files = (list(ROOT.glob('*.html')) + list(ROOT.glob('compare/*.html'))
             + list(ROOT.rglob('data/**/*.json')) + [ROOT / 'datapackage.json'])
    for path in files:
        if not path.exists():
            continue
        text = path.read_text(encoding='utf-8', errors='replace')
        for m in URL_RE.findall(text):
            url = m.rstrip('.,;')
            # skip template placeholders ({s}/{z}, ${...}), schema URIs, infra hosts
            if '{' in url or '}' in url or '${' in url:
                continue
            if 'json-schema.org/draft' in url or url.split('//', 1)[1].rstrip('/') == 'schema.org':
                continue
            if any(h in url for h in SKIP_HOSTS):
                continue
            urls.setdefault(url, set()).add(path.relative_to(ROOT).as_posix())
    return urls


def encode_url(url):
    """Percent-encode non-ASCII (e.g. Cyrillic Wikipedia URLs) so urllib accepts them."""
    parts = urllib.parse.urlsplit(url)
    try:
        host = parts.netloc.encode('idna').decode('ascii')
    except Exception:  # noqa: BLE001
        host = parts.netloc
    path = urllib.parse.quote(parts.path, safe="/%:@!$&'()*+,;=~")
    query = urllib.parse.quote(parts.query, safe="/%:@!$&'()*+,;=~?")
    return urllib.parse.urlunsplit((parts.scheme, host, path, query, ''))


def check(url):
    req_url = encode_url(url)
    for method in ('HEAD', 'GET'):
        try:
            req = urllib.request.Request(req_url, method=method, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=15) as r:
                return r.status
        except urllib.error.HTTPError as e:
            if method == 'HEAD' and e.code in (403, 405, 501):
                continue  # retry with GET
            return e.code
        except Exception as e:  # noqa: BLE001
            if method == 'HEAD':
                continue
            return f'ERR: {type(e).__name__}'
    return 'ERR'


def main():
    urls = collect_urls()
    print(f'Checking {len(urls)} unique URLs...\n')
    dead, review = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
        results = list(ex.map(lambda u: (u, check(u)), urls))
    for url, status in sorted(results):
        ok = isinstance(status, int) and 200 <= status < 400
        if ok:
            continue
        hostile = any(h in url for h in BOT_HOSTILE)
        line = f'{status}  {url}  ({", ".join(sorted(urls[url]))})'
        if hostile:
            review.append(line)
        else:
            dead.append(line)
    if review:
        print('REVIEW (bot-hostile hosts — likely fine):')
        for l in review:
            print('  ' + l)
        print()
    if dead:
        print('DEAD / UNREACHABLE:')
        for l in dead:
            print(f'::warning::{l}')
        print(f'\n{len(dead)} problem link(s), {len(review)} to review, '
              f'{len(urls) - len(dead) - len(review)} OK')
        return 1
    print(f'All {len(urls)} links OK ({len(review)} bot-hostile skipped).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
