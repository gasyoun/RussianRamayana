# Конвейер построения указателей в InDesign — расшифровки и руководство

_Created: 08-07-2026 · Last updated: 08-07-2026_

Эта папка содержит документацию по конвейеру построения предметных указателей к
двухтомнику «Рамаяна» в Adobe InDesign — набор скринкастов Михаила Иванюшина
([dotextok.ru](https://dotextok.ru)), приведенный из авто-субтитров в связную,
выверенную по коду документацию.

## Что здесь лежит

| Файл / папка | Что это |
|---|---|
| [`MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md) | **Главный документ** — сводное руководство: операторский разбор стадий `[0]`→`[4]` + техническое приложение для мейнтейнера (инварианты, ловушки, дефекты) |
| [`clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean) | 18 **почищенных** пофайловых расшифровок (по одной на видео), выверенных по коду |
| `NN … [id].txt` | 18 **сырых** ASR-расшифровок — сохранены как провенанс, **не редактировать** |

## Как это устроено

- **Сырые `.txt`** — прямой вывод авто-распознавания речи YouTube. Изобилуют ошибками
  распознавания (искаженные имена скриптов, стилей, имен собственных), без структуры.
  Первая строка каждого файла — URL ролика на YouTube. Оставлены как есть (провенанс).
- **`clean/NN-<slug>.md`** — та же расшифровка, но с исправленными ошибками распознавания
  (имена скриптов/стилей/цветов — строго по
  [`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc)
  и [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md)),
  с пунктуацией и разбивкой на шаги. **Смысл и порядок действий автора сохранены** — это
  выверенный транскрипт, а не переписывание.
- **`MANUAL.md`** — синтез всех 18 роликов в единое руководство, увязывающее нарратив со
  стадиями конвейера и конкретными `.jsx`-скриптами.

Живая версия операторского обзора опубликована на сайте проекта:
[indexing-pipeline.html](https://gasyoun.github.io/RussianRamayana/indexing-pipeline.html).

## Карта: видео → стадия → очищенная расшифровка

| # | Тема | Стадия | Очищенная расшифровка |
|---|---|---|---|
| 01 | Обзор папки со всеми программами | обзор | [01-overview.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/01-overview.md) |
| 02 | Разметка тегами (книга 1) | `[0]` | [02-tagging-book1.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/02-tagging-book1.md) |
| 03 | Как выполняется поиск | `[0]` | [03-search-mechanism.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/03-search-mechanism.md) |
| 04 | Пример: текст Гринцера | `[0]` | [04-example-grintser.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/04-example-grintser.md) |
| 05 | Пропущенные теги | `[0]` | [05-missed-tags.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/05-missed-tags.md) |
| 06 | Разметка Примечаний | `[0]` | [06-tagging-notes.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/06-tagging-notes.md) |
| 07 | Пропуски в Примечаниях | `[0]` | [07-missed-tags-notes.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/07-missed-tags-notes.md) |
| 08 | Словарь имен и названий | `[0]` | [08-transfer-names-geo.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/08-transfer-names-geo.md) |
| 09 | IndexList 001 | `[1]` | [09-indexlist-001.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/09-indexlist-001.md) |
| 10 | IndexList 002–004 | `[1]` | [10-indexlist-002-004.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/10-indexlist-002-004.md) |
| 11 | Сводный IndexList | `[1]` | [11-merge-indexlist.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/11-merge-indexlist.md) |
| 12 | Ошибка в xlsx | `[1]` | [12-xlsx-error.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/12-xlsx-error.md) |
| 13 | Перенос символьных стилей | `[0]`/`[1]` | [13-transfer-char-styles.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/13-transfer-char-styles.md) |
| 14 | Индексирование текста | `[3]` | [14-indexing.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/14-indexing.md) |
| 15 | Исправление ошибок | `[3]` | [15-fixing-index-errors.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/15-fixing-index-errors.md) |
| 16 | Подготовка указателя | `[4]` | [16-build-index.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/16-build-index.md) |
| 17 | Деление на 4 части | `[4]` | [17-split-index.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/17-split-index.md) |
| 18 | Исправлен UseReadyTable v7 | `[1]` | [18-usereadytable-fix.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/18-usereadytable-fix.md) |

## Связанные документы

- [`Litpam-Indexator/README.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/README.md) — обзор всего инструментария
- [`Litpam-Indexator/CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md) — технический контракт (`ForIndex.jsxinc`, ловушки)
- [`Roadmap_Ramayana_Index-Vol.1.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md) — пошаговый чек-лист построения указателей Тома I

_Dr. Mārcis Gasūns_
