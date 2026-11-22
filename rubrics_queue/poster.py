#!/usr/bin/env python3
"""Auto-poster for the Ramayana rubrics line (handoff H8530, MG ruling 21-11-2026:
"никакого копипаста, бот сам все").

Reads rubrics_queue/queue.tsv, takes rows with status=approved whose week matches
the current ISO week (or --id), posts the draft body to the owner channel
@ramayanaru via the Telegram Bot API, records tg_msg_id + posted_at, and flips
the row to status=posted. Rows without an MG verdict (draft/awaiting-gate) are
NEVER posted — the red line stays in code.

Token: env RRAM_TG_BOT_TOKEN, or file rubrics_queue/.bot_token (gitignored).

Usage:
  python3 rubrics_queue/poster.py --dry-run        # no token needed, prints posts
  python3 rubrics_queue/poster.py                  # live post + queue flip
  python3 rubrics_queue/poster.py --id RB1-001     # one row regardless of week
"""
import argparse
import csv
import datetime
import os
import re
import sys
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
QUEUE = os.path.join(HERE, "queue.tsv")
CHANNEL = "@ramayanaru"  # MG ruling 21-11-2026: главный канал линии
COLS = ["id", "rubric", "status", "episode", "canonical_ref", "week",
        "draft_file", "posted_at", "tg_msg_id"]
STATUSES_ALLOWED = ("approved",)  # red line: only MG-approved rows post


def iso_week(tag):
    m = re.match(r"(\d{4})-W(\d{2})$", tag.strip())
    if not m:
        return None
    return (int(m.group(1)), int(m.group(2)))


def load_rows():
    with open(QUEUE, encoding="utf-8", newline="") as f:
        rows = list(csv.reader(f, delimiter="\t"))
    if rows[0] != COLS:
        raise SystemExit("queue.tsv header mismatch: %r" % (rows[0],))
    return rows[0], rows[1:]


def md_to_tg_html(text):
    """Minimal md -> Telegram HTML: escape, then **bold**, *italic*, [t](url)."""
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)",
                  r'<a href="\2">\1</a>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    return text


def draft_body(path):
    """Frontmatter and internal-metadata lines stripped, md -> TG HTML."""
    raw = open(path, encoding="utf-8").read()
    if raw.startswith("---"):
        raw = raw.split("---", 2)[2]
    keep = [ln for ln in raw.splitlines()
            if not ln.startswith("_Created:")
            and not ln.startswith("_Auto-generated")]
    body = "\n".join(keep).strip()
    return md_to_tg_html(body)


def send(token, html):
    data = urllib.parse.urlencode({
        "chat_id": CHANNEL, "text": html, "parse_mode": "HTML",
        "disable_web_page_preview": "false"}).encode()
    req = urllib.request.Request(
        "https://api.telegram.org/bot%s/sendMessage" % token, data=data)
    with urllib.request.urlopen(req, timeout=30) as r:
        import json
        return json.load(r)["result"]["message_id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--id", default="", help="post one row by id")
    ap.add_argument("--week", default=datetime.date.today().strftime("%G-W%V"),
                    help="ISO week tag, default: current")
    args = ap.parse_args()

    header, rows = load_rows()
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    cur = iso_week(args.week)

    picked = [r for r in rows if args.id and r[0] == args.id and not r[7]] or \
             [r for r in rows if not args.id
              and r[2] in STATUSES_ALLOWED
              and iso_week(r[5]) == cur
              and not r[7]]
    if not args.id:
        picked = [r for r in picked if r[2] in STATUSES_ALLOWED]
    if not picked:
        print("nothing to post (week %s, approved+unposted)" % args.week)
        return 0

    token = os.environ.get("RRAM_TG_BOT_TOKEN") or ""
    tokfile = os.path.join(HERE, ".bot_token")
    if not token and os.path.exists(tokfile):
        token = open(tokfile, encoding="utf-8").read().strip()
    if not args.dry_run and not token:
        raise SystemExit("no token: set RRAM_TG_BOT_TOKEN or rubrics_queue/.bot_token")

    changed = False
    for r in picked:
        if r[2] not in STATUSES_ALLOWED:
            print("SKIP %s: status=%s — red line, only approved posts" % (r[0], r[2]))
            continue
        body = draft_body(os.path.join(HERE, r[6]))
        if args.dry_run:
            print("=== DRY RUN %s -> %s (week %s) ===" % (r[0], CHANNEL, r[5]))
            print(body)
            continue
        mid = send(token, body)
        r[2], r[7], r[8] = "posted", now, str(mid)
        changed = True
        print("POSTED %s -> %s msg_id=%s" % (r[0], CHANNEL, mid))

    if changed:
        with open(QUEUE, "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f, delimiter="\t", lineterminator="\n")
            w.writerow(header)
            w.writerows(rows)
    return 0


if __name__ == "__main__":
    sys.exit(main())
