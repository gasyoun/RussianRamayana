# MANUAL.meta.md — метадокумент о `MANUAL.md`

_Created: 08-07-2026 · Last updated: 08-07-2026_

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
- **Следующая закалка:** запланирована в [H363](https://github.com/gasyoun/Uprava/blob/main/handoffs/H363-Opus_RussianRamayana_litpam-indexator-manual-and-process-uplift_08.07.26.md)
  (Opus 4.8 `claude-opus-4-8`) — реализует бэклог ниже.

## Бэклог улучшений (ранжированный)

Оценка «как улучшить сам документ» (08-07-2026). Каждый пункт — на исполнение в H363,
если не отмечено иначе. По мере закрытия — ставить ✅ и ссылку на PR.

### Документ силён как нарратив, но слаб как справочник для ежедневного возврата

| # | Улучшение | Почему | Статус |
|---|---|---|---|
| 1 | **Cheat-sheet на 1 экран** сверху: весь конвейер как ~10 строк «что запустить» с якорями вниз | оператор возвращается за одним шагом, а вынужден вычитывать прозу | queued (H363) |
| 2 | **Диаграмма потока данных** (ASCII из `CLAUDE.md`: `ram_tags.txt` + `.xlsx` → `teg_exp` → `[0]…[4]`) | в MANUAL её нет, ориентира на входе нет | queued (H363) |
| 3 | **Таблица «Симптом → Причина → Лечение»** (overflow-отказ, непустой `log.txt`, дефект «ними», зависание на колонке `C`, кириллическая «с») | ловушки размазаны по прозе | queued (H363) |
| 4 | **Глоссарий** (вёрстка / разметка / словник / IndexList / маркер / overflow / доразметка) | новичок тонет в терминах | queued (H363) |
| 5 | **Раздел «Окружение и предпосылки»** (InDesign CS6+ ради `\h`, установка скриптов, Excel для `teg_exp`, кодировки) | сейчас раскидано по всему тексту | queued (H363) |
| 6 | **Розеттская таблица** `указатель ↔ xlsx-лист ↔ IndexList-nnn ↔ буква-маркер` | единый ключ, устраняет путаницу схем | queued (H363) |
| 7 | **Бюджет времени** по стадиям | планирование сессии | queued (H363) |
| 8 | **Честный раздел про стадию `[2]` и Том II** | `[2]` в MANUAL почти отсутствует; Том II не оговорён | queued (H363) |

### Процесс (влияет на MANUAL опосредованно — фиксируется здесь для полноты)

| # | Улучшение | Почему | Статус |
|---|---|---|---|
| 9 | **Согласовать три документа** (MANUAL `[0]–[4]`/`a-b-c-d` vs [Roadmap](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md) `П/1/2/3/4/Ф`/`N-G-T-F` vs `CLAUDE.md`) | две буквенные схемы маркеров = дефект истины: оператор назовёт файлы по-разному | queued (H363) |
| 10 | **Взаимные ссылки в шапках** трёх документов («какой открывать под задачу») | сейчас три параллельные истины | queued (H363) |
| 11 | **Pre-flight-валидатор словаря `.xlsx`** (openpyxl, отчёт-only) — в MANUAL добавить раздел запуска | дефекты словника всплывают только на многочасовом прогоне | queued (H363) |

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

_Dr. Mārcis Gasūns_
