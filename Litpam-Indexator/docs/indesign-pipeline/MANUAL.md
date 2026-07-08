# Построение указателей «Рамаяны» в InDesign — сводное руководство

_Created: 08-07-2026 · Last updated: 08-07-2026_

Сквозное руководство по конвейеру построения предметных указателей к двухтомнику
«Рамаяна» (перевод П. А. Гринцера, серия «Литературные памятники»), собранное из
18 видео-скринкастов Михаила Иванюшина ([dotextok.ru](https://dotextok.ru)) и
сверенное с кодовым контрактом инструментария —
[`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc)
и [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md).

Документ состоит из двух частей:

- **Часть I. Операторский разбор** — что и в каком порядке делать в InDesign, от чистого
  исходника до четырёх готовых указателей, со ссылками на конкретные `.jsx`-скрипты и видео.
- **Часть II. Техническое приложение для мейнтейнера** — привязка нарратива к коду,
  инварианты имён из `ForIndex.jsxinc`, известные ловушки и список замеченных дефектов.

Почищенные пофайловые расшифровки всех 18 роликов лежат рядом, в
[`clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean);
сырые ASR-файлы сохранены как провенанс в
[`docs/indesign-pipeline/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline).

---

## Карта: видео → стадия → скрипт

| # | Видео | Стадия | Скрипт | Очищенная расшифровка |
|---|---|---|---|---|
| 01 | [Обзор папки](https://www.youtube.com/watch?v=Q6BrE-l4DTg) | обзор | все стадии | [01-overview.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/01-overview.md) |
| 02 | [Разметка тегами, книга 1](https://www.youtube.com/watch?v=tm0v-VHYRSw) | `[0]` | `FindTags.2024.jsx` | [02-tagging-book1.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/02-tagging-book1.md) |
| 03 | [Как работает поиск](https://www.youtube.com/watch?v=ZU7xelhtWnI) | `[0]` | `#ApplyCharacterStyle.2024.jsx` | [03-search-mechanism.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/03-search-mechanism.md) |
| 04 | [Пример: текст Гринцера](https://www.youtube.com/watch?v=Bj3MIcu3jsM) | `[0]` | `FindTags.2024.jsx` | [04-example-grintser.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/04-example-grintser.md) |
| 05 | [Пропущенные теги](https://www.youtube.com/watch?v=wP6xXKiEX5E) | `[0]` | `#ApplyCharacterStyle.2024.jsx` | [05-missed-tags.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/05-missed-tags.md) |
| 06 | [Разметка Примечаний](https://www.youtube.com/watch?v=EsXjzu09SA4) | `[0]` | `FindTags.2024.jsx` | [06-tagging-notes.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/06-tagging-notes.md) |
| 07 | [Пропуски в Примечаниях](https://www.youtube.com/watch?v=i7mkyTAJMB0) | `[0]` | `#ApplyCharacterStyle.2024.jsx` | [07-missed-tags-notes.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/07-missed-tags-notes.md) |
| 08 | [Словарь имён и названий](https://www.youtube.com/watch?v=lmoNXBchKRE) | `[0]` | `FindTags.2024.jsx` | [08-transfer-names-geo.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/08-transfer-names-geo.md) |
| 09 | [IndexList 001](https://www.youtube.com/watch?v=tYQBLu9WNyM) | `[1]` | `UseReadyTable.v.7.jsx` | [09-indexlist-001.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/09-indexlist-001.md) |
| 10 | [IndexList 002–004](https://www.youtube.com/watch?v=wC62L0XMGSk) | `[1]` | `UseReadyTable.v.7.jsx` | [10-indexlist-002-004.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/10-indexlist-002-004.md) |
| 11 | [Сводный IndexList](https://www.youtube.com/watch?v=eryYnZBrEPs) | `[1]` | `AddMarker.jsx` + `MergeTwoIndexListTables.jsx` | [11-merge-indexlist.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/11-merge-indexlist.md) |
| 12 | [Ошибка в xlsx](https://www.youtube.com/watch?v=azj_saSPq-c) | `[1]` | — (словарь) | [12-xlsx-error.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/12-xlsx-error.md) |
| 13 | [Перенос символьных стилей](https://www.youtube.com/watch?v=XTIfFdqQyeE) | `[0]`/`[1]` | `#GatherStyleNamesInIndexList(new).jsx` | [13-transfer-char-styles.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/13-transfer-char-styles.md) |
| 14 | [Индексирование](https://www.youtube.com/watch?v=8pBSRDVAAZU) | `[3]` | `ProcStoryOrDoс[09.10.2023].jsx` | [14-indexing.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/14-indexing.md) |
| 15 | [Исправление ошибок](https://www.youtube.com/watch?v=wK60yNgeEqA) | `[3]` | `DeleteUnnecessarySign [Black].jsx` · `[SkipTheWord].jsx` | [15-fixing-index-errors.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/15-fixing-index-errors.md) |
| 16 | [Подготовка указателя](https://www.youtube.com/watch?v=pVO9qKyE_a4) | `[4]` | `ProcNumberLines[3-4,6-8].jsx` | [16-build-index.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/16-build-index.md) |
| 17 | [Деление на 4 части](https://www.youtube.com/watch?v=WmCJ7GdJjzQ) | `[4]` | `SplitStory` (Useful Support Tools) | [17-split-index.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/17-split-index.md) |
| 18 | [Исправлен UseReadyTable v7](https://www.youtube.com/watch?v=dtuew2WHt64) | `[1]` | `UseReadyTable.v.7.jsx` | [18-usereadytable-fix.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/clean/18-usereadytable-fix.md) |

> **О тайм-кодах.** Тайминговые субтитры роликов скачаны заново по `videoId`
> (в первой строке каждого сырого файла) и сохранены как провенанс в
> [`timed/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/timed).
> На их основе каждый значимый шаг получил посекундную ссылку `…&t=<N>s`,
> открывающую ролик на нужном моменте. Полный перечень — в разделе
> [«Тайм-коды по роликам»](#тайм-коды-по-роликам) ниже; те же ссылки продублированы
> в очищенных расшифровках в [`clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean).

---

# Часть I. Операторский разбор

Итоговая цель — **четыре указателя** в конце тома: именной, географический, предметов
и терминов, флоры и фауны. Источник — вручную тегированный текст перевода
([`Tags/ram_tags.txt`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Tags/ram_tags.txt))
с инлайн-тегами вида `#термин{Тег\уровень}` и рабочий словарь в Excel
([`xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/xls/%D0%A3%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D0%B5%D0%BB%D1%8C_%D0%BA_%D0%A0%D0%B0%D0%BC%D0%B0%D1%8F%D0%BD%D0%B5_1_2_2026_05_18.xlsx)).

Все `.jsx`-скрипты запускаются из палитры **Window → Utilities → Scripts** внутри
открытого документа InDesign (двойной клик по имени скрипта).

## Шаг 0. Очистка исходника (видео 01)

Перед новым прогоном убираем старую разметку, чтобы начать с чистого листа:

1. Стадия `[3]` → скрипт индексирования, выбрать «удалить все имеющиеся записи».
2. Открыть группу символьных стилей «Index styles» (`Shift+F11`), выделить в ней все
   стили и удалить **без сохранения форматирования** (чтобы снялся цвет).
3. Выделить текст и задать чёрный цвет — снять остаточную служебную окраску.

## Стадия [0]. Перенос теговой разметки в вёрстку (видео 02–08, 13)

Разметка переносится **по материалам** тома: основной текст первой книги, текст
Гринцера, Примечания, словарь имён и географических названий — каждый в своём файле.
Для каждого материала:

1. Открыть два файла — вёрстку и её тегированную разметку. Файл разметки должен лежать
   **в одной папке** с вёрсткой.
2. Запустить `FindTags.2024.jsx`, поставить курсор в вёрстку, поставить галочку
   «выделить текст с тегированной разметкой», выделить весь текст, запустить.

Скрипт делает два прохода: извлечение информации, затем поиск и оформление. Найденное
красится **красным** (`IndexStylesColor`); термины, помеченные как неиндексируемые,
получают сиреневый цвет `SkipTheWord`. Всё, что не удалось сопоставить, собирается в
файл необработанных тегов.

**Доразметка пропусков** — скрипт `#ApplyCharacterStyle.2024.jsx` (видео 03, 05, 07):

1. Поместить файл необработанных тегов в новый документ (страница за страницей, **без**
   разворота), сохранить рядом с вёрсткой.
2. Запустить скрипт и идти по тегам горячими клавишами: курсор в вёрстку → в файле тегов
   встать на очередной тег → клавишей поиска найти нужный случай (по вертикальной черте
   видно, что попало в поиск) → клавишей «стиль» применить символьный стиль → «следующий».

Попутно встречаются **ошибки самой разметки** (в тексте одна форма, в теге другая) — их
просто пропускают.

**Перенос символьных стилей в таблицу** (видео 13) — обязательный шаг на стыке стадий
`[0]`/`[1]`, **до** индексирования: скрипт `#GatherStyleNamesInIndexList(new).jsx`
переносит из вёрстки в `IndexList` все символьные стили, созданные при разметке (курсор
в текст вёрстки → курсор в `IndexList` → «собрать символьные стили»). Пропустить этот шаг
= потерять время на бесполезном прогоне.

## Стадия [1]. Построение таблиц IndexList (видео 09–12, 18)

Из каждого листа словаря `.xlsx` строится своя таблица `IndexList`.

Для каждого из четырёх указателей (именной → 001, географический → 002, предметы и
термины → 003, флора и фауна → 004):

1. Взять стартовый файл `IndexList` (с уже заданной группой стилей «Index styles»:
   пять стилей уровней + разделитель).
2. Скопировать нужные колонки листа из `.xlsx`, вставить в вёрстку. **Удалить все пустые
   строки** (иначе скрипт не отработает) и верхнюю служебную строку.
3. Запустить `UseReadyTable.v.7.jsx` (именно версию 7 — для «Рамаяны»). Сохранить с
   нужным номером (`IndexList-001`…`004`; скрипт по умолчанию предлагает `001`).

`UseReadyTable.v.7.jsx` выполняет шесть проходов: чистит текст, расставляет флаги
обработки (`n`/`#`), префиксы регистра (`-I` / `-i`), сортирует формы термина по убыванию
длины и заполняет служебные колонки. Подробности — в Части II.

**Сборка сводной таблицы** (видео 11):

1. `AddMarker.jsx` — проставить перед каждым термином букву-маркер указателя: `a`, `b`,
   `c`, `d` (курсор в первую колонку → запуск).
2. Файл-приёмник переименовать так, чтобы имя начиналось с `@`.
3. `MergeTwoIndexListTables.jsx` — по очереди прицепить таблицы `b`, `c`, `d` к приёмнику
   `@…` (активный файл — приёмник). Итог: сводная `IndexList[@]-001` со всеми терминами.

> **Ловушка словаря** (видео 12): комментарий-пометка в колонке `C` листа (например
> «без тега не искать») может «завесить» обработку. Такой текст из колонки `C` надо убрать.

## Стадия [3]. Индексирование (видео 14–15)

1. Запустить `ProcStoryOrDoс[09.10.2023].jsx` (буква «с» в «Doс» — **кириллическая**!),
   загрузить рабочую таблицу (она должна лежать в той же папке).
2. «Выделить таблицу» → «подготовить задание на работу с текстом» → поставить курсор в
   текст → «обработать выбранный текст в соответствии с заданием».

Процесс долгий (≈1–1,5 часа). Необработанные термины собираются в `log.txt` — их полезно
скопировать в папку `save` перед повторной генерацией.

**Исправление ошибок** (видео 15):

- `DeleteUnnecessarySign [Black].jsx` — убрать ненужную запись из указателя и покрасить в
  чёрный.
- `DeleteUnnecessarySign [SkipTheWord].jsx` — покрасить слово цветом `SkipTheWord`, убрать
  из указателя и исключить из будущей индексации.
- Точечная правка записи: удалить старые вхождения (в скрипте индексирования выбрать
  «удалить из индекса выбранную запись» → подготовить задание → обработать), затем
  исправить строку в `IndexList` и добавить заново. Частотные имена (например «Рама»),
  охваченные только через символьный стиль, добавляют отдельной строкой **без** стиля,
  чтобы найти все вхождения.

## Стадия [4]. Оформление и деление указателя (видео 16–17)

1. **Сборка:** панель «Указатель» → «Построить указатель» (≈4 минуты).
2. **Номера страниц:** `ProcNumberLines[3-4,6-8].jsx` (папка «Оформление номеров страниц в
   указателе») — схлопнуть подряд идущие номера в диапазоны через дефис и сделать ссылки
   из Примечаний полужирными (задать диапазон страниц примечаний, стиль «страница в
   комментарии»).
3. **Деление на четыре указателя:** скрипт `SplitStory` (папка «Useful Support Tools»)
   разрезает сводный указатель по буквам-маркерам `A`/`B`/`C`/`D`; поиском с заменой
   удаляются служебные префиксы (`a-`, `b-`, …). Смена двух-/одноколоночного вида
   правится объектным стилем «страница указателя».

Прочие операции оформления (стадия `[4]`) — в отдельных подпапках: ссылки «См.»
(`AddSeeTopic.v.3.v.3.jsx`), прочерки вместо повторов слова (`DashInsteadWord.jsx`),
скрытие/показ служебного номера (`HideShowNumber.v.2.jsx`), алфавитные рубрики
(`AddLetter.v.2.jsx`), аннотации (`AddAnnotationData.v.3.jsx`), замена списка инициалов на
имена (`UpdateNameList.jsx`). Очерёдность применения — в
`[4. Оформление указателя]/Очерёдность.txt`.

---

## Тайм-коды по роликам

Собрано из авто-субтитров YouTube (файлы-провенанс — в [`timed/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/timed)); секунды взяты из субтитров, ссылки открывают ролик на нужном моменте. Те же ссылки продублированы в каждой очищенной расшифровке в [`clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean).

**01. Обзор папки со скриптами** — [ролик](https://www.youtube.com/watch?v=Q6BrE-l4DTg)  
[0:01](https://www.youtube.com/watch?v=Q6BrE-l4DTg&t=1s) Обзор папки: скрипты всех стадий конвейера · [1:49](https://www.youtube.com/watch?v=Q6BrE-l4DTg&t=109s) Очистка исходника перед новым прогоном: снять старую разметку и цвет · [3:00](https://www.youtube.com/watch?v=Q6BrE-l4DTg&t=180s) Чистый исходник — всю разметку сделает конвейер

**02. Разметка тегами, книга 1 · [0] FindTags** — [ролик](https://www.youtube.com/watch?v=tm0v-VHYRSw)  
[0:01](https://www.youtube.com/watch?v=tm0v-VHYRSw&t=1s) Что подготовить: вёрстка и файл разметки в одной папке · [0:18](https://www.youtube.com/watch?v=tm0v-VHYRSw&t=18s) Структура файлов тома (деление на части) · [3:05](https://www.youtube.com/watch?v=tm0v-VHYRSw&t=185s) Два прохода: извлечение информации, затем поиск и оформление · [3:26](https://www.youtube.com/watch?v=tm0v-VHYRSw&t=206s) Замер времени прогона второго прохода

**03. Как устроен поиск · [0]** — [ролик](https://www.youtube.com/watch?v=ZU7xelhtWnI)  
[0:01](https://www.youtube.com/watch?v=ZU7xelhtWnI&t=1s) Файл необработанных тегов — назначение · [1:02](https://www.youtube.com/watch?v=ZU7xelhtWnI&t=62s) Как строится grep-запрос: пробелы → любой пробельный символ, кавычки и дефисы взаимозаменяемы · [10:49](https://www.youtube.com/watch?v=ZU7xelhtWnI&t=649s) Ошибка самой разметки (форма в тексте ≠ форма в теге) — пропускаем

**04. Пример: текст Гринцера · [0] FindTags** — [ролик](https://www.youtube.com/watch?v=Bj3MIcu3jsM)  
[0:03](https://www.youtube.com/watch?v=Bj3MIcu3jsM&t=3s) Тегированный текст Гринцера в первой книге · [1:12](https://www.youtube.com/watch?v=Bj3MIcu3jsM&t=72s) Результат переноса разметки — проверяем

**05. Пропущенные теги · [0] #ApplyCharacterStyle** — [ролик](https://www.youtube.com/watch?v=wP6xXKiEX5E)  
[0:01](https://www.youtube.com/watch?v=wP6xXKiEX5E&t=1s) Новый файл для необработанных тегов (страницы без разворота) · [2:11](https://www.youtube.com/watch?v=wP6xXKiEX5E&t=131s) Проход по тегам горячими клавишами (пример)

**06. Разметка Примечаний · [0] FindTags** — [ролик](https://www.youtube.com/watch?v=EsXjzu09SA4)  
[0:01](https://www.youtube.com/watch?v=EsXjzu09SA4&t=1s) Третий материал тома — Примечания; открыты два файла · [1:01](https://www.youtube.com/watch?v=EsXjzu09SA4&t=61s) Результат разметки Примечаний

**07. Пропуски в Примечаниях · [0] #ApplyCharacterStyle** — [ролик](https://www.youtube.com/watch?v=i7mkyTAJMB0)  
[0:01](https://www.youtube.com/watch?v=i7mkyTAJMB0&t=1s) Новый файл с необработанными тегами Примечаний · [3:06](https://www.youtube.com/watch?v=i7mkyTAJMB0&t=186s) Работа с чёрным текстом и дефисами · [7:30](https://www.youtube.com/watch?v=i7mkyTAJMB0&t=450s) Проход по тегам, ручная отметка (примеры) · [9:32](https://www.youtube.com/watch?v=i7mkyTAJMB0&t=572s) Второй материал закончен — идём дальше

**08. Словарь имён и географических названий · [0]** — [ролик](https://www.youtube.com/watch?v=lmoNXBchKRE)  
[0:00](https://www.youtube.com/watch?v=lmoNXBchKRE&t=0s) Последний материал — словарь имён и географических названий · [0:57](https://www.youtube.com/watch?v=lmoNXBchKRE&t=57s) Готово: красным отмечены найденные термины

**09. IndexList 001 · [1] UseReadyTable.v.7** — [ролик](https://www.youtube.com/watch?v=tYQBLu9WNyM)  
[0:00](https://www.youtube.com/watch?v=tYQBLu9WNyM&t=0s) Стартовый набор стилей «Index styles» (папка Info) · [1:17](https://www.youtube.com/watch?v=tYQBLu9WNyM&t=77s) Именной указатель: берём нужные колонки листа .xlsx · [2:38](https://www.youtube.com/watch?v=tYQBLu9WNyM&t=158s) Удалить пустые строки — иначе скрипт не отработает · [3:39](https://www.youtube.com/watch?v=tYQBLu9WNyM&t=219s) Шесть проходов UseReadyTable.v.7 · [4:49](https://www.youtube.com/watch?v=tYQBLu9WNyM&t=289s) Разбор результата: флаги, регистр, служебные колонки

**10. IndexList 002–004 · [1] UseReadyTable.v.7** — [ролик](https://www.youtube.com/watch?v=wC62L0XMGSk)  
[0:00](https://www.youtube.com/watch?v=wC62L0XMGSk&t=0s) Скрипт сам сохраняет файл с номером (IndexList-001…) · [2:25](https://www.youtube.com/watch?v=wC62L0XMGSk&t=145s) Готовим 002 · [4:13](https://www.youtube.com/watch?v=wC62L0XMGSk&t=253s) Готовим 003 · [4:34](https://www.youtube.com/watch?v=wC62L0XMGSk&t=274s) Готовим 004 (флора и фауна) · [6:05](https://www.youtube.com/watch?v=wC62L0XMGSk&t=365s) Четыре таблицы готовы — сохраняем · [6:31](https://www.youtube.com/watch?v=wC62L0XMGSk&t=391s) Дальше — объединение в сводную таблицу

**11. Сводный IndexList · [1] AddMarker + Merge** — [ролик](https://www.youtube.com/watch?v=eryYnZBrEPs)  
[0:01](https://www.youtube.com/watch?v=eryYnZBrEPs&t=1s) Четыре файла созданы — что дальше · [3:52](https://www.youtube.com/watch?v=eryYnZBrEPs&t=232s) AddMarker: буквы-маркеры указателей a/b/c/d · [4:16](https://www.youtube.com/watch?v=eryYnZBrEPs&t=256s) Объединение: файл-приёмник, имя начинается с @ · [4:45](https://www.youtube.com/watch?v=eryYnZBrEPs&t=285s) MergeTwoIndexListTables: прицепляем таблицы по очереди · [7:33](https://www.youtube.com/watch?v=eryYnZBrEPs&t=453s) Итог — сводная таблица IndexList[@]-001

**12. Ошибка в xlsx · [1]** — [ролик](https://www.youtube.com/watch?v=azj_saSPq-c)  
[0:01](https://www.youtube.com/watch?v=azj_saSPq-c&t=1s) Проблема: комментарий в колонке C «завесил» обработку · [1:05](https://www.youtube.com/watch?v=azj_saSPq-c&t=65s) Комментарий убран — теперь работает

**13. Перенос символьных стилей · [0]/[1] #GatherStyleNames** — [ролик](https://www.youtube.com/watch?v=XTIfFdqQyeE)  
[0:01](https://www.youtube.com/watch?v=XTIfFdqQyeE&t=1s) Два файла готовы; заводим папку save · [1:53](https://www.youtube.com/watch?v=XTIfFdqQyeE&t=113s) Символьные стили перенесены в IndexList

**14. Индексирование · [3] ProcStoryOrDoс** — [ролик](https://www.youtube.com/watch?v=8pBSRDVAAZU)  
[0:00](https://www.youtube.com/watch?v=8pBSRDVAAZU&t=0s) Строим индексный указатель по строкам IndexList · [1:07](https://www.youtube.com/watch?v=8pBSRDVAAZU&t=67s) Запуск процесса (≈1–1,5 часа) · [2:50](https://www.youtube.com/watch?v=8pBSRDVAAZU&t=170s) Замер времени; log.txt с необработанными терминами

**15. Исправление ошибок индексирования · [3]** — [ролик](https://www.youtube.com/watch?v=wK60yNgeEqA)  
[0:01](https://www.youtube.com/watch?v=wK60yNgeEqA&t=1s) Файл log.txt — необработанные термины · [3:33](https://www.youtube.com/watch?v=wK60yNgeEqA&t=213s) Запись «ними» — дефект «одной формы» UseReadyTable · [5:48](https://www.youtube.com/watch?v=wK60yNgeEqA&t=348s) Точечная правка: находим и выделяем строку · [6:49](https://www.youtube.com/watch?v=wK60yNgeEqA&t=409s) Обработать выбранный текст: удалить запись из индекса · [10:36](https://www.youtube.com/watch?v=wK60yNgeEqA&t=636s) Частотное имя «Рама» через символьный стиль — добавляем строкой без стиля · [13:05](https://www.youtube.com/watch?v=wK60yNgeEqA&t=785s) 632 записи добавлено с «Рамой»

**16. Подготовка указателя · [4]** — [ролик](https://www.youtube.com/watch?v=pVO9qKyE_a4)  
[0:01](https://www.youtube.com/watch?v=pVO9qKyE_a4&t=1s) Пора собрать указатель · [0:43](https://www.youtube.com/watch?v=pVO9qKyE_a4&t=43s) Через ≈4 минуты указатель готов (буквы-рубрики) · [2:35](https://www.youtube.com/watch?v=pVO9qKyE_a4&t=155s) Символьный стиль «термин» · [3:40](https://www.youtube.com/watch?v=pVO9qKyE_a4&t=220s) Готово — оформление применено

**17. Деление на четыре указателя · [4] SplitStory** — [ролик](https://www.youtube.com/watch?v=WmCJ7GdJjzQ)  
[0:01](https://www.youtube.com/watch?v=WmCJ7GdJjzQ&t=1s) Из сводного указателя делаем четыре · [0:29](https://www.youtube.com/watch?v=WmCJ7GdJjzQ&t=29s) Сноска — одна на все указатели; идём по тексту · [2:36](https://www.youtube.com/watch?v=WmCJ7GdJjzQ&t=156s) До буквы C — маркеры указателей · [4:09](https://www.youtube.com/watch?v=WmCJ7GdJjzQ&t=249s) Исправления; предметы и термины · [6:52](https://www.youtube.com/watch?v=WmCJ7GdJjzQ&t=412s) Смена двух-/одноколоночного вида (объектный стиль)

**18. Исправлен UseReadyTable v7 · [1]** — [ролик](https://www.youtube.com/watch?v=dtuew2WHt64)  
[0:01](https://www.youtube.com/watch?v=dtuew2WHt64&t=1s) Причина ошибки «ними» из 15-го видео · [0:38](https://www.youtube.com/watch?v=dtuew2WHt64&t=38s) Исправлено — прогон без ошибок

---

# Часть II. Техническое приложение для мейнтейнера

## Инварианты имён (из `ForIndex.jsxinc`)

Все имена ниже — жёсткий контракт; **переименование в коде или в документах InDesign
ломает систему**. Значения выверены по
[`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc).

**Абзацные стили уровней** (группа `#IndexStyles`): `#Level1`, `#Level2`, `#Level3`,
`#Level4`. Стили оформления собранного указателя: `#Level1=Index` … `#Level4=Index`.

**Цвета:**

| Имя | RGB | Значение |
|---|---|---|
| `SkipTheWord` | `255,0,255` (сиреневый/маджента) | слово запрещено индексировать; совпадает с термином, но пропускается |
| `IndexStylesColor` / `usedColor` | `255,0,0` (красный) | уже обработанное / добавленное слово |
| `IndexColor-<буква>-<n>` | из таблицы `colorsRGB` | цвет термина конкретного указателя (создаётся по букве маркировки) |

Красный оттенок занят под `IndexStylesColor`, поэтому в палитре указателей его нет.
Буквы маркировки указателей — массив `markLetters = ["a","b","c","d","e","f","g","h","i"]`
(активный набор; в коде закомментирован прежний набор `["d","f","h",…]`). Каждой букве
соответствует свой цвет из `colorsRGB`.

**Прочее:** маркер отсутствующего уровня `noLevel` — длинное тире `—`
(`SpecialCharacters.emDash`); разделитель термина и последовательности номеров
`indLineSep` — два пробела; служебный пробел поиска `sepSpace` — `\h` (для CS6+).

**Схема имён файлов таблиц:** `IndexList-nnn.indd` (без маркера) →
`IndexList[X]nnn.indd` (`X` — латинская буква указателя) → сводный
`IndexList[@]nnn.indd`.

## Как устроен поиск (`GetInfoForSearch`, видео 03)

Прямой поиск термина по тексту невозможен (слишком много совпадений). Вместо этого от
тега берётся контекст ~44 знака вверх и вниз и обобщается в grep-запрос: пробелы → любой
пробельный символ (`\h`); кавычки, дефис/тире/минус — взаимозаменяемы; перевод строки →
«перевод строки + возможный пробел». В `ForIndex.jsxinc` за это отвечают наборы
`vowel`/`consonant`/`afterWord`, флаги `simpleSearch` и `useFamily`, граница слова
`we = \b`.

Флаг `simpleSearch = false` даёт точный (не избыточный) grep-запрос; `true` — простой, но
избыточный вариант со всем диапазоном `[а-я]`. Флаг `showUnsupportedWords = false`
подавляет экранные сообщения о необработанных «фамилиях» (намеренно, чтобы не смущать
операторов).

## Логика `UseReadyTable.v.7.jsx` (видео 09, 18)

- **Флаг обработки строки** (2-я колонка): `n` → строку **не** обрабатывать; иначе `#`
  или номер.
- **Регистр:** префикс `-I` — искать только с прописной (как написано); `-i` — со строчной
  и с прописной.
- **Сортировка по длине:** формы одного термина сортируются по убыванию длины, чтобы
  находилось слово целиком, а не его фрагмент.
- **Колонка стилей** (предпоследняя) — принимает символьные стили из вёрстки (заполняется
  скриптом `#GatherStyleNamesInIndexList(new).jsx`).

Дефект «одной формы» (видео 15/18): при единственной падежной форме термина v7 давала
неверный запрос (проявилось на слове «ними»); **исправлено** в текущей `UseReadyTable.v.7.jsx`.

## Известные ловушки (из `CLAUDE.md`)

- `ProcStoryOrDoс[09.10.2023].jsx` — буква «с» в «Doс» **кириллическая**; учитывать при
  поиске/автодополнении по имени.
- **Кодировки:** `.jsx` — UTF-8 **с BOM**, CRLF (сохранять именно так). Часть авторских
  `.txt` (`[Индексирование. Программы].txt`, `Очерёдность.txt`) — в cp1251. Кодировку по
  умолчанию не менять.
- **Overflow / несохранённый документ:** скрипты стадий `[1]` и `[3]` намеренно
  отказываются работать при вытесненном (overflow) тексте и на несохранённом документе —
  это проверки в коде, **не баги**.
- **ES3-идиомы:** `};` перед `else`, однострочные `if (a) f() else g()` — допустимы в
  ExtendScript, «исправлять» их не нужно.
- Папки `tmp/` в стадиях `[0]`/`[3]` — архив черновиков с намеренно битыми путями
  `#include`, в рабочий конвейер не входят.
- В `xls/` рабочие листы — только «Именной», «Географ», «Предметы и термины», «Флора и
  фауна» (+ справочник «Все_Теги»); прочие служебные.

## Замеченные при выверке дефекты (не исправлялись — задача документационная)

Согласно guardrail H355, код не трогался; ниже — список наблюдений для будущего разбора:

- **`UseReadyTable.v.7.jsx` — «одна форма».** По словам автора (видео 15/18), дефект
  устранён; стоит зафиксировать регрессионный учебный пример (слова «ними», «кха-тха»),
  чтобы отлавливать повторение.
- **Оператор-зависимость колонки `C`.** Свободный комментарий в колонке `C` листа словаря
  способен «завесить» обработку (видео 12). Кандидат на защиту — санитайзер/валидатор
  словаря перед прогоном стадии `[1]`.
- **Ручной цикл доразметки** (`#ApplyCharacterStyle.2024.jsx`) не логирует, какие теги
  остались неотмеченными после прохода оператора, — кандидат на аудит-лог.

---

## Провенанс и оговорки

- Руководство синтезировано из авто-субтитровых расшифровок; формулировки и порядок
  действий автора сохранены, исправлены только ошибки распознавания (имена скриптов,
  стилей и цветов — строго по `ForIndex.jsxinc` / `CLAUDE.md`).
- Тайм-коды шагов добыты заново из тайминговых авто-субтитров YouTube (по `videoId`
  из первой строки каждого сырого файла), сохранённых как провенанс в
  [`timed/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/timed);
  секунды взяты из субтитров, не выдуманы. Полный перечень — раздел
  [«Тайм-коды по роликам»](#тайм-коды-по-роликам).
- Часть имён собственных в роликах звучит искажённо (ASR); в очищенных расшифровках они
  оставлены осторожно, без домысливания «правильного» написания там, где источник
  неоднозначен.

_Dr. Mārcis Gasūns_
