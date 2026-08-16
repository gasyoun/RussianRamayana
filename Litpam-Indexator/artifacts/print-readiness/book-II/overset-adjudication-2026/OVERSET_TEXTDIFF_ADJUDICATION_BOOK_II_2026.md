# Overset книги II адъюдицирован без InDesign: text-diff IDML↔PDF (H2590)

_Created: 16-08-2026 · Last updated: 16-08-2026_

**Вопрос (из Step5 conversion gate, DFT-II-0002 blocker):** после конвертации
2022→2026 три истории overset. Тот же метод, что и для книги I
([H2770 адъюдикация](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/overset-adjudication-2026/OVERSET_TEXTDIFF_ADJUDICATION_BOOK_I_2026.md)),
[`tools/overset_textdiff.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/overset_textdiff.py)
(reused as-is, no changes) — применён к книге II.

## 1. Постраничный дифф 2022-пруфа против 2026-конвертации — решающий

[`pages-diff.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/overset-adjudication-2026/pages-diff.json):
**0 из 668 страниц** отличаются по тексту (whitespace-insensitive). Пруф 2022
([`InDesign/Ramayana_II_12.10.25/Ramayana_II_12.10.25.pdf`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/InDesign/Ramayana_II_12.10.25/Ramayana_II_12.10.25.pdf))
и конвертация 2026
([`…/conversion-2026/Ramayana_II_conversion_2026.pdf`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/conversion-2026/Ramayana_II_conversion_2026.pdf))
посимвольно идентичны на каждой странице — конвертация не изменила ни текст,
ни пагинацию.

## 2. Покрытие overset-историй — все три предположительно безобидны

Числовые story-ID из `export_print_evidence.jsx` (decimal Self-ID → hex):
1632=`u660`, 16507=`u407b`, 16237=`u3f6d`.

| Story | Что это | Рендер контента |
|---|---|---|
| `u660` (1632) | копирайт-нотис «Репродуцирование, воспроизведение данного издания любым способом без договора…» (9 слов) | 100 % в обоих PDF (0 absent) |
| `u3f6d` (16237) | фрагмент оглавления/running-строки «Указатель имен эпических и мифологических персонажей 570…» (13 слов) | 100 % в обоих PDF (0 absent) |
| `u407b` (16507) | продолжение того же фрагмента «Указатель географических названий 579 Предметно-терминологический указатель 582 Указатель…» (8 слов) | 100 % в обоих PDF (0 absent) |

Отличие от книги I: там третья история была тегированной рабочей `c-`/`d-`
дублирующей категорией; здесь `u3f6d`/`u407b` — короткий фрагмент, перечисляющий
названия и стартовые страницы всех четырёх указателей (похоже на titling/
running-head текст перед самим блоком указателей на стр. 630+, НЕ тело
указателя — тело такого объёма (десятки тысяч слов) было бы в отдельной
крупной истории, а не в 13+8-словной). Крупнейшая история пакета — `u676`
(52553 слова, вероятно сведённый текст всех четырёх указателей) НЕ входит в
список overset и не адъюдицируется здесь.

## Остаточные absence-слова — те же классы артефактов, что в книге I

[`stories-textdiff.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/overset-adjudication-2026/stories-textdiff.json)
показывает ненулевые absence в НЕ-overset историях (включая `u676`, крупный
указатель) — та же природа, что в книге I: IAST-диакритика, subset-шрифтовые
ToUnicode-пропуски, разрывы переносов, номера сносок. Решающий постраничный
дифф (§1) их поглощает: извлечённый текст обоих PDF постранично идентичен на
всех 668 страницах, включая страницы указателей (630–649 по PLAN).

## Диспозиция

- **DFT-II-0002**: blocker → **предположительно cosmetic / pre-existing-by-design**,
  тем же классом рассуждения, что H2770 для книги I: 0 % контента overset-историй
  не рендерится, 0/668 страниц отличий. Формальный waiver гейта требует того же
  human ruling, что MG дал 15-08-2026 для книги I (H2776) — этот файл его НЕ
  заменяет, готовит для него evidence.
- **DFT-II-0001** (7 `LINK_MISSING`: `102.eps`, `30.eps`, `91.eps`, `LP.tif`,
  `линейка21.eps`) — **три из пяти уникальных имён совпадают буквально с
  отсутствующими файлами книги I** (`102.eps`, `LP.tif`, `линейка21.eps` —
  см. [H2589 DFT-I-0001](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md)):
  сильный сигнал общего пула ресурсов, отсутствовавшего уже в оригинальных
  2022-пакетах обеих книг, а не потери при конвертации книги II. `git ls-tree`
  по всему репозиторию — 0 совпадений ни для одного из 5 имён.

Воспроизвести:

```sh
python Litpam-Indexator/tools/overset_textdiff.py pages --pdf-a "Litpam-Indexator/work/print-readiness/book-II/baseline-2022-workcopy/Ramayana_II_12.10.25.pdf" --pdf-b Litpam-Indexator/artifacts/print-readiness/book-II/conversion-2026/Ramayana_II_conversion_2026.pdf
python Litpam-Indexator/tools/overset_textdiff.py stories --idml Litpam-Indexator/artifacts/print-readiness/book-II/conversion-2026/Ramayana_II_conversion_2026.idml --pdf Litpam-Indexator/artifacts/print-readiness/book-II/conversion-2026/Ramayana_II_conversion_2026.pdf --pdf "Litpam-Indexator/work/print-readiness/book-II/baseline-2022-workcopy/Ramayana_II_12.10.25.pdf"
```

_Dr. Mārcis Gasūns_
