# BUGHUNT-FINDINGS — RussianRamayana — 23.11.2026

_Created: 23-11-2026 · Last updated: 23-11-2026_

_Nightly bug hunt (MG ruling 26-09-2026: nightly, one repo, auto-fix HIGH). Executor: GLM-5.3-Flash (zai-coding-plan / glm-5.3-flash). Scope: repo CODE — `scripts/`, root-level `.py`, `js/`, `rubrics_queue/`, `tests/`, `Litpam-Indexator/tools/`, `.github/workflows/`; skipped: vendored/data giants/audio, lockfiles, `Leitan-Sundarakanda/` (source texts), `data/*.json` bodies except where consumed by code._

**Elapsed: ~40 min wall (hunt ~02:50–03:10 MSK, fix+verify ~03:10–03:30, landing ~03:30).**

Every finding below was verified by actually running the probe named in «Evidence» in this session; nothing is taken from a doc or memory.

---

## HIGH

### H-1 · `scripts/update-counter.ps1` — README-documented money-counter tool was triply broken (schema clobber, RU-Windows parse failure, donor-count inflation) — **FIXED THIS RUN**

- File (fixed version): [scripts/update-counter.ps1](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/update-counter.ps1)
- Old defective lines: schema block wrote a **flat** object (`collected_rub`, `donor_count`, `goal_rub`, `monthly_goal_rub`) — old lines 39–47; donor key `"anon_$($donorNames.Count)"` — old line 35.
- Consumers that read the **nested** schema (`onetime.collected_rub`, `monthly.pledged_rub`, …): [index.html L846–858](https://github.com/gasyoun/RussianRamayana/blob/main/index.html#L846-L858), [support.html L375–406](https://github.com/gasyoun/RussianRamayana/blob/main/support.html#L375-L406); canonical nested writer: [scripts/import_donations.py](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/import_donations.py). The tool is presented as live in [README.md L75](https://github.com/gasyoun/RussianRamayana/blob/main/README.md#L75).
- Class: broken contract / public money-display corruption / data clobber (money-adjacent → auto-fix per MG ruling; not a credential finding, no GTD hand-off needed).

**Defects (three in one script):**

1. **Schema clobber.** Running the script rewrote `data/fundraising/summary.json` in the legacy flat shape; every consumer does `data.onetime.collected_rub` → `undefined.toLocaleString` → TypeError; both pages fall into their catch branches and the public counter shows «—». The committed monthly block (`pledged_rub`, `supporter_count`) was destroyed.
2. **Parse failure on Windows PowerShell 5.1.** The file was BOM-less UTF-8 with Cyrillic string literals; RU-locale PS 5.1 reads it as ANSI → `TerminatorExpectedAtEndOfString` parse errors — the README-documented tool could not run on RU Windows at all. (Verified byte-level: `git show origin/main:scripts/update-counter.ps1 | head -c 3` = `3c 23 0a`, no `EF BB BF`.)
3. **donor_count inflation.** `$key = "anon_$($donorNames.Count)"` minted a fresh key per anonymous donation row — one anonymous donor giving twice counted as two donors. Money-miscount class.

**Fix shipped:** nested-schema output (`onetime.collected_rub` / `onetime.donor_count` / `onetime.goal_rub`, `monthly.*` preserved from the existing file), UTF-8 BOM added to the script itself (parses on RU-locale PS 5.1), donor keyed by normalized `donor_name` (same rule as `import_donations.py`), output written BOM-less UTF-8 via `[System.IO.File]::WriteAllText` (PS 5.1's `Set-Content -Encoding UTF8` emits a BOM that breaks strict JSON parsers).

**Evidence (live, this session):** `pwsh` on this Mac is a bash-emulation shim (H3914) — no real engine — so the fixed script was verified end-to-end on the MSI Windows box over SSH with real `powershell` 5.1: 5-row fixture (anon donor ×2, named donor ×2, unnamed ×1) + pre-existing summary with `monthly.pledged_rub=9500` → output `onetime.collected_rub=2550`, `onetime.donor_count=3`, `monthly` preserved byte-for-byte, `updated_at=2026-11-23`, **no flat keys** (negative control), zero BOM in output, two consecutive runs identical (idempotent), exit 0 both runs. Repo pytest still 11/11 green after the change.

## MEDIUM

### M-1 · `rubrics_queue/poster.py` — partial-failure re-post hazard (same class H8530 round-1 repaired)

- [rubrics_queue/poster.py L115–L134](https://github.com/gasyoun/RussianRamayana/blob/main/rubrics_queue/poster.py#L115-L134)
- `queue.tsv` is persisted only **after** the whole posting loop. If `draft_body()` ([L120](https://github.com/gasyoun/RussianRamayana/blob/main/rubrics_queue/poster.py#L120)) or `send()` ([L125](https://github.com/gasyoun/RussianRamayana/blob/main/rubrics_queue/poster.py#L125)) throws on row N after row N−1 already posted, row N−1's `posted` flip is lost (never written) → the next run **re-posts** an already-published message to @ramayanaru (duplicate public post). Related sharp edge: an empty/missing `draft_file` crashes `open()` mid-loop with the same effect. Report-only (MEDIUM).

### M-2 · `data/export/bibliography.csl.json` — stale committed export vs its generator

- [data/export/bibliography.csl.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/export/bibliography.csl.json) vs regeneration from [scripts/export_bibliography.py](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/export_bibliography.py).
- Evidence: re-ran the generator in a temp copy (main tree untouched) — `bibliography.bib`, `gazetteer.geojson`, `rama-route.geojson` are byte-identical (parity OK), but `bibliography.csl.json` **drifts**: the committed `note` for the retellings entry carries an older shorter description; the current catalog source has the newer expanded text. The catalog was edited after the last export run. Residual filed as GTD @DO (regenerate + commit; data edit, out of auto-fix scope for MEDIUM).

### M-3 · `scripts/import_donations.py` — silent ledger-row replacement on re-import

- [scripts/import_donations.py L247](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/import_donations.py#L247)
- `ledger[row['source_id']] = row` overwrites an existing ledger row with the fresh parse with no diff/warning — a re-imported export with a stripped/changed field silently replaces richer (possibly hand-corrected) money data. Money-data integrity class, no crash. Report-only.

## LOW

### L-1 · `scripts/export_bibliography.py` — latent author→translator mislabel (0 rows trigger today)

- [scripts/export_bibliography.py L46–L48](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/export_bibliography.py#L46-L48): `person = entry.get('translator') or entry.get('author')` then `item[role] = …` with `role='translator'` — an editions entry with `author` but no `translator` would be exported (CSL + BibTeX) with the **author in the translator field**. Evidence: live check of `data/editions.json` — 6 entries, **0** with author-but-no-translator, so no committed output is wrong today. Latent.

### L-2 · `scripts/check_links.py` — URL fragments silently dropped → anchor rot unchecked

- [scripts/check_links.py L66–L68](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/check_links.py#L66-L68): `encode_url` drops the fragment (`urlunsplit` with empty fragment), so a link whose target page lives but whose `#anchor` died verifies OK. Report-only.

### L-3 · `scripts/audio_inventory.py` — probe mode dead off Windows

- [scripts/audio_inventory.py L34](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/audio_inventory.py#L34): `FFPROBE = ROOT / 'bin' / 'ffprobe.exe'` — inventory (probe) mode fails on macOS/Linux; `--verify` mode (the documented everyday path) is fine. Report-only.

### L-4 · `rubrics_queue/poster.py` — unclosed frontmatter crashes; local/UTC week+timestamp mix

- [L66](https://github.com/gasyoun/RussianRamayana/blob/main/rubrics_queue/poster.py#L66): `raw.split("---", 2)[2]` raises IndexError if a draft has an opening `---` but no closing fence. [L89](https://github.com/gasyoun/RussianRamayana/blob/main/rubrics_queue/poster.py#L89) derives the default week from the **local** date while `posted_at` ([L94](https://github.com/gasyoun/RussianRamayana/blob/main/rubrics_queue/poster.py#L94)) is UTC — a week-boundary run near midnight can tag the row with the neighbour week. Report-only.

### L-5 · `scripts/prerender.py` — docstring vs `copy_assets()` (doc-only)

- The docstring says drafts.html "must not be baked into public HTML"; `EXCLUDE` skips only the **rendering**, while `copy_assets()` ([L51](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/prerender.py#L51)) still copies the raw gated page into `dist/`. Not a leak: the gate is default-deny (`PASSWORD_HASH=''`) and [data/drafts.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/drafts.json) carries only public-safe teasers by documented design (in-file comment, SECURITY.md). Doc-consistency note only.

## Verified green this session (live probes)

- `pytest tests/` — **11 passed** (twice: before fix on main, after fix in worktree).
- `scripts/validate_data.py` — 19 files: 18 schema-validated, 1 parse-only, **0 failed**.
- `scripts/changelog_duplicate_bullets.py` — no duplicated entries (23 nested-label skips).
- `py_compile` sweep — **71/71** .py files compile (`scripts/`, `Litpam-Indexator/tools/` incl. `print_ready/`, `tests/`).
- Secret sweep (`git grep` for Telegram-bot/sk-/xox/ghp/AIza token shapes over tracked files) — **0 hits**; `rubrics_queue/.bot_token`, `donations_private.csv`, `_private/`, `.env` all gitignored (verified in `.gitignore`).
- Export parity (temp-copy regeneration, main tree untouched) — `bibliography.bib` / `gazetteer.geojson` / `rama-route.geojson` byte-identical (csl drift → M-2). Coordinate-swap in `export_geojson.py` re-checked against live data (`[lat,lng]` source → `[lng,lat]` output) — correct.
- Fix verification receipt — see H-1 (real PowerShell 5.1 on MSI, fixture in / out asserted, remote fixture cleaned up).

## Notes

- `scripts/prerender.py` sat dirty in the shared main tree during the hunt (CRLF/LF churn only — content-identical diff). Untouched per worktree discipline; no action needed.
- `scripts/changelog_*.py` are deployed spine copies (github-spine/changelog_guard) — per their headers, defects there are upstream-fixed, not forked per repo. No defects found in either.
- No committed secrets, no credential findings → no HIGH-credential GTD row this run. One GTD @DO row filed for the M-2 export regeneration residual.

---

_BUGHUNT-FINDINGS-RussianRamayana-23.11.2026.md · Dr. Mārcis Gasūns_
