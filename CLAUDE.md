# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Русская Рамаяна** is a data-driven static site: a digital corpus, translation archive, and crowdfunding platform supporting completion of the first full poetic academic Russian translation of Valmiki's Ramayana (Гринцер → Леонов line, series "Литературные памятники").

No framework, no package manager. Pure HTML5/CSS3/ES6+. **Development is build-free**: open any `.html` file in a browser, or serve locally with `python -m http.server` — pages fetch their JSON at runtime.

There is **one optional build, used only for deployment**: `scripts/prerender.py` (headless Chromium) bakes the data-driven pages to static HTML in `dist/` for SEO/archivability, run by `.github/workflows/deploy.yml` which deploys to GitHub Pages (Pages source = GitHub Actions). Renders are idempotent (each clears its container before populating), so baked pages still hydrate live from JSON. You never need to run the build for local development.

## Architecture

All pages load their content via `fetch()` from `data/*.json` at runtime — no server required. To update site content, edit the relevant JSON file; the page picks it up on next load.

**Pages and their primary data sources:**

| Page | Data sources |
|---|---|
| `index.html` | `fundraising/summary.json`, `project-status.json` |
| `support.html` | `fundraising/summary.json`, `fundraising/levels.json`, `payment-methods.json`, `project-status.json` |
| `translations.html` | `translations.json`, `retellings.json` |
| `project.html` | `people.json`, `videos.json`, `project-status.json` |
| `timeline.html` | `timeline.json` |
| `media.html` | `audio.json`, `videos.json` |
| `compare/sundarakanda-start.html` | `comparison-episodes.json` |

**Key data files:**

- `data/fundraising/summary.json` — live fundraising counter (`collected_rub`, `donor_count`, `updated_at`)
- `data/fundraising/levels.json` — subscription tiers and bonuses
- `data/project-status.json` — status of Books IV, V, VI
- `data/payment-methods.json` — payment channel details (Sber, Boosty, Patreon, bank transfer)

## Design system

Shared styles live in `style.css` (repo root), loaded by every page via `<link rel="stylesheet" href="style.css">` (`../style.css` for `compare/`). It contains:

- CSS variables (palette + `--success`)
- Reset, `body`, paper-texture overlay
- `.nav-back`, `.header-ornament`, `.divider*`, `footer`
- Google Fonts `@import`

```css
--ink, --ink-soft, --ink-muted        /* text hierarchy */
--paper, --paper-dark                  /* backgrounds */
--gold, --gold-light, --gold-pale      /* accent color */
--border, --border-strong              /* gold-tinted borders */
--success                              /* green for status badges */
```

To change the palette or any shared element, edit `style.css` only. Each page's `<style>` block contains only its own component styles.

## Content rules (from roadmap.md)

- **Эрман** = пересказ, not перевод. Never describe him as a translator.
- **Потабенко** is not included as a translator of the Ramayana (no such translation exists).
- Translations, подстрочники, пересказы, and adaptations must be visually and terminologically kept strictly separate.
- Книга IV delay is attributed to Серебряный (not completing the introduction); the current fundraiser does not affect Book IV.
- Книга VI drafts are subscriber-only.
- No search functionality on this site — it exists at `samskrtam.ru`.
- English version not planned.

## Content inventory and next steps

`docs/content-inventory.md` — full audit of audio, video, texts, and images with publication-readiness statuses.

`roadmap.md` — long-form product decisions, open questions (Q1–Q15), and risks. Consult before making structural changes.

`CHANGELOG.md` — working log of decisions and changes; update when making non-trivial edits.

## Where findings go (ruling F1, 26-08-2026)

This repo keeps **no local registries of its own**. Gotchas found here are routed to the two
org hubs: infra and process to
[Uprava/FINDINGS.md](https://github.com/gasyoun/Uprava/blob/main/FINDINGS.md); Sanskrit data
(encodings, transliteration, corpus traps) to
[SanskritLexicography/FINDINGS.md](https://github.com/gasyoun/SanskritLexicography/blob/master/FINDINGS.md).
Do not scaffold a local `FINDINGS.md` or any of the seven sibling registries here — the
two-hub routing is the design, not a gap.

Before writing a normalizer, transcoder, parser or exporter, read
[SHARED_CODE.md](https://github.com/gasyoun/github-spine/blob/main/SHARED_CODE.md); what this
repo produces for the rest of the spine is registered in
[PROJECT_INTERLINKS.md](https://github.com/gasyoun/Uprava/blob/main/PROJECT_INTERLINKS.md)
and [interlinks_edges.tsv](https://github.com/gasyoun/Uprava/blob/main/interlinks_edges.tsv).

## Large binary assets

MP3 audiobook files (7 books, named in Cyrillic) live in the repo root. GitHub has a 100 MiB file limit — hosting for large files is an open risk noted in `roadmap.md`. Do not add new large binaries without a hosting plan.
