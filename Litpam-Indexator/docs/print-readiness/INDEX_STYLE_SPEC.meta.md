# Метадокумент INDEX_STYLE_SPEC

_Created: 14-08-2026 · Last updated: 14-08-2026_

Предмет — [INDEX_STYLE_SPEC.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/INDEX_STYLE_SPEC.md),
единый print-контракт четырёх указателей книг I–II. Покрывает также его
спутников [DEFECT_POLICY.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/DEFECT_POLICY.md),
[BOOK_I_REVIEW_CHECKLIST.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/BOOK_I_REVIEW_CHECKLIST.md)
и [config/print-readiness.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/config/print-readiness.json) —
четыре файла образуют один контракт и меняются вместе.

## Провенанс

- Автор: Fable 5 (`claude-fable-5`), сессия
  [H2588 (Fable 5) — общий print-контракт четырёх указателей книг I–II](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2588-Fable_RussianRamayana_litpam-index-style-print-contract_12.08.26.md),
  14-08-2026.
- Метод: измерение текстовых спанов обоих PDF-пруфов 12.10.25 (PyMuPDF: шрифт,
  кегль, x-координаты строк по всем полосам указателей + смежные полосы), сверка
  с [MANUAL](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md)
  и 30 рулингами [PLAN](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md).
- Аудитория: H2589/H2590-исполнители (машинные проверки), оператор InDesign,
  редактор (review-required решения §11).

## Бэклог улучшений

| # | Улучшение | Почему | Статус |
|---|---|---|---|
| 1 | Заполнить `notes_bold_page_ranges` из baseline IDML | до этого §7.3 проверяется как UNVERIFIED | queued: H2589 (Sonnet 5) — deterministic tooling и print-readiness пилот книги I |
| 2 | Закрыть review-required D3–D6, D8 (редакционное подтверждение defaults) | контракт полон, но пять defaults ждут человеческого «да» | WAITING, ledger пилота |
| 3 | После пилота книги I вписать фактические расхождения регенерата с печатью 2025 | спецификация должна стать audit trail | owned H2589 |
| 4 | Проверить интерлиньяж/базовую сетку (не измерялись: PyMuPDF даёт x надёжнее, чем leading) | возможный скрытый параметр вёрстки | queued |

## Ограничения

- Измерения сделаны по PDF, не по IDML: имена абзацных/символьных стилей InDesign
  в контракте — производные (§4 даёт параметры, не имена стилей документа).
- Диапазоны полос примечаний/приложений НЕ зафиксированы (null в JSON) — намеренно:
  их источник — baseline IDML, не PDF-эвристика.
- Контракт нормирует УКАЗАТЕЛИ; смежные аномалии (D8 — призрачные полосы 627–629
  тома II) записаны, но их починка вне объёма спецификации.
- `PASS automated` ≠ `approved by human` (рулинг 25).

## История ревизий

| Дата | Событие | Кто |
|---|---|---|
| 14-08-2026 | Первая редакция контракта: spec + policy + checklist + JSON, таблица D1–D10 | Fable 5 (`claude-fable-5`), H2588 |

_Dr. Mārcis Gasūns_
