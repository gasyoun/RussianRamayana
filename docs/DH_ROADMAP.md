# DH-роадмап: приведение «Русской Рамаяны» к стандартам цифровой гуманитаристики

_Created: 12-06-2026 · Last updated: 27-08-2026_

> **Human-gate 27-08-2026** (Grok 4.6 `grok-4.6`). The next open unit is a human act — fetch MP3 of books V and VI from Yandex Disk — not `/roadmap-item-exec` for an agent. Do not tick the box. Do not fetch the files.

Составлен 2026-06-12. Дополняет [roadmap.md](https://github.com/gasyoun/RussianRamayana/blob/main/roadmap.md) (продуктовый/краудфандинговый
план) — здесь только инфраструктура данных, идентификаторы, права и долговременное хранение.

**Зафиксированные решения (М.Ю. Гасунс, 2026-06-12):**

1. Репозиторий остаётся **порталом**: канонические тексты живут на samskrtam.ru; здесь — метаданные, каталог, сбор средств, медиа-указатели.
2. Аудиокнига 1986 г. переезжает на **Internet Archive**; MP3 вычищаются из git-истории.
3. ~~Права на аудио 1986 г. **очищены письменно** — публикуем открыто с явным rights statement.~~ **Пересмотрено 26-08-2026 — см. врезку ниже.**
4. FAIR-уровень: **полный LOD-каркас** (Wikidata + VIAF + JSON-LD + DOI + CITATION.cff).

> **Статус-проверка 26-08-2026 (H3003).** Каждый открытый пункт этого файла сверен
> с диском, а не с прозой. Главный результат — **решение № 3 в его исходной
> формулировке больше не верно**, и это меняет предпосылку всей Фазы 1.
>
> Письменное разрешение 2026 г. покрывает **только запись** (Е. Кривецкий), но не
> **текст перевода В. Потаповой**: наследники (ум. 1992, права действуют) не
> урегулированы — [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md), строка «Текст перевода
> В. Потаповой» («⚠️ НЕ УРЕГУЛИРОВАНО») и раздел «Открытые вопросы», пункт 1:
> «До решения — **НЕ** делать item публичным». Поскольку в записи звучит именно
> этот перевод, «публикуем открыто» из решения № 3 не исполнимо до отдельного
> решения человека. Пункты Фазы 1, зависящие от публичности IA-item, отмечены
> ниже как **C — требуется решение/действие человека**.
>
> Шесть пунктов оказались **сделанными, но не отмеченными** (Фазы 2, 3, 5);
> пять утверждений оказались фактически неверными. Обе группы разобраны в
> разделе «Статус-проверка 26-08-2026 — кто разблокирует каждый открытый пункт»
> в конце файла.

---

## Фаза 0 — Гигиена репозитория (≈1 день)

