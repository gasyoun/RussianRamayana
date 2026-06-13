# JSON-схемы данных

Каждый файл `<basename>.schema.json` — это [JSON Schema](https://json-schema.org/)
(draft 2020-12) для одноимённого файла данных (`data/<basename>.json`, включая
вложенные, напр. `data/fundraising/summary.json` ← `summary.schema.json`).

## Зачем

Сайт статический и читает данные через `fetch` в рантайме. Одна сломанная
запятая в JSON роняет страницу молча. Поэтому в CI ([.github/workflows/ci.yml](../../.github/workflows/ci.yml),
job **Validate data JSON**) на каждый push/PR прогоняется
[scripts/validate_data.py](../../scripts/validate_data.py):

1. **Парсинг** — каждый `data/*.json` должен быть корректным UTF-8 JSON.
2. **Схема** — если рядом есть схема, файл проверяется на структуру
   (обязательные поля, типы, форматы — даты, SHA-256, QID и т.п.).

Файлы без схемы проходят с пометкой `parse-only` — новый файл данных не ломает
CI до того, как для него написана схема. Сгенерированные данные
(`data/export/`) не проверяются.

## Локальный запуск

```sh
pip install jsonschema
python scripts/validate_data.py
```

## Правила

- Схемы намеренно нестрогие к лишним полям (`additionalProperties: true`):
  добавить новое поле в данные можно без правки схемы. Обязательные поля —
  только те, на которые реально опираются страницы.
- Добавили новый `data/*.json` — заведите для него схему здесь (или оставьте
  parse-only, если структура ещё не устоялась).
- `reports.json` пока parse-only — схема не написана.
