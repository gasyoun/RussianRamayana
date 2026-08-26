# DH-роадмап: приведение «Русской Рамаяны» к стандартам цифровой гуманитаристики

_Created: 12-06-2026 · Last updated: 26-08-2026_

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
- [ ] **(A — можно делать сейчас)** Добавить поле `rights` в каждый объект `editions.json`, `audio.json`, `retellings.json`, `videos.json`. Проверено 26-08-2026: **audio 7/7 ✔, videos 1/1 ✔, editions 0/6 ✘, retellings 0/3 ✘.** Пункт выполнен наполовину; формулы берутся из готового реестра [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md), внешних данных не требуется.
- [x] Опубликовать резюме письменного разрешения на аудио 1986 г. (без персональных данных). — готово: строка «Аудиозапись „Рамаяны“ 1986 г. (7 MP3) · Е. Кривецкий (запись) · InC · Письменное разрешение правообладателя записи, 2026 г.» в [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md), персональные данные не раскрыты (правило того же файла: «Персональные данные доноров и приватные договорённости в реестр не заносятся»).

## Фаза 3 — FAIR / LOD-каркас (≈2–3 недели)

- [ ] **(A)** **Идентификаторы людей**: в [data/people.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/people.json) и авторах каталога — поля `wikidata`, `viaf`. Проверено 26-08-2026: заполнен **1 из 4** (Гринцер — `Q4149672`, VIAF `35823334`); у Леонова, Костиной, Гасунса оба поля пусты. **Исправление:** «Гринцер = Q4147525» в исходной редакции этого пункта было опечаткой — верный QID **Q4149672**, перепроверено 2026-06-12 и записано в [.ai_state.md](https://github.com/gasyoun/RussianRamayana/blob/main/.ai_state.md); в `people.json` стоит уже верный. Заготовки по остальным: [docs/wikidata-drafts.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/wikidata-drafts.md). Создание новых Wikidata-items для Леонова и Кривецкого — **не** этот пункт: по [.ai_state.md](https://github.com/gasyoun/RussianRamayana/blob/main/.ai_state.md) на это нужно согласие М. Г.
- [ ] **(A + C)** **Идентификаторы изданий**: ISBN для всех изданий в [data/editions.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/editions.json) — проверено 26-08-2026: **2 из 6** (`grintser-1-2` 5-86218-454-6, `grintser-3` 978-5-86218-522-5), а не «1 из 6»; `wikidata` — **0 из 6**. Простановка ISBN по выходным данным — A; создание недостающих Wikidata-items для серии «Литературные памятники» — внешняя правка, C.
- [x] **schema.org JSON-LD** в `<head>` всех страниц: `Book`/`PublicationVolume`, `Person`, `AudioObject`, `DonateAction`, `WebSite`. — готово: проверено 26-08-2026, `application/ld+json` присутствует на **17 из 17** HTML-страниц репозитория.
- [x] **bibliography.json** (задача 5 из roadmap.md) с экспортом: скрипт `scripts/export_bibliography.py` → CSL-JSON + BibTeX в `data/export/`. — готово: [scripts/export_bibliography.py](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/export_bibliography.py) → [data/export/bibliography.csl.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/export/bibliography.csl.json) + [data/export/bibliography.bib](https://github.com/gasyoun/RussianRamayana/blob/main/data/export/bibliography.bib), оба в git; обе выгрузки прилинкованы со страницы [bibliography.html](https://github.com/gasyoun/RussianRamayana/blob/main/bibliography.html).
- [ ] **(A + C)** **Цитируемость**: [CITATION.cff](https://github.com/gasyoun/RussianRamayana/blob/main/CITATION.cff) **готов** (version 0.2.0, date-released 2026-06-12) — открытыми остаются Zenodo DOI релиз-снапшота (C: внешний аккаунт), страница «Как цитировать» (A) и запрос Software Heritage save (C). Поле `doi` в `CITATION.cff` пустое и заполняется после Zenodo.
- [ ] **(C — человек)** **Wikidata-обратная связь**: у items изданий — свойство «полный текст доступен на» → samskrtam.ru, «аудио» → archive.org. Правки во внешнем проекте; «аудио» дополнительно ждёт публичного IA-item (Фаза 1).

## Фаза 4 — Канонические ссылки и источники данных (≈1 неделя)

Портал не хранит тексты, но всё цитируемое обязано иметь канонический адрес.

- [x] [data/comparison-episodes.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/comparison-episodes.json): каждому фрагменту — ключ `canonical_ref` вида `R.5.1.1–8` (кāṇḍa.sarga.śloka, южная редакция) + `source_url` на конкретный якорь параллельного корпуса samskrtam.ru. — готово: все 8/8 эпизодов несут `canonical_ref`.
- [x] [data/rama-route.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/rama-route.json): поле `source` у каждой точки — чья идентификация локализации (издание/исследование); без атрибуции DH-карта не цитируема. — готово: все 11/11 точек несут `source`.
- [x] [data/timeline.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/timeline.json): поле `source` у событий; стабильные `id`. — готово: все 6/6 событий несут `id` и `source`.
- [ ] **(A)** Каталог переводов: поле `recension` (южная/северная). **Формулировка «в JSON отсутствует» неверна** — проверено 26-08-2026: поле есть у **6 из 6** изданий в [data/editions.json](https://github.com/gasyoun/RussianRamayana/blob/main/data/editions.json). Настоящий остаток другой: у **5 из 6** стоит заглушка «уточняется», реальное значение проставлено только у `potapova`. Пункт = проставить редакцию для оставшихся пяти по выходным данным изданий.

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
| **A — агент может сделать сейчас** | 4 | `rights` в `editions.json` (0/6) и `retellings.json` (0/3) · `recension` вместо пяти заглушек · `wikidata`/`viaf` для Леонова, Костиной, Гасунса по [docs/wikidata-drafts.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/wikidata-drafts.md) · ISBN для четырёх изданий · страница «Как цитировать» |
| **B — специфицировано, ждёт артефакта** | 3 | `ia_url` (0/7) — после IA-item · состав репо после `filter-repo` · синхронизация с продуктовым роадмапом |
| **C — требуется акт человека** | 7 | Решение по правам наследников Потаповой · публикация IA-item · сведение MP3 V–VI · `filter-repo` + force-push со снятием branch protection · Zenodo DOI и ежегодный снапшот · Software Heritage · правки в Wikidata (включая создание items, на которое нужно согласие М. Г.) |

Ни один пункт дорожки C в этом проходе не исполнялся: выкачивание медиа и
force-push прямо запрещены заданием, а публикация записи упирается в
неурегулированные права.

---

## Чего сознательно НЕ делаем (решение «портал, не корпус»)

- TEI/XML-разметка текстов переводов — остаётся на стороне samskrtam.ru / отдельного корпусного репозитория.
- Полнотекстовый поиск — уже реализован вне этого репо (правило из CLAUDE.md).
- Английская версия — не планируется (roadmap.md).

Если решение изменится в сторону «корпус здесь», первой задачей станет verse-addressable хранилище с ключами kāṇḍa.sarga.śloka — Фаза 4 закладывает совместимую систему ссылок заранее.

---

_Dr. Mārcis Gasūns_
