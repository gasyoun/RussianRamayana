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

## Large binary assets

MP3 audiobook files (7 books, named in Cyrillic) live in the repo root. GitHub has a 100 MiB file limit — hosting for large files is an open risk noted in `roadmap.md`. Do not add new large binaries without a hosting plan.
