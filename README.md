# Русская Рамаяна (Russian Ramayana)

Цифровой портал, архив переводов и краудфандинговая платформа для завершения первого полного поэтического академического перевода «Рамаяны» Вальмики на русский язык.

🌐 **Сайт:** <https://gasyoun.github.io/RussianRamayana/>

## О проекте

Сайт объединяет наследие академической школы П. А. Гринцера и современные труды М. В. Леонова по переводу великого санскритского эпоса. Проект осуществляется Обществом ревнителей санскрита под руководством М. Ю. Гасунса.

## Архитектура

**Data-driven static site** — без сборки, без фреймворков. Чистый HTML5/CSS3/ES6+; каждая страница во время загрузки читает данные из `data/*.json` через `fetch`. Чтобы обновить контент, достаточно отредактировать JSON — страница подхватит изменения. Общие стили — в `style.css`.

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
| `drafts.html` | Черновики Книг V–VI (для подписчиков) |
| `reports.html` | Отчеты о сборе средств |

## Данные (`data/`)

**Каталоги.** `editions.json` — каноническая библиографическая запись (ISBN, Wikidata/VIAF, рецензия); `translations.json` — витрина для `translations.html` (связана с `editions.json` общим `id`); `retellings.json` — пересказы.

**Эпос.** `characters.json` — 20 героев с QID Викиданных и ребрами связей; `kandas.json` — семь книг (число глав, краткое содержание); `comparison-episodes.json` — ключевые сцены с санскритом и каноническими ссылками.

**География.** `rama-route.json` — маршрут (точки, сегменты, область Дандаки); `gazetteer-extra.json` — места вне маршрута.

**Медиа и проект.** `audio.json`, `videos.json`, `drafts.json`, `people.json`, `project-status.json`, `timeline.json`; `fundraising/summary.json`, `fundraising/levels.json`, `payment-methods.json` (см. [data/fundraising/README.md](data/fundraising/README.md)).

**Схемы.** `data/schema/*.schema.json` — JSON Schemas; проверяются в CI (см. [data/schema/README.md](data/schema/README.md)).

**Экспорт** (генерируется скриптами, в репозитории): `data/export/` — `rama-route.geojson`, `gazetteer.geojson`, `bibliography.csl.json`, `bibliography.bib`.

## FAIR / связанные данные (LOD)

- **Идентификаторы.** Люди и издания связаны с **Wikidata** и **VIAF**; персонажи и места — с Wikidata; на страницах — микроразметка schema.org (JSON-LD).
- **Канонические ссылки.** Цитируемые фрагменты адресуются как `R.kāṇḍa.sarga.śloka` по **южной рецензии** (valmikiramayan.net); подробности — на странице «Рецензии и текст».
- **Экспорт.** Маршрут и газетир — в **GeoJSON** (RFC 7946); библиография — в **CSL-JSON** и **BibTeX**.
- **Датасет.** [`datapackage.json`](datapackage.json) (Frictionless) описывает все наборы данных; цитирование — [`CITATION.cff`](CITATION.cff).

## Скрипты (`scripts/`)

| Скрипт | Назначение |
|---|---|
| `validate_data.py` | Проверка `data/*.json`: разбор + валидация по схемам |
| `check_links.py` | Проверка доступности внешних ссылок |
| `audio_inventory.py` | Размер/SHA-256/длительность MP3 (через ffprobe) |
| `export_bibliography.py` | `editions.json` → CSL-JSON + BibTeX |
| `export_geojson.py` | `rama-route.json` → GeoJSON (точки, полигон, линия) |
| `export_gazetteer.py` | Маршрут + extra → газетир GeoJSON |

После правки данных перегенерируйте экспорт соответствующим скриптом.

## Непрерывная интеграция

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) на каждый push/PR:
- **Validate data JSON** — разбор + проверка по схемам (блокирующая);
- **Link health** — доступность внешних ссылок (неблокирующая);
- ruff / black / pytest / YAML-lint для Python-инструментов.

## Документация (`docs/`)

[content-inventory.md](docs/content-inventory.md) — реестр материалов; [use-cases.md](docs/use-cases.md) — сценарии; [RIGHTS.md](docs/RIGHTS.md) — реестр прав; [DH_ROADMAP.md](docs/DH_ROADMAP.md) — план развития; [ia-upload.md](docs/ia-upload.md) — манифест загрузки аудио на Internet Archive.

## Лицензии и права

Лицензирование раздельное:

- **Код сайта** (HTML/CSS/JS, Python) — [Apache 2.0](LICENSE).
- **Метаданные** (`data/*.json`) **и документация** — [CC BY 4.0](LICENSE-data.md).
- **Контент** (аудио, тексты переводов, изображения, видео) — права на каждый материал индивидуальны; см. публичную страницу [rights.html](rights.html) и канонический реестр [docs/RIGHTS.md](docs/RIGHTS.md).

Вклад в проект — см. [CONTRIBUTING.md](CONTRIBUTING.md) и [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---
Проект осуществляется при поддержке Общества ревнителей санскрита.
