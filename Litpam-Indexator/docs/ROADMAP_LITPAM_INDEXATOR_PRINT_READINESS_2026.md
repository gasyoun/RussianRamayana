# Дорожная карта print-readiness указателей «Рамаяны», книги I–II

_Created: 12-08-2026 · Last updated: 12-08-2026_

Главный индекс решений: [PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md).

## Wave 0A — print-контракт (Fable 5)

[H2588 (Fable 5) — общий print-контракт четырёх указателей книг I–II](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2588-Fable_RussianRamayana_litpam-index-style-print-contract_12.08.26.md) фиксирует style spec, defect policy и deterministic review packet. Это первый обязательный запуск.

## Wave 0B / Wave 1 — детерминированный фундамент и книга I (Sonnet 5, 5–8 ч)

[H2589 (Sonnet 5) — deterministic tooling и print-readiness пилот книги I](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2589-Sonnet_RussianRamayana_litpam-book1-print-readiness-pilot_12.08.26.md) может строить tooling параллельно H2588, но production formatting начинает после print-контракта.

1. Зафиксировать manifests/checksums оригиналов 2025 и baseline-экспорты InDesign 2022.
2. Создать версионную копию XLSX; применить 43 детерминированные коррекции с before/after ledger; добиться чистого validator run.
3. Построить read-only IDML/PDF QA: inventory, page/font/link metadata, index coverage statuses, cross-reference checks, render/contact-sheet manifest.
4. Формализовать InDesign 2022→2026 migration comparison и machine-readable evidence schema.

**Разблокирует:** безопасный пилот книги I. **Гейт:** исходники неизменны; corrected XLSX = 0 findings; fixtures/tests зелёные; evidence manifest валиден.

### Производственный пилот книги I

1. Открыть версионную копию пакета в InDesign 2026 и доказать отсутствие непреднамеренного conversion drift.
2. Утвердить общую спецификацию четырёх указателей на базе текущего дизайна и зарегистрированных exceptions.
3. Регенерировать четыре указателя книги I из исправленного словника; разобрать логи; исправить print-blocking/material defects.
4. Выпустить IDML, proof-PDF и evidence packet; передать deterministic sample на human review.

**Разблокирует:** перенос на книгу II после автоматических гейтов, не дожидаясь подписи человека. **Гейт:** автоматическая матрица книги I PASS; human gate = `WAITING` до подписи.

## Wave 2 — книга II, повторяемое применение (Sonnet 5)

[H2590 (Sonnet 5) — повторяемое применение print-readiness к книге II](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2590-Sonnet_RussianRamayana_litpam-book2-print-readiness-application_12.08.26.md) gated автоматическим PASS книги I.

1. Повторить миграционную проверку на книге II.
2. Применить утверждённую спецификацию и те же volume-aware coverage/reference проверки.
3. Регенерировать четыре указателя; исправить print-blocking/material defects; записать только обоснованные exceptions.
4. Выпустить IDML, proof-PDF и evidence packet книги II.

**Гейт:** те же автоматические критерии, что у книги I; два signed human review checklist остаются финальным издательским gate.

## Wave 3 — сводная сдача издателю

- Свести два манифеста и два defect ledger; закрыть замечания human review.
- Проверить, что packages содержат нужные links/fonts, но Git не хранит рабочие `.indd`.
- Передать издателю packages, IDML, proof-PDF, checksums и краткий release note. Издатель производит финальный PDF/X.

## Не-цели

- Не переписывать перевод, примечания или иной основной текст.
- Не заменять InDesign отдельной системой книжной вёрстки.
- Не реконструировать с нуля существующие `.jsx`, `teg_exp`, словник или Golden Fish drill.
- Не объявлять автоматический PASS человеческой корректурной подписью.
- Не чинить косметические дефекты, если они не влияют на печатное качество и не являются существенно отвлекающими.

## Устаревший документ

[Roadmap_Ramayana_Index-Vol.1.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md) остаётся подробным операторским сценарием стадий `[0]–[4]`, но его утверждение, что PDF 2025 предшествуют индексированию, опровергнуто аудитом. Настоящий roadmap является источником истины для print-readiness и обеих книг.

_Dr. Mārcis Gasūns_
