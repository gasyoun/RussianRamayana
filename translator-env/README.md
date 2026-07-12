# translator-env — среда переводчика (пилот, H764 Wave 0)

_Created: 12-07-2026 · Last updated: 12-07-2026_

Автоматические сноски по трудным словам для перевода Рамаяны М. В. Леонова
(книги 5–7). К каждой шлоке среда даёт аттестованные передачи классиков с locus
и словарные глоссы — вместо ручных запросов в словарь. Пилот — на саргах 1–2
Сундараканды (кн. V), где есть валидационная база: ручной аппарат самого Леонова.

> ⚠️ **Приватность.** Сгенерированные листы (`sheets/`) и промежуточные данные
> (`data/`) встраивают защищённые копирайтом передачи (Кочергина 1987,
> современные переводы, подстрочник Леонова) и полный корпусный текст — они в
> `.gitignore` и **НЕ публикуются**. В репозитории — только код и отчёт-анализ.
> Любой шаг к публикации — через `/publish-safety-check`.

## Конвейер

```
# 1. извлечь валидационные леммы из ручного аппарата (сарга 1)
python src/parse_apparatus.py            # -> data/apparatus_sarga1.json

# 2. движок трудности: 4 сигнала -> кандидаты (сарги 1–2)
python src/difficulty.py --sargas 1,2    # -> data/candidates.json

# 3. валидация против аппарата (recall / шум)
python src/validate.py                   # -> отчёт в stdout; см. VALIDATION_SARGA1.md

# 4. листы сносок (модель + HTML-обозрение + web-мок + Markdown)
python src/gen_sheets.py --sargas 1,2    # -> sheets/{sarga_N.html, web_mock_sarga_N.html, sarga_N.md}

# 5. проба машинной сводки (DeepSeek) на первых 5 шлоках
python src/deepseek_synth.py --sarga 1 --n 5   # -> sheets/deepseek_synth_sarga1.json (+ кэш)

# 6. пересобрать листы, чтобы вшить сводки, затем .docx с настоящими footnotes
python src/gen_sheets.py --sargas 1,2
python src/render_docx.py --sargas 1,2   # -> sheets/sarga_N.docx (pandoc)
```

## Движок трудности (4 сигнала)

`difficulty.py` для каждой шлоки берёт SLP1-леммы и оценивает:

- **(а) расхождение классиков** — передачи кластеризуются в *семьи основ*
  (`common.ru_family`), взвешенные вхождениями; расхождение = ≥2 существенных
  семьи без доминирующего консенсуса, ниже частотного потолка (`DIV_FREQ_MAX`).
  Так `kālāntaka` (n=6, 4 разные передачи) ловится, а `mahat` (n=994, флексия)
  — нет. **Ярус A.**
- **(б) нечастотность + аттестованная передача** — редкое слово (`n ≤ MID_RARE_N`)
  с классической глоссой: показать её, чтобы не лезть в словарь. **Ярус B.**
- **(в) лог 499 запросов Леонова** — СТАБ до экспорта с его машины (@WAITING).
- **(г) селф-TM Леонова** — если у слова есть его устоявшаяся передача из его же
  Сундараканды, слово подавляется (он его знает).

Плюс подавление явных глагольных форм и служебных слов; дедуп против собственных
заметок Леонова/Костиной и tier-2 аппарата (`already_noted`).

## Формы выпуска (рулинг МГ — все три, переводчик выберет)

- `sarga_N.html` — автономный офлайн-лист-обозрение (паттерн review-sheet).
- `sarga_N.docx` — Word с **настоящими** сносками (Markdown → pandoc).
- `web_mock_sarga_N.html` — статичный мок веб-режима reader под samskrtam.ru.

## Валидация

Числа и методика — [`VALIDATION_SARGA1.md`](VALIDATION_SARGA1.md)
(+ метадок [`VALIDATION_SARGA1.meta.md`](VALIDATION_SARGA1.meta.md)). Кратко:
recall на достижимых не-гиперчастотных леммах ≈ 61.5 %; главная находка —
расхождение рецензий аппарат↔корпус (37 % лемм аппарата недостижимы).

## Входы (по путям, не копируются)

- Корпус Сундары + словари — `SamudraManthanam/web/corpus_builder/jsonl/`.
- Глоссарий передач — `SanskritLexicography/RussianTranslation/glossary/`.
- Дедуп-заметки — `CommentaryStrategies/data/{leonov_own_notes,sundara_commentary_to_add}.json`.
- Валидационный аппарат — `RussianRamayana/Leitan-Sundarakanda/_Перевод сундараканды.md`.

Родительский роадмап: [`docs/ROADMAP_LEONOV_TRANSLATOR_ENV_RAMAYANA_5_7_2026.md`](../docs/ROADMAP_LEONOV_TRANSLATOR_ENV_RAMAYANA_5_7_2026.md).

_Dr. Mārcis Gasūns_
