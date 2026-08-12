# Архитектура print-readiness Litpam-Indexator

_Created: 12-08-2026 · Last updated: 12-08-2026_

Решения и автономный контракт: [PLAN](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md).

## Источники истины и неизменяемая база

| Слой | Источник истины | Роль |
|---|---|---|
| Книжная вёрстка | versioned copy исходного `.indd`, экспортируемый `.idml` | Геометрия, pagination, index markers, styles |
| Словарь | исходный XLSX + детерминированно исправленная версия | Канонические статьи и формы четырёх указателей |
| Теги | `Tags/ram_tags.txt` | Предвёрсточная разметка и сверка tag↔dictionary |
| Визуальная база | PDF 12.10.25 | Намерение дизайна, не источник ссылок |
| Кодовый контракт | `ForIndex.jsxinc`, рабочие `.jsx`, MANUAL | Имена, стадии, действия оператора |
| Доказательства | manifests/ledgers/reports/contact sheets | Воспроизводимость и gate decisions |

Оригиналы 2025 read-only. Рабочие `.indd` живут во внешней versioned package directory, указанной в manifest; Git получает IDML, proof-PDF и доказательства.

## Компоненты

1. **Source manifest** — относительные пути, размеры, SHA-256, версии InDesign, состав links/fonts; доказывает неизменность оригиналов.
2. **Workbook correction pipeline** — YAML/JSON ledger детерминированных операций `sheet/row/column/old/new/reason`; создаёт новый XLSX, никогда не перезаписывает исходный.
3. **InDesign preflight/export runner** — additive ExtendScript для отчёта документа, preflight, links/fonts/overset, IDML и proof export. Скрипт не принимает редакционных решений.
4. **IDML index auditor** — Python read-only разбор ZIP/XML: stories, index markers/page references, paragraph/character styles, section/page structure, overset-relevant geometry where exposed.
5. **Coverage ledger** — одна запись на каноническую статью × volume × index со статусом `occurrence`, `valid_absence`, `intentional_exclusion`, `redirect`, `blocking_anomaly`; provenance у каждого non-occurrence.
6. **Reference auditor** — проверяет страницы/диапазоны/жирное выделение примечаний и `см.`-targets; выдаёт machine-readable results и deterministic review sample.
7. **PDF visual QA** — metadata/fonts/page boxes, representative renders, contact sheets и baseline comparisons. Visual diff сигнализирует, Fable/human решают намеренность.
8. **Index style specification** — общая типографика, hierarchy, recto/verso, opening pages, running heads, bold-note semantics, ranges and redirects; exceptions versioned отдельно.
9. **Evidence packet** — manifest, checksums, reports, contact sheets, ledgers и review checklist как единый каталог на volume/revision.

## Контракты данных

- Все отчёты имеют `schema_version`, `volume`, `revision`, `source_sha256`, `generated_at`, `tool_version`, `status`.
- Коррекция словника запрещена, если `old` не совпадает с текущей ячейкой.
- Coverage ledger запрещает пустой статус; `valid_absence`, `exclusion`, `redirect` требуют `reason`, `redirect` также требует существующий target.
- Evidence manifest перечисляет каждый артефакт с SHA-256; PASS невозможен при отсутствующем обязательном файле.
- Исключения оформления имеют scope, rationale и approver/status; отсутствие записи означает применение общего стиля.

## Build-vs-reuse

| Concern | Вердикт |
|---|---|
| XLSX lint | REUSE `tools/validate_dictionary.py`; добавить только deterministic apply/ledger gap. |
| Морфологические подсказки | REUSE `gen_case_forms.py`; не считать их источником истины. |
| Tag↔dictionary | REUSE `_Ram_Tag_explorer`; автоматизировать лишь evidence capture. |
| InDesign pipeline | REUSE `.jsx` + MANUAL + Golden Fish; не переписывать. |
| Print evidence, coverage, migration/visual QA | NEW gap; реализовать additive tools. |
| PDF rendering | REUSE bundled Poppler/PDFium; сохранить команды и версии. |

## Границы ответственности

- Sonnet 5 строит и запускает детерминированные инструменты, не принимает print/editorial rulings.
- Fable 5 утверждает style spec, классифицирует visual drift/defects и управляет книгой I.
- Human подписывает корректурные выборки; отсутствие подписи всегда `WAITING`.

_Dr. Mārcis Gasūns_
