# Реализация print-readiness Litpam-Indexator

_Created: 12-08-2026 · Last updated: 12-08-2026_

Главный контракт: [PLAN](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md). Этот слой описывает первую автономную волну 5–8 часов и её переход к пилоту книги I.

## Предлагаемая структура

```text
Litpam-Indexator/
├── config/print-readiness.json
├── tools/
│   ├── print_ready.py
│   ├── print_ready/                 # repair, IDML/PDF snapshots, coverage, packet
│   ├── indesign/export_print_evidence.jsx
│   └── tests/fixtures/
├── xls/derived/Указатель_к_Рамаяне_1_2_2026_08_12.xlsx
├── docs/print-readiness/
│   ├── INDEX_STYLE_SPEC.md
│   ├── DEFECT_POLICY.md
│   └── BOOK_I_REVIEW_CHECKLIST.md
├── artifacts/print-readiness/
│   ├── dictionary/
│   └── book-I/{baseline-2022,conversion-2026,pilot-2026,visual}/
└── work/print-readiness/            # gitignored: рабочие .indd packages
```

Добавить в корневой `.gitignore` только `/Litpam-Indexator/work/print-readiness/`; broad `*.indd` запрещён.

## Шаг 1 — Fable 5: зафиксировать print/editorial contract

Создать `INDEX_STYLE_SPEC.md`, `DEFECT_POLICY.md`, `BOOK_I_REVIEW_CHECKLIST.md` и policy JSON. Спецификация должна определить общую четырёхиндексную иерархию, paragraph/character styles, отступы, буквенные рубрики, ranges, annotations, жирные note/application refs, `см.` redirects, recto/verso и running heads. Межтомные exceptions записываются отдельно.

**Acceptance:** для каждого visual/editorial state существует pass/fail/default; deterministic sample полностью задан; blocking `@DECIDE` отсутствуют. Никакие binaries, основной текст, XLSX или авторские `.jsx` не изменены.

## Шаг 2 — Sonnet 5: реализовать детерминированные инструменты

`print_ready repair-workbook` запрещает in-place; сохраняет sheets, formulas, formatting и non-target cells; применяет 43 явно заданные операции с проверкой `old`; пишет JSON+MD ledger; повторный запуск даёт 0 changes.

`audit-idml` инвентаризирует version, pages/spreads/stories, page geometry/sections, styles usage, fonts/links, detectible overset, index markers/references/ranges/redirects, generated index stories и stable story text hashes.

`audit-pdf` фиксирует metadata, boxes/count, fonts embedding/subsetting, page text hashes и renders/contact sheets. Использовать bundled Poppler/PDFium и записывать dependency/version.

`coverage` выдаёт одну строку на workbook entry × volume и проверяет каждую page/range/redirect target. `verify-packet` валидирует evidence schema и checksums. Tests покрывают source-hash mismatch, stale `old`, missing status, broken redirect, missing packet member и idempotence.

```powershell
python -m pytest Litpam-Indexator/tools/tests
python Litpam-Indexator/tools/validate_dictionary.py "Litpam-Indexator/xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx"
```

Исходный validator ожидаемо возвращает findings; это baseline evidence, не stop.

## Шаг 3 — исправить версионную копию словника

```powershell
python Litpam-Indexator/tools/print_ready.py repair-workbook `
  --source "Litpam-Indexator/xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx" `
  --output "Litpam-Indexator/xls/derived/Указатель_к_Рамаяне_1_2_2026_08_12.xlsx" `
  --ledger "Litpam-Indexator/artifacts/print-readiness/dictionary/correction-ledger.json"

python Litpam-Indexator/tools/validate_dictionary.py `
  "Litpam-Indexator/xls/derived/Указатель_к_Рамаяне_1_2_2026_08_12.xlsx" `
  --report "Litpam-Indexator/artifacts/print-readiness/dictionary/validation-report.md"
```

**Acceptance:** original SHA unchanged; 43 dispositions/operations present; validator = 0; second repair = 0 changes. Редакционно значимый case-only duplicate получает `WAITING`, а не молчаливое удаление.

## Шаг 4 — снять baseline книги I в InDesign 2022

Additive workspace preparer копирует исходный package в два локальных каталога и подтверждает hashes. В InDesign 2022 открыть только baseline copy; `export_print_evidence.jsx` экспортирует IDML, proof-PDF, preflight, fonts/links/styles/pages/sections/overset/index inventory и checksums. Оригинал не сохранять.

```powershell
python Litpam-Indexator/tools/print_ready.py audit-idml --manifest <baseline-manifest.json>
python Litpam-Indexator/tools/print_ready.py audit-pdf --manifest <baseline-manifest.json>
```

## Шаг 5 — доказать conversion 2022→2026 до редактирования

Открыть отдельную production copy в InDesign 2026, сохранить под новым versioned name без редакционных изменений, повторить evidence export и сравнение.

**Gate:** equal page count/geometry/section starts; 0 missing fonts/links/overset; stable story text and index structure; no unexplained reflow/missing glyph; visual differences либо ниже threshold, либо классифицированы Fable. Failed check создаёт defect packet, не прекращая безопасные независимые проверки.

## Шаг 6 — пилот книги I

Только после conversion gate:

1. Подключить corrected workbook.
2. Выполнить существующие стадии [MANUAL](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md) на production copy.
3. Существующие authorial scripts не менять; additive wrapper допустим лишь для preflight/export/evidence.
4. Нормализовать четыре указателя по `INDEX_STYLE_SPEC.md`.
5. Все layout defects записать; исправить blockers/material, косметику queue.
6. После стабилизации pagination регенерировать и перепроверить все references.
7. Выпустить pilot IDML, proof-PDF, coverage/reference reports, contact sheets, ledgers и manifest.

```powershell
python Litpam-Indexator/tools/print_ready.py coverage --manifest <pilot-manifest.json>
python Litpam-Indexator/tools/print_ready.py verify-packet --packet <book-I-evidence-dir>
python -m pytest Litpam-Indexator/tools/tests
```

**Выход:** `AUTOMATED_PASS / HUMAN_REVIEW_WAITING` при всех автоматических PASS; этот статус разрешает начать книгу II, но не объявляет книгу I принятой в печать.

## Stop/defaults

- Conversion изменил pagination/text/index structure → fail gate и диагностика до index mutation.
- Fresh 2022 export отличается от PDF 2025 → 2022 export технический baseline, PDF остаётся visual/editorial reference.
- Missing required font/link → остановить mutation, продолжить read-only evidence.
- Existing `.jsx` не работает в 2026 → не патчить архив в этой волне; minimal repro, additive equivalent wrapper либо `WAITING`.
- Cosmetic scope растёт → queue; blockers/material only.

## Исполнительские границы

1. [H2588 (Fable 5) — общий print-контракт четырёх указателей книг I–II](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2588-Fable_RussianRamayana_litpam-index-style-print-contract_12.08.26.md): спецификация оформления, defect policy и review packet.
2. [H2589 (Sonnet 5) — deterministic tooling и print-readiness пилот книги I](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2589-Sonnet_RussianRamayana_litpam-book1-print-readiness-pilot_12.08.26.md): tooling + corrected workbook + Book-I baseline/conversion/pilot evidence; production formatting начинается после Fable spec, tooling может строиться параллельно.
3. [H2590 (Sonnet 5) — повторяемое применение print-readiness к книге II](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2590-Sonnet_RussianRamayana_litpam-book2-print-readiness-application_12.08.26.md): отдельный gated handoff после Book-I automated gate.

_Dr. Mārcis Gasūns_
