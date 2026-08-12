# Метадокумент плана print-readiness Litpam-Indexator

_Created: 12-08-2026 · Last updated: 12-08-2026_

Предмет — [PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md). Здесь хранится провенанс, ограничения и ledger улучшений, а не содержание плана.

## Предмет

- **Назначение:** автономно исполнимая спецификация подготовки указателей книг I–II к издательской корректуре.
- **Аудитория:** Claude-исполнители, оператор InDesign, редактор и издатель.
- **Контракт:** русский plain Markdown, full blob URLs, 30 рулингов, ноль blocking forks, human approval не симулируется.

## Провенанс

- Аудит и интервью: Codex Sol (`gpt-5.6-sol`) + М. Гасунс, 11–12-08-2026.
- Источники: repo state, git/GitHub, PDF renders/text/font metadata, IDML structure, MANUAL, предыдущие H355/H363/H377 и org hubs.
- Следующая закалка: [H2588 (Fable 5) — общий print-контракт четырёх указателей книг I–II](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2588-Fable_RussianRamayana_litpam-index-style-print-contract_12.08.26.md), [H2589 (Sonnet 5) — deterministic tooling и print-readiness пилот книги I](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2589-Sonnet_RussianRamayana_litpam-book1-print-readiness-pilot_12.08.26.md) и [H2590 (Sonnet 5) — повторяемое применение print-readiness к книге II](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2590-Sonnet_RussianRamayana_litpam-book2-print-readiness-application_12.08.26.md).

## Бэклог улучшений

| # | Улучшение | Почему | Статус |
|---|---|---|---|
| 1 | Утвердить style/defect/review contract | снимает субъективные forks до production mutation | queued: H2588 (Fable 5) — общий print-контракт четырёх указателей книг I–II |
| 2 | Реализовать deterministic foundation и Book-I pilot | превращает visual baseline в проверенный package | queued: H2589 (Sonnet 5) — deterministic tooling и print-readiness пилот книги I |
| 3 | Применить процесс к книге II | доказывает повторяемость | gated: H2590 (Sonnet 5) — повторяемое применение print-readiness к книге II |
| 4 | Вписать фактические PR/checksum/acceptance результаты | план должен стать audit trail, не вечным future tense | owned соответствующими handoffs |

## Ограничения и неверные прочтения

- План не является финальным издательским sign-off и не производит PDF/X.
- Найденные визуальные подозрения — hypotheses до проверки source pages/style intent.
- План не разрешает редактировать перевод или оригинальные пакеты 2025.
- `PASS automated` не означает `approved by human`.

## Поддержка и завершение

План активен до закрытия Wave 3. После подписанных human checklists и передачи пакетов издателю он становится historical record; результаты и PR должны быть дописаны в этот metadoc.

## Статус устаревания

`active`; старый roadmap остаётся operator reference, но superseded для статуса print-readiness.

## Связанные документы

- [Roadmap](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/ROADMAP_LITPAM_INDEXATOR_PRINT_READINESS_2026.md)
- [Architecture](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/ARCHITECTURE_LITPAM_INDEXATOR_PRINT_READINESS.md)
- [Implementation](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/IMPLEMENTATION_LITPAM_INDEXATOR_PRINT_READINESS.md)
- [Verification](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/VERIFICATION_LITPAM_INDEXATOR_PRINT_READINESS.md)

## История ревизий

| Дата | Событие | Кто |
|---|---|---|
| 12-08-2026 | Аудит, 5-round interview, layered plan | Codex Sol (`gpt-5.6-sol`) + М. Гасунс |

_Dr. Mārcis Gasūns_
