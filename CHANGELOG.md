# Changelog

Рабочий журнал изменений, решений и уточнений по проекту `RussianRamayana`.

## 2026-09-01

### Блокер Фазы 1 «достать MP3 книг V–VI с Яндекс Диска» снят: доставать нечего (H3777)

Чек-бокс, из-за которого 27-08-2026 весь DH-роадмап получил врезку «human-gate, не тикать»,
стоял на утверждении, которое проверяется одной командой. Проверено: на Windows-машине лежат
**все 7 книг**, и у всех семи `size_bytes` и `sha256` совпадают с
[data/audio.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/audio.json) и с
таблицей [docs/ia-upload.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/ia-upload.md).
Ни один файл не скачивался — измерено уже лежащее.

- **Почему два прежних замера дали «пять из семи», и почему оба были честными.**
  Книги V (124 MB) и VI (154 MB) — в `.gitignore`, потому что превышают лимит GitHub в 100 MiB;
  остальные пять **в git**. Замер 26-08-2026 (H3003) шёл в **связанном git-worktree**, а тот
  никогда не переносит игнорируемые файлы — там физически видны ровно пять, что бы ни лежало на
  машине. Замер 28-08-2026 (A05) шёл на **другой машине** (macOS), где книг V–VI действительно нет.
  Противоречия между записями не было — были две машины и один worktree.
