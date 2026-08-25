# BOOK_II_REVIEW_CHECKLIST — детерминированная выборка ручной проверки книги II

_Created: 25-08-2026 · Last updated: 25-08-2026_

Аналог [BOOK_I_REVIEW_CHECKLIST.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/BOOK_I_REVIEW_CHECKLIST.md)
для книги II (H2590), та же методология (рулинги 15, 20
[PLAN](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md)).
Машинная половина — `dump_topic_pages.py`/`analyze_topic_pages.py`/
`diff_topic_page_dumps.py`, полный проход каждого топика книги II, PASS на
935/935 (см. [PLAN §19-08-2026](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md)
и [evidence packet](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/artifacts/print-readiness/book-II/pilot-2026/final)).
Этот документ фиксирует ТОЛЬКО детерминированную выборку строк для визуальной
проверки человеком (или агентно-визуальной сессии с реальным просмотром PDF) —
машинная полнота его не заменяет.

Итоговый пилотный документ: [Ramayana_II_pilot_2026.pdf](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/pilot-2026/final/Ramayana_II_pilot_2026.pdf)
(711 стр., proof-PDF) + [Ramayana_II_pilot_2026.idml](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/pilot-2026/final/Ramayana_II_pilot_2026.idml).
Четыре указателя начинаются на стр. 669 / 695 / 700 / 709 (регенерат;
в печати 2025 — 630 / … / … / 649, см. `docs/PLAN` «Что установил аудит»).

## A. Выборка статей — для КАЖДОГО из четырёх указателей

| # | Правило отбора (детерминированное) | Что проверяется | Статус |
|---|---|---|---|
| A1 | Первая и последняя статьи указателя | сетка отступов, широкий пробел, сортировка на краях | WAITING |
| A2 | 3 статьи с наибольшим числом локаторов (при равенстве — алфавитно первые) | свёртка диапазонов, перенос оборотных строк, полнота против словника | WAITING |
| A3 | 3 алфавитно первые статьи ровно с одним локатором | минимальный случай; частая точка потери статьи | WAITING |
| A4 | Все статьи с ≥3 подстатьями; если их >5 — алфавитно первые 5 | иерархия уровня 2, отступы, orphan-контроль | WAITING |
| A5 | Все пары статей, различающиеся только регистром/вариантом написания; если пар >5 — первые 5 | случайные дубли против законных вариантов «, или» | WAITING |
| A6 | Строки, затронутые исправлениями словника (H2589 шаг 3, 43 операции) и попавшие в книгу II | исправление дошло до печати без соседнего дефекта | WAITING |
| A7 | 5 алфавитно первых статей, содержащих диапазон «–» | en dash, отсутствие отбивок, возрастание | WAITING |
| A8 | 5 алфавитно первых статей с полужирными локаторами + 2 статьи со смешанными (bold/regular) локаторами | семантика §7.3 — **см. DFT-II-0004: 0/2567 in-range локаторов сейчас полужирные, машинный FAIL уже задокументирован, эта выборка подтверждает/детализирует для проофридинга, не открывает заново** | WAITING (known-FAIL, DFT-II-0004) |
| A9 | Все ссылки «см.» (115 верифицированных пар, [SEE_REFS_VERIFIED.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/pilot-2026/stage4/SEE_REFS_VERIFIED.json)); если >10 — каждая ⌈N/10⌉-я + последняя | адресат существует, алфавитное место, ground truth 2025 сверен | WAITING |
| A10 | Все омонимные статьи с тире-глоссой; все статьи со скобочным уточнением — если каждых >5, алфавитно первые 5. **Плюс: 820 статей с аннотацией AddAnnotationData** ([ADD_ANNOTATION_REPORT_final.txt](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/pilot-2026/stage4/ADD_ANNOTATION_REPORT_final.txt)) — выборка: 5 алфавитно первых + 5 алфавитно последних | §7.1: пробелы вокруг тире, содержание глоссы соответствует референту; для аннотаций — точность глоссы против источника (XLSX «Краткая аннотация») | WAITING |

## A11 (книга II-специфичная) — исключённые из AddAnnotationData коллизии

29 заголовков исключены из автоматической аннотации (`build_annotation_source_tsv.py`
вывод): 6 регистро-коллизий (напр. «Бали»/«бали») + 23 префиксных коллизии
(напр. «Рама» vs «Рама Джамадагнья») — полный список в консольном выводе
скрипта, не сохранён отдельным файлом в этой сессии. **Человеку**: решить,
нужна ли аннотация для этих 29 заголовков вручную (по одному, без риска
document-wide `changeGrep()` зацепить чужую статью) — не блокирует остальное.

## B. Полосные проверки (весь диапазон указателей книги II)

| # | Полосы | Что проверяется | Статус |
|---|---|---|---|
| B1 | Полоса-открытие каждого указателя: 669, 695, 700, 709 | новая полоса; заголовок первым элементом; фурнитура по D6 spec | WAITING |
| B2 | Последняя полоса каждого указателя | короткая полоса допустима; нет orphan-строк | WAITING |
| B3 | Каждая 5-я полоса указателей начиная с 669 (669, 674, 679, …) + последняя | колонтитулы verso/recto (§6), колонцифры, баланс колонок | WAITING |
| B4 | Все полосы, где автопроверка H2590 нашла FAIL (DFT-II-0003: 29 топиков; DFT-II-0004: bold-локаторы) | визуальное подтверждение/опровержение каждого машинного FAIL | WAITING |
| B5 | Стык «приложения → указатели» (664→669, см. `notes_bold_page_ranges.II`) | нет призрачных полос (класс D8 spec) | WAITING |

## C. Порядок прохода и фиксация

1. Проход строго по порядку A1→A11, B1→B5, указатель за указателем (1→4).
2. Вердикт каждой строки: `PASS` / `FAIL <класс> <правило spec>` / `WAITING` — в
   [defect-ledger.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/defect-ledger.json)
   (формат — [DEFECT_POLICY.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/DEFECT_POLICY.md) §3).
3. Известные незакрытые дефекты, не блокирующие этот пилот (см. ledger):
   **DFT-II-0001** (7 LINK_MISSING, pre-existing, WAITING), **DFT-II-0002**
   (3 overset, wontfix-exception), **DFT-II-0003** (29/934 топиков теряют один
   локатор, queued-for-manual-proofreading, [список](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/pilot-2026/stage4/DFT-II-0003_PROOFREADING_LIST.md)),
   **DFT-II-0004** (bold-локаторы §7.3, 0/2567, queued-for-human-decision).
4. Статус пилота: **`AUTOMATED_PASS / HUMAN_REVIEW_WAITING`** — машинная
   полнота (935/935 топиков, coverage/reference recheck 0 differences на
   каждой контрольной точке) подтверждена; человеческая приёмка (эта таблица
   + 4 задокументированных дефекта) не симулируется (рулинг 25).

_Dr. Mārcis Gasūns_
