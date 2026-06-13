#!/usr/bin/env python3
"""Pre-render the data-driven pages to static HTML for SEO / archivability.

Each page renders itself with its OWN JavaScript (no second renderer to drift):
a headless Chromium loads the page from a local server, waits for the fetch +
render to settle, and the resulting DOM is serialized into dist/. The deployed
baked pages keep their <script> tags, so JS still hydrates them live from the
JSON on load (renders are idempotent — they clear their container first), which
is why dynamic data (e.g. fundraising) stays fresh while crawlers and no-JS
readers get real content.

drafts.html is intentionally NOT pre-rendered: it is subscriber-gated and its
content must not be baked into public HTML.

Requires: pip install playwright && python -m playwright install chromium
Run: python scripts/prerender.py   (outputs to dist/)
"""
import functools
import http.server
import pathlib
import shutil
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
PORT = 8799

# Pages NOT pre-rendered: subscriber-gated content must not be baked.
EXCLUDE = {'drafts.html'}
# Top-level items to copy into dist (everything the served site needs).
ASSET_DIRS = ['data', 'js', 'web', 'web-src', 'compare']
ASSET_FILES = ['style.css', 'sitemap.xml', 'robots.txt', 'datapackage.json',
               'CITATION.cff']


def copy_assets():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for d in ASSET_DIRS:
        src = ROOT / d
        if src.exists():
            shutil.copytree(src, DIST / d)
    for f in ASSET_FILES + [p.name for p in ROOT.glob('*.html')]:
        src = ROOT / f
        if src.exists():
            shutil.copy2(src, DIST / f)


def pages():
    found = [p.name for p in sorted(ROOT.glob('*.html'))]
    rel = [f for f in found if f not in EXCLUDE]
    rel += ['compare/' + p.name for p in sorted((ROOT / 'compare').glob('*.html'))]
    return rel


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    copy_assets()
    httpd = serve()
    baked = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        for rel in pages():
            url = f'http://127.0.0.1:{PORT}/{rel}'
            try:
                page.goto(url, wait_until='networkidle', timeout=30000)
                page.wait_for_timeout(700)  # let DOMContentLoaded renders settle
                html = page.content()
            except Exception as e:  # noqa: BLE001
                print(f'::warning::prerender failed for {rel}: {e}')
                continue
            out = DIST / rel
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(html, encoding='utf-8')
            print(f'  baked  {rel}  ({len(html)} bytes)')
            baked += 1
        browser.close()
    httpd.shutdown()
    excluded = ', '.join(sorted(EXCLUDE))
    print(f'\nPre-rendered {baked} pages -> {DIST}  (excluded: {excluded})')
    return 0


if __name__ == '__main__':
    sys.exit(main())