- **Чтобы это не повторилось:** у
  [scripts/audio_inventory.py](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/audio_inventory.py)
  появился режим `--verify` — сверяет чекаут с `data/audio.json` без ffprobe, печатает
  предупреждение, если запущен из worktree (`.git` — файл, а не каталог), и выходит с кодом 1
  при любом расхождении. Общее правило («перепись игнорируемого ассета в worktree всегда
  показывает ложное отсутствие») занесено в
  [Uprava/FINDINGS.md](https://github.com/gasyoun/Uprava/blob/main/FINDINGS.md).
- **Что действительно держит Фазу 1** — ровно два человеческих акта, и оба не про файлы:
  решение по правам наследников В. Потаповой
  ([docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md),
  «Открытые вопросы» № 1) и логин `ia configure` для создания item на archive.org.
- **Дренаж «независимых от MP3» пунктов не понадобился.** Задание H3777 описывало 19 открытых
  чек-боксов; на `origin/main` их 10, потому что дорожку A исполнил
  [PR #103](https://github.com/gasyoun/RussianRamayana/pull/103) (26-08-2026, H3558), а 19 были
  прочитаны из клона, отставшего на 13 коммитов. Ни один открытый пункт, кроме четырёх в Фазе 1,
  от аудиофайлов не зависит — и ни один из этих четырёх не зависел от Яндекс Диска.

## 2026-08-29

### Потребитель ребра назван: «consumer is the printed book to come» — строка перестала быть спекулятивной (решение F5b)

Ребро *Litpam print-readiness lane*, зарегистрированное вчера **на перспективу**
(H3568, решение F5), получило названного потребителя: это **само двухтомное академическое
издание «Литературных памятников»** (перевод П. А. Гринцера, «Наука») — печатная книга, ради
готовности которой конвейер и существует.

- **Что это меняет.** Потребитель находится **вне git и вне графа репозиториев**, поэтому
  третий тест Gate 2 программы связности («в репозитории-потребителе есть что-то, что это
  читает») к нему **неприменим по форме**: строка признана реальной **по решению**, а не по
  замеру. Условие снятия **исполнено**; вердикт `edges-registered` в
  [INTERLINKS_COVERAGE_LEDGER.tsv](https://github.com/gasyoun/Uprava/blob/main/INTERLINKS_COVERAGE_LEDGER.tsv)
  остаётся в силе и на следующей переписи связности не отменяется.
- **Что это не меняет.** Замер 28-08-2026 по двенадцати соседним клонам **не отменяется** и не
  переписывается: ни один репозиторий конвейер не читает. Отныне эта пустота — **ожидаемая**,
  и заносить её в дефекты нельзя.
- ⚠️ **Спекулятивный бюджет Gate 2 этим не освобождается.** Решение F5a оставило перекрёстную
  таблицу IndologyScholars «только со стороны производителя» именно потому, что единственный
  спекулятивный слот занимала эта строка. F5b не пересматривает F5a и не разрешает вторую
  спекулятивную строку нигде — освободился ли слот, решает человек.
- Доставка потребителю идёт прямо сейчас: книга II — `AUTOMATED_PASS / HUMAN_REVIEW_WAITING`
  ([H2590](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H2590-OxAlpha_RussianRamayana_litpam-book2-print-readiness-application_12.08.26.md),
  [PR #98](https://github.com/gasyoun/RussianRamayana/pull/98)).

## 2026-08-28

### Репозиторий подключён к «хребту»: конвейер печатной готовности зарегистрирован ребром графа — на перспективу, с условием снятия (H3568)

Решение F5 программы связности отменяет вердикт `standalone-by-design` для этого
репозитория и регистрирует *Litpam print-readiness lane* как ребро в
[PROJECT_INTERLINKS.md](https://github.com/gasyoun/Uprava/blob/main/PROJECT_INTERLINKS.md)
и [interlinks_edges.tsv](https://github.com/gasyoun/Uprava/blob/main/interlinks_edges.tsv):
[`Litpam-Indexator/tools/print_ready.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/print_ready.py),
ExtendScript-инструменты
[`tools/indesign/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/tools/indesign),
порог
[`config/print-readiness.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/config/print-readiness.json)
и версионированные артефакты
[`artifacts/print-readiness/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/artifacts/print-readiness).

- ⚠️ **Ребро зарегистрировано на перспективу.** Замер 28-08-2026 по всем соседним клонам
  (`kosha`, `SanskritLexicography`, `CommentaryStrategies`, `BookIndex`, `SamudraManthanam`,
  `github-spine`, `csl-atlas`, `IndologyScholars`, `SanskritKaraoke`, `AfanasiyNikitin`,
  `Systema-Sanscriticum`, `ORS-FAQ`): **конвейер не читает ни один репозиторий**; единственные
  совпадения — английское словосочетание *print-readiness* в словарном смысле и URL
  `litpamyatniki.ru`. Это единственная спекулятивная строка, которую бюджетирует Gate 2
  программы; вторую добавлять нельзя.
- ⚠️ **Условие снятия:** если к следующей переписи связности реального потребителя не назовут,
  строка удаляется, а вердикт в
  [INTERLINKS_COVERAGE_LEDGER.tsv](https://github.com/gasyoun/Uprava/blob/main/INTERLINKS_COVERAGE_LEDGER.tsv)
  возвращается к `standalone-by-design`.
- Производящая сторона реальна и активна: H2589 (книга I) и
  [H2590](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H2590-OxAlpha_RussianRamayana_litpam-book2-print-readiness-application_12.08.26.md)
  (книга II, [PR #98](https://github.com/gasyoun/RussianRamayana/pull/98)) выпускают
  gate-отчёты, покрытие, реестр дефектов и proof-PDF по этому пути.
- [README.md](https://github.com/gasyoun/RussianRamayana/blob/main/README.md) получил раздел
  «Как этот репозиторий связан с остальными» (решение F11 — до сих пор обратных ссылок на
  «хребет» здесь не было),
  [CLAUDE.md](https://github.com/gasyoun/RussianRamayana/blob/main/CLAUDE.md) — раздел
  маршрутизации находок по двум хабам (решение F1; локальных реестров репозиторий не заводит).


### Сведение MP3 (Фаза 1, чек-бокс A05): замер на mac-машине — книг V–VI нет, пять файлов целы (sha256 5/5)

Дорожка C, чек-бокс «Свести воедино MP3 всех 7 книг»
([docs/DH_ROADMAP.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/DH_ROADMAP.md)):
проход A05 подтвердил замер H3003 на этой машине и снял двусмысленность
записи от 26-08 в
[.ai_state.md](https://github.com/gasyoun/RussianRamayana/blob/main/.ai_state.md) (Dev Notes):

- Книги V–VI (`Рамаяна 1986. Книга 5. Прекрасная.MP3`, `… 6. Битва.MP3`) на
  этой машине отсутствуют повсюду: полный обход домашнего каталога (find без
  Library/.git/node_modules) + поиск Spotlight по именам; находятся только
  пять отслеживаемых MP3 (книги 1–4, 7).
- Целостность пяти имеющихся файлов подтверждена криптографически: SHA-256
  совпадают с [data/audio.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/audio.json)
  **5/5** — для будущей загрузки на IA (когда будет решён вопрос прав) годятся
  как есть, перекачка не нужна.
- Остаток — человеческий, без изменений: достать V–VI (Яндекс Диск или машина
  с полным комплектом). Агент медиа не выкачивает (human-gate 27-08-2026).
  Целевые размеры/хэши — [docs/ia-upload.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/ia-upload.md).

## 2026-08-26

### Дорожка A DH-роадмапа исполнена: `rights` и `recension` в каталоге, VIAF-идентификаторы, страница «Как цитировать» (H3558)

Исполнение агентских (Дорожка A) пунктов, которые оставила после себя
статус-проверка H3003. Что изменилось на диске:

- **`rights` у всех записей каталога.** Поле добавлено в
  [data/editions.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/editions.json)
  (**6 из 6**, было 0) и
  [data/retellings.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/retellings.json)
  (**3 из 3**, было 0). Формулы дословно взяты из реестра
  [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md);
  ничего нового о правах не решалось. В реестр добавлен **объект №13** —
  библиографические описания (описания CC BY 4.0, описываемые произведения InC) —
  и правило: каждая запись `editions/retellings/audio/videos` несёт `rights`
  формы «статус · правообладатель · основание · См. docs/RIGHTS.md, объект №N».
  Поле объявлено в
  [data/schema/editions.schema.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/schema/editions.schema.json)
  и [data/schema/retellings.schema.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/schema/retellings.schema.json)
  по образцу `audio.schema.json`, так что CI-job `data-validate` его проверяет.

- **Пять заглушек `recension` «уточняется» сняты (осталось 0).** Значения не
  выдуманы, а выведены из измерений репозитория: у `leonov-6` — из
  [data/YUDDHA_GITASUPERSITE_COMPARISON_REPORT.md](https://github.com/gasyoun/RussianRamayana/blob/main/data/YUDDHA_GITASUPERSITE_COMPARISON_REPORT.md)
  (5728 шлок против 5209 у Gita Supersite, сопоставлена 5031 пара, 3353 из них
  near-identical) — южная (вульгата); у `leonov-5` — из
  [data/comparison-episodes.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/comparison-episodes.json)
  (эпизод R.5.1.1 размечен как южная вульгата). Для `grintser-1-2`,
  `grintser-3` и `serebryany-4` записано честное «не установлена» с причиной:
  в самих изданиях редакция не оговорена, и
  [recensions.html](https://github.com/gasyoun/RussianRamayana/blob/main/recensions.html)
  это фиксирует. Потребителей у этого поля в HTML/JS нет — страница сравнения
  читает `recension` из `comparison-episodes.json`, — так что правка ничего
  не ломает визуально.

- **Идентификаторы людей: VIAF Гасунса найден, остальное измерено и
  переклассифицировано.**
  [data/people.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/people.json):
  `viaf` теперь **2 из 4** (добавлен кластер `1158167565597098750002`,
  единственный источник — DNB/GND `1279528044`), `wikidata` остаётся **1 из 4**.
  Для Леонова и Костиной записи VIAF не существует вовсе, а items Wikidata
  ни для кого из троих не заводились — их **создание** требует согласия М. Г.
  и остаётся Дорожкой C. Замер и техническая заметка (VIAF снял старые
  REST-пути; рабочий вызов — POST на `/api/cluster-record`) записаны в
  [docs/wikidata-drafts.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/wikidata-drafts.md).

- **Страница «Как цитировать»** — новая
  [cite.html](https://github.com/gasyoun/RussianRamayana/blob/main/cite.html):
  библиографическая запись проекта по ГОСТ Р 7.0.5-2008 и APA 7, готовый
  BibTeX, ссылки на выгрузки `data/export/*`, лицензии данных и кода,
  правило «пересказ не цитируется как перевод». **DOI не выдуман** — страница
  прямо говорит, что его нет, что депонирование в Zenodo остаётся внешним
  актом и что поле `doi` появится в
  [CITATION.cff](https://github.com/gasyoun/RussianRamayana/blob/main/CITATION.cff)
  после него. Страница прилинкована с
  [index.html](https://github.com/gasyoun/RussianRamayana/blob/main/index.html),
  из подвалов [rights.html](https://github.com/gasyoun/RussianRamayana/blob/main/rights.html)
  и [bibliography.html](https://github.com/gasyoun/RussianRamayana/blob/main/bibliography.html)
  и внесена в [sitemap.xml](https://github.com/gasyoun/RussianRamayana/blob/main/sitemap.xml).
  Сборки не потребовалось: `scripts/prerender.py` берёт все корневые `*.html`.

- **ISBN для четырёх изданий — исполнимого остатка нет (Дорожка B).** Замер:
  `potapova` (1986) в собственном описании оговаривает, что издание вышло до
  введения ISBN; `serebryany-4`, `leonov-5`, `leonov-6` не изданы (нет и года),
  так что номера пока не существует. Половина пункта про `wikidata` для изданий
  остаётся Дорожкой C.

Проверка: `scripts/validate_data.py` — 19 файлов, 18 схемных, 0 падений.

### DH-роадмап сверен с диском: решение о правах на аудио 1986 г. пересмотрено, шесть пунктов оказались выполненными (H3003)

[docs/DH_ROADMAP.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/DH_ROADMAP.md)
не обновлялся с 2026-06-12 и разошёлся с состоянием репозитория. Каждый его
открытый чек-бокс сверен механически — наличие файлов, подсчёт заполненных полей
по каждому JSON, имена job в `ci.yml`, `git ls-files`, измерение `.git`; проза
роадмапа и README доказательством не считались. Нового пятидокументного
`/ask`-комплекта не заводилось: файлу не хватало не плана, а актуального статуса.

Главный результат — **зафиксированное решение № 3 («права на аудио 1986 г.
очищены письменно — публикуем открыто») в этой формулировке больше не верно.**
Письменное разрешение 2026 г. покрывает только запись (Е. Кривецкий); текст
перевода В. Потаповой (ум. 1992) не урегулирован, и
[docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md)
прямо запрещает делать IA-item публичным до решения. Поскольку в записи звучит
именно этот перевод, предпосылка всей Фазы 1 не держится — соответствующие
пункты помечены как требующие акта человека, а не как инженерные задачи.

Ещё четыре утверждения оказались неверными: «сейчас JSON никак не валидируется»
(в `ci.yml` есть job `data-validate` → `scripts/validate_data.py` против 18 схем);
поле `recension` «в JSON отсутствует» (есть у 6/6 изданий, но у 5/6 стоит
заглушка «уточняется»); оценка чистки истории «~480 MB → <30 MB» (измерено
`.git` = 740 MB, из них MP3 лишь ≈306 MiB, а ≈430 MB — подпроекты
`Leitan-Sundarakanda` и `Litpam-Indexator`, в роадмапе не названные вовсе);
«Гринцер = Q4147525» (верный QID — Q4149672, в `people.json` стоит верный).
Плюс устаревший счёт ISBN (2 из 6, а не 1) и неразрешимое противоречие о
полноте аудиоархива между `.ai_state.md` и содержимым клона — оно оставлено
как противоречие, медиа не выкачивались.

Шесть пунктов были выполнены, но не отмечены: разделение лицензий, `RIGHTS.md`
и `rights.html`, публикация резюме разрешения, JSON-LD на 17/17 страниц, экспорт
библиографии в `data/export/`, CI-валидация JSON. Остаток пересортирован по
тому, **кто способен его разблокировать**: 4 пункта агент может закрыть сейчас
(поле `rights` в `editions.json` и `retellings.json`, пять заглушек `recension`,
идентификаторы трёх персон, ISBN), 3 ждут внешнего артефакта, 7 требуют акта
человека (права наследников, публикация на IA, `filter-repo` с force-push,
Zenodo DOI, Software Heritage, правки в Wikidata). Ни один пункт последней
группы в этом проходе не исполнялся.

Выполнено Opus 5 (`claude-opus-5`) по
[H3003](https://github.com/gasyoun/Uprava/blob/main/handoffs/H3003-Opus_multi_stale-roadmap-s5-dh-narrative-ask-replan_17.08.26.md).

## 2026-08-25

### Книга II: пилот полностью восстановлен после потери воркчтри, AddAnnotationData выполнен впервые, финальный evidence packet выпущен (H2590)

Прежний воркчтри с живым `.indd` пилота книги II (все стадии `[1]`–`[4]`
с 19-08-2026) был удалён между сессиями (по замыслу — `work/` вне Git);
без него стадия `[3]` не могла возобновиться. Весь пайплайн передержан с
нуля (стадии `[1]`→`[1b]`→`[3]`→`[4]` шаги 1–6), сверен на каждой
контрольной точке с сохранёнными данными прежней сессии через новый
`dump_topic_pages.py`+`diff_topic_page_dumps.py` — 0 расхождений везде,
включая финал (935/935 топиков). По ходу пойманы и исправлены: скрытая
причина сбоя InDesign COM (`.indd`, скопированный вручную из
InDesign-2022-формата, требует явного `Document.save(path)` перед первым
скриптовым сохранением) и watchdog «долгого скрипта» на больших буквах
словника (решено построчным чанкингом).

`AddAnnotationData.v.3.jsx` выполнен впервые — ни одна прежняя сессия до
этого шага не доходила. Источник данных подтверждён (все 4 листа словника
несут «Краткая аннотация»); 820 из 855 пар применены. По ходу найдены и
задокументированы два ранее неизвестных дефекта самого авторского скрипта:
регистронезависимый `findGrep` схлопывает разные заголовки, различающиеся
только регистром («Бали»/«бали»); `changeGrep()` заменяет ВСЕ вхождения
шаблона документа целиком, из-за чего короткий заголовок-словограничный
префикс более длинного получает свою глоссу на обеих статьях (задело бы
«Рама», протагониста эпоса, не будь пойман). 29 коллидирующих заголовков
исключены из автоматической таблицы, не выбраны молча.

`notes_bold_page_ranges.II` измерен впервые (§7.3 spec, был `null` со
времён H2589): «Примечания» стр. 497–593, «Приложение» стр. 594–664.
Проверка нашла новый материальный дефект `DFT-II-0004` — 0 из 2567
локаторов в этом диапазоне набраны полужирным; зарегистрирован, не
исправлен автоматически (решение о способе применения — за человеком).

Финальный evidence packet выпущен:
[artifacts/print-readiness/book-II/pilot-2026/final/](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/artifacts/print-readiness/book-II/pilot-2026/final)
(versioned IDML + proof-PDF, 711 стр., 0 overset) + `verify-packet` PASS на
всех 7 членах +
[BOOK_II_REVIEW_CHECKLIST.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/BOOK_II_REVIEW_CHECKLIST.md).
Статус книги II: `AUTOMATED_PASS / HUMAN_REVIEW_WAITING`
([PR #98](https://github.com/gasyoun/RussianRamayana/pull/98)).

## 2026-08-24

### Расшифровка видео-интервью Леонова; текстовый корпус цитат расширен (roadmap.md, A11)

Единственное опубликованное видео Леонова (`leonov-intro`, `data/videos.json`)
расшифровано из автоматической дорожки субтитров YouTube (`yt-dlp
--write-auto-sub`, формат `json3`), сведено в связный текст и вычитано вручную
с опорой на контекст (термины, имена переводчиков и произведений — Гринцер,
Потапова, Липкин, Гаспаров, Микушевич, Ашвагхоша, Калидаса, Голдман —
сверены по известным фактам индологии). Полная расшифровка —
[`data/transcripts/leonov-intro-2023-transcript.md`](https://github.com/gasyoun/RussianRamayana/blob/main/data/transcripts/leonov-intro-2023-transcript.md),
помечена как черновая (ASR-основа), с явными пометками мест, не поддающихся
надёжному распознаванию. Корпус цитат в `data/videos.json` расширен с 2 до 8
(новые цитаты — из речи Леонова, отобраны как чисто распознанные и
самодостаточные фрагменты). Реестр прав (`docs/RIGHTS.md`) дополнен объектом
№12 на тех же основаниях согласия, что и объект №10 (текстовые цитаты
Леонова). `docs/content-inventory.md` обновлён; `roadmap.md` — пункт 1
раздела «Следующие шаги» отмечен выполненным.

## 2026-08-19

### Книга II: контаминация stage[3] исправлена и подтверждена; stage[4] шаги 1–2 перегнаны; новый дефект DFT-II-0003 (H2590)

Продолжение находки от 17-08 (PR #86): `index_letter.jsx`'s document-wide grep
self-matched against the OLD 2025 printed index text still present on pages
630+, contaminating ~10% of page references. That commit shipped the fix
(`--exclude-from-page`) but only re-ran letter `a`; letters `b`/`c`/`d` redone
today (2.0/9.1/1.8 min, `drive_stage3_own_checkpointed.py --exclude-from-page
630`) — 17 filtered hits confirmed across all 4 letters. Verified on a concrete
example: `a-Агастья` printed `…613, 614, 630` (contaminated) → now `…613–614`
(630 correctly excluded).

Stage[4] steps 1–2 re-run from scratch on the corrected data: "Построить
указатель" (668→711 pages) + `ProcNumberLines` (1.9 min, 58282→49929 chars
after range-collapse). Coverage check v2 (`dump_topic_pages.py` +
`analyze_topic_pages.py`, comparing deduplicated page-number sets — the older
`coverage_check_stage4.py` v1 false-flags legitimate `ProcNumberLines`
dedup) found a new defect **DFT-II-0003** (material, `WAITING`,
[defect-ledger.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/defect-ledger.json)):
29/934 Level-1 topics each lose exactly one locator in print vs. the data
model. Root-cause hypothesis: `ProcNumberLines`' native range-collapse leaves
one trailing `PageReference` per topic unresolvable (`Object is invalid`) —
harmless for 664/693 affected topics (page already covered by a collapsed
range) but silently drops a standalone non-adjacent page for 29/693. Native
InDesign palette behavior, not an artifact of `index_letter.jsx` or
`drive_proc_number_lines.py` (both call the unmodified authorial script/API).
Book I has not yet run stage[4] and is plausibly at the same risk — flagged
as a follow-up, out of scope for this Book-II-titled handoff.

Remaining: resolve or accept-as-`WAITING` DFT-II-0003, then `SplitStory` →
«См.»/`HideShowNumber`/`AddAnnotationData` per the authorial `Очерёдность.txt`
ordering (`AddLetter`/`DashInsteadWord` stay disabled per contract);
`notes_bold_page_ranges` for both volumes still `null` in
`config/print-readiness.json` (not measured this session).

## 2026-08-17

### Книга II: стадия [3] индексирования завершена — 1318 topics, точное совпадение с книгой I (H2590)

Авторская палитра `ProcStoryOrDoс` воспроизвела ту же DOM-регрессию InDesign 2026,
что H2776 задокументировал для книги I (строка 773, «Invalid parameter» для
диапазона не с нулевой строки) — на письме `b`. Обход: уже проверенный на книге I
additive-индексатор
[`index_letter.jsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/index_letter.jsx)
(без изменений) через новый параметризованный драйвер
[`drive_stage3_own_checkpointed.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/drive_stage3_own_checkpointed.py).
**Итог: a=761 (авторская палитра, до регрессии) + b=183/c=286/d=88 (additive
индексатор) = 1318 topics — точное совпадение с итоговым числом книги I.**
Независимо перепроверено. Метод оказался в 3–6 раз быстрее сломанной палитры.

### Книга II: триаж лога «не найдено» — 233/255 ожидаемые, 22/255 подозрительные (H2590)

[`analyze_stage3_log_book2.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/analyze_stage3_log_book2.py)
(база сравнения — собственный не-найденный список книги I, раз у книги II нет
diff-против-2025 из стадии [1]): **233/255 (91 %) ожидаемые** — термин, которого
книга I тоже не нашла, но который она НАШЛА (значит принадлежит тексту тома I).
**22/255 (9 %) подозрительные** — не найдены ни в одном томе, тот же класс, что
5 подозрительных книги I (составные записи, общая ритуальная лексика) —
[триаж](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/pilot-2026/stage3/STAGE3_LOG_TRIAGE.md).
Остаток: стадия `[4]` (сборка/оформление, операторская) → финальный evidence
packet.

## 2026-08-16

### Книга II запущена: baseline+conversion evidence, gate PASS_WITH_WAIVERS, стадии [1]/[1b] выполнены (H2590)

Baseline-2022 (статический аудит) + живая 2026 COM-конверсия (668 стр., 53 истории);
Step5 gate FAIL на тех же классах дефектов, что книга I (`DFT-II-0001`: 7 LINK_MISSING,
3/5 имён совпадают с книгой I; `DFT-II-0002`: 3 overset). Адъюдицировано
`overset_textdiff.py` (переиспользован без изменений): 0/668 страниц отличий,
все 3 истории рендерятся 100% —
[адъюдикация](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/overset-adjudication-2026/OVERSET_TEXTDIFF_ADJUDICATION_BOOK_II_2026.md).
МГ применил waiver-прецедент книги I (H2776) →
`PASS_WITH_WAIVERS` ([PR #75](https://github.com/gasyoun/RussianRamayana/pull/75), merged).

Стадия `[1]` (`drive_stage1.py`, COM, авторские скрипты без модификаций): все 4 листа
общего словника → IndexList-001..004.indd (784/201/443/88 строк — та же сумма, что
книга I, общий словник). Стадия `[1b]` (`drive_stage1b.py`): маркеры a/b/c/d + 3 мерджа
→ сводная `IndexList[@]001.indd` (1516 строк). Остаток: стадия `[3]` (индексирование,
ожидаются те же DOM-регрессии InDesign 2026, что H2776 задокументировал для книги I) →
стадия `[4]` (сборка/оформление) → финальный evidence packet.

## 2026-08-15

### Стадия [3] выполнена: 1318 topics; три DOM-регрессии InDesign 2026 задокументированы (H2776)

Backfill (а) → словник `…08_15b.xlsx` → стадия `[1]` пересобрана (сводная 1516 строк,
[PR #70](https://github.com/gasyoun/RussianRamayana/pull/70)) → **стадия `[3]`**
([PR #71](https://github.com/gasyoun/RussianRamayana/pull/71)): **1318 topics**
(a=761 авторской палитрой + b/c/d аддитивным индексатором
[`index_letter.jsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/index_letter.jsx)
— авторский ProcStoryOrDoс headless под 2026 не работает: flatten
`everyItem().cells`, пустые `contents` на everyItem-цепочках,
`rows.itemByRange().select()` → Invalid parameter; per-guardrail «additive
equivalent wrapper», архив не тронут). Evidence: 442 стр., OVERSET=0;
[триаж лога](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/stage3/STAGE3_LOG_TRIAGE.md)
— 138 «не найдено» = 133 ожидаемых (том II) + 5 подозрительных + 0 ошибок.
Остаток: стадия `[4]` → волна H2590.

### Стадия [1] пилота выполнена агентом через COM: сводная IndexList[@]001, сравнение с 2025 (H2776)

MG-override («Попробуй стадию [1] сам через COM»): генерационная стадия `[1]`
прогнана headless на **авторских скриптах без модификаций** —
[`drive_stage1.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/drive_stage1.py)
строит 2-колоночные таблицы из словника
([`build_indexlist_table.jsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/build_indexlist_table.jsx))
и запускает `UseReadyTable.v.7.jsx` ×4 (782/199/429/88 строк; 30/2/12/1 мин;
модальные alert'ы перехвачены шимом в его persistent engine);
[`drive_stage1b.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/drive_stage1b.py)
ставит маркеры `a`–`d` (аддитивный твин цикла `AddMarker.jsx`) и гонит авторский
`MergeTwoIndexListTables.jsx` ×3 → **сводная `IndexList[@]001.indd`, 1498 строк,
5 колонок** (вне Git, в pilot-workspace).

Сравнение с типографскими указателями 2025 (страницы 415–438 пруфа;
[`compare_stage1_2025.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/compare_stage1_2025.py)
+ read-only дампер [`dump_indexlist.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/dump_indexlist.py)):
union common 1073, потерь строк словника нет; **находка — ~15–20 терминов 2025
отсутствуют в словнике** (добавлены в 2025 напрямую в вёрстку при разборе
`log.txt`, в `.xlsx` не возвращены) — вердикт и список:
[SVODNAYA_VS_2025_STAGE1_COMPARISON.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/stage1/SVODNAYA_VS_2025_STAGE1_COMPARISON.md).
Канал backfill — решение человека; иначе восстановить на стадии `[3]`.

### Словник закрыт 43/43: строка 221 очищена по рулингу МГ (H2776)

Рулинг МГ 15-08-2026: `[без тега не искать]` удалено из колонки `C` строки 221
листа «Предметы и термины». `repair-workbook` получил канал `--clear-prose SHEET:ROW`
(+ обязательная `--ruling-note`, фиксируется в ledger; не-whitelisted проза остаётся
`WAITING`). Repair перегнан с оригинала 05_18: **43/43 fixed, 0 WAITING, валидатор
чист, второй прогон 0 операций.** Новый канон —
[`xls/derived/Указатель_к_Рамаяне_1_2_2026_08_15.xlsx`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/xls/derived)
(`…08_12.xlsx` упразднён), [ledger](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/dictionary/correction-ledger.md)
перевыпущен; workspace пилота обновлён. 25 pytest. Ловушка MANUAL «проза в C завешивает
стадию [3]» для пилота снята.

### Шаг 6 (пилот книги I) запущен: waiver гейта применён, машинная половина выполнена (H2776)

Waiver МГ 15-08-2026 по адъюдикации H2770 (Fable 5 `claude-fable-5`):

- `conversion-gate` — waiver-каналы (`--waive-overset-story-id`, `--waive-missing-links`,
  обязательный `--waiver-note`; waived-пункты остаются в ledger); вердикт
  **`PASS_WITH_WAIVERS`** для книги I —
  [gate-report-waived.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/gate-report-waived.json). 23 pytest.
- Новый additive-инструмент
  [`tools/indesign/resolve_overset.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/resolve_overset.py)
  + [`resolve_overset.jsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/resolve_overset.jsx):
  снял 3 waived overset-истории в версионной pilot-копии тредингом 5 extension-фреймов
  на pasteboard (текст не удалялся; страницы посимвольно идентичны — 0/442 отличий).
- Pilot workspace + corrected workbook подключены; операторская половина — по
  [PILOT_BOOK_I_OPERATOR_RUNBOOK_2026.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/PILOT_BOOK_I_OPERATOR_RUNBOOK_2026.md)
  (стадии `[1]`–`[4]`, ≈3–6 ч; строка 221 словника — `WAITING` до решения человека).

## 2026-08-14

### Overset книги I адъюдицирован без InDesign — DFT-I-0002 опровергнут как blocker (H2770)

Ответ на открытый пункт H2589 (Fable 5 `claude-fable-5`): overset — результат
вёрстки, которого IDML не хранит, но overset-текст не попадает в PDF, поэтому
дифф IDML-историй против рендера + постраничный дифф пруфов решают вопрос
детерминированно. Новый инструмент
[`Litpam-Indexator/tools/overset_textdiff.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/overset_textdiff.py)
(режимы `stories` / `pages`, переиспользуем для книги II):

- **0 из 442 страниц** отличаются между пруфом 2022 и конвертацией 2026 —
  посимвольная идентичность текста и пагинации;
- все три overset-истории безобидны (титульная строка, копирайт, тегированная
  рабочая история `c-`/`d-` — не Именной указатель, вопреки атрибуции дефекта);
- **DFT-I-0002: blocker → cosmetic / pre-existing-by-design**; человеку остаётся
  формальный waiver гейта + строка 221 словника.

Разбор: [`OVERSET_TEXTDIFF_ADJUDICATION_BOOK_I_2026.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/overset-adjudication-2026/OVERSET_TEXTDIFF_ADJUDICATION_BOOK_I_2026.md).

### Deterministic print-readiness tooling + conversion gate книги I = FAIL (H2589)

Шаги 2–5 плана print-readiness (работа Sonnet 5 `claude-sonnet-5`; сессия упала до
коммита — crash-recovery доставка Fable 5 `claude-fable-5`,
[PR #65](https://github.com/gasyoun/RussianRamayana/pull/65)):

- **[`Litpam-Indexator/tools/print_ready.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/print_ready.py)** + пакет
  [`tools/print_ready/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/tools/print_ready):
  `repair-workbook` / `audit-idml` / `audit-pdf` / `coverage` / `verify-packet` /
  `conversion-gate`; 20 pytest-тестов зелёные.
- **Словник**: 42/43 находок валидатора исправлены идемпотентно в
  [`xls/derived/Указатель_к_Рамаяне_1_2_2026_08_12.xlsx`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/xls/derived);
  ledger — [`artifacts/print-readiness/dictionary/correction-ledger.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/dictionary/correction-ledger.md);
  1 `WAITING` (строка 221 `[без тега не искать]` — решение за человеком).
- **Conversion gate книги I: FAIL** —
  [`gate-report.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/conversion-2026/gate-report.json):
  DFT-I-0002 (blocker) — 3 overset-истории после 2022→2026, вероятно сам Именной
  указатель; DFT-I-0001 (material) — 6 `LINK_MISSING`, правдоподобно pre-existing.
  Шаг 6 (пилот) по собственному условию входа не запускался; книга II (H2590)
  остаётся gated. Статус: `HUMAN_REVIEW_WAITING` — полный разбор в
  [`PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md).

### Print-контракт четырёх указателей книг I–II (H2588)

Первая волна плана print-readiness (шаг 1, Fable 5 `claude-fable-5`): измеренный по
PDF-пруфам 12.10.25 единый контракт оформления указателей.

- **[`Litpam-Indexator/docs/print-readiness/INDEX_STYLE_SPEC.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/INDEX_STYLE_SPEC.md)** —
  геометрия полосы/колонок, сетка отступов двух уровней, шрифтовая система,
  локаторы/диапазоны/полужирные ссылки примечаний, модель «см.», фурнитура;
  таблица D1–D10 межтомных различий с классификацией
  intentional / defect / review-required.
- **[`DEFECT_POLICY.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/DEFECT_POLICY.md)** —
  классы blocker/material/cosmetic, default-диспозиции по рулингу 23, формат
  defect ledger.
- **[`BOOK_I_REVIEW_CHECKLIST.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/BOOK_I_REVIEW_CHECKLIST.md)** —
  детерминированная выборка ручной проверки (A1–A10 по статьям, B1–B5 по полосам).
- **[`Litpam-Indexator/config/print-readiness.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/config/print-readiness.json)** —
  машиночитаемые пороги/defaults; субъективное одобрение как test PASS не
  кодируется (`notes_bold_page_ranges` = null до baseline IDML в H2589).
- `.gitignore` — `/Litpam-Indexator/work/print-readiness/` (рабочие копии пакетов).
- Production-файлы (packages, PDF, XLSX, `.jsx`) не тронуты — только additive docs/config.

## 2026-08-05

### Публичные аннотации каталога переводов (H1857)

Каждая запись каталога [`translations.html`](https://github.com/gasyoun/RussianRamayana/blob/main/translations.html) получила русскую
аннотацию в 2–4 предложения: что это за перевод/пересказ, с чего выполнен, подход
и кому подойдёт.

- **`data/translations.json`** — новое поле `annotation` у всех 6 записей; факты
  взяты только из уже закоммиченных источников ([`data/editions.json`](https://github.com/gasyoun/RussianRamayana/blob/main/data/editions.json),
  [`reception.html`](https://github.com/gasyoun/RussianRamayana/blob/main/reception.html), правила контента в [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/CLAUDE.md)/[`roadmap.md`](https://github.com/gasyoun/RussianRamayana/blob/main/roadmap.md)). Незафиксированные
  детали (год Книги IV, годы русских изданий пересказов) явно помечены как
  неизвестные, не выдуманы.
- **`data/retellings.json`** — `description` всех 3 записей расширен до полной
  аннотации; пересказы последовательно маркированы как «не перевод с санскрита»
  (правило «Эрман = пересказ»).
- **`translations.html`** — карточка перевода теперь рендерит `item.annotation`
  над строками «Охват»/«Издание» (пересказы уже рендерили `description`).
- **`data/schema/translations.schema.json`** — поле `annotation` задекларировано;
  `scripts/validate_data.py` — 18 schema-validated, 0 failed.
- Оценочный язык — описательный (подход, охват, адресат), без ранжирования
  переводчиков.
- Аннотации: Fable 5 (`claude-fable-5`).

## 2026-08-01

### DH_ROADMAP Фаза 0 закрыта (H2061) — stale-tick + audio URL switch

Пункт drain Tier-2: [`docs/DH_ROADMAP.md`](docs/DH_ROADMAP.md) Фаза 0.

- Truth-pass: `.ai_state.md`, `_meta/` gitignore-disposition, `web-src/cover-og.png` — уже
  сделаны 2026-06-12; чекбоксы в DH_ROADMAP были stale и отмечены.
- **`resolveAudioUrl(track)`** в [`js/utils.js`](js/utils.js): единая точка замены хоста
  аудио (`ia_url` → `url`, https-only). Подключено в `audio.html`, `index.html`,
  `media.html` вместо прямого `track.url`. Когда Фаза 1 заполнит `ia_url` (archive.org),
  плееры переключатся без правок страниц. Сейчас `url` по-прежнему raw.github.

## 2026-07-27

### Импорт донатов Boosty/Patreon → summary.json (H1515)

Роадмап-пункт «Настройка автоматического импорта донатов из Boosty и Patreon в
`summary.json`» (roadmap.md:184-198 + architecture.md §Учёт пожертвований).

- **`scripts/import_donations.py`** — нормализует выгрузку Boosty/Patreon/generic
  CSV в приватный реестр (поля: date/platform/amount/currency/amount_rub/fee/
  net_amount_rub/donor_name/public_name/anonymous/reward_level/comment/source_id),
  сливает по `source_id` (повторный запуск идемпотентен), публикует в
  `data/fundraising/summary.json` **только агрегаты**
  (`onetime.collected_rub/donor_count`, `monthly.pledged_rub/supporter_count`,
  `updated_at`) — бакет one-time/subscription берётся из уже существующего
  `data/payment-methods.json`. Имена доноров в публичный файл никогда не попадают.
- Реального экспорта Boosty/Patreon в репозитории ещё нет — раскладки колонок
  best-effort, проверены на синтетических фикстурах (`tests/fixtures/`); свериться
  с реальной выгрузкой при первом реальном импорте.
- Приватный реестр (`donations_private.csv`, уже в `.gitignore`) в репозиторий не
  попадает.

## 2026-07-14

### Среда переводчика — Wave 3: контекст сноски (H943, ответ на отзыв Леонова)

Отзыв М. В. Леонова по [issue #35](https://github.com/gasyoun/RussianRamayana/issues/35):
форма **А** удобна и выбрана, но «сама идея не работает — в Пахтании я вижу
контекст, а здесь контекста нет, всё равно придётся смотреть Пахтание». Сноска
давала передачи классиков + глоссу БЕЗ контекста. Рулинг МГ: сделать все три вида
контекста, Леонов сам выберет, какой убирает поход в «Пахтание» (SamudraManthanam).

- **Новый модуль `translator-env/src/context.py`** — три контекст-слоя из того же
  корпуса JSONL, что читает SamudraManthanam (движок не дублируется):
  **(1) конкорданс** (KWIC: где ещё форма встречается в корпусе Рамаяны, строка +
  русская параллель, слово выделено); **(2) пассаж-источник** (резолв locus
  `work:passage` → строку корпуса за передачей классика, с предпочтением одиночной
  строфы Рамаяны и KWIC-окном для диапазонных loci МБ/кавьи); **(3) соседние шлоки**.
- **`src/gen_sheets.py`** — форма А (лист-обозрение) несёт все три слоя, цветокодированы,
  с легендой-вопросом Леонову. Флаг `--context all|none|concord,passage,neighbors`
  (после выбора Леонова лист пересобирается с одним слоем).
- Русская параллель есть у кн. I–V (Гринцер I–IV, Леонов V); VI–VII — только санскрит.
- Приватность без изменений: листы/данные в `.gitignore`, в репозиторий только код.
  [PR](https://github.com/gasyoun/RussianRamayana/pulls) · метадок — [`VALIDATION_SARGA1.meta.md`](https://github.com/gasyoun/RussianRamayana/blob/main/translator-env/VALIDATION_SARGA1.meta.md).

## 2026-07-12

### Среда переводчика — Wave 0, пилот на Сундараканде (H764)

- **`translator-env/`** — новый подпроект: автосноски по трудным словам для
  перевода Рамаяны М. В. Леонова (кн. 5–7). Пилот на саргах 1–2 Сундараканды.
- **Движок трудности** (`src/difficulty.py`), 2 яруса: **A** — расхождение
  классиков по семьям основ (взвешено вхождениями, с частотным потолком: ловит
  `kālāntaka` n=6/4 передачи, не `mahat` n=994/флексия); **B** — нечастотное
  слово с аттестованной передачей. Плюс селф-TM Леонова, дедуп против его
  заметок + tier-2 аппарата, подавление глагольных/служебных форм. Сигнал (в)
  лог-499 запросов — СТАБ до экспорта с машины Леонова.
- **Листы в 3 формах** (`src/gen_sheets.py` + `src/render_docx.py`): офлайн
  HTML-обозрение, `.docx` с настоящими Word-сносками (pandoc), web-мок reader.
- **Проба DeepSeek** (`src/deepseek_synth.py`) — машинная сводка расхождений на
  первых 5 шлоках, вшита в листы с меткой «(машинная сводка)».
- **Валидация** против ручного аппарата Леонова (`translator-env/VALIDATION_SARGA1.md`):
  difficulty-recall 61.5 %, ~2.5 сноски/шлока. Находка — расхождение рецензий
  аппарат↔корпус (37 % лемм аппарата недостижимы как поверхностная форма).
- ⚠️ **Приватность**: листы (`sheets/`) и промежуточные данные (`data/`)
  встраивают защищённые копирайтом передачи (Кочергина 1987, современные
  переводы, подстрочник Леонова) — в `.gitignore`, НЕ публикуются; в репозиторий
  только код и отчёт. [PR #25](https://github.com/gasyoun/RussianRamayana/pull/25).

## [1.0.0] - 2026-06-13

### Changed
- Released the current changelog state as version 1.

## 2026-06-12

### DH-инфраструктура: роадмап, права, идентификаторы (Фазы 0–3)

- **Роадмап**: создан `docs/DH_ROADMAP.md` (5 фаз приведения к DH-стандартам). Решения: портал (не корпус), аудио → Internet Archive, полный LOD-каркас.
- **Гигиена**: `_meta/` исключена из git (материалы RuWritingStyles); создан отсутствовавший `web-src/cover-og.png` (OG-превью было битым на 13 страницах); `.ai_state.md`.
- **Аудио 1986**: подтверждена атрибуция — перевод В. Потаповой, частная запись Е. Кривецкого; `data/audio.json` дополнен полями `translator`, `file`, `size_bytes`, `sha256`, `rights`; `scripts/audio_inventory.py`; манифест IA-загрузки `docs/ia-upload.md`. ⚠️ Разрешение Кривецкого (2026) покрывает только запись; права на текст Потаповой не урегулированы — публичность IA-item заблокирована (см. `docs/RIGHTS.md`).
- **Права**: раздельное лицензирование — Apache 2.0 (код), CC BY 4.0 (`LICENSE-data.md`, данные и документация); реестр прав `docs/RIGHTS.md`; поле `rights` в audio/videos/drafts.json; обложки подтверждены как ИИ-генерация (CC BY).
- **Цитируемость**: `CITATION.cff`; экспорт библиографии `scripts/export_bibliography.py` → `data/export/bibliography.{csl.json,bib}`, ссылки на `bibliography.html`.
- **Идентификаторы (проверены по Wikidata)**: Гринцер Q4149672/VIAF 35823334, Потапова Q15720383, Серебряный Q4417419, Эрман Q4532534, Нарайян Q334252, Вальмики Q715607, Рамаяна Q37293, серия ЛП Q4263826 — внесены в `people.json`, `editions.json`, `retellings.json`. ISBN изданий: кн. I–II 5-86218-454-6, кн. III 978-5-86218-522-5. У Леонова и Кривецкого items в Wikidata нет.
- **Исправления каталога**: пересказ Эрмана — на деле «Рамаяна» Э.Н. Темкина и В.Г. Эрмана, М.: Наука, **1965** (не 1980); издание Потаповой 1986 — отдельная книга «Худлит», ~6000 строк, до эпохи ISBN.
- **JSON-LD**: `index.html` (WebSite + about Q37293), `translations.html` (CollectionPage + Book/ISBN/sameAs), `audio.html` (Audiobook + readBy/translator), `project.html` (Person + sameAs).

## 2026-05-15

### Фаза 1: Краудфандинговый каркас

- **Созданы JSON-данные**:
  - `data/fundraising/summary.json` — счётчик сбора.
  - `data/project-status.json` — статусы книг IV-VI.
  - `data/payment-methods.json` — способы оплаты.
- **Создана страница поддержки**:
  - `support.html` — центральный узел сбора средств с прогресс-барами, способами оплаты и описанием статуса проекта.
- **Обновлена главная страница**:
  - Добавлен акцентированный блок поддержки (CTA) "Поддержать перевод" на первый экран `index.html`.
  - Внедрена краткая формула: "Гринцер начал, Леонов продолжает".
  - Указаны статусы книг V и VI.
- **Архитектура**:
  - Внедрена загрузка данных через `fetch` для `support.html`, обеспечивающая легкое обновление цифр через JSON.

### Фаза 2: Каталог переводов и пересказов

- **Созданы JSON-данные**:
  - `data/translations.json` — каталог академических переводов и подстрочников с санскрита.
  - `data/retellings.json` — каталог пересказов (Эрман, Нарайян) и адаптаций.
- **Создана страница каталога**:
  - `translations.html` — структурированный каталог с жестким разделением типов (Перевод, Подстрочник, Пересказ, Адаптация).
- **Обновлена главная страница**:
  - Добавлен блок входа в каталог переводов под блоком поддержки.
- **Контент**:
  - Систематизированы данные по Гринцеру, Леонову, Серебряному и Потаповой.
  - Эрман и кришнаитские материалы вынесены в отдельный раздел пересказов.

### Фаза 3: Страница проекта (Гринцер -> Леонов)

- **Созданы JSON-данные**:
  - `data/people.json` — реестр ключевых участников проекта с описанием их ролей (Гринцер, Леонов, Костина, Гасунс).
  - `data/videos.json` — реестр видеоматериалов и цитат.
- **Создана страница проекта**:
  - `project.html` — подробная история перевода, объяснение преемственности от академической школы П.А. Гринцера к М.В. Леонову, статус "Литературных памятников" и видео-блок.
- **Обновлена главная страница**:
  - Добавлен блок входа в историю проекта под каталогом переводов.
- **Контент**:
  - Сформулирована позиция по "проблеме Книги IV" (Серебряный).
  - Зафиксирована роль Е.А. Костиной как редактора и М.Ю. Гасунса как руководителя.

### Фаза 4: Хронология и начало Сундараканды

- **Созданы JSON-данные**:
  - `data/timeline.json` — вехи русской Рамаяны (1986–2029).
  - `data/comparison-episodes.json` — данные для curated-чтения (санскрит, подстрочник, поэзия).
- **Созданы новые разделы**:
  - `timeline.html` — визуальная хронология проекта.
  - `compare/sundarakanda-start.html` — первая страница сравнительного чтения (начало 5-й книги).
- **Обновлена главная страница**:
  - Добавлены блоки входа для хронологии и сравнительного чтения.
- **Интеграция**:
  - Обеспечена связь сравнительного чтения с внешним корпусом на `samskrtam.ru`.

### Фаза 5: Инвентаризация материалов и медиа

- **Создан реестр материалов**:
  - `docs/content-inventory.md` — полный аудит аудио, видео, текстов и изображений с назначением статусов готовности.
- **Созданы JSON-данные**:
  - `data/audio.json` — метаданные аудиокниги 1986 года (длительность, чтец, ссылки).
- **Создана страница медиа-архива**:
  - `media.html` — галерея видеоматериалов и интерактивный плейлист аудиокниги.
- **Обновлена главная страница**:
  - Добавлен блок входа в медиа-архив.
- **Организация**:
  - Намечены этапы обработки материалов из Яндекс Диска, ВК и Telegram на следующие кварталы.

## 2026-05-14

### Добавлено

- Создан `roadmap.md` с долгосрочной дорожной картой проекта.
- Зафиксирована миссия сайта: главный русскоязычный ресурс о переводах, пересказах, аудио, сканах, OCR, библиографии, видео и параллельном корпусе Валмики-Рамаяны.
- Зафиксирована центральная задача: поддержка продолжения проекта П.А. Гринцера и завершение первого полного русского поэтического академического перевода Валмики-Рамаяны с санскрита М.В. Леоновым.
- Зафиксирована цель краудфандинга: `1 000 000 руб.`
- Зафиксирована команда проекта:
  - М.Ю. Гасунс — руководитель проекта;
  - М.В. Леонов — переводчик;
  - Костина — редактор.
- Создан текущий `CHANGELOG.md`.

### Уточнено

- Эрмана следует описывать как автора пересказа, а не перевода.
- Потабенко не включается как переводчик Рамаяны.
- Кришнаитские материалы предварительно относятся к пересказам и адаптациям, а не к переводам избранных мест.
- Основная аудитория сайта — широкая публика.
- Английская версия пока не планируется.
- Поиск по текстам не нужен на этом сайте, так как он уже сделан в другом репозитории.
- Права на публикацию материалов есть.
- Связь с серией `Литературные памятники` можно формулировать публично.

### Статус Работы

- Книга IV: застряла на вступительной статье; проект пока не может повлиять на этот блокер.
- Книга V: перевод завершён; комментарии готовы примерно на две трети; указатели оцениваются примерно в полгода работы.
- Книга VI: черновой литературный перевод готов полностью.

### Краудфандинг

- Основные статьи сбора: перевод, комментарии, в меньшей степени редактура.
- Нужны разовые пожертвования и регулярная подписка.
- Минимальный значимый уровень подписки: `500 руб.` или предпочтительно `1000 руб.` в месяц.
- Нужны разные платёжные каналы: Boosty, Сбер, отдельный вариант для зарубежных доноров.
- Нужны публичный счётчик собранного и ежемесячные отчёты.
- Реалистичные бонусы: отчёты, закрытые черновики, имя в благодарностях на сайте, печатный экземпляр.
- Zoom-встречи не планируются как обязательный бонус.

### Открытые Решения

- Как публично формулировать проблему книги IV.
- Как именно разбить сумму `1 000 000 руб.` на понятные донорские этапы.
- Какие платёжные каналы использовать для зарубежных доноров.
- Какие материалы вынести на главную страницу, а какие оставить на втором уровне.
- Каким тоном писать главную: торжественным, научно-популярным или прямо краудфандинговым.

### Решения После Уточнений

- Книгу IV публично можно описывать прямо с именем Серебряного.
- Книгу IV нужно показывать на странице сбора как часть общей истории проекта, но честно писать, что текущий сбор на неё не влияет.
- Для книг I-II фиксируется библиографическое описание издания `Рамаяна : [в 7 кн.] / подгот. П. А. Гринцер. - Москва : Ладомир : Наука, 2006- ...`.
- Для книги III фиксируется издание `Кн. 3: Араньяканда (книга о лесе). - 2014. - 397, [1] с.; ISBN 978-5-86218-522-5`.
- По книге V публично можно говорить, что до завершения комментария остаётся около года работы.
- Фрагменты чернового литературного перевода книги VI показывать только подписчикам.
- Екатерину Костину указывать как Екатерину Александровну Костину; редактор, исследователь и преподаватель санскрита, хинди и индоарийских языков.
- Для М.В. Леонова выбрана краткая публичная формула: переводчик санскритской литературы, автор опубликованных переводов санскритской поэзии и специалист по передаче поэтической формы оригинала на русском языке.
- Для М.Ю. Гасунса пока использовать краткую формулу: руководитель проекта, санскритолог.
- В институциональном контексте можно указывать издательство `Наука`.
- Цитаты Леонова из видео можно и нужно превращать в текстовые цитаты для страницы сбора.
- Срок сбора `1 000 000 руб.`: полгода.
- Уровни подписки предварительно: `1000`, `3000`, `5000`, `10000` руб.; названия уровней нужны, но суммы и бонусы следует уточнить после анализа прежних сборов на Planeta.ru.
- Бонусы распределить предварительно так: отчёты, закрытые черновики, имя на сайте, печатный экземпляр.
- Зарубежные платежи: PayPal через посредника, Patreon, банковский перевод. Криптовалюту не использовать.
- Первым эпизодом для сравнительного чтения выбрать начало Сундараканды.
- Главный акцент первого экрана главной страницы: сбор на завершение перевода.

### Следующий Раунд Вопросов

- Следующие вопросы перенесены в `roadmap.md` в формате `Q1`, `Q2`, чтобы номера сохранялись при копировании в Notepad.

### Решения Второго Раунда

- Публичная формулировка проблемы книги IV должна быть жёсткой, с именем Серебряного.
- Связь с `Литературными памятниками` формулировать как `готовится для серии`.
- Месячную цель сбора показывать как `166 000 руб.`
- Общий счётчик сбора должен быть на сайте.
- Для учёта поступлений предложена автоматизация: единый приватный реестр поступлений, импорт выгрузок разных платформ, нормализация скриптом и публикация только агрегированных данных в `summary.json`.
- По прежним сборам на Planeta.ru есть данные за 10 кампаний: суммы, число доноров, средний взнос, уровни и бонусы. Эти данные нужно использовать для настройки уровней новой кампании.
- Названия уровней подписки должны быть в образах Рамаяны.
- Материалы лежат на Яндекс Диске, частично в ВК и Telegram-каналах, а также на `samskrtam.ru`.
- Вопрос о немедленной публикации материалов требует отдельного аудита.
- Расшифровки видео нужны для сайта и цитат Леонова.
- Нужна отдельная страница `Хронология русской Рамаяны`.
- Каталог переводов и пересказов пока делать отдельным разделом.
- Переводы, подстрочники, пересказы и адаптации нужно жёстко разделять.
- Карту и аудио оставить вторым уровнем.
- Тон главной страницы: прямой краудфандинговый.
- Ориентировочный срок подготовки книги V: 2027 год.
- Работа над книгой VI продолжится после сбора средств; оптимальный ориентир — 2029 год.
- За подготовку указателей отвечает к.ф.н. М.Ю. Гасунс.
- После завершения перевода и комментариев нужен отдельный сбор на печатную подготовку.

### Новые Открытые Вопросы

- Как назвать уровни подписки в образах Рамаяны.
- Какой технический формат выбрать для реестра пожертвований: локальный CSV/JSON или таблица с экспортом.
- Какие материалы инвентаризировать первыми.
- Какой текст и CTA поставить на первый экран главной.
- Как выдавать закрытые черновики подписчикам.

### Архитектура Внедрения

- Создан `architecture.md` с практической архитектурой перехода от одного `index.html` к статическому data-driven сайту.
- Зафиксирован стартовый принцип: оставить GitHub Pages и не вводить тяжёлый фреймворк на первом этапе.
- Предложена структура `data/*.json` для статусов книг, переводов, пересказов, аудио, видео, хронологии, платёжных способов и публичного счётчика.
- Предложены основные страницы: `support.html`, `project.html`, `translations.html`, `timeline.html`, `audio.html`, `media.html`, `compare/sundarakanda-start.html`.
- Зафиксирован первый внедряемый этап: создать JSON-данные проекта и сбора, добавить новый краудфандинговый первый экран и отдельную страницу поддержки.
- Зафиксировано, что приватные донорские данные не должны попадать в публичный репозиторий.

### Implementation Plan

- Создана папка `docs/implementation/` с планом внедрения для Gemini Flash.
- План разбит на документы короче 100 строк:
  - `README.md`;
  - `phase-1-crowdfunding.md`;
  - `phase-1-data-contracts.md`;
  - `verification-and-tests.md`;
  - `verification-automated.md`;
  - `verification-manual.md`.
- Зафиксированы ограничения для первой фазы: не трогать MP3, PDF, изображения, карту, аудио-логику и приватные данные доноров.
- Зафиксированы критерии приёмки: валидный JSON, наличие `support.html`, видимый CTA, отсутствие приватных данных, отсутствие новых больших файлов, сохранность аудио и карты.
- Добавлены команды автоматической проверки и ручной браузерный чеклист.
