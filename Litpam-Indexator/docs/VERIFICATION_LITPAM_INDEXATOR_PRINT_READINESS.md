# Верификация, acceptance и риски print-readiness

_Created: 12-08-2026 · Last updated: 12-08-2026_

Архитектура: [ARCHITECTURE](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/ARCHITECTURE_LITPAM_INDEXATOR_PRINT_READINESS.md). Реализация: [IMPLEMENTATION](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/IMPLEMENTATION_LITPAM_INDEXATOR_PRINT_READINESS.md).

## Acceptance matrix на каждый том

| Gate | PASS | Evidence |
|---|---|---|
| Source integrity | SHA-256 оригиналов совпадает; оригиналы не изменены | source manifest |
| Migration 2022→2026 | page count/reflow/styles/fonts/links/index refs без необъяснённого drift | migration report + renders |
| Workbook | 0 validator findings; каждая из 43 правок записана и повторяема | correction ledger + validator report |
| InDesign | 0 preflight errors, missing fonts/links, overset; документ сохранён | preflight JSON/MD |
| Coverage | каждая статья × volume имеет один допустимый статус; 0 blocking anomalies | coverage JSON/TSV |
| References | 100% generated refs/cross-refs machine-valid; redirects resolve | reference report |
| PDF | fonts embedded; expected page boxes/count; no missing glyph/clipping signal | pdf report + contact sheets |
| Visual | нет blocker-классов; intentional differences recorded | defect ledger + style exceptions |
| Human | deterministic sample signed | review checklist; до подписи `WAITING` |

Книга II может стартовать после автоматических PASS книги I; human checklist книги I может оставаться `WAITING`.

## Детерминированная ручная выборка

Для каждого из четырёх указателей каждого тома включить: первую и последнюю статью; top-frequency и low-frequency; вложенную иерархию; варианты регистра; минимум одну corrected-workbook article; жирную ссылку в примечания/приложения; диапазон; `см.` redirect; valid absence/exclusion. Seed и список loci сохраняются, чтобы повторная корректура сравнивала одно и то же.

## Visual fail classes

Автоматически блокируют proof: clipping/overset, missing glyph, collision, unsafe trim margin, orphan heading, неверное начало recto/verso, непреднамеренная blank page/running head, нарушенная hierarchy/indent, необъяснённое различие общей index furniture. Косметическое замечание без ущерба чтению помещается в backlog.

## Точные проверки

```powershell
python Litpam-Indexator/tools/validate_dictionary.py <corrected.xlsx> --report <report.md>
python -m pytest Litpam-Indexator/tools/tests
python Litpam-Indexator/tools/print_ready.py audit-idml --manifest <volume-manifest.json>
python Litpam-Indexator/tools/print_ready.py audit-pdf --manifest <volume-manifest.json>
python Litpam-Indexator/tools/print_ready.py coverage --manifest <volume-manifest.json>
python Litpam-Indexator/tools/print_ready.py verify-packet --packet <evidence-dir>
```

Имена новых CLI являются контрактом плана; исполнитель может разделить модули внутри `tools/print_ready/`, сохранив команды верхнего уровня.

## Риски и обязательные spikes

| Риск | Spike / mitigation | Stop? |
|---|---|---|
| InDesign 2026 меняет reflow или ссылки | baseline export в 2022 до первого save; page/render/reference diff | только если drift нельзя локализовать |
| COM/ExtendScript automation нестабильна | сначала headless smoke на копии; fallback к операторскому запуску с тем же output contract | только при полном отказе обоих путей |
| 41 case-duplicate findings намеренны | correction ledger допускает no-op/intentional record только с rationale; не удалять вслепую | редакционный fork → WAITING |
| PDF 2025 содержит намеренные blank/verso решения | style spec + Fable classification; не «чинить» по эвристике | нет |
| IDML не отражает всё UI-preflight | InDesign report остаётся обязательным, IDML audit — второй независимый сигнал | нет |
| Шрифтовая лицензия/packaging | не добавлять/заменять fonts; инвентаризировать локальный package | missing required font → stop |
| Большие binary diffs | track stable IDML/PDF + checksums; targeted commits | нет |
| Reference correctness нельзя вывести только из PDF | проверять index objects/markers в InDesign/IDML и sampling по proof | blocking anomaly → defect, не общий stop |

## Evidence packet layout

`evidence/volume-<I|II>/<revision>/` содержит `manifest.json`, `checksums.sha256`, `preflight/`, `workbook/`, `coverage/`, `references/`, `pdf/`, `renders/`, `defects.tsv`, `decisions.md`, `review-checklist.md`. Packet validator запрещает PASS при пропуске обязательного узла.

_Dr. Mārcis Gasūns_
