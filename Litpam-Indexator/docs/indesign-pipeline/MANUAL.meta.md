# MANUAL.meta.md — метадокумент о `MANUAL.md`

_Created: 08-07-2026 · Last updated: 08-07-2026 (весь бэклог внедрён — H363/PR #14)_

Это **метадокумент** — документ *о документе*. Его предмет —
[`MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md),
сводное руководство по конвейеру построения указателей «Рамаяны» в InDesign. Здесь
не дублируется содержимое `MANUAL.md`, а фиксируется всё, что *про* него: назначение,
аудитория, провенанс, известные пробелы и ранжированный бэклог улучшений, история
крупных ревизий, связанные документы. Ведётся по общему правилу «для каждого важного
документа — свой метадокумент» (см. `~/.claude/CLAUDE.md`, раздел «Метадокументы»).

---

## Предмет

- **Документ:** [`MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md)
- **Назначение:** сквозное операторское руководство (Часть I) + техническое приложение
  для мейнтейнера (Часть II) по конвейеру `[0]`–`[4]` построения четырёх указателей.
- **Аудитория:** оператор InDesign (что нажимать) + мейнтейнер (привязка к коду, инварианты, ловушки).
- **Формат / контракт:** plain Markdown, датированная шапка + подпись, полные `blob`-ссылки,
  без HTML. Имена скриптов/стилей/цветов — строго по
  [`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc)
  и [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md).

## Провенанс

- **Создан:** 08-07-2026 в рамках [H355](https://github.com/gasyoun/Uprava/blob/main/handoffs/H355-Opus_RussianRamayana_indesign-pipeline-docs-uplift_08.07.26.md)
  (Opus 4.8 `claude-opus-4-8`) — синтез из 18 ASR-расшифровок скринкастов Михаила
  Иванюшина + сверка с кодовым контрактом; таймкоды добыты заново из тайминговых субтитров.
- **Закалка внедрена:** [H363](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H363-Opus_RussianRamayana_litpam-indexator-manual-and-process-uplift_08.07.26.md)
  → [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) (merged 08-07-2026 12:05 UTC, исполнил
  параллельный прогон; handoff done + заархивирован) — реализовал весь бэклог ниже + добавил
  [`tools/validate_dictionary.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/validate_dictionary.py)
  и регрессионный дрилл `regression_expected.md`.
- **Пост-закалка:** [H377](https://github.com/gasyoun/Uprava/blob/main/handoffs/H377-Fable_RussianRamayana_litpam_manual_overhaul_copilot_08.07.26.md)
  (Fable 5 `claude-fable-5`) — влил в MANUAL находки построчного аудита кода (раздел «Замеченные дефекты»).

## Бэклог улучшений (ранжированный)

Оценка «как улучшить сам документ» (08-07-2026). **Весь бэклог внедрён** в тот же день через
[H363](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H363-Opus_RussianRamayana_litpam-indexator-manual-and-process-uplift_08.07.26.md)
→ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) (merged 08-07-2026 12:05 UTC).
Ledger append-only: закрытые пункты помечены ✅ + ссылка на PR, не удаляются.

### Документ силён как нарратив, но слаб как справочник для ежедневного возврата

| # | Улучшение | Почему | Статус |
|---|---|---|---|
| 1 | **Cheat-sheet на 1 экран** сверху: весь конвейер как ~10 строк «что запустить» с якорями вниз | оператор возвращается за одним шагом, а вынужден вычитывать прозу | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 2 | **Диаграмма потока данных** (ASCII из `CLAUDE.md`: `ram_tags.txt` + `.xlsx` → `teg_exp` → `[0]…[4]`) | в MANUAL её нет, ориентира на входе нет | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 3 | **Таблица «Симптом → Причина → Лечение»** (overflow-отказ, непустой `log.txt`, дефект «ними», зависание на колонке `C`, кириллическая «с») | ловушки размазаны по прозе | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 4 | **Глоссарий** (вёрстка / разметка / словник / IndexList / маркер / overflow / доразметка) | новичок тонет в терминах | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 5 | **Раздел «Окружение и предпосылки»** (InDesign CS6+ ради `\h`, установка скриптов, Excel для `teg_exp`, кодировки) | сейчас раскидано по всему тексту | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 6 | **Розеттская таблица** `указатель ↔ xlsx-лист ↔ IndexList-nnn ↔ буква-маркер` | единый ключ, устраняет путаницу схем | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 7 | **Бюджет времени** по стадиям | планирование сессии | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 8 | **Честный раздел про стадию `[2]` и Том II** | `[2]` в MANUAL почти отсутствует; Том II не оговорён | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |

### Процесс (влияет на MANUAL опосредованно — фиксируется здесь для полноты)

| # | Улучшение | Почему | Статус |
|---|---|---|---|
| 9 | **Согласовать три документа** (MANUAL `[0]–[4]`/`a-b-c-d` vs [Roadmap](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md) `П/1/2/3/4/Ф`/`N-G-T-F` vs `CLAUDE.md`) | две буквенные схемы маркеров = дефект истины: оператор назовёт файлы по-разному | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 10 | **Взаимные ссылки в шапках** трёх документов («какой открывать под задачу») | сейчас три параллельные истины | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |
| 11 | **Pre-flight-валидатор словаря `.xlsx`** (openpyxl, отчёт-only) — в MANUAL добавить раздел запуска | дефекты словника всплывают только на многочасовом прогоне | ✅ [PR #14](https://github.com/gasyoun/RussianRamayana/pull/14) |

## Известные ограничения / оговорки

- MANUAL описывает **Том I**; конвейер Тома II идентичен, но таблицы `IndexList` строятся заново.
- Часть имён собственных в исходных роликах звучит искажённо (ASR) — в расшифровках оставлены осторожно.
- Guardrail: авторские `.jsx` Иванюшина не правятся; дефекты кода фиксируются списком, а не правкой.

## Связанные документы

- [`Roadmap_Ramayana_Index-Vol.1.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md) — пошаговый исполняемый чек-лист (этапы П/1/2/3/4/Ф).
- [`Litpam-Indexator/CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md) — кодовый контракт + big-picture диаграмма.
- [`Litpam-Indexator/README.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/README.md) — обзор комплекта и сценарии использования.
- Расшифровки-провенанс: [`clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean) · тайминги: [`timed/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/timed).

## История ревизий метапредмета

| Дата | Событие | Кто |
|---|---|---|
| 08-07-2026 | `MANUAL.md` создан (H355) | Opus 4.8 (`claude-opus-4-8`) |
| 08-07-2026 | Метадокумент заведён; бэклог улучшений зафиксирован; закалка запланирована в H363 | Opus 4.8 (`claude-opus-4-8`) |
| 08-07-2026 | H363 внедрён ([PR #14](https://github.com/gasyoun/RussianRamayana/pull/14)): все 11 пунктов бэклога влиты в `MANUAL.md` (шпаргалка, диаграмма потока, симптом→лечение, глоссарий, окружение, Розеттская таблица, бюджет времени, `[2]`/Том II, согласование трёх документов, взаимные ссылки) + `tools/validate_dictionary.py` + регрессионный дрилл | параллельный прогон (см. PR #14) |
| 08-07-2026 | H377: находки построчного аудита кода влиты в раздел «Замеченные дефекты» `MANUAL.md` | Fable 5 (`claude-fable-5`) |
| 08-07-2026 | Бэклог сверен с реальностью и помечен ✅ (ledger-дисциплина метадока) | Opus 4.8 (`claude-opus-4-8`) |

_Dr. Mārcis Gasūns_
