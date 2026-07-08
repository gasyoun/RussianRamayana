# Litpam-Indexator

_Created: 07-07-2026 · Last updated: 08-07-2026_

🔗 Живой сайт проекта:
[https://gasyoun.github.io/RussianRamayana/project.html](https://gasyoun.github.io/RussianRamayana/project.html)
(раздел «Команда проекта» ссылается на этот инструментарий; отдельной
live-страницы/демо у самого индексатора нет).

Рабочий комплект для построения предметных указателей (именного,
географического, предметов и терминов, флоры и фауны) к двухтомному
академическому изданию перевода «Рамаяны» Валмики (перевод П.А. Гринцера,
серия «Литературные памятники», ИМЛИ РАН / «Ладомир»). Не программный
проект в обычном смысле — сборки, линтера и тестов здесь нет; это набор
ExtendScript-скриптов (.jsx) для Adobe InDesign, вспомогательная
Pascal/Lazarus-утилита и рабочие данные (тегированный текст + Excel-словарь),
собранные и задокументированные Михаилом Иванюшиным (dotextok@gmail.com,
[dotextok.ru](https://dotextok.ru)).

Расположен как подпапка внутри более крупного репозитория
[`RussianRamayana`](https://github.com/gasyoun/RussianRamayana) (репозиторий
статического сайта/краудфандинга того же переводческого проекта) — этот
каталог самостоятельного `git remote` не имеет.

---

## Что это делает

Итоговая цель — четыре указателя в конце каждого тома:

1. **Именной** (имена персонажей, богов, мудрецов и т.д.)
2. **Географический** (топонимы)
3. **Предметы и термины**
4. **Флора и фауна**

Источник — вручную тегированный текст перевода
([`Tags/ram_tags.txt`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Tags/ram_tags.txt)), где индексируемые термины
помечены инлайн-тегами вида `#термин{Тег\уровень}`. Тег и уровень
сверяются с рабочим словарём в Excel
([`xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx)),
после чего последовательность `.jsx`-скриптов внутри Adobe InDesign
переносит разметку в вёрстку, строит таблицы указателя (`IndexList`),
расставляет маркеры индекса в тексте и форматирует итоговый указатель
(схлопывание диапазонов страниц, ссылки «См.», алфавитные заголовки
разделов, аннотации).

## Сценарии использования (use cases)

- **Построение указателей Тома I** — основной активный сценарий, пошагово
  расписан в [`Roadmap_Ramayana_Index-Vol.1.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md):
  от снятия lock-файла и тренировочного прогона на «Golden Fish Story» до
  финальной вычитки и PDF-экспорта с гиперссылками/закладками.
- **Построение указателей Тома II** — тот же пайплайн (стадии 1–4) с нуля,
  так как таблицы `IndexList` для Тома II ещё не построены; общий с Томом I
  только Excel-словарь. Пока не начато.
- **Сверка тегов ↔ словаря перед индексацией** — прогон
  `_Ram_Tag_explorer/teg_exp.exe` над [`Tags/ram_tags.txt`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Tags/ram_tags.txt)
  и [`xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx),
  чтобы отловить расхождения (тег есть в тексте, но нет в словаре, и наоборот)
  до запуска дорогих стадий в InDesign.
- **Пре-флайт-валидация словаря перед стадией `[1]`** — прогон
  [`tools/validate_dictionary.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/validate_dictionary.py)
  по `.xlsx`: read-only отчёт по **внутренним** дефектам рабочих листов (проза/комментарий
  в колонке форм — «вешает» обработку, видео 12; пустые строки; хвостовые `;`; дубли форм;
  разрывы уровней; служебные/формульные строки). Кроссплатформенно (Python + `openpyxl`,
  без Excel/OLE) — дополняет `teg_exp.exe`, который сверяет файлы **между** собой и требует
  Windows+Excel. Отчёт по текущему словарю —
  [`docs/indesign-pipeline/dictionary-validation-report.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/dictionary-validation-report.md).
- **Обучение новой стадии/скрипту на игрушечном примере** — перед прогоном
  на реальном тексте отработать конкретный скрипт на
  `#Indexing. Ramayana/Info/Учебные примеры (Drill examples)/` (Golden Fish
  Story, SeePointer, UnknownBook), чтобы понять эффект стиля/цвета/маркера,
  не рискуя реальной вёрсткой тома.
- **Ручная докурация словаря** — редактирование листов «Именной»,
  «Географ», «Предметы и термины», «Флора и фауна» и разбор служебных
  листов «Корзина»/«Михаилу!» между прогонами пайплайна; это неотъемлемая
  часть рабочего цикла, а не разовая подготовка.
- **Перенос пайплайна на будущие тома/издания серии «Литературные
  памятники»** — потенциальный сценарий: `ForIndex.jsxinc` и стадии 0–4
  написаны достаточно обобщённо, чтобы применяться к другим тегированным
  текстам той же схемы разметки, а не только к «Рамаяне» (пока не
  апробировано, тема для roadmap-обсуждения).

## Поток данных (data flow)

```
Tags/ram_tags.txt  ─┐
                     ├──▶  _Ram_Tag_explorer/teg_exp.exe   (сверка тег ↔ словарь между файлами, OLE+Excel)
xls/Указатель_*.xlsx ┘──▶  tools/validate_dictionary.py    (внутренние дефекты листа, кроссплатформенно)
                                      │
                                      ▼
        «#Indexing. Ramayana»/  — пять стадий обработки внутри Adobe InDesign:
        [0. Работа с тегированной разметкой]
        [1. Подготовка таблиц]
        [2. Проверка правильности данных в таблицах]   (для этого проекта в основном пропускается)
        [3. Индексирование]
        [4. Оформление указателя]
                                      │
                                      ▼
                InDesign/Ramayana_I_12.10.25.indd / Ramayana_II_12.10.25.indd
                                (готовые тома с указателями)
```

## Структура репозитория

```
Litpam-Indexator/
├── CLAUDE.md                              — техническая памятка для AI-агентов (контракт ForIndex.jsxinc, ловушки)
├── Roadmap_Ramayana_Index-Vol.1.md        — пошаговый чек-лист построения указателей для Тома I
├── Tags/
│   └── ram_tags.txt                       — тегированный текст Тома I (Балаканда), 31 738 строк
├── xls/
│   └── Указатель_к_Рамаяне_1_2_*.xlsx     — рабочий словарь, 17 листов (4 рабочих указателя + служебные)
├── _Ram_Tag_explorer/                     — Free Pascal/Lazarus-утилита сверки тегов (teg_exp.exe)
├── tools/
│   └── validate_dictionary.py            — аддитивный read-only пре-флайт-валидатор словаря (openpyxl)
├── #Indexing. Ramayana/
│   ├── ForIndex.jsxinc                    — общий include: имена стилей/цветов, нельзя переименовывать
│   ├── [0. Работа с тегированной разметкой]/
│   ├── [1. Подготовка таблиц]/
│   ├── [2. Проверка правильности данных в таблицах]/
│   ├── [3. Индексирование]/
│   ├── [4. Оформление указателя]/         — 6 подпапок по отдельным операциям форматирования
│   ├── Info/                              — методичка автора (PDF), ссылки на видео, учебные примеры
│   └── Useful Support Tools/
└── InDesign/
    ├── Ramayana_I_12.10.25/               — .indd/.idml/.pdf + шрифты, Том I
    └── Ramayana_II_12.10.25/              — .indd/.idml/.pdf + шрифты + web-экспорт, Том II
```

## Технологии

- **Adobe ExtendScript (.jsx)** — 39 скриптов + 1 `.jsxinc`, диалект ES3.
  Запускаются только изнутри Adobe InDesign (Window → Utilities → Scripts).
- **Free Pascal / Lazarus** — `_Ram_Tag_explorer/teg_exp.exe`, читает
  `.xlsx` через OLE-автоматизацию Excel; требует Windows + установленный
  Excel. Пересборка: `lazbuild teg_exp.lpi`.
- **Форматы данных**: `.txt` (смешанная кодировка — `.jsx`-файлы в
  UTF-8 с BOM/CRLF, часть авторских `.txt` в cp1251, менять кодировку по
  умолчанию нельзя), `.xlsx`, `.docx` (аннотации), `.indd`/`.idml`
  (Adobe InDesign).

## Как запускать

Единой команды «собрать проект» нет.

- **`.jsx`-скрипты** запускаются только из палитры Scripts внутри
  открытого документа InDesign (двойной клик). Проверить пайплайн можно
  на учебном примере
  `#Indexing. Ramayana/Info/Учебные примеры (Drill examples)/Golden Fish Story/`.
- **Синтаксическая проверка без InDesign**: снять BOM и препроцессорные
  директивы (`#include`, `#targetengine`), затем `node --check`. ExtendScript
  — ES3, конструкции вроде `};` перед `else` — не баги, не «чинить».
- **`teg_exp.exe`**: собрать через `lazbuild teg_exp.lpi` (Lazarus,
  Windows + Excel обязательны).
- **Пре-флайт-валидатор словаря** (кроссплатформенно, без InDesign/Excel):
  `python tools/validate_dictionary.py "xls/Указатель_к_Рамаяне_1_2_2026_05_18.xlsx"`
  (в отчёт-файл — `--report <файл.md>`; один лист — `--sheet "Именной"`). Требует
  `openpyxl` (`pip install openpyxl`). Код возврата 1, если найдены дефекты.
- Полный порядок действий по стадиям — в
  [`Roadmap_Ramayana_Index-Vol.1.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md);
  сводное руководство оператора — [`docs/indesign-pipeline/MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md).

## Инварианты — не переименовывать / не «чинить» без явного запроса

Из [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md) и `ForIndex.jsxinc` — жёсткий контракт имён,
на которые опираются все скрипты:

- Стили абзаца `#Level1`…`#Level4` (группа `#IndexStyles`), стили отображения
  `#Level1=Index`…
- Цвета `SkipTheWord` (слово исключено из индексации), `IndexColor` /
  `usedColor` (уже обработано), `IndexStylesColor`
- Маркер отсутствующего уровня — тире `noLevel`
- Схема именования файлов: `IndexList-nnn.indd`, `IndexList[X]nnn.indd`,
  `IndexList[@]nnn.indd`

Прочие ловушки:

- `ProcStoryOrDoс[09.10.2023].jsx` — в имени файла кириллическая «с»
  вместо латинской, легко промахнуться при поиске/автодополнении.
- Папки `tmp/` (в стадиях `[0]` и `[3]`) — архив черновиков, НЕ часть
  рабочего пайплайна; часть файлов там с намеренно битыми путями
  `#include`.
- `_Ram_Tag_explorer/backup/` и `lib/x86_64-win64/` — старые копии
  исходника и артефакты сборки, не канонический код.
- В `xls/Указатель_*.xlsx` из 17 листов рабочие только 4 (Именной,
  Географ, Предметы и термины, Флора и фауна) + справочный «Все_Теги»;
  «Корзина» и «Михаилу!» — черновые/служебные листы.
- Стадия `[2. Проверка правильности данных в таблицах]` для этого проекта
  в основном не нужна (нет совпадающих grep-запросов) — см. её собственный
  `info.txt`.
- Скрипты стадий 1/3 намеренно отказываются работать при переполнении
  текстового фрейма или на несохранённом документе — это ожидаемое
  поведение, не баг.

## Текущее состояние (08-07-2026)

- **Документация конвейера выверена и опубликована (08-07-2026).** 18 сырых
  авто-субтитровых расшифровок видео-скринкастов приведены в связную документацию:
  почищенные пофайловые расшифровки —
  [`docs/indesign-pipeline/clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean),
  сводное руководство (операторский разбор + приложение для мейнтейнера) —
  [`docs/indesign-pipeline/MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md),
  живая страница на сайте —
  [`indexing-pipeline.html`](https://github.com/gasyoun/RussianRamayana/blob/main/indexing-pipeline.html)
  ([gasyoun.github.io/RussianRamayana/indexing-pipeline.html](https://gasyoun.github.io/RussianRamayana/indexing-pipeline.html)).
  Сырые `.txt` сохранены как провенанс.
- **Тайм-коды шагов добавлены (08-07-2026).** Тайминговые авто-субтитры всех 18
  роликов скачаны заново по `videoId` и сохранены как провенанс в
  [`docs/indesign-pipeline/timed/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/timed);
  на их основе каждый значимый шаг получил посекундную ссылку `…&t=<N>s` — сводно в
  разделе [«Тайм-коды по роликам»](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md#%D1%82%D0%B0%D0%B9%D0%BC-%D0%BA%D0%BE%D0%B4%D1%8B-%D0%BF%D0%BE-%D1%80%D0%BE%D0%BB%D0%B8%D0%BA%D0%B0%D0%BC)
  руководства, продублировано в каждой очищенной расшифровке и на странице сайта
  (секции «Ключевые моменты по роликам»).
- **Руководство закалено + процесс усилен (08-07-2026, H363).** В
  [`MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md)
  добавлены шпаргалка, диаграмма потока данных, таблица «Симптом → Причина → Лечение»,
  глоссарий, раздел «Окружение», бюджет времени и **Розеттская таблица** маркеров; три
  документа (MANUAL / Roadmap / CLAUDE) сведены к канону букв-маркеров `a/b/c/d` из
  `ForIndex.jsxinc`. Добавлен аддитивный
  [`tools/validate_dictionary.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/validate_dictionary.py)
  (43 находки на текущем словаре, отчёт в
  [`dictionary-validation-report.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/dictionary-validation-report.md))
  и регрессионный дрилл дефекта «одной формы»
  ([`regression_expected.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/Info/%D0%A3%D1%87%D0%B5%D0%B1%D0%BD%D1%8B%D0%B5%20%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80%D1%8B%20(Drill%20examples)/Golden%20Fish%20Story/regression_expected.md)).
  Авторские `.jsx`/`.xlsx` не менялись (guardrail).
- Скрипты и документация — зрелые и завершённые (авторский инструментарий,
  подробные `info.txt` по каждой стадии, полный учебный пример «Golden Fish
  Story»); `TODO`/`FIXME` в коде не найдено.
- Применение пайплайна к реальному тексту — только в начале: чек-лист
  [`Roadmap_Ramayana_Index-Vol.1.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/Roadmap_Ramayana_Index-Vol.1.md) для
  Тома I пока не пройден (пункты `☐` не отмечены), включая необходимость
  вручную удалить lock-файл `~ramayana_i_12.10.2~f5jd0f.idlk` перед началом
  работы.
- **Том II** к индексации ещё не приступали — таблицы `IndexList` для него
  не существуют и должны быть построены с нуля (общий для обоих томов
  только Excel-словарь); в `Roadmap` шаг «Ф4. Том II» явно помечен как не
  начатый.
- Готовые вёрстки в `InDesign/` датированы 12.10.25 — предшествуют
  собственно работе над указателями, т.е. это базовые тома без указателей
  либо ранняя контрольная версия.
- В `git log` эта папка присутствует только в 3 последних коммитах
  репозитория `RussianRamayana` (`42cdc54`, `169d6bd`, `c44d1b6`) — это
  свежее добавление, инструментарий сюда ещё не «оброс» правками по месту.

## Контакты

Автор скриптов и методики: Михаил Иванюшин, dotextok@gmail.com,
[dotextok.ru](https://dotextok.ru). Методичка (PDF) и ссылки на видео —
в [`#Indexing. Ramayana/Info/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/%23Indexing.%20Ramayana/Info).

---

_Dr. Mārcis Gasūns_
