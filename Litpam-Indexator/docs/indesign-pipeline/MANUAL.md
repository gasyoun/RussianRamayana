# Построение указателей «Рамаяны» в InDesign — сводное руководство

_Created: 08-07-2026 · Last updated: 10-07-2026_

Сквозное руководство по конвейеру построения предметных указателей к двухтомнику
«Рамаяна» (перевод П. А. Гринцера, серия «Литературные памятники»), собранное из
18 видео-скринкастов Михаила Иванюшина ([dotextok.ru](https://dotextok.ru)) и
сверенное с кодовым контрактом инструментария —
[`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc)
и [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md).

Документ состоит из трёх частей:

- **Часть I. Операторский разбор** — что и в каком порядке делать в InDesign, от чистого
  исходника до четырёх готовых указателей. Самодостаточен **без просмотра видео**: каждый
  шаг описан текстом (диалоги и кнопки скриптов — по именам), ролики остаются
  необязательными ссылками, их текстовые расшифровки — в
  [`clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean).
- **Часть II. Техническое приложение для мейнтейнера** — привязка нарратива к коду,
  инварианты имён из `ForIndex.jsxinc`, **пофайловый разбор всех скриптов конвейера**,
  известные ловушки и список замеченных дефектов (с отметками, что уже исправлено).
- **Часть III. Модернизация** — план замены ручного склонятеля словарной морфологией
  (pymorphy3), DeepSeek-копилот оператора
  ([`tools/copilot/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/tools/copilot))
  и раздел «Что делает наука» (ACL Anthology ↔ стадии конвейера).

Почищенные пофайловые расшифровки всех 18 роликов лежат рядом, в
[`clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean);
сырые ASR-файлы сохранены как провенанс в
[`docs/indesign-pipeline/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline).

> **Три документа — какой открывать под задачу.** Один конвейер описан в трёх местах,
> с разным назначением (не три параллельные истины, а три среза):
> — **пошаговый исполняемый чек-лист** с контрольными точками — [`Roadmap_Ramayana_Index-Vol.1.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md);
> — **сводный нарратив + техприложение** (этот документ) — `MANUAL.md`;
> — **кодовый контракт + big-picture** (имена стилей/цветов/файлов, ловушки) — [`Litpam-Indexator/CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md).
> Имена стилей, цветов, файлов и букв-маркеров во всех трёх сведены к канону из
> [`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc).

---

## Шпаргалка: весь конвейер за один экран

Открывающий MANUAL ежедневно оператор смотрит сюда; каждая строка — якорь на подробный
раздел ниже.

1. **Резервная копия** тома → снять `~*.idlk` lock-файл (Roadmap [П1–П2](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md#этап-п-подготовка-один-раз)).
2. **Пре-флайт словаря:** прогнать [`tools/validate_dictionary.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/validate_dictionary.py) по `.xlsx`, вычистить прозу в колонке `C`, пустые строки, хвостовые `;` (см. [«Окружение»](#окружение-и-предпосылки)).
3. **`[0]` Перенос разметки** → `FindTags.2024.jsx`, доразметка пропусков → `#ApplyCharacterStyle.2024.jsx` ([раздел](#стадия-0-перенос-теговой-разметки-в-вёрстку-видео-0208-13)).
4. **`[0]/[1]` Перенос символьных стилей** в `IndexList` → `#GatherStyleNamesInIndexList(new).jsx` (не пропускать).
5. **`[1]` Таблицы `IndexList`:** по каждому листу словаря → `UseReadyTable.v.7.jsx` → `IndexList-001…004` ([раздел](#стадия-1-построение-таблиц-indexlist-видео-0912-18)).
6. **`[1]` Маркеры и сводная:** `AddMarker.jsx` (буквы `a/b/c/d`) → `MergeTwoIndexListTables.jsx` → сводный `IndexList[@]-001`.
7. **`[2]` Проверка таблиц** — для «Рамаяны» почти пропускается ([раздел](#стадия-2-и-том-ii)).
8. **`[3]` Индексирование:** `ProcStoryOrDoс[09.10.2023].jsx` («с» — кириллическая!), ≈1–1,5 ч; разбор `log.txt` ([раздел](#стадия-3-индексирование-видео-1415)).
9. **`[3]` Чистка ложных срабатываний:** `DeleteUnnecessarySign [Black].jsx` / `[SkipTheWord].jsx`.
10. **`[4]` Сборка и оформление:** «Построить указатель» (≈4 мин) → `ProcNumberLines…` → `SplitStory` на 4 части → «См.»/прочерки/рубрики ([раздел](#стадия-4-оформление-и-деление-указателя-видео-1617)).

Диагностика на бегу — таблица [«Симптом → Причина → Лечение»](#симптом-причина-лечение).

## Поток данных

```
Tags/ram_tags.txt              xls/Указатель_к_Рамаяне_*.xlsx
(текст с инлайн-разметкой         (словник: 4 рабочих листа = 4 указателя;
 #термин{Тег\уровень})            падежные формы через «;» в колонке «Что искать»)
        │                                  │
        │      teg_exp.exe сверяет тег ↔ словарь между файлами (Windows+Excel)
        │      tools/validate_dictionary.py — внутренние дефекты листа (кроссплатформ.)
        ▼                                  ▼
[0] FindTags.2024.jsx: перенос разметки → символьные стили в вёрстке (InDesign/Ramayana_*.indd)
    #ApplyCharacterStyle.2024.jsx: доразметка пропусков
    #GatherStyleNamesInIndexList(new).jsx: перенос символьных стилей в IndexList
        │
        ▼
[1] UseReadyTable.v.7.jsx → IndexList-001…004.indd
    AddMarker.jsx (буква указателя a/b/c/d) → IndexList[a]…[d]
    MergeTwoIndexListTables.jsx → сводный IndexList[@]-001.indd
        │
        ▼
[2] Проверка таблиц (для «Рамаяны» почти не нужна — совпадающих grep-запросов нет)
        │
        ▼
[3] ProcStoryOrDoс[09.10.2023].jsx: по строкам IndexList расставляет index-маркеры в вёрстке
    → «Построить указатель» стандартными средствами InDesign
        │
        ▼
[4] Оформление: ProcNumberLines (свёртка номеров) → SplitStory (деление на 4) →
    «См.»-ссылки → прочерки → скрытие служебных номеров → алфавитные рубрики
```

## Розеттская таблица указателей

Единая привязка «указатель ↔ лист словаря ↔ IndexList ↔ буква-маркер» — одна и та же во
всех трёх документах. **Буквы сверены с массивом `markLetters = ["a","b","c","d",…]` в
[`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc)**
(строка 63): канон — латинские `a/b/c/d`.

| Указатель | Лист `.xlsx` | № указателя (колонка) | Файл таблицы | Буква-маркер (`AddMarker`) | Рубрика при делении (`SplitStory`) |
|---|---|---|---|---|---|
| Именной | «Именной» | 1 | `IndexList-001` | `a` | `A` |
| Географический | «Географ» | 2 | `IndexList-002` | `b` | `B` |
| Предметы и термины | «Предметы и термины» | 3 | `IndexList-003` | `c` | `C` |
| Флора и фауна | «Флора и фауна» | 4 | `IndexList-004` | `d` | `D` |

Сводная таблица после слияния — `IndexList[@]-001`. Мнемоническая схема `N/G/T/F`
(именной/гео/термины/флора), встречающаяся в Roadmap, — это *предложение* автора для
удобочитаемости, а не то, что реально ставит код: `AddMarker` берёт буквы из `markLetters`
по порядку. Если понадобятся мнемонические буквы, это правка `markLetters`/`AddMarker`,
т.е. изменение кодового контракта (вне текущего объёма — см. `@DECIDE` в
[`.ai_state.md`](https://github.com/gasyoun/RussianRamayana/blob/main/.ai_state.md)).

## Симптом → Причина → Лечение

Разбросанные по нарративу ловушки — одним диагностическим блоком.

| Симптом | Причина | Лечение |
|---|---|---|
| Стадия `[1]`/`[3]` отказывается запускаться | Вытесненный (overflow) текст или несохранённый документ — намеренная проверка в коде, не баг | Убрать overflow (Preflight), сохранить документ; см. [«Стадия [1]»](#стадия-1-построение-таблиц-indexlist-видео-0912-18) |
| Обработка «завесла» на одном слове (напр. «оружие») | Свободная проза/комментарий в колонке `C` листа словаря (видео 12) | Убрать комментарий из `C`; ловится заранее [`validate_dictionary.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/validate_dictionary.py) (класс `prose_in_forms`) |
| `UseReadyTable` не отрабатывает по вставленной таблице | Пустые строки, прицепившиеся при вставке из Excel, и/или верхняя служебная строка (видео 09) | Удалить пустые строки и шапку; ловится `validate_dictionary.py` (`blank_row`, `service_leak`) |
| Дефект «одной формы» — неверный запрос при единственной падежной форме (слово «ними») | Ошибка `UseReadyTable.v.7` (видео 15), **исправлена** (видео 18) | Прогнать [регрессионный дрилл](#регрессионный-дрилл-golden-fish) после любого обновления `UseReadyTable.v.7.jsx` |
| `log.txt` непустой после стадии `[3]` | Часть терминов не проиндексирована (нормально) | Скопировать `log.txt` в `save`, разобрать построчно; частотные имена («Рама») добавить строкой без символьного стиля (видео 15) |
| Скрипт `ProcStoryOrDoс…` «не находится»/имя не совпадает | Буква «с» в `Doс` — **кириллическая** | Копировать имя как есть; не переименовывать |
| Хвостовой `;` / дубли форм в ячейке | Огрехи ручного ведения словника | Ловится `validate_dictionary.py` (`trailing_semicolon`, `duplicate_forms`); поправить вручную |
| Прогон `UseReadyTable` затёр предыдущую таблицу | Автоинкремент имени был закомментирован (26.11.2024) — выход всегда `IndexList-000.indd` | **Исправлено 10-07-2026 (H377):** автонумерация возвращена, скрипт снова сохраняет `IndexList-001…`. На старых копиях скрипта — пересохранять вручную |
| Grep `^[dfhjmstwz]-` не убирает префиксы маркеров из собранного указателя | Дрейф контракта: `markLetters` сменились на `a…i`, а help-текст `AddMarker.jsx` и регекс очистки остались от старого набора | Использовать `^[a-i]-`; **help-текст исправлен 10-07-2026 (H377)** |
| В указателе английское «see» вместо «см.» | `AddSeeTopic.v.3.v.3.jsx` берёт «см.» из `sets/#AddSeeTopic.ini`; без ini действовал дефолт `textPointer="see"` из `ForIndex.jsxinc` | **Исправлено 10-07-2026 (H377):** дефолт в `ForIndex.jsxinc` — `"см."`. На старых копиях — один раз выбрать «см.» в диалоге (создастся ini) |

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

> **Видео необязательны.** С ревизии 10-07-2026 каждый шаг ниже описан текстом,
> включая диалоги скриптов (точные названия кнопок и флажков — в блоках «Диалог
> скрипта» и в [пофайловом разборе](#пофайловый-разбор-скриптов) Части II). Ссылки
> на ролики и [тайм-коды](#тайм-коды-по-роликам) оставлены как дополнительная
> опора; текстовые расшифровки всех 18 роликов — в
> [`clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean).

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

> **Диалог скрипта** (палитра «Работа с тегированным текстом»): два чекбокса-фиксатора —
> «Поставьте курсор в текст вёрстки и установите флажок» (после отметки: «Файл вёрстки
> выбран») и «Выделите текст с тегированной разметкой…» («Файл с тегами выбран»); кнопка
> «Перенести разметку тегами в вёрстку» запускает оба прохода, кнопка «?» — подробная
> справка. Прогресс: «1/2 Извлечение…» → «2/2 Поиск в файле вёрстки…». Требования: ровно
> два открытых документа в одной папке, в файле тегов есть цвет `TagsColor`.

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

> **Диалог скрипта** (палитра «Перенос разметки»): чекбоксы «Вёрстка» / «Теги» /
> «Курсор в строке тегов»; кнопки `>` (перейти к очередному тегу и скопировать его в
> буфер), `И` («искать текст» — найти скопированный термин в вёрстке; поля номера
> текущего/всех найденных образцов позволяют перебирать совпадения), `С` («стилевое
> оформление найденного текста» — применить символьный стиль из тега; обработанная
> строка тега красится голубым), `?` — справка.

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
   нужным номером (`IndexList-001`…`004`).

> ✅ **Ловушка перезаписи закрыта (10-07-2026, H377).** С 26.11.2024 по 10-07-2026
> автоинкремент имени был закомментирован и скрипт всегда сохранял результат под жёстким
> именем `IndexList-000.indd`, затирая предыдущую таблицу. Автонумерация возвращена:
> скрипт снова сам выбирает следующий свободный номер `IndexList-001`…, как показано в
> видео 10. Если работаете на **старой копии** скрипта — пересохраняйте файл вручную
> после каждого прогона. После любого обновления скрипта — прогнать
> [регрессионный дрилл](#регрессионный-дрилл-golden-fish).

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

## Стадия [2] и Том II

**Стадия `[2]` (проверка таблиц)** для «Рамаяны» почти пропускается: по `info.txt` автора
совпадающих grep-запросов между терминами нет, поэтому массовая сверка не нужна. Но стадия
**существует** — минимальная выборочная проверка описана в Roadmap
([этап 2](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md#этап-2-проверка-таблиц-для-рамаяны--сокращённо)):
курсор в строку термина → `ShowFoundByGrep.v.3.jsx` покажет, что реально находит запрос;
`TermCompare[+letter].v.2.jsx` — если словник менялся. Лишние совпадения помечаются в
тексте цветом `SkipTheWord`.

**Том II.** Настоящий MANUAL описывает Том I. Конвейер Тома II **идентичен** (Roadmap
[Ф4](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md#этап-ф-финал)):
повторяются стадии `[1]`–`[4]` для `Ramayana_II_…indd`. Словник общий (тот же `.xlsx`), но
таблицы `IndexList` Тома II строятся **заново** по фактическим тегам второго тома — переносить
готовые `IndexList` Тома I нельзя.

## Стадия [3]. Индексирование (видео 14–15)

1. Запустить `ProcStoryOrDoс[09.10.2023].jsx` (буква «с» в «Doс» — **кириллическая**!),
   загрузить рабочую таблицу (она должна лежать в той же папке).
2. «Выделить таблицу» → «подготовить задание на работу с текстом» → поставить курсор в
   текст → «обработать выбранный текст в соответствии с заданием».

> **Диалог скрипта** (палитра «Подготовка указателя»): кнопки «Загрузить таблицу»,
> «Подготовить задание на работу с текстом», «Обработать выбранный текст…»; радиокнопки
> области «Материал/Файл» и режима добавить/удалить; чекбоксы «Удалить все имеющиеся
> записи в индексе» (полная очистка перед новым прогоном), «Сноски», «Заблокированные
> тексты/слои», «Скрытые слои», а также флажок запуска `GetInfoForSearch.jsx` рядом.
> Строки с пустой второй ячейкой и с нечёрным grep-запросом пропускаются — это норма.

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

## Бюджет времени

Оценка на одну сессию по одному тому. Помечено, что **измерено** в роликах, а что —
**прикидка** (точных замеров `[0]`/`[1]` автор не приводит).

| Стадия | Что | Оценка | Источник |
|---|---|---|---|
| Пре-флайт | Прогон `validate_dictionary.py` + ручная правка словаря | ~10–30 мин | прикидка |
| `[0]` | Перенос разметки + доразметка пропусков (по 4 материалам) | ~1–2 ч | прикидка (второй проход `FindTags` замерялся, но число не названо — видео 02) |
| `[1]` | 4 таблицы `IndexList` + маркеры + слияние | ~30–60 мин | прикидка |
| `[2]` | Проверка таблиц | ~0 (почти пропускается) | измерено (видео/`info.txt`) |
| `[3]` | Индексирование сводной таблицы | **≈1–1,5 ч** | измерено (видео 14) |
| `[3]` | Разбор `log.txt`, чистка ложных срабатываний | ~0,5–2 ч (зависит от текста) | прикидка |
| `[4]` | «Построить указатель» | **≈4 мин** | измерено (видео 16) |
| `[4]` | Номера / деление / «См.» / рубрики | ~1–2 ч | прикидка |

Вывод для планирования: один полный проход тома — **не одна сессия**; стадия `[3]`
(индексирование) — единый непрерываемый блок ≈1,5 ч, его планируют отдельно.

## Окружение и предпосылки

Сведено в один раздел (раньше было раскидано по Roadmap/CLAUDE).

- **InDesign CS6 и новее** — обязательно ради `\h` (служебный пробел `sepSpace` в
  [`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc), строка 5); для более старых версий там же закомментирован вариант `[[:blank:]]`.
- **Установка скриптов:** Window → Utilities → Scripts → правый клик на `User` → Reveal in
  Explorer → скопировать туда папку `#Indexing. Ramayana` (Roadmap
  [П3](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md#этап-п-подготовка-один-раз)). Скрипты запускаются двойным кликом из палитры.
- **Служебные стили:** загрузить группу `#IndexStyles` из `Info/Стили индекса (Index Styles)/IndexStyles.idml` (Roadmap П4).
- **Пре-флайт-валидатор словаря** (аддитивный, вне InDesign): `python tools/validate_dictionary.py "xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx"` — read-only отчёт по внутренним дефектам листа. Требует Python 3 + `openpyxl` (`pip install openpyxl`); Excel/OLE **не** нужен (в отличие от `teg_exp`). Полный отчёт по текущему словарю — [`dictionary-validation-report.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/dictionary-validation-report.md).
- **`teg_exp.exe`** ([`_Ram_Tag_explorer/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/_Ram_Tag_explorer)) — сверка тег ↔ словарь между файлами; **требует Windows + установленный Excel** (читает `.xlsx` через OLE).
- **Кодировки:** `.jsx` — UTF-8 **с BOM**, CRLF (сохранять именно так); часть авторских
  `.txt` (`[Индексирование. Программы].txt`, `Очерёдность.txt`, учебный `Slovnik.txt`) — в
  cp1251. Кодировку по умолчанию **не менять**. Новые `.py`/`.md` — UTF-8 **без BOM**.

## Глоссарий

| Термин | Значение |
|---|---|
| **Вёрстка** | документ InDesign с макетом тома (`Ramayana_*.indd`), в который расставляются index-маркеры |
| **Разметка / тег** | инлайн-пометка `#термин{Тег\уровень}` в исходном тексте (`Tags/ram_tags.txt`), связывающая фрагмент с термином указателя |
| **Словник** | рабочий словарь `.xlsx`: 4 листа = 4 указателя; в колонке «Что искать» — падежные формы термина через `;` |
| **IndexList** | таблица InDesign, построенная `UseReadyTable.v.7.jsx` из листа словаря; несёт grep-запросы, флаги, регистр и колонку символьных стилей |
| **Маркер указателя** | латинская буква (`a/b/c/d` из `markLetters`), которой `AddMarker.jsx` помечает термины одного указателя для последующего деления сводного индекса |
| **Символьный стиль** | Character Style группы «Index styles», созданный при переносе разметки; переносится в `IndexList` шагом `#GatherStyleNamesInIndexList(new).jsx` |
| **Overflow** | вытесненный (не вместившийся) текст фрейма; при нём скрипты стадий `[1]`/`[3]` намеренно отказываются работать |
| **Доразметка** | ручной проход `#ApplyCharacterStyle.2024.jsx` по тегам, не сопоставленным автоматически на стадии `[0]` |
| **Сводная таблица** | `IndexList[@]-001` — результат слияния четырёх `IndexList` в один (`MergeTwoIndexListTables.jsx`) |

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
Чтобы регресс этого дефекта не всплывал снова на многочасовом реальном прогоне, заведён
[регрессионный дрилл](#регрессионный-дрилл-golden-fish) на учебном примере Golden Fish.

## Регрессионный дрилл (Golden Fish)

`UseReadyTable.v.7.jsx` уже ломался на дефекте «одной формы» (слово «ними», видео 15) и был
починен (видео 18). Такой дефект тихий: он не роняет скрипт, а выдаёт неверный grep-запрос,
и всплывает только в `log.txt` после ≈1,5-часового индексирования. Поэтому после **любого**
обновления `UseReadyTable.v.7.jsx` его прогоняют на маленьком контролируемом входе и
сверяют выход с эталоном — это секунды вместо часов.

Учебный корпус уже есть:
[`#Indexing. Ramayana/Info/Учебные примеры (Drill examples)/Golden Fish Story/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/%23Indexing.%20Ramayana/Info/%D0%A3%D1%87%D0%B5%D0%B1%D0%BD%D1%8B%D0%B5%20%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80%D1%8B%20(Drill%20examples)/Golden%20Fish%20Story)
(`Golden Fish.idml`, `Slovnik.txt`, `IndexStyles.idml`). Минимальный вход-ловушка и ожидаемый
выход зафиксированы рядом в
[`regression_expected.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/Info/%D0%A3%D1%87%D0%B5%D0%B1%D0%BD%D1%8B%D0%B5%20%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80%D1%8B%20(Drill%20examples)/Golden%20Fish%20Story/regression_expected.md).

**Процедура:**

1. Открыть `Golden Fish.idml`, вставить в стартовый `IndexList` две колонки словника,
   **включив слова-ловушки** из `regression_expected.md` (однословные термины с единственной
   падежной формой: «ними», «кха-тха» + 1–2 коротких).
2. Прогнать `UseReadyTable.v.7.jsx`.
3. Сверить grep-запросы в третьей колонке полученного `IndexList` с эталонным снимком в
   `regression_expected.md` (grep по ожидаемым строкам). Расхождение на строке-ловушке =
   регресс дефекта «одной формы» — не выпускать обновлённый скрипт в реальный прогон.

## Пофайловый разбор скриптов

Полный мейнтейнерский разбор всех скриптов конвейера (построчный аудит 08-07-2026 +
пофайловая выверка 10-07-2026, Fable 5 `claude-fable-5`). Формат: назначение → алгоритм →
UI → контракты → дефекты/хрупкости. Дефекты, исправленные 10-07-2026 (H377), помечены ✅;
номера строк — по состоянию **до** фиксов. ES3-идиомы (`};` перед `else`, однострочный
`if (a) f() else g()`) встречаются везде и дефектами не являются.

### Общий include: `ForIndex.jsxinc` (~616 строк)

- **Инварианты/глобали:** группа абзацных стилей `#IndexStyles` (`indStyleGroup`), стили
  уровней `indStyle1..4` = `#Level1..#Level4`, стили оформления `#Level1=Index…`, группа
  символьных стилей `groupForIndexStyles = "Index styles"`, цвета `usedColor =
  "IndexStylesColor"`, RGB-образцы `nilColorSample=[255,0,255]` (SkipTheWord) /
  `usedColorSample=[255,0,0]`, маркер отсутствующего уровня `noLevel` (длинное тире),
  разделитель `sepSpace = "\h"`, граница слова `we = "\b"`, маска `searchMaskN =
  'IndexList*.indd'`.
- **`markLetters = ["a"…"i"]`** (стр. 63) — буквы-маркеры указателей; старый набор
  `d f h j m s t w z` закомментирован строкой выше. `colorsRGB` — 9 цветов, привязанных к
  буквам.
- **Ручной склонятель** — ядро include: `getWord()` (стр. 308) обрезает пунктуацию
  (`afterWord`), спец-случаи («у», «че» — как есть), слова короче 4 букв — без окончаний;
  `getGroup(chL,chM,chR)` (стр. 579) классифицирует три последние буквы через `testChar()`
  (s = согласная, g = гласная, m = мягкий знак, t = твёрдый) в трёхбуквенный код;
  `procFamily()` (стр. 475) — отдельная ветка для фамилий. Группы обычных слов:
  `ssg`/`ssg1`/`ssm`/`gsm`/`msg`/`sgg`/`gsg` + согласные-финальные `sms/mgs/gss/sgs/sss/
  ggs/tgs`; фамильные наборы `fssg1/2`, `fssm`, `fgsm`, `fmsg`, `fsmg`, `fsgg1..7`,
  `fgsg1..3`, `fsgs`, `Fsgs` (Павел/Орёл), `ksgs` (…ОК/…ЕЦ); несклоняемые окончания
  `noEnds`, трёхбуквенные фамилии `shortWordEnds`. Всего ≈500 строк ручной модели русского
  склонения — кандидат на замену pymorphy3 (Часть III).
- **Дефект — дубль ключа `fsss`:** переменная объявлена дважды (стр. 159 и 164) и дважды
  положена в `theGroups` (стр. 224 и 228); значения совпадают, так что сейчас безвредно,
  но при правке одного из двух мест — мина.
- **`ProgressBar`** (стр. 263) — конструктор палитры-прогрессбара (`reset/info/error/hit/
  hide/close`), используется этапными скриптами; `myFile()`, `myGetScriptPath()` —
  вспомогательные. `textPointer` — слово ссылки «см.» (✅ дефолт исправлен 10-07-2026:
  было английское `"see"`), `seeTopicArray` — варианты «см.» для AddSeeTopic.
- Подключается `#include "../ForIndex.jsxinc"` (или `../../` — по глубине папки) почти
  всеми этапными скриптами; исключения отмечены ниже.

### Стадия [0] — перенос тегированной разметки

**`FindTags.2024.jsx`** (~587 строк)
- Назначение: главный скрипт этапа — переносит разметку `#термин{Стиль\уровень}` из
  indd-файла разметки в вёрстку, оформляя каждый термин символьным стилем; несовпадения
  выгружает в отчёт `TagFileProblems.txt` (UTF-8, в папке вёрстки).
- Алгоритм: этап I — цикл по `findGrep` `#[^\}]+\}`: извлекает искомый текст (`\b…\b`),
  имя стиля и «полную строку поиска» по ±40 знаков контекста (обрезая по соседним тегам);
  этап II — во втором документе через служебный фрейм и `convertDataToSearch()` (стр. 476)
  экранирует спецсимволы, нормализует пробелы/дефисы/кавычки/переносы, находит фрагмент в
  потоке, внутри него термин, применяет стиль (с сохранением шрифта/кегля/интерлиньяжа);
  `nil` → заливка цветом `SkipTheWord`.
- UI: палитра «Работа с тегированным текстом» — два чекбокса-фиксатора файлов, кнопка
  «Перенести разметку тегами в вёрстку», «?»; прогресс «1/2 Извлечение…» → «2/2 Поиск…».
- Контракты: ровно 2 документа в одной папке; курсор в вёрстке, выделение в файле тегов;
  без overflow; в файле тегов обязателен цвет `TagsColor`. Создаёт группу/стили и цвета в
  вёрстке. Из include: `groupForIndexStyles`, `usedColor`, `nilColorSample`, `ProgressBar`.
  `#targetengine "FindTags"`.
- Дефекты/хрупкости: захардкожены `delta=40` (стр. 84), имена цветов (стр. 76–77),
  геометрия служебного фрейма (стр. 379–385); `allTextForSearch` без `var` (стр. 352) —
  неявная глобаль; закомментированные варианты grep (стр. 298, 523–573).

**`#ApplyCharacterStyle.2024.jsx`** (~409 строк)
- Назначение: ручной «доводчик» после FindTags — снятие вопросов по тегам из
  `TagFileProblems.txt`, по одной строке за раз.
- Алгоритм: событийная палитра. `>` — найти очередной тег в файле тегов, выделить абзац
  над ним, скопировать в буфер; выбор строки валидируется (ровно один `#`, порядок
  `{`/`}`); `И` — временный фрейм «FindClipboard», нормализация пробелов/скобок, поиск
  чёрного текста от курсора с циклическим перебором находок (счётчик `текущий/все`);
  `С` — применить символьный стиль (с восстановлением атрибутов), `nil` → `SkipTheWord`;
  обработанная строка тега красится голубым (C=100 M=0 Y=0 K=0).
- UI: палитра «Перенос разметки» — чекбоксы «Вёрстка»/«Теги»/«Курсор в строке тегов»,
  кнопки `И`, `С`, `>`, `?`, поля номера образца.
- Контракты: ровно 2 документа в одной папке; в вёрстке обязательна группа
  `groupForIndexStyles`; системный буфер обмена. `#targetengine "ApplyCharacterStyleZ"`.
- Дефекты/хрупкости: мёртвый цикл очистки только что созданного пустого `rz=[]` (стр. 56);
  магические смещения `sindx+selLength+3` (стр. 185), `prevParaIndex-2` (стр. 198);
  захардкожены проверяемые скобки/кавычки (стр. 302–303) и итоговый голубой цвет
  (стр. 398).

**`#GatherStyleNamesInIndexList(new).jsx`** (~143 строки)
- Назначение: переносит имена символьных стилей группы «Index styles» из вёрстки в 4-ю
  колонку таблицы `IndexList`, сопоставляя по терминам.
- Алгоритм: собирает имена стилей в ассоц-массив; по строкам таблицы берёт термин из
  cells[0], зачищает префикс `X-` (маркер) и суффикс `=N` (нумерация совпадений); для
  строк не верхнего уровня строит имя `верхний\термин`; найденное пишет в cells[3].
- UI: палитра «Извлечение символьных стилей» — два чекбокса-фиксатора, кнопка «Собрать в
  IndexList названия символьных стилей».
- Контракты: 2 документа в одной папке; имя файла таблицы начинается с `IndexList`;
  таблица ровно 5 колонок. Из include: `groupForIndexStyles`, `indStyleGroup`, `indStyle1`.
- Дефекты/хрупкости: разбор термина через `split("-")[1]`/`split("=")[0]` (стр. 119–121)
  ломается на терминах с дефисом/`=` внутри; повторный прогон переписывает колонку без
  пропуска (проверка «стиль уже есть» закомментирована, стр. 117).

Черновики `tmp/` стадии [0] (в конвейер не входят): `#FindClipboardInStory.jsx` —
автономная кнопка-искалка по буферу (прародитель `И`); `#FindNextTag.jsx` — переход к
следующему тегу (вошёл в `>`); `#GetAll-nil.jsx` — сбор строк `{nil}` (битый путь
include); `FindTagsLight.jsx` — ручной вариант FindTags; `GetPredefinedCharStyles.jsx` —
устаревший (заменён связкой FindTags + GatherStyleNames); два `.back` — бэкапы.

### Стадия [1] — построение таблиц IndexList

**`AddMarker.jsx`** (~125 строк)
- Назначение: присваивает файлу `IndexList-nnn.indd` буквенный маркер указателя — префикс
  `буква-` к каждому термину левой колонки + переименование файла в `IndexList[X]nnn`.
- Алгоритм: проверки (документ сохранён, имя вида `IndexList-nnn`, курсор в левой
  колонке) → один проход по строкам колонки → `doc.close(SaveOptions.YES)` +
  `File.rename`.
- UI: палитра «Маркеры для разных указателей» — 9 радиокнопок (буквы из `markLetters`),
  кнопки «Маркер выбран», «?».
- Контракты: из include — `markLetters`, `ProgressBar`.
- Дефекты: ✅ **исправлено 10-07-2026** — help-текст называл старые буквы
  `d f h j m s t w z` и советовал мёртвый grep `^[dfhjmstwz]-`; теперь `a…i` и `^[a-i]-`.

**`Clear 'cm' cells [all at once].jsx`** (~56 строк) / **`Clear 'cm' cells[one to one].jsx`** (~80 строк)
- Назначение: очистка ячеек 2–5 у строк с отсылкой « см.» — вся таблица за один запуск /
  по одной строке (с навигацией `select()` и показом страницы).
- Контракты: таблица 5 колонок; шаблон строго ` см\.` (пробел + строчные + точка) —
  «См.» или без пробела не ловится. `[one to one]` — единственный скрипт стадии **без**
  include (самодостаточен).
- Дефекты/хрупкости: правка ячеек без Undo-обёртки; жёсткий 5-колоночный контракт.

**`GetInfoForSearch.2024.jsx`** (~692 строки; копия `GetInfoForSearch.jsx` живёт в
стадии [3] — разбор там же)
- Назначение: интерактивная доводка grep-запросов таблицы — падежные формы, регистр,
  ударения, фамилии, инициалы, перенос слов, добавление строк-вариантов.
- UI: палитра «Уточнение grep-запросов» — радиокнопки «Именительный падеж»/«Все падежные
  формы», чекбоксы `useAccent`/регистра (`(?i)`/`(?-i)`)/`complexReg`/`usePunct`/`fwOnly`,
  кнопка-переключатель «Слово — обычный текст» ↔ «Слово — это фамилия», кнопки «Изменить
  в grep-запросе вариант учёта падежа», «Добавить строку для нового варианта термина»,
  группы переноса слова и «Фамилия Инициалы»/«Инициалы Фамилия».
- Контракты: активный файл `IndexList*`; запросы в колонке index 2, исходный текст — в
  index 4; из include: `getWord`, `sepSpace`, `simpleSearch`, `useFamily`, `ProgressBar`.
  Позиции окон — `sets/SearchMainWindow.ini`, `sets/InfoForSearch.ini`.
- Дефекты/хрупкости: ветка `textForSearch`/`haveMarker` закомментирована (маркер из
  термина при генерации запроса больше не убирается этим путём); «магическое» `rw.length
  == 5` (стр. 522); `#targetengine` держит состояние между запусками.

**`MergeTwoIndexListTables.jsx`** (~140 строк)
- Назначение: дописывает таблицу второго открытого `IndexList` в конец активного
  `IndexList[@]…` — сборка сводного указателя.
- Алгоритм: 1/3 поиск 5-колоночных таблиц в обоих документах → 2/3 добавление пустых
  строк → 3/3 копирование содержимого с конца с восстановлением иерархии абзацных стилей.
- Контракты: ровно 2 документа в одной папке; имя активного начинается с `IndexList[@]`;
  второй символ первой ячейки — дефис (признак маркированной таблицы); из include:
  `indStyle1`, `indStyleGroup`, `ProgressBar`.
- Дефекты/хрупкости: проверка «таблица указателя» по дефису выполняется поздно (стр. 87)
  — немаркированная таблица сначала попадает в списки; копирование по `contents`
  полагается на идентичную структуру колонок.

**`UseReadyTable.v.7.jsx`** (~639 строк; «ЭТОТ СКРИПТ ДЛЯ РАМАЯНЫ!»)
- Назначение: превращает вставленный из `.xlsx` двухколонник «термин — что искать» в
  полноценную таблицу `IndexList` с уровнями, grep-запросами, нумерацией и служебными
  колонками.
- Алгоритм: шесть проходов — 1/6 стили уровней по числу `\t`/`\\` (`#Level1..4`); 2/6
  приведение текста (шпации, переводы строк, слипшиеся инициалы, дубль первой ячейки);
  3/6 синонимы через «;» → один grep-запрос (формы отсортированы по убыванию длины,
  `\b`-обрамление, префикс регистра `(?i)`/`(?-i)`), служебные колонки; 5/6 одинаковые
  термины → суффиксы `=1/=2/…`; 6/6 восстановление пропущенных уровней строками с
  `noLevel`; финальная доводка регистра и одиночных падежных форм.
- Контракты: документ сохранён, без overflow; таблица ровно 2 колонки; в `indStyleGroup`
  обязательны `indStyle1..4` и `#PageShow`; из include: стили, `noLevel`, `sepSpace`,
  `getWord`, `ProgressBar`.
- Дефекты: ✅ **исправлено 10-07-2026** — жёсткое имя `IndexList-000.indd` (26.11.2024)
  заменено возвращённым блоком автонумерации (плюс числовой sort-компаратор вместо
  булева). Остаётся **намеренно отключённой** фаза «4/6 подготовка grep-запросов»
  (стр. ~411–455: пословная генерация через `getWord`) — запросы для Рамаяны формирует
  синонимная обработка 3/6; прогресс-бары шагов 1–3 не закрываются между фазами.

### Стадия [2] — проверка таблиц

По `info.txt` автора, для «Рамаяны» стадия почти не нужна: совпадающих grep-запросов в её
словнике нет — все пять скриптов на этом проекте страховочные.

**`ApplySpecialStyles.jsx`** (~356 строк)
- Назначение: для терминов с уникальным словом в 5-й колонке находит слово по grep из
  3-й колонки и оформляет символьным стилем из 4-й; обработанные строки зачёркивает
  (их пропустит MarkSameQueries).
- UI: палитра «Оформление слов символьными стилями» — чекбоксы-фиксаторы, радиокнопки
  цвета «красный»/«чёрный» и области «М»/«Ф», кнопка «Оформить слова символьными
  стилями».
- Контракты: ровно 2 документа; таблица 5 колонок, имя с «IndexList». Создаёт цвет
  `IndexStylesColor` и группу/стили; зачёркивает cells[3]/cells[4], сохраняет таблицу.
- Дефекты/хрупкости: восстановление атрибутов теряет `fontStyle` (считывается, не
  применяется); при пустом списке уникальных окно закрывается, но выполнение продолжается
  (стр. 177).

**`ColorSimilarLines.jsx`** (~102 строки)
- Назначение: в 3-колоночной таблице красит зелёным (`SimilarItemsColor`) соседние строки
  с одинаковыми/похожими терминами — визуальный контроль дубликатов.
- Дефекты/хрупкости: «похожесть» через `String.match` трактует термин как регэксп
  (стр. 63, 74) — спецсимволы дают ложные совпадения; счётчик серий хрупок (off-by-one).

**`MarkSameQueries.jsx`** (~666 строк)
- Назначение: обратная сторона ApplySpecialStyles — ручной проход по вхождениям
  совпадающих запросов с назначением каждому своего стиля; делает служебную копию
  IndexList (только строки со стилем, сгруппированные по запросу).
- Алгоритм: копия через `save(File(...nameSample))` → удаление строк без стиля →
  «Группировка 1/3…3/3» (упаковка стиля в текст через `{@}`/`!@#$%` → `convertToText` →
  `sort()` → `convertToTable`) → окно навигации по `findGrep`-результатам.
- UI: палитра «Работа с одинаковыми запросами» + вложенное окно (dropdown стилей,
  «красный»/«чёрный», «М»/«Ф», «Найти», `<`/`>`, «Отметить»).
- Дефекты/хрупкости: `usedColor` используется, но локальное объявление закомментировано
  (стр. 21) — живёт только благодаря include; `activeDocument.id` без `app.` (стр. 76);
  сортировка через упаковку ID стиля в текст ячейки — очень хрупко; `testSelection`
  может пропустить последнюю пару (стр. 117).

**`ShowFoundByGrep.v.3.jsx`** (~559 строк)
- Назначение: диагностика — показывает, что реально находит выбранный grep-запрос
  (с числом вхождений), и собирает результаты всех запросов в
  `<вёрстка>@foundByGrep.txt`. Ничего не меняет.
- Контракты: ровно 2 документа; при показе курсор обязан быть в 3-й ячейке; из include:
  `ProgressBar`, `myGetScriptPath`; позиция мини-окна — `sets/FoundByGrep.ini`.
- Дефекты/хрупкости: сравнение `parentColumn.name != 2` хрупко по типу; бессмысленное
  экранирование `"\(?i\)"` (работает случайно, стр. 251/449); массовое дублирование кода.

**`TermCompare[+letter].v.2.jsx`** (~137 строк)
- Назначение: находит строки с совпадающими grep-запросами, проставляет им предлагаемые
  имена символьных стилей в 4-ю колонку (+ буква указателя из имени файла как префикс),
  отчёт в `<имя>@TermCompare.txt`.
- Дефекты/хрупкости: `strCompare`/`startIndx`/`rii` без `var` — глобали; «магическое»
  ограничение 39 шагов вверх до родительского термина (стр. 81); не вызывает `save()` —
  правки таблицы остаются несохранёнными; разделители `!@#$%` конфликтуют с текстом, где
  могли бы встретиться.

### Стадия [3] — индексирование

**`ProcStoryOrDoс[09.10.2023].jsx`** (983 строки; «с» в «Doс» — кириллическая)
- Назначение: центральный скрипт — по строкам `IndexList` расставляет index-маркеры и
  наполняет стандартный указатель InDesign (topics + pageReferences); умеет и удалять
  записи.
- Алгоритм: загрузка таблицы → `getDataAction()` (стр. 271–443) строит массив заданий
  `dataLines` (термин/страница/grep/стиль/цвет), поднимаясь от выделения вверх до строки
  `#Level1`; создание служебных цветов из `colorsRGB`; исполнение — сортировка заданий по
  убыванию длины образца, строки без символьного стиля — вниз (защита «двух Джанак»,
  стр. 599–621), по уровням `split("||")` создаются topics, `findGrep` ищет вхождения,
  страница вычисляется с учётом `appliedSection`/`pageOffset`, добавляются
  pageReferences; обработанный текст красится служебным цветом.
- UI: палитра «Подготовка указателя» (кнопки «Загрузить таблицу», «Подготовить задание…»,
  «Обработать выбранный текст…», чекбоксы очистки/сносок/заблокированных/скрытых слоёв,
  радиокнопки «Материал/Файл», добавить/удалить).
- Контракты: ровно 2 документа; таблица 5 колонок; стили `#Level1…4` + группа символьных;
  лог `<вёрстка>=log.txt` пишется только при неудачах (формат: блоки с датой, строки с
  табуляцией `<термин> [страница/???]`). Из include: `colorsRGB`, `indStyle1`,
  `groupForIndexStyles`, `searchMaskN`, `ProgressBar`.
- Дефекты/хрупкости (не чинились в H377 — отдельная работа): `save()` на каждой итерации
  двойного цикла (стр. 790) — главный тормоз ≈1,5-часового прогона; `startRow ==
  _table.rows-1` — число против коллекции, ветка мёртвая (стр. 433); версия в шапке
  «22.01.2023» ≠ дате в имени файла; при заданном символьном стиле `findWhat`
  перезаписывается на `.+` (документированная фича, стр. 715, — источник переизбытка
  совпадений); `try/catch … continue` глотают сбои определения страницы (лог `[ ??? ]`).

**`GetInfoForSearch.jsx`** (~666 строк — вариант `GetInfoForSearch.2024.jsx`, запускается
и из стадии [1], и чекбоксом из ProcStoryOrDoс)
- См. разбор в стадии [1]; здесь дополнительно: `procTextInCell()` (стр. 464–582) копирует
  текст из 5-й ячейки в 3-ю, отбрасывает суффикс `_<цифра>`, обрабатывает оба дефиса
  (обычный/неразрывный → класс `[-‑]`), экранирует точки, по флажку вставляет опциональный
  акцент `́`; отдельные обработчики регистра/переноса/инициалов/разбиения строки.
  Тяжёлые операции — под `doScript(FAST_ENTIRE_SCRIPT)`.

**`DeleteUnnecessarySign [Black].jsx`** (~76 строк)
- Назначение: удалить index-маркеры `~I` в выделении и перекрасить выделение в чёрный —
  откат ошибочной индексации.
- UI: мини-палитра `>B<` с одной кнопкой `•`.
- Дефекты/хрупкости: сравнение цвета по `.name != "Black"` хрупко при переименованных
  swatch; `win.close()` без `return` при отсутствии документов.

**`DeleteUnnecessarySign [SkipTheWord].jsx`** (~101 строка)
- Назначение: то же, но слова между маркерами красятся в `SkipTheWord` (запрет будущей
  индексации).
- Алгоритм: для каждого найденного `~I` идёт вперёд по символам, крася их, до первого
  чёрного; затем `changeGrep` удаляет маркеры.
- Дефекты: ✅ **исправлено 10-07-2026** — цикл `do…while` не проверял конец материала
  (выход за границу story, если чёрный не встретился); добавлен ограничитель. Остаётся:
  сравнение цвета по ссылке на объект (в [Black]-варианте — по имени).
- UI: мини-палитра `>S<` с одной кнопкой `•`.

**`Tell_Index_Item.jsx`** (~170 строк)
- Назначение: по маркеру `~I` в выделении показать полную иерархию темы указателя
  (уровни через « • ») — компактная замена штатному инструменту.
- Контракты: ровно один маркер в выделении; непустой `indexes[0]`. **Автономен** — без
  include, собственный `ProgressBar`. `#targetengine "Tell_Index_Item"`.
- Дефекты/хрупкости: глубина жёстко 4 вложенных цикла (не рекурсия); уровни 3–4 автором
  «не проверялись — не на чем» (его собственный комментарий, стр. 139–142); линейный
  перебор topics × pageReferences медленный на больших указателях.

Черновики `tmp/` стадии [3]: `AddHairSpace_File/Story.jsx` — вставка волосяной шпации
после «дефис + мягкий перенос» (обход: разделитель мешал второму слову попасть в индекс);
`RemoveHairSpace_File/Story.jsx` — обратная замена; бэкап `DeleteUnnecessarySign.jsx,back`.

### Стадия [4] — оформление указателя

**`ProcNumberLines[3-4,6-8].jsx`** (~949 строк) / **`ProcNumberLines[3,4,6-8].jsx`** (~894)
- Назначение: приведение номеров страниц — схлопывание повторов и последовательностей в
  диапазоны, поправка номеров, символьный стиль терминам, особые диапазоны страниц
  (примечания — полужирным), исключение служебных страниц.
- Алгоритм: `procNums` под `FAST_ENTIRE_SCRIPT`: служебная точка `•` между термином и
  номерами → проход 1/4 от конца к началу: строка номеров ищется grep-ом
  `(?<=\h)\h*\b\d+[-–—\d,\h]*$`, дробится по запятой, фильтруется от исключённых страниц,
  пересобирается `makeNumberLine()` (раскрытие диапазонов → поправка → сортировка →
  схлопывание); 2/4 стиль терминам без номеров; 3/4–4/4 обработка помеченных тегами
  `{•[…]•}` номеров и снятие тегов.
- UI: палитра «Оформление номеров страниц в указателе» — поле поправки, выпадающий
  разделитель («Дефис»/«Минус»/«Тире»), выпадающий символьного стиля терминов, чекбокс
  «Особый диапазон страниц» + 4 панели (каждая: «использовать», «не учитывать страницы» /
  «оформить стилем», два поля номеров, выпадающий стиля). ini
  `sets/#ProcNumberLine.ini` (20 строк).
- **Различие вариантов** (имена кодируют семантику): `[3,4,6-8]` собирает диапазон только
  из трёх и более подряд идущих страниц (пара остаётся «3, 4»); `[3-4,6-8]` добавляет
  финальный проход, схлопывающий и пары («3–4») — более новый/полный вариант.
- Дефекты: ✅ **исправлены 10-07-2026** — copy-paste `pop()` не того массива (стр. 86,
  оба варианта) и мёртвая проверка перекрытия панелей 3–4 (`nQ == 2` вместо `nQ == 0`,
  стр. ~880). Остаётся: `theTerm` в grep не экранируется; `pageLimit=2000` правится
  только в коде.

**`AddSeeTopic.v.3.v.3.jsx`** (~859 строк)
- Назначение: для терминов 2–4 уровней формирует отсылки «Термин см. Термин-верхнего-
  уровня» и поднимает их на верхний уровень указателя по алфавиту.
- Алгоритм: проход 1/4 — определение уровня по абзацному+символьному стилю, сборка строк
  `термин # см. # верхний` в `rezData`; 2/4 — первые слова терминов верхнего уровня;
  3/4 — добавление отсылок; сортировка; 4/4 — вставка от конца к началу по сохранённым
  `placeIndex`, применение стилей ссылки/термина, снятие разделителей; строки без
  подходящей первой буквы уходят в хвост под маркер `infoString`.
- UI: палитра «Оформление ссылок в указателе» — выпадающие абзацного стиля + уровня 1–4,
  символьного стиля терминов, варианта «см.» (`usedSee` из `seeTopicArray`), стилей
  ссылки/термина; радиокнопки объёма оформления; «Выполнить и закрыть». ini
  `sets/#AddSeeTopic.ini` (17 строк).
- Дефекты: ✅ **исправлены 10-07-2026** — 14 боевых `$.writeln` убраны за флаг `debugLog`
  (по умолчанию false); английский дефолт `"see"` без ini закрыт фиксом дефолта в
  `ForIndex.jsxinc`. Остаётся: вставка по сохранённым символьным индексам хрупка (обход
  снизу вверх — единственная защита); sort-компаратор возвращает boolean; термины на
  редкую букву молча уходят в хвост.

**`AddLetter.v.2.jsx`** (~314 строк)
- Назначение: алфавитные рубрики — отдельный абзац с прописной буквой перед каждым
  блоком на новую букву либо оформление первой буквы блока символьным стилем.
- UI: палитра «Делаем алфавитный указатель» — радиокнопки способа, выпадающие стилей,
  чекбокс пустой строки-отбивки; ini `sets/#AddLetter.ini`.
- Контракты: выделение без overflow; первый абзац — `indStyle1`; символьный стиль буквы
  должен иметь регистр «Все прописные».
- Дефекты: ✅ **исправлено 10-07-2026** — copy-paste `pop()` не того массива (стр. 57).
  Остаётся: `procNumsRez` — наследие ProcNumberLines без объявления (стр. 197); сравнение
  букв без нормализации ё/е и латиницы/кириллицы.

**`AddAnnotationData.v.2.jsx` / `.v.3.jsx`** (~413/414 строк)
- Назначение: вставка аннотаций в готовый указатель из двухколоночной таблицы
  «термин | аннотация»; знаки-обрамители, `noBreak`, символьный стиль — по установкам.
- UI: палитра «Добавление аннотационных сведений в указатель» — фиксаторы, радиокнопки
  оформления, выбор знаков («—…—», «•…•», «/…/», «[…]», свой вариант), чекбоксы
  неразрывного пробела и «не оставлять крайние знаки на другой строке». ini
  `sets/#AddAnnotationData.ini` (11 строк).
- **Различие v2↔v3:** единственное — в v3 GREP-поиск термина в режиме по умолчанию
  обёрнут в `\b…\b` (10.10.2023); в стилевом режиме (`newView`) уточнение НЕ применено.
- Дефекты/хрупкости: `termIndexValue = termIndexValue++` — самоприсваивание постинкремента
  (стр. 271, безвредно — объект дальше не используется); термин не экранируется для GREP;
  пустые аннотации пропускаются молча.

**`UpdateNameList.jsx`** (~220 строк)
- Назначение: замена «фамилия + инициалы» на «фамилия + полное имя» по таблице
  соответствий; ненайденные строки → `@notFound.txt`.
- Дефекты/хрупкости: `String.replace("\\.", …, "g")` со строковым первым аргументом
  заменяет только первое вхождение — «g» игнорируется (стр. 198–202); проверка совпадения
  только по первому слову — двойные фамилии/однофамильцы дадут ложные замены; возможен
  лишний пробел после замены.

**`DashInsteadWord.jsx`** (~133 строки)
- Назначение: полиграфические прочерки вместо повторяющихся начальных слов соседних строк
  («Особое решение уравнения Клеро» → «— — уравнения Клеро»).
- Дефекты/хрупкости: пословное сравнение не понимает составные слова (признание автора в
  шапке); `recompose()` после каждой замены — медленно на больших указателях; ветка
  `useNote` (примечание с исходной строкой) хрупка для последнего абзаца.

**`HideShowNumber.v.2.jsx`** (~237 строк)
- Назначение: скрыть/показать служебный номер после термина (`слово_1`, `слово-2`,
  `слово=3`): скрытие — кегль 0,1 пт / масштаб 1 % / цвет None; показ — обратная операция
  по атрибутам знака слева.
- Контракты: **без** include — собственный `ProgressBar`; ini не читает.
- Дефекты/хрупкости: детекция «показать» по тройке 0,1 пт/1 %/None зацепит любой
  легитимно крошечный текст; восстановление по знаку слева неверно, если слева тоже
  служебный знак; для номера в начале материала `num.index-1` = −1 даёт последний знак.

**Support Tools.** `RemoveNeedlessTextFrame.new.jsx` (~209 строк) — удаление пустых
фреймов-дубликатов за рабочими (по совпадению габаритов с допуском 1); дефект: в ветке
мастер-фреймов условие совпадения собрано без скобок (`&&`/`||`, стр. 170) — фрейм может
удалиться при совпадении одной координаты (в ветке обычных фреймов, стр. 193, уже
исправлено на полное `&&`). `SplitStory[move].jsx` (~51 строка) — разрыв материала на
стыке двух фреймов (`nextTextFrame = null` + перенос хвоста); дефекты: проверка
`mySel == null && mySel.constructor…` — при null бросит исключение (нужно `||`);
`smartTextReflow` намеренно остаётся выключенным — включить вручную после работы.

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

## Замеченные дефекты

Guardrail H355/H363 («код не трогать») **снят решением М.Г. 08-07-2026**; фиксы кода
запланированы в [H377](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H377-Fable_RussianRamayana_litpam_manual_overhaul_copilot_08.07.26.md)
(каждый — отдельным коммитом, с прогоном [регрессионного дрилла](#регрессионный-дрилл-golden-fish)
где применимо). Наблюдения из выверки по видео:

- **`UseReadyTable.v.7.jsx` — «одна форма».** По словам автора (видео 15/18), дефект
  устранён. Закрыто на уровне процесса: заведён
  [регрессионный дрилл](#регрессионный-дрилл-golden-fish) (слова «ними», «кха-тха») +
  эталон-снимок, прогонять после каждого обновления скрипта.
- **Оператор-зависимость колонки `C`.** Свободный комментарий в колонке `C` листа словаря
  способен «завесить» обработку (видео 12). Частично закрыто:
  [`validate_dictionary.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/validate_dictionary.py)
  (класс `prose_in_forms`) ловит это в отчёте **до** прогона. Остаётся кандидат на
  **авто-санитайзер** поверх валидатора (сейчас — только отчёт, правка вручную; автоправка
  `.xlsx` — отдельный `@DECIDE`).
- **Ручной цикл доразметки** (`#ApplyCharacterStyle.2024.jsx`) не логирует, какие теги
  остались неотмеченными после прохода оператора, — кандидат на **аудит-лог** (список
  необработанных тегов в файл, а не только на экран).
- **`teg_exp.exe` не в обязательном чек-листе.** Сверка тег ↔ словарь
  ([`_Ram_Tag_explorer/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/_Ram_Tag_explorer))
  запускается по желанию. Кандидат — сделать её (вместе с `validate_dictionary.py`)
  обязательным pre-flight-шагом стадии `[1]` в Roadmap, чтобы расхождения ловились до
  дорогого прогона, а не в `log.txt`.
- **Валидатор — только отчёт, эвристики не исчерпывающи.** `duplicate_forms` ловит
  преимущественно дубли по регистру (одна и та же форма прописью и строчной — избыточно при
  префиксах `-i/-I`); `prose_in_forms` — эвристика по ключевым словам и длине сегмента,
  возможны пропуски. Отчёт — подсказка оператору, не замена ручной вычитки.

### Находки построчного аудита кода (08-07-2026, Fable 5 `claude-fable-5`)

Все ~25 `.jsx` прочитаны целиком; ниже — дефекты, которых нет в видео и в прежней версии
этого раздела. 🔴 — влияет на данные/оператора уже сейчас; 🟠 — латентный баг или
производительность; 🟡 — гигиена кода. **Фиксы H377 выполнены 10-07-2026** (Fable 5
`claude-fable-5`, по коммиту на дефект) — исправленные пункты помечены ✅; развёрнутый
контекст каждого — в [пофайловом разборе](#пофайловый-разбор-скриптов) выше.

- ✅ 🔴 **`UseReadyTable.v.7.jsx` — перезапись выходного файла.** Автоинкремент имени
  (`IndexList-001`, `-002`…) был закомментирован 26.11.2024, вместо него жёсткое имя
  `IndexList-000.indd` — каждый прогон затирал предыдущую таблицу. **Исправлено
  10-07-2026:** блок автонумерации возвращён (+ числовой sort-компаратор вместо булева).
- ✅ 🔴 **`AddMarker.jsx` — устаревший help-текст.** Диалог `?` называл маркеры
  `d f h j m s t w z` и советовал grep очистки `^[dfhjmstwz]-`, тогда как реальные
  `markLetters` — `a…i`. **Исправлено 10-07-2026:** справка называет `a…i` и `^[a-i]-`.
- 🟠 **Отключённые пути кода.** Фаза «4/6 grep prep» в `UseReadyTable.v.7.jsx` (пословная
  генерация grep через морфодвижок `getWord`) полностью закомментирована — движок
  реально работает только интерактивно из `GetInfoForSearch`; там же закомментировано
  снятие буквы-маркера (`haveMarker` вычисляется, но не используется).
- 🟠 **`ProcStoryOrDoс[09.10.2023].jsx`:** `save()` документа внутри цикла по терминам —
  главный тормоз ≈1,5-часового прогона; сравнение `startRow == _table.rows-1` — число
  против коллекции (ветка мёртвая); версия в шапке кода «22.01.2023» не совпадает с датой
  в имени файла.
- ✅ 🟠 **Copy-paste баг очистки массивов** в `ProcNumberLines` (оба варианта) и
  `AddLetter.v.2.jsx`: `while (Xid.length > 0) X.pop()` — проверялась длина одного
  массива, а опустошался другой. Там же в `ProcNumberLines` (~стр. 880) проверка
  перекрытия «особых диапазонов» панелей 3–4 использовала `nQ == 2` вместо `nQ == 0` —
  валидация этой пары не выполнялась. **Оба исправлены 10-07-2026.**
- ✅ 🟠 **`AddSeeTopic.v.3.v.3.jsx`:** 14 отладочных `$.writeln` в боевом коде — убраны
  за флаг `debugLog` (по умолчанию false); английский дефолт `"see"` без ini — закрыт
  фиксом дефолта `textPointer = "см."` в `ForIndex.jsxinc`. **Исправлено 10-07-2026.**
  Остаётся: вставка строк по заранее сохранённым символьным индексам хрупка (обход снизу
  вверх — единственная защита).
- ✅ 🟡 **`DeleteUnnecessarySign [SkipTheWord].jsx`:** покраска слова после маркера шла
  `do…while` до первого чёрного символа без проверки конца story. **Исправлено
  10-07-2026** (ограничитель по последнему индексу). Остаётся: цвета сравниваются по
  ссылке на объект.
- 🟡 **`HideShowNumber.v.2.jsx`:** режим «показать» ищет скрытые номера по точной тройке
  форматирования (0.1 pt / 1% / None) — зацепит любой легитимно мелкий текст с теми же
  атрибутами.
- 🟡 **`ForIndex.jsxinc`:** ключ `fsss` определён дважды (вторая инициализация молча
  побеждает); три скрипта (`Tell_Index_Item`, `HideShowNumber`, и др.) несут собственную
  копию `ProgressBar` вместо общей из include; в `Tell_Index_Item` уровни 3–4 автором
  «не проверялись — не на чем» (его собственный комментарий).
- **Замечание для модернизации:** ядро `ForIndex.jsxinc` (getWord/procFamily/getGroup,
  группы окончаний `ssg`/`gsm`/… + ~25 фамильных вариантов) — ручная модель русского
  склонения ≈500 строк; прямой кандидат на замену словарной морфологией
  (pymorphy3/mystem) на стороне словника — см. H377, этап «Часть III».

---

# Часть III. Модернизация

План замены самых хрупких ручных узлов конвейера современными инструментами — что
уже построено (10-07-2026, H377), что остаётся в InDesign и какие риски. Правило
всех инструментов этой части: **исходники (`.xlsx`, вёрстка, лог) не изменяются** —
инструменты пишут отчёты, правки переносит оператор.

## Замена ручного склонятеля: pymorphy3

Ядро `ForIndex.jsxinc` — ручная модель русского склонения ≈500 строк ES3
(`getWord`/`procFamily`/`getGroup`, группы окончаний `ssg`/`gsm`/…, ~25 фамильных
вариантов). Она же — источник дефекта «одной формы» (видео 15/18). Причём в текущем
`UseReadyTable.v.7.jsx` пословная генерация («фаза 4/6») вообще отключена: реальный
источник падежных форм — колонка «Что искать» словника, которую ведёт человек.
Значит, правильная точка модернизации — **не InDesign, а словник**: генерировать и
проверять формы до стадии `[1]`.

Построено: [`tools/gen_case_forms.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/gen_case_forms.py) —
pymorphy3-генератор (OpenCorpora, офлайн, детерминированный): для каждого термина
листа предлагает полный набор падежных форм (падежи × числа) и показывает, каких форм
в колонке «Что искать» не хватает; отчёт `case-forms-report.md` + опциональный TSV.
Разовый режим: `python tools/gen_case_forms.py "Хануман"`.

**Ограничение (измерено на живых примерах):** словарная морфология уверенно склоняет
русифицированные имена без омонимов («Хануман» — весь набор верен), но на
санскритских именах, совпадающих с русскими нарицательными, побеждает нарицательное
(«Сита» → парадигма «сито», «риши» → «риш»). Поэтому генератор — черновик-подсказчик,
а спорные строки добирает LLM-лента ниже; финальная сверка — за оператором.

## DeepSeek-копилот оператора (`tools/copilot/`)

Три инструмента поверх дешёвой нерассуждающей модели `deepseek-chat` (ключ — в
`.env` корня репозитория, gitignored; решение MG 08-07-2026). Общий клиент
[`deepseek_common.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/copilot/deepseek_common.py)
печатает running-стоимость после каждого вызова и **жёстко останавливает прогон на
95 % бюджета** ($20 по умолчанию, `--budget` меняет). Все три проверены живыми
вызовами 10-07-2026 (суммарно ≈$0.006).

| Инструмент | Роль | Запуск |
|---|---|---|
| [`enrich_dictionary.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/copilot/enrich_dictionary.py) | проверка/дополнение падежных форм словника (LLM-лента поверх `validate_dictionary.py` и `gen_case_forms.py` — понимает санскритские имена) | `python enrich_dictionary.py <xlsx> [--sheet …] [--limit N] [--budget $]` → `dictionary-enrichment-report.md` |
| [`triage_log.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/copilot/triage_log.py) | классификация `<вёрстка>=log.txt` после стадии `[3]`: `markup_error` / `missing_form` / `frequent_name` + рекомендация по каждой строке | `python triage_log.py "<…=log.txt>" [--batch N]` → `<лог>-triage.md` |
| [`copilot_qa.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/copilot/copilot_qa.py) | интерактивные вопросы-ответы по конвейеру (контекст = этот MANUAL; `@имя-скрипта вопрос` подгружает исходник) | `python copilot_qa.py` (диалог) или `--ask "вопрос"` |

## Что остаётся в InDesign (и почему)

- **Расстановка index-маркеров и сборка указателя** (`ProcStoryOrDoс`, «Построить
  указатель») — неотделимы от вёрстки: страницы, секции, topics/pageReferences
  существуют только внутри InDesign.
- **Оформление стадии `[4]`** (номера, «См.», прочерки, рубрики) — работа со стилями
  и потоками текста в макете.
- **Интерактивная доводка** (`GetInfoForSearch`, `#ApplyCharacterStyle`) — требует
  глаз оператора на реальном развороте.

Кандидаты на следующие шаги (не начаты, по убыванию отдачи): вынести `save()` из
внутреннего цикла `ProcStoryOrDoс` (главный тормоз ≈1,5-часового прогона);
авто-санитайзер словника поверх `validate_dictionary.py` (сейчас только отчёт —
отдельный `@DECIDE`); аудит-лог доразметки в `#ApplyCharacterStyle` (какие теги
остались необработанными — в файл, а не только на экран).

## Риски модернизации

- **Регресс тихих дефектов.** Любое изменение генерации форм/запросов проявляется
  только в `log.txt` после ≈1,5-часового прогона — потому каждый шаг обязан проходить
  [регрессионный дрилл](#регрессионный-дрилл-golden-fish) (секунды вместо часов).
- **Санскритская ономастика.** Ни OpenCorpora, ни LLM не дают 100 % на редких именах;
  двухленточная схема (pymorphy3 → DeepSeek → оператор) снижает, но не убирает риск.
- **Стоимость LLM.** Полный словник ×2 тома — единицы долларов на `deepseek-chat`
  (замерено: 2 термина ≈ $0.0004), бюджетный стоп в клиенте страхует от сюрпризов.
- **Кодовый контракт.** Имена стилей/цветов/файлов из `ForIndex.jsxinc` менять нельзя
  (см. [инварианты](#инварианты-имён-из-forindexjsxinc)) — модернизация идёт «снаружи»
  (словник, отчёты, копилот), не трогая контракт.

## Что делает наука (ACL Anthology ↔ стадии конвейера)

Компактная привязка опубликованных работ к нашим стадиям — что уже решали до нас и
что можно перенять. Все ссылки — реальные страницы ACL Anthology.

| Работа | Наша стадия | Что перенять |
|---|---|---|
| Csomai & Mihalcea, [Linguistically Motivated Features for Enhanced Back-of-the-Book Indexing (ACL 2008)](https://aclanthology.org/P08-1106/) | весь конвейер (словник → `[3]`) | Автоматическое построение книжного указателя как supervised-задача: кандидаты из текста + лингвистические признаки (синтаксис, дискурс). Их вывод — комбинация частотных и лингвистических признаков бьёт tf-idf; наш аналог кандидатов — теги `#термин{…}`, к которым применима та же фильтрация. |
| Hasan & Ng, [Automatic Keyphrase Extraction: A Survey of the State of the Art (ACL 2014)](https://aclanthology.org/P14-1119/) | словник (пополнение) | Систематика методов отбора терминов-кандидатов; полезна, если словник Тома II будет пополняться полуавтоматически, а не только вручную. |
| Kim et al., [SemEval-2010 Task 5: Automatic Keyphrase Extraction from Scientific Articles](https://aclanthology.org/S10-1004/) | словник (оценка) | Готовый протокол оценки «автоматические термины vs назначенные человеком» — образец для замера, какую долю нашего ручного словника покрыл бы автоматический отбор. |
| Nastase & Strapparava, [Harvesting Indices to Grow a Controlled Vocabulary (2012)](https://aclanthology.org/W12-1005/) | словник (структура) | Существующие книжные указатели как источник контролируемого словаря: иерархия рубрик из готовых указателей — прямой аналог нашего 4-уровневого словника; идея пригодна для переиспользования словника Тома I во втором томе. |
| Loukachevitch et al., [NEREL: A Russian Dataset with Nested Named Entities, Relations and Events (RANLP 2021)](https://aclanthology.org/2021.ranlp-1.100/) | `[0]` (разметка имён) | Русская NER с **вложенными** сущностями — наш случай («Рама\сын Дашаратхи»: сущность внутри рубрики); обученная на NEREL модель — кандидат для автопредразметки имён/топонимов вместо ручного тегирования. |
| [Rubic2: Ensemble Model for Russian Lemmatization (BSNLP 2025)](https://aclanthology.org/2025.bsnlp-1.18/) | словник (формы) | Современная оценка русских лемматизаторов (mystem/pymorphy и нейросетевые) — ориентир при выборе замены ручного склонятеля; подтверждает, что словарные инструменты сильны на общем языке и слабеют на нестандартной лексике (наш санскритский случай). |

Вывод одним абзацем: наш конвейер — это «back-of-the-book indexing» в терминах ACL,
где роль автоматического отбора терминов играет ручное тегирование, а роль
морфологического расширения — колонка «Что искать». Наука предлагает готовые куски
для обеих половин (NER-предразметка на стадии `[0]`, словарная+нейро-морфология для
форм), но целиком задачу «указатель к художественному переводу с санскритской
ономастикой» ни один из инструментов не закрывает — гибрид с оператором остаётся
архитектурно правильным.

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
- Ревизия 10-07-2026 (H377, Fable 5 `claude-fable-5`): добавлены пофайловый разбор всех
  скриптов (по построчному чтению кода, не по видео), Часть III (модернизация, копилот,
  ACL-раздел), блоки «Диалог скрипта» в Части I; 7 дефектов кода исправлены отдельными
  коммитами (ветка `h377-manual-overhaul-copilot`), номера строк в разборах — по
  состоянию до фиксов.

_Dr. Mārcis Gasūns_
