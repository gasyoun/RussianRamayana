# Overset книги I адъюдицирован без InDesign: text-diff IDML↔PDF (H2770)

_Created: 14-08-2026 · Last updated: 14-08-2026_

**Вопрос (из H2589, DFT-I-0002 blocker):** после конвертации 2022→2026 три истории
overset — «с высокой вероятностью сам Именной указатель не помещается в рамку».
Подтвердить или опровергнуть требовалось вручную в InDesign, потому что машина
агента не открывает InDesign 2022 живьём.

**Ответ: blocker ОПРОВЕРГНУТ — детерминированно, без InDesign.** Overset — это
результат вёрстки, которого IDML сам по себе не хранит, но его *следствие* хранит
PDF: overset-текст в экспортированный PDF не попадает. Отсюда две проверки
([`tools/overset_textdiff.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/overset_textdiff.py),
Fable 5 `claude-fable-5`, 14-08-2026):

## 1. Постраничный дифф 2022-пруфа против 2026-конвертации — решающий

[`overset-textdiff-pages.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/overset-adjudication-2026/overset-textdiff-pages.json):
**0 из 442 страниц** отличаются по тексту (whitespace-insensitive; пробельный
джиттер вокруг переносов — артефакт разных генераторов PDF, не контент).
Пруф 2022 ([`InDesign/Ramayana_I_12.10.25/Ramayana_I_12.10.25.pdf`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/InDesign/Ramayana_I_12.10.25/Ramayana_I_12.10.25.pdf))
и конвертация 2026 ([`…/conversion-2026/Ramayana_I_conversion_2026.pdf`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/conversion-2026/Ramayana_I_conversion_2026.pdf))
**посимвольно идентичны на каждой странице** — конвертация не изменила ни текст,
ни пагинацию.

## 2. Покрытие overset-историй — все три безобидны

Числовые story-ID из `export_print_evidence.jsx` — это десятичная запись
IDML-шестнадцатеричных `Self`-ID: 2019=`u7e3`, 2085=`u825`, 12223=`u2fbf`.

| Story | Что это | Рендер контента |
|---|---|---|
| `u7e3` (2019) | титульная строка «П. А. Гринцер. Перевод, статья, словарь…» (9 слов) | 100 % в обоих PDF |
| `u825` (2085) | копирайт-нотис «Репродуцирование… запрещается» (9 слов) | 100 % в обоих PDF |
| `u2fbf` (12223) | **тегированная рабочая история** указателей категорий `c-`/`d-` (396 строк, маркер-буквы канона `ForIndex.jsxinc`) | все 381 заголовочных слова присутствуют в обоих PDF **без префикса** — это исходный материал, дублирующий уже свёрстанные указатели; в префиксной форме не рендерится нигде и никогда |

Сниппет дефекта начинался с `c-абхиджит` — маркер-буква `c-`, т. е. это **не**
Именной указатель (категория `a-`), а рабочий материал категории 3. Формулировка
«сам Именной указатель не помещается» в DFT-I-0002 была неверной атрибуцией.

## Остаточные absence-слова — артефакты извлечения, не потери

[`overset-textdiff-stories.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/overset-adjudication-2026/overset-textdiff-stories.json)
показывает ненулевые absence в НЕ-overset историях; все классы — известные
артефакты pypdf-извлечения, почти одинаковые в обоих PDF (что само по себе
исключает конверсионный дрейф): IAST-композиты с диакритикой (`cakra-gadā-pāṇiḥ`),
слова с заглавной «Г» (subset-шрифтовой ToUnicode-пропуск: Гомер, Гончарова,
Горбунов…), разрывы переносов. Решающий постраничный дифф (§1) всё это
поглощает: извлечённый текст обоих PDF постранично идентичен.

## Диспозиция

- **DFT-I-0002**: blocker → **cosmetic / pre-existing-by-design**. Overset-контент
  не содержит несвёрстанного текста; вёрстка 2026 идентична 2022.
- **DFT-I-0001** (6 `LINK_MISSING`) — не затрагивается этим диффом напрямую, но
  посимвольная идентичность пруфов согласуется с версией «отсутствовали уже в 2022».
- **Что остаётся человеку:** формальный waiver гейта (критерий «0 overset stories»
  как написан всё равно FAIL — рекомендация: whitelist трёх story-ID выше либо
  правило «tagged working stories не считаются») и прежнее решение по строке 221
  словника. После waiver открываются шаг 6 книги I и H2590 (книга II).

Воспроизвести:

```sh
python Litpam-Indexator/tools/overset_textdiff.py pages --pdf-a "Litpam-Indexator/InDesign/Ramayana_I_12.10.25/Ramayana_I_12.10.25.pdf" --pdf-b Litpam-Indexator/artifacts/print-readiness/book-I/conversion-2026/Ramayana_I_conversion_2026.pdf
python Litpam-Indexator/tools/overset_textdiff.py stories --idml Litpam-Indexator/artifacts/print-readiness/book-I/conversion-2026/Ramayana_I_conversion_2026.idml --pdf Litpam-Indexator/artifacts/print-readiness/book-I/conversion-2026/Ramayana_I_conversion_2026.pdf --pdf "Litpam-Indexator/InDesign/Ramayana_I_12.10.25/Ramayana_I_12.10.25.pdf"
```

_Dr. Mārcis Gasūns_
