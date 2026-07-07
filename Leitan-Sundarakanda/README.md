# Leitan — Sundarakanda (Parab 1888)

Working drafts of the Sanskrit text of the *Sundarakāṇḍa* (Book V of the
Rāmāyaṇa), Parab's 1888 edition with the *Tilakā* commentary, prepared as
`.docx` source files and mirrored here as Markdown for easier diffing,
searching, and review.

Each sarga (chapter) carries Devanagari, IAST transliteration, and inline
commentary (blockquoted in the Markdown). `_Перевод сундараканды.docx` /
`.md` is the full running compilation of the book; the numbered
`Ramayana_Sundarakandam_Parab_1888_Chapter_NN_*` files are per-sarga working
drafts at various revision stages.

## Files

| File | Contents |
|---|---|
| `_Перевод сундараканды.{docx,md}` | Full Sundarakanda compilation (all sargas, Devanagari + IAST + commentary) |
| `Ramayana_Sundarakandam_Parab_1888_v6.3.0.{docx,md}` | Whole-book draft, v6.3.0 |
| `Ramayana_Sundarakandam_Parab_1888_v6.4.1.{docx,md}` | Whole-book draft, v6.4.1 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_23_v6.4.0.{docx,md}` | Sarga 23 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_24_v7.0.0.{docx,md}` | Sarga 24 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_25_v7.1.0.{docx,md}` | Sarga 25 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_26_v7.2.0.{docx,md}` | Sarga 26 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_27_Dev.{docx,md}` | Sarga 27, development draft |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_27_v1.0.{docx,md}` | Sarga 27, v1.0 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_28_v1.0.{docx,md}` | Sarga 28 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_29_v1.0.{docx,md}` | Sarga 29 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_30_v1.0.{docx,md}` | Sarga 30 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_31_v1.0.{docx,md}` | Sarga 31 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_32_v1.0.{docx,md}` | Sarga 32 |
| `Ramayana_Sundarakandam_Parab_1888_Chapter_33_v1.0.{docx,md}` | Sarga 33 |

Each `.md` file has an accompanying `<name>_media/` folder holding images
extracted from the corresponding `.docx` (page scans, diagrams) referenced
by the Markdown.

## About the Markdown conversion

The `.docx` files are the authoritative source; the `.md` files are a
generated mirror for readability (GitHub rendering, text search, diffs
across revisions). Regenerate them with [Pandoc](https://pandoc.org/) after
editing a `.docx`:

```sh
pandoc "<file>.docx" --from docx --to gfm --wrap=none \
  --markdown-headings=atx --extract-media "<file>_media" -o "<file>.md"
```

Do not hand-edit the `.md` files — changes belong in the source `.docx`,
followed by re-running the conversion above.
