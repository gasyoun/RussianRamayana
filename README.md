# Русская Рамаяна (Russian Ramayana)

_Created: 15-05-2026 · Last updated: 28-08-2026_

Цифровой портал, архив переводов и краудфандинговая платформа для завершения первого полного поэтического академического перевода «Рамаяны» Вальмики на русский язык.

🌐 **Сайт:** <https://gasyoun.github.io/RussianRamayana/>

## О проекте

Сайт объединяет наследие академической школы П. А. Гринцера и современные труды М. В. Леонова по переводу великого санскритского эпоса. Проект осуществляется Обществом ревнителей санскрита под руководством М. Ю. Гасунса.

## Архитектура

**Data-driven static site** — без фреймворков, без сборки для разработки. Чистый HTML5/CSS3/ES6+; каждая страница во время загрузки читает данные из `data/*.json` через `fetch`. Чтобы обновить контент, достаточно отредактировать JSON — страница подхватит изменения. Общие стили — в `style.css`.

Единственная опциональная сборка нужна только для публикации: [`scripts/prerender.py`](https://github.com/gasyoun/RussianRamayana/blob/main/scripts/prerender.py) (headless Chromium) «запекает» data-driven страницы в статический HTML в `dist/` для SEO/архивации; запускается из [`.github/workflows/deploy.yml`](https://github.com/gasyoun/RussianRamayana/blob/main/.github/workflows/deploy.yml) при деплое на GitHub Pages (источник Pages — GitHub Actions). Для локальной разработки сборка не нужна.

Технические подробности архитектуры — в [`architecture.md`](https://github.com/gasyoun/RussianRamayana/blob/main/architecture.md).

### Страницы

| Страница | Назначение |
|---|---|
| `index.html` | Главная, точки входа в разделы, сбор средств |
| `support.html` | Краудфандинг: разовые и ежемесячные сборы, уровни, способы оплаты |
| `translations.html` | Каталог переводов и пересказов |
| `bibliography.html` | Библиография изданий + экспорт BibTeX/CSL |
| `rights.html` | Публичная страница «Права и источники» |
| `project.html` | История проекта (Гринцер → Леонов) и команда |
| `timeline.html` | Хронология проекта |
| `reception.html` | «Рамаяна в России» — история русских переводов |
| `recensions.html` | «Рецензии и текст» — текстология эпоса |
| `kandas.html` | «Структура эпоса» — семь книг (кāṇḍ) |
| `characters.html` | Действующие лица: карта связей (LOD) |
| `compare/` | Сравнительное чтение: санскрит · подстрочник · перевод |
| `ramayana-map-leaflet.html` | Карта странствий Рамы (Leaflet) + газетир |
| `media.html`, `audio.html` | Аудио- и видео-архив, аудиокнига 1986 г. |
| `indexing-pipeline.html` | Конвейер построения предметных указателей (см. подпроект Litpam-Indexator) |
| `drafts.html` | Черновики Книг V–VI (для подписчиков) |
| `reports.html` | Отчеты о сборе средств |

## Данные (`data/`)

**Каталоги.** `editions.json` — каноническая библиографическая запись (ISBN, Wikidata/VIAF, рецензия); `translations.json` — витрина для `translations.html` (связана с `editions.json` общим `id`); `retellings.json` — пересказы.

**Эпос.** `characters.json` — 20 героев с QID Викиданных и ребрами связей; `kandas.json` — семь книг (число глав, краткое содержание); `comparison-episodes.json` — ключевые сцены с санскритом и каноническими ссылками.

**География.** `rama-route.json` — маршрут (точки, сегменты, область Дандаки); `gazetteer-extra.json` — места вне маршрута.

**Медиа и проект.** `audio.json`, `videos.json`, `drafts.json`, `reports.json`, `people.json`, `project-status.json`, `timeline.json`; `fundraising/summary.json`, `fundraising/levels.json`, `payment-methods.json` (см. [data/fundraising/README.md](https://github.com/gasyoun/RussianRamayana/blob/main/data/fundraising/README.md)).

**Схемы.** `data/schema/*.schema.json` — JSON Schemas; проверяются в CI (см. [data/schema/README.md](https://github.com/gasyoun/RussianRamayana/blob/main/data/schema/README.md)).

**Экспорт** (генерируется скриптами, в репозитории): `data/export/` — `rama-route.geojson`, `gazetteer.geojson`, `bibliography.csl.json`, `bibliography.bib`.

## FAIR / связанные данные (LOD)

- **Идентификаторы.** Люди и издания связаны с **Wikidata** и **VIAF**; персонажи и места — с Wikidata; на страницах — микроразметка schema.org (JSON-LD).
- **Канонические ссылки.** Цитируемые фрагменты адресуются как `R.kāṇḍa.sarga.śloka` по **южной рецензии** (valmikiramayan.net); подробности — на странице «Рецензии и текст».
- **Экспорт.** Маршрут и газетир — в **GeoJSON** (RFC 7946); библиография — в **CSL-JSON** и **BibTeX**.
- **Датасет.** [`datapackage.json`](https://github.com/gasyoun/RussianRamayana/blob/main/datapackage.json) (Frictionless) описывает все наборы данных; цитирование — [`CITATION.cff`](https://github.com/gasyoun/RussianRamayana/blob/main/CITATION.cff).

## Скрипты (`scripts/`)

| Скрипт | Назначение |
|---|---|
| `validate_data.py` | Проверка `data/*.json`: разбор + валидация по схемам |
| `check_links.py` | Проверка доступности внешних ссылок |
| `audio_inventory.py` | Размер/SHA-256/длительность MP3 (через ffprobe) |
| `export_bibliography.py` | `editions.json` → CSL-JSON + BibTeX |
| `export_geojson.py` | `rama-route.json` → GeoJSON (точки, полигон, линия) |
| `export_gazetteer.py` | Маршрут + extra → газетир GeoJSON |
| `prerender.py` | Опциональная сборка для деплоя: запекание страниц в `dist/` (headless Chromium) |
| `update-counter.ps1` | Обновление счетчика сбора средств (`fundraising/summary.json`) |

После правки данных перегенерируйте экспорт соответствующим скриптом.

## Подпроекты

В репозитории живут два самостоятельных рабочих комплекта того же переводческого проекта (свой `git remote` у них отсутствует — это подпапки):

- **[`Litpam-Indexator/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator)** — рабочий комплект для построения предметных указателей (именного, географического, предметов и терминов, флоры и фауны) к двухтомному академическому изданию (серия «Литературные памятники», перевод П. А. Гринцера). Набор ExtendScript-скриптов (`.jsx`) для Adobe InDesign + Pascal/Lazarus-утилита сверки тегов + тегированный текст и Excel-словарь; автор — Михаил Иванюшин. Операторское руководство — [`docs/indesign-pipeline/MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md); живая страница конвейера — [`indexing-pipeline.html`](https://github.com/gasyoun/RussianRamayana/blob/main/indexing-pipeline.html). Подробности — в [`Litpam-Indexator/README.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/README.md).
- **[`Leitan-Sundarakanda/`](https://github.com/gasyoun/RussianRamayana/tree/main/Leitan-Sundarakanda)** — подготовка санскритского исходника («сверка санскрита») к переводу Книги V (*Сундара-канда*): рабочие черновики текста *Сундараканды* по изданию Parab 1888 с комментарием *Тилака*, в виде `.docx` (авторитетный источник) и зеркальных `.md` для чтения и диффов. Подробности — в [`Leitan-Sundarakanda/README.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Leitan-Sundarakanda/README.md).

## Непрерывная интеграция

[`.github/workflows/ci.yml`](https://github.com/gasyoun/RussianRamayana/blob/main/.github/workflows/ci.yml) на каждый push/PR:
- **Validate data JSON** — разбор + проверка по схемам (блокирующая);
- **Link health** — доступность внешних ссылок (неблокирующая);
- ruff / black / pytest / YAML-lint для Python-инструментов.

Деплой на GitHub Pages — [`.github/workflows/deploy.yml`](https://github.com/gasyoun/RussianRamayana/blob/main/.github/workflows/deploy.yml) (prerender → `dist/` → Pages). Анализ безопасности — [`.github/workflows/codeql.yml`](https://github.com/gasyoun/RussianRamayana/blob/main/.github/workflows/codeql.yml).

## Документация (`docs/`) и корневые документы

- [content-inventory.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/content-inventory.md) — реестр материалов; [use-cases.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/use-cases.md) — сценарии; [RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md) — реестр прав; [DH_ROADMAP.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/DH_ROADMAP.md) — план развития; [ia-upload.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/ia-upload.md) — манифест загрузки аудио на Internet Archive.
- Корневые: [`roadmap.md`](https://github.com/gasyoun/RussianRamayana/blob/main/roadmap.md) — продуктовые решения, открытые вопросы (Q1–Q15) и риски; [`architecture.md`](https://github.com/gasyoun/RussianRamayana/blob/main/architecture.md) — техническая архитектура; [`CHANGELOG.md`](https://github.com/gasyoun/RussianRamayana/blob/main/CHANGELOG.md) — рабочий журнал изменений.

## Как этот репозиторий связан с остальными

Проект — часть организационного «хребта» из примерно 85 репозиториев; ниже — что он отдаёт
наружу, кто это читает и куда записывать находки.

- **Что производит.** Конвейер печатной готовности «Литпамятников» (*Litpam print-readiness
  lane*): детерминированный набор для сборки предметных указателей и проверки готовности к
  печати двухтомного академического издания —
  [`Litpam-Indexator/tools/print_ready.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/print_ready.py)
  и ExtendScript-инструменты
  [`Litpam-Indexator/tools/indesign/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/tools/indesign),
  порог качества —
  [`Litpam-Indexator/config/print-readiness.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/config/print-readiness.json),
  версионированные артефакты (`gate-report.json`, покрытие, `defect-ledger.json`, IDML и
  proof-PDF по каждой книге) —
  [`Litpam-Indexator/artifacts/print-readiness/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/artifacts/print-readiness).
  Операторское руководство —
  [`docs/indesign-pipeline/MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md).
  Кому нужен воспроизводимый контракт «указатель + готовность к печати» для русской книги —
  берёт этот конвейер, а не строит второй.
- **Кто читает.** ⚠️ **Пока никто.** Конвейер зарегистрирован рёбром графа в
  [PROJECT_INTERLINKS.md](https://github.com/gasyoun/Uprava/blob/main/PROJECT_INTERLINKS.md)
  и [interlinks_edges.tsv](https://github.com/gasyoun/Uprava/blob/main/interlinks_edges.tsv)
  28-08-2026 **на перспективу** (решение F5): проверка по всем соседним клонам показала, что
  ни один репозиторий его сегодня не читает. **Условие снятия:** если к следующей переписи
  связности реального потребителя не назовут, строка удаляется, а вердикт репозитория в
  [INTERLINKS_COVERAGE_LEDGER.tsv](https://github.com/gasyoun/Uprava/blob/main/INTERLINKS_COVERAGE_LEDGER.tsv)
  возвращается к `standalone-by-design`.
- **Куда писать находки.** Инфраструктура и процесс —
  [Uprava/FINDINGS.md](https://github.com/gasyoun/Uprava/blob/main/FINDINGS.md); санскритские
  данные — [SanskritLexicography/FINDINGS.md](https://github.com/gasyoun/SanskritLexicography/blob/master/FINDINGS.md).
  Своих реестров этот репозиторий не держит (решение F1).
- **Общий код.** Прежде чем писать нормализатор, транскриптор, парсер или экспортёр —
  [SHARED_CODE.md](https://github.com/gasyoun/github-spine/blob/main/SHARED_CODE.md).
- **Что уже существует.**
  [FEATURES_INDEX.md](https://github.com/gasyoun/SanskritLexicography/blob/master/FEATURES_INDEX.md).
- **Что делать дальше / кто решает.**
  [GTD_NEXT_ACTIONS.md](https://github.com/gasyoun/Uprava/blob/main/GTD_NEXT_ACTIONS.md).

## Лицензии и права

Лицензирование раздельное:

- **Код сайта** (HTML/CSS/JS, Python) — [Apache 2.0](https://github.com/gasyoun/RussianRamayana/blob/main/LICENSE).
- **Метаданные** (`data/*.json`) **и документация** — [CC BY 4.0](https://github.com/gasyoun/RussianRamayana/blob/main/LICENSE-data.md).
- **Контент** (аудио, тексты переводов, изображения, видео) — права на каждый материал индивидуальны; см. публичную страницу [rights.html](https://github.com/gasyoun/RussianRamayana/blob/main/rights.html) и канонический реестр [docs/RIGHTS.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/RIGHTS.md).

Вклад в проект — см. [CONTRIBUTING.md](https://github.com/gasyoun/RussianRamayana/blob/main/CONTRIBUTING.md) и [CODE_OF_CONDUCT.md](https://github.com/gasyoun/RussianRamayana/blob/main/CODE_OF_CONDUCT.md).

---
Проект осуществляется при поддержке Общества ревнителей санскрита.

_Dr. Mārcis Gasūns_