- [x] Создать `.ai_state.md` по орг-конвенции (см. CLAUDE.md уровня GitHub/). — готово 2026-06-12; живой журнал с 4 каноническими секциями.
- [x] Разобрать `_meta/`: рабочие документы (AUDIT.md, FAQ.md, HANDOFF.md, стайлгайды) → `docs/internal/`; AI-сгенерированные PNG-черновики дизайна — удалить из трекинга (вычистятся из истории в Фазе 1). — готово 2026-06-12: disposition = `_meta/` в `.gitignore` (RuWritingStyles-скрапы, не портальный контент); `docs/internal/` не создавался. PNG-черновики выйдут из истории в Фазе 1 вместе с MP3.
- [x] Проверить, что `cover-og.png` (указан в OpenGraph) реально существует и отдаётся. — готово 2026-06-12: [`web-src/cover-og.png`](https://github.com/gasyoun/RussianRamayana/blob/main/web-src/cover-og.png) (1200×630); OG на страницах указывает на `…/web-src/cover-og.png`.
- [x] В `js/utils.js` и страницах — подготовить точку замены URL аудио (сейчас `raw.githubusercontent.com`, это нестабильный хостинг медиа). — готово 2026-08-01 ([H2061](https://github.com/gasyoun/Uprava/blob/main/handoffs/H2061-Grok_RussianRamayana_dh-phase0-audio-url-switch_01.08.26.md)): `resolveAudioUrl(track)` в [`js/utils.js`](https://github.com/gasyoun/RussianRamayana/blob/main/js/utils.js) предпочитает `ia_url` → `url`; wired в `audio.html`, `index.html`, `media.html`. Фаза 1 заполняет `ia_url` — плееры переключатся без правок страниц.

## Фаза 1 — Аудио → Internet Archive + чистка git-истории (≈1 неделя)

Вся фаза стоит на решении № 3, которое 26-08-2026 признано неверным (врезка выше).
Ни один пункт здесь **не** является инженерным «просто сделать».

- [ ] **(C — человек)** Свести воедино MP3 всех 7 книг. Исходная формулировка — «получить MP3 книг V и VI с Яндекс Диска (сейчас в `.gitignore`, архив неполон)» — не подтверждается: [.ai_state.md](https://github.com/gasyoun/RussianRamayana/blob/main/.ai_state.md) (Dev Notes) утверждает «MP3 всех 7 книг ЕСТЬ локально (V–VI просто в `.gitignore`) — Яндекс Диск не нужен», тогда как в проверенном 26-08-2026 клоне на диске лежат **пять** файлов (книги 1, 2, 3, 4, 7; ≈306 MiB, все **в git**), а книг V–VI нет. Две записи одного дня противоречат друг другу; какая из машин держит полный комплект — установить может только человек. Агент **не** выкачивает медиа сам.
- [ ] **(C — человек)** Создать item(ы) на archive.org: `ramayana-russian-1986` — все 7 книг, метаданные (чтец Е. Кривецкий, перевод В. Потаповой, 1986), обложки, rights statement. **Блокировано** пунктом «Открытые вопросы» № 1 в [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md): до урегулирования с наследниками Потаповой item не делается публичным. Черновик процедуры загрузки: [docs/ia-upload.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/ia-upload.md).
- [ ] **(B — ждёт артефакта)** Дозаполнить [data/audio.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/audio.json). Проверено 26-08-2026: `ia_identifier` **7/7**, `sha256` **7/7**, `rights` **7/7** — не хватает только `ia_url` (**0/7**), а он появляется лишь после предыдущего пункта. Пока поле пусто, `resolveAudioUrl()` из Фазы 0 работает вхолостую и отдаёт старый `url`.
- [ ] **(C — человек)** Переписать историю (`git filter-repo`): удалить все `*.mp3`/`*.MP3` и `_meta/*.png`-черновики.
  - ⚠️ Force-push: снять/вернуть branch protection; предупредить соавторов о re-clone. Агенту force-push запрещён — это действие человека.
  - **Оценка «~480 MB → <30 MB» неверна.** Измерено 26-08-2026: `.git` = **740 MB**. Пять MP3 дают ≈306 MiB, то есть меньше половины. Остальные ≈430 MB — это подпроекты, которых этот роадмап вообще не упоминает: `Leitan-Sundarakanda` (≈308 MB, 650 файлов) и `Litpam-Indexator` (≈128 MB, 452 файла), плюс `_meta/IMG_8076.MOV` (26.6 MB), `teg_exp.exe` (24.7 MB) и `.indd` (28.7 MB). Удаление одних MP3 даёт примерно 740 → 434 MB, а не «<30 MB». Реалистичная цель требует отдельного решения по двум подпроектам ([README.md](https://github.com/gasyoun/RussianRamayana/blob/main/README.md) их описывает, этот файл — нет).
- [ ] **(B)** В репо остаются: метаданные, контрольные суммы, обложки `web/` (оптимизированные).

## Фаза 2 — Права и лицензии (≈3 дня) — **выполнена**

- [x] Разделить лицензирование: `LICENSE` (Apache 2.0 — только код), `LICENSE-data.md` (CC BY 4.0 для `data/*.json` и документации), per-item права на контент. — готово: [LICENSE](https://github.com/gasyoun/RussianRamayana/blob/main/LICENSE) + [LICENSE-data.md](https://github.com/gasyoun/RussianRamayana/blob/main/LICENSE-data.md) на диске.
- [x] Создать `docs/RIGHTS.md` + страницу «Права и источники»: для каждого материала — правообладатель, основание публикации, стандартная формула (rightsstatements.org). — готово: [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md) (12 строк реестра, разделы «Открытые вопросы» и «Правила») + страница [rights.html](https://github.com/gasyoun/RussianRamayana/blob/main/rights.html).
- [x] **(A — исполнено 26-08-2026, [PR #103](https://github.com/gasyoun/RussianRamayana/pull/103))** Добавить поле `rights` в каждый объект `editions.json`, `audio.json`, `retellings.json`, `videos.json`. Было 26-08-2026: **audio 7/7 ✔, videos 1/1 ✔, editions 0/6 ✘, retellings 0/3 ✘**; стало **audio 7/7, videos 1/1, editions 6/6, retellings 3/3**. Формулы взяты дословно из [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md); для библиографических описаний добавлен новый **объект № 13** реестра. Поле объявлено в [data/schema/editions.schema.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/schema/editions.schema.json) и [data/schema/retellings.schema.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/schema/retellings.schema.json) по образцу `audio.schema.json`, так что CI-job `data-validate` его проверяет. Замер: `scripts/validate_data.py` — 19 файлов, 18 схемных, 0 падений.
- [x] Опубликовать резюме письменного разрешения на аудио 1986 г. (без персональных данных). — готово: строка «Аудиозапись „Рамаяны“ 1986 г. (7 MP3) · Е. Кривецкий (запись) · InC · Письменное разрешение правообладателя записи, 2026 г.» в [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md), персональные данные не раскрыты (правило того же файла: «Персональные данные доноров и приватные договорённости в реестр не заносятся»).

## Фаза 3 — FAIR / LOD-каркас (≈2–3 недели)

- [x] **(A — исполнено наполовину 26-08-2026, [PR #103](https://github.com/gasyoun/RussianRamayana/pull/103); остаток переклассифицирован в C)** **Идентификаторы людей**: в [data/people.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/people.json) и авторах каталога — поля `wikidata`, `viaf`. Проверено 26-08-2026: заполнен **1 из 4** (Гринцер — `Q4149672`, VIAF `35823334`); у Леонова, Костиной, Гасунса оба поля пусты. **Исправление:** «Гринцер = Q4147525» в исходной редакции этого пункта было опечаткой — верный QID **Q4149672**, перепроверено 2026-06-12 и записано в [.ai_state.md](https://github.com/gasyoun/RussianRamayana/blob/main/.ai_state.md); в `people.json` стоит уже верный. Заготовки по остальным: [docs/wikidata-drafts.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/wikidata-drafts.md). Создание новых Wikidata-items для Леонова и Кривецкого — **не** этот пункт: по [.ai_state.md](https://github.com/gasyoun/RussianRamayana/blob/main/.ai_state.md) на это нужно согласие М. Г.
  **Сделано 26-08-2026:** Гасунсу проставлен `viaf` **1158167565597098750002** — существующий кластер VIAF (заголовок «Gasuns, Marcis Jurʹevič 1983-», единственный источник DNB/GND `1279528044`), т. е. поиск и запись уже существующего идентификатора, а не создание записи. Стало **viaf 2 из 4, wikidata 1 из 4**.
  **Переклассифицировано в дорожку C с замером:** у Леонова и Костиной **нет ни одной записи VIAF** (`viaf.org/AutoSuggest` ничего не возвращает) и **нет Wikidata-item** (`wbsearchentities` пуст по «Гасунс», «Marcis Gasuns», «Mārcis Gasūns», «Леонов», «Костина»). Проставлять нечего — недостающее пришлось бы **создавать**, а на создание items нужно согласие М. Г. Полный замер и техническая записка о VIAF API — [docs/wikidata-drafts.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/wikidata-drafts.md), раздел «Замер 26-08-2026 (H3558)».
- [ ] **(B + C — переклассифицировано 26-08-2026 из A + C)** **Идентификаторы изданий**: ISBN для всех изданий в [data/editions.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/editions.json) — проверено 26-08-2026: **2 из 6** (`grintser-1-2` 5-86218-454-6, `grintser-3` 978-5-86218-522-5), а не «1 из 6»; `wikidata` — **0 из 6**. Простановка ISBN по выходным данным была намечена как A; создание недостающих Wikidata-items для серии «Литературные памятники» — внешняя правка, C.
  **Замер, переклассифицировавший половину A в B (26-08-2026, [PR #103](https://github.com/gasyoun/RussianRamayana/pull/103)):** агентского остатка **нет**. У `potapova` в её собственном `description` сказано, что издание 1986 года вышло **до введения ISBN в СССР**; `serebryany-4` (`blocked`), `leonov-5` (`in-progress`) и `leonov-6` (`draft-ready`) **не опубликованы** и не имеют даже поля `year` — ISBN у них ещё не существует. Проставлены остаются те же **2 из 6**, и это не пробел, а полнота. Пункт ждёт артефакта (выхода книг), т. е. дорожка B; `wikidata` для изданий остаётся C.
- [x] **schema.org JSON-LD** в `<head>` всех страниц: `Book`/`PublicationVolume`, `Person`, `AudioObject`, `DonateAction`, `WebSite`. — готово: проверено 26-08-2026, `application/ld+json` присутствует на **17 из 17** HTML-страниц репозитория.
- [x] **bibliography.json** (задача 5 из roadmap.md) с экспортом: скрипт `scripts/export_bibliography.py` → CSL-JSON + BibTeX в `data/export/`. — готово: [scripts/export_bibliography.py](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/export_bibliography.py) → [data/export/bibliography.csl.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/export/bibliography.csl.json) + [data/export/bibliography.bib](https://github.com/gasyoun/RussianRamayana/blob/main/data/export/bibliography.bib), оба в git; обе выгрузки прилинкованы со страницы [bibliography.html](https://github.com/gasyoun/RussianRamayana/blob/main/bibliography.html).
- [ ] **(C — половина A исполнена 26-08-2026, [PR #103](https://github.com/gasyoun/RussianRamayana/pull/103))** **Цитируемость**: [CITATION.cff](https://github.com/gasyoun/RussianRamayana/blob/main/CITATION.cff) **готов** (version 0.2.0, date-released 2026-06-12). **Страница «Как цитировать» — [cite.html](https://github.com/gasyoun/RussianRamayana/blob/main/cite.html) — написана и связана** (ссылки из `index.html`, `rights.html`, `bibliography.html`, строка в `sitemap.xml`): ГОСТ Р 7.0.5-2008, APA 7, BibTeX, выгрузки `data/export/*`, лицензии по объектам реестра и правило «пересказ не цитируется как перевод». **DOI на странице не выдуман** — сказано прямо, что его нет. Открытыми остаются Zenodo DOI релиз-снапшота (C: внешний аккаунт) и запрос Software Heritage save (C); поле `doi` в `CITATION.cff` заполняется после Zenodo.
- [ ] **(C — человек)** **Wikidata-обратная связь**: у items изданий — свойство «полный текст доступен на» → samskrtam.ru, «аудио» → archive.org. Правки во внешнем проекте; «аудио» дополнительно ждёт публичного IA-item (Фаза 1).

## Фаза 4 — Канонические ссылки и источники данных (≈1 неделя)

Портал не хранит тексты, но всё цитируемое обязано иметь канонический адрес.

- [x] [data/comparison-episodes.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/comparison-episodes.json): каждому фрагменту — ключ `canonical_ref` вида `R.5.1.1–8` (кāṇḍa.sarga.śloka, южная редакция) + `source_url` на конкретный якорь параллельного корпуса samskrtam.ru. — готово: все 8/8 эпизодов несут `canonical_ref`.
- [x] [data/rama-route.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/rama-route.json): поле `source` у каждой точки — чья идентификация локализации (издание/исследование); без атрибуции DH-карта не цитируема. — готово: все 11/11 точек несут `source`.
- [x] [data/timeline.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/timeline.json): поле `source` у событий; стабильные `id`. — готово: все 6/6 событий несут `id` и `source`.
- [x] **(A — исполнено 26-08-2026, [PR #103](https://github.com/gasyoun/RussianRamayana/pull/103))** Каталог переводов: поле `recension` (южная/северная). **Формулировка «в JSON отсутствует» неверна** — проверено 26-08-2026: поле есть у **6 из 6** изданий в [data/editions.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/editions.json). Настоящий остаток другой: у **5 из 6** стоит заглушка «уточняется», реальное значение проставлено только у `potapova`. Пункт = проставить редакцию для оставшихся пяти по выходным данным изданий. **Сделано:** заглушек «уточняется» осталось **0**. `leonov-6` — южная (вульгата), выведено из [data/YUDDHA_GITASUPERSITE_COMPARISON_REPORT.md](https://github.com/gasyoun/RussianRamayana/blob/main/data/YUDDHA_GITASUPERSITE_COMPARISON_REPORT.md) (5728 строф против 5209 у Gita Supersite, 5031 сопоставленная пара, 3353 почти совпадающих); `leonov-5` — южная (вульгата), по [data/comparison-episodes.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/comparison-episodes.json) (эпизод `R.5.1.1`). Для `grintser-1-2`, `grintser-3` и `serebryany-4` вместо заглушки стоит честное «не установлена» с указанием причины: в выходных данных «Литературных памятников» редакция не оговорена. Ни одна HTML-страница это поле не читает (страница сравнения берёт `recension` из `comparison-episodes.json`), так что правка ничего не ломает.

## Фаза 5 — Непрерывность (постоянно)

- [x] CI-проверка JSON-схем (`data/schema/*.json` + валидация в ci.yml). — готово: job `data-validate` («Validate data JSON») в [.github/workflows/ci.yml](https://github.com/gasyoun/RussianRamayana/blob/main/.github/workflows/ci.yml) запускает [scripts/validate_data.py](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/validate_data.py) против **18** схем в [data/schema/](https://github.com/gasyoun/RussianRamayana/tree/main/data/schema). Прежняя приписка «сейчас JSON никак не валидируется» устарела.
- [ ] **(C — человек)** Ежегодный Zenodo-снапшот с новой версией DOI. Ждёт первого DOI (Фаза 3).
- [ ] **(B)** Синхронизация с продуктовым [roadmap.md](https://github.com/gasyoun/RussianRamayana/blob/main/roadmap.md): задачи Q3–Q4 2026 (расшифровки, импорт донатов, карта, библиография) идут параллельно и не блокируются этим планом. Библиография, которая была здесь названа единственной зависимостью, **уже выгружена** (Фаза 3) — эта оговорка снята.

---

## Статус-проверка 26-08-2026 (H3003) — кто разблокирует каждый открытый пункт

Проверка проведена в рамках [H3003](https://github.com/gasyoun/Uprava/blob/main/handoffs/H3003-Opus_multi_stale-roadmap-s5-dh-narrative-ask-replan_17.08.26.md)
(Opus 5, `claude-opus-5`). Метод: каждый открытый чек-бокс сверялся с диском —
наличие файлов, подсчёт заполненных полей по каждому JSON, имена job в `ci.yml`,
`git ls-files`, измерение `.git`. Проза роадмапа и README доказательством не считались.
Новый пятидокументный `/ask`-комплект **не** заводился: этому файлу не хватало не
плана, а актуального статуса (форма «truth-passed, no new set»).

### Что оказалось не так

| № | Утверждение в файле | Что на диске 26-08-2026 |
|---|---|---|
| 1 | Решение № 3: права на аудио «очищены письменно — публикуем открыто» | Разрешение покрывает только **запись**; текст перевода Потаповой не урегулирован, публичность IA-item явно запрещена до решения ([docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md)) |
| 2 | Фаза 5: «сейчас JSON никак не валидируется» | Job `data-validate` в `ci.yml` + `scripts/validate_data.py` + 18 схем |
| 3 | Фаза 4: поле `recension` «в JSON отсутствует» | Поле есть у 6/6; у 5/6 значение — заглушка «уточняется» |
| 4 | Фаза 1: «~480 MB → <30 MB» после `filter-repo` | `.git` = 740 MB; MP3 ≈ 306 MiB, ещё ≈430 MB — два подпроекта, не названные в этом файле |
| 5 | Фаза 3: «Гринцер = Q4147525» | Верный QID — **Q4149672** (перепроверено 2026-06-12); в `people.json` стоит верный |
| 6 | Фаза 3: ISBN «сейчас 1 из 6» | 2 из 6 |
| 7 | Фаза 1: «архив неполон», MP3 V–VI брать с Яндекс Диска | `.ai_state.md` того же дня: все 7 книг есть локально, Яндекс Диск не нужен. Противоречие не разрешается агентом |

Шесть пунктов были выполнены, но не отмечены: Фаза 2 (LICENSE-split, RIGHTS.md,
резюме разрешения), Фаза 3 (JSON-LD, экспорт библиографии), Фаза 5 (CI-валидация).

### Кто разблокирует остаток

| Дорожка | Пунктов | Что это |
|---|---|---|
| **A — агент может сделать сейчас** | 0 (было 5) | Пусто: 26-08-2026 ([PR #103](https://github.com/gasyoun/RussianRamayana/pull/103)) исполнены `rights` (editions 6/6, retellings 3/3), `recension` (0 заглушек), `viaf` Гасунса и страница «Как цитировать». ISBN ушёл в B, создание items — в C |
| **B — специфицировано, ждёт артефакта** | 4 (было 3) | `ia_url` (0/7) — после IA-item · состав репо после `filter-repo` · синхронизация с продуктовым роадмапом · **ISBN для четырёх изданий — ждёт выхода книг, агентского остатка нет** |
| **C — требуется акт человека** | 8 (было 7) | Решение по правам наследников Потаповой · публикация IA-item · сведение MP3 V–VI · `filter-repo` + force-push со снятием branch protection · Zenodo DOI и ежегодный снапшот · Software Heritage · правки в Wikidata (включая создание items, на которое нужно согласие М. Г.) · **создание Wikidata-items и записей VIAF для Леонова и Костиной — их не существует, проставлять нечего** |

Ни один пункт дорожки C в этом проходе не исполнялся: выкачивание медиа и
force-push прямо запрещены заданием, а публикация записи упирается в
неурегулированные права.

Исполнение дорожки A — 26-08-2026, [PR #103](https://github.com/gasyoun/RussianRamayana/pull/103). Ни одна строка не оставлена
молча: четыре отмечены исполненными со ссылкой на PR, пятая (ISBN)
переклассифицирована в B с замером, который её сдвинул.

---

## Чего сознательно НЕ делаем (решение «портал, не корпус»)

- TEI/XML-разметка текстов переводов — остаётся на стороне samskrtam.ru / отдельного корпусного репозитория.
- Полнотекстовый поиск — уже реализован вне этого репо (правило из CLAUDE.md).
- Английская версия — не планируется (roadmap.md).

Если решение изменится в сторону «корпус здесь», первой задачей станет verse-addressable хранилище с ключами kāṇḍa.sarga.śloka — Фаза 4 закладывает совместимую систему ссылок заранее.

---

_Dr. Mārcis Gasūns_
