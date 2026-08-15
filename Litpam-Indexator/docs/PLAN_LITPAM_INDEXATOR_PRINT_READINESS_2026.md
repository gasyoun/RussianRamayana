# Litpam-Indexator: план готовности указателей книг I–II к печати

_Created: 12-08-2026 · Last updated: 15-08-2026_

Цель — перевести существующие указатели двух томов из состояния «визуально готовый макет 2025 года» в воспроизводимую, доказуемо проверенную издательскую поставку: обновлённые указатели, версионные пакеты InDesign 2026, IDML, proof-PDF и полный пакет свидетельств. Финальный PDF для типографии выпускает издатель; этот план заканчивается проверенными пакетами и корректурными PDF.

## Слои плана

- [Дорожная карта](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/ROADMAP_LITPAM_INDEXATOR_PRINT_READINESS_2026.md)
- [Архитектура](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/ARCHITECTURE_LITPAM_INDEXATOR_PRINT_READINESS.md)
- [Реализация](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/IMPLEMENTATION_LITPAM_INDEXATOR_PRINT_READINESS.md)
- [Верификация и риски](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/VERIFICATION_LITPAM_INDEXATOR_PRINT_READINESS.md)
- [Метадокумент плана](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.meta.md)

## Что установил аудит

Вердикт prior-art: **PARTIAL**. Существуют зрелый конвейер ExtendScript, операторский [MANUAL](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md), общий XLSX-словник, `ram_tags.txt`, валидатор, Golden Fish drill и четыре визуально оформленных указателя в каждом PDF. Не существуют: единый print-ready контракт, воспроизводимая миграция 2022→2026, машинный учёт покрытия каждой словарной статьи по тому, полный reference/cross-reference QA, нормализованная спецификация оформления и evidence packet.

Октябрьские PDF совпадают байт-в-байт с PDF внутри исходных пакетов. Книга I: 442 PDF-страницы, указатели на PDF-страницах 415–438. Книга II: 668 PDF-страниц, указатели на PDF-страницах 630–649. Шрифты встроены. Выборочная визуальная проверка обнаружила различия в оформлении секций и подозрительные пустые/переходные страницы; они являются проверяемыми гипотезами, не заранее объявленными ошибками.

## Принятые решения — 30 рулингов М. Гасунса

| # | Рулинг |
|---|---|
| 1 | Done = обе книги, регенерированные и редакционно проверенные указатели, proof-PDF и воспроизводимый evidence packet. |
| 2 | Книга I — контролируемый пилот; затем тот же процесс для книги II. |
| 3 | Можно править указатели и любые видимые дефекты макета; основной текст произведения не редактировать. |
| 4 | Указатели PDF 2025 — визуально-редакционная база; все ссылки регенерировать и проверить. |
| 5 | Выход — пакеты InDesign и proof-PDF; финальный печатный PDF выпускает издатель. |
| 6 | Источники истины: `.indd/.idml` + XLSX + `ram_tags.txt`; PDF — визуальная база. |
| 7 | Пакеты 2025 неприкосновенны; работа только в новых версионных копиях. |
| 8 | Автоматизировать повторяемые preflight/generation/export/evidence шаги; редакционные решения оставить оператору. |
| 9 | Один канонический четырёхлистный словник; вхождения, исключения и логи — по томам. |
| 10 | Одна спецификация оформления для обеих книг с явными допустимыми исключениями. |
| 11 | Производственная версия — InDesign 2026; миграционный drift проверять расширенно. |
| 12 | Git хранит IDML, proof-PDF, скрипты, отчёты и checksums; рабочие `.indd` — вне Git по манифесту. |
| 13 | 43 находки валидатора исправить детерминированно в версионной копии XLSX с ledger; оригинал сохранить. |
| 14 | QA = InDesign preflight + IDML + PDF/font metadata + renders/contact sheets + visual baselines. |
| 15 | Машинно проверить каждую ссылку и `см.`; вручную — детерминированную стратифицированную выборку. |
| 16 | Все дефекты регистрировать; сейчас чинить блокирующие печать и существенно отвлекающие, косметические — в очередь. |
| 17 | Книга I открывает книгу II после автоматических гейтов; human review книги I может идти параллельно. |
| 18 | До правок сравнить экспорт из InDesign 2022 с версионной копией после открытия/сохранения в 2026. |
| 19 | Каждая каноническая статья получает по тому статус: occurrence, valid absence, exclusion, redirect или anomaly. |
| 20 | Ручная выборка включает первые/последние, частые/редкие, вложенные, варианты регистра, жирные ссылки, диапазоны, `см.` и исправленные строки. |
| 21 | Fail: clipping/overset, orphan heading, неверный recto/verso, непреднамеренная пустая страница/колонтитул, иерархия, collision, unsafe trim, missing glyph, межтомное расхождение мебели. |
| 22 | Evidence packet полный: manifest, checksums, preflight, fonts/links, coverage/references, contact sheets, defect/correction ledgers, signed checklist. |
| 23 | При обратимой неоднозначности применять отмеченный default, логировать и идти дальше; необратимое/редакционное — park. |
| 24 | Стоп только при corruption, отсутствующих обязательных assets/fonts, неустранимом сбое InDesign, разрушительном расширении scope или смысловом редакционном fork. |
| 25 | Исполнитель может branch→commit→push→PR→auto-merge; human-proof gate нельзя симулировать или обходить. |
| 26 | Fence: оригиналы 2025, текст перевода, авторские архивы `.jsx`/`tmp`, fonts, сайт и другие подсистемы не трогать. |
| 27 | Fable 5 — архитектура/редактура/print judgment; Sonnet 5 — детерминированные инструменты, аудиты и перенос книги II. |
| 28 | На human gate выпускать пакет и продолжать независимую работу; финал помечать `WAITING`. |
| 29 | Никакой молчаливой потери словарных статей или ссылок. |
| 30 | Намеренные межтомные различия допустимы только как записанные exceptions к общей спецификации. |

## Контракт автономности

- **Неоднозначность:** применить выбранный в плане default, если действие обратимо, записать в `decision-log.md`, продолжить; смысловой или необратимый выбор поместить в defect ledger со статусом `WAITING`.
- **Стоп:** только условия рулинга 24. Обычный failed check создаёт дефект, артефакты сохраняются, независимая работа продолжается.
- **Доставка:** handoff разрешает branch, targeted commits, push, PR и auto-merge после машинных checks. Финальное human approval не выводится из автоматических тестов.
- **Fence:** исходные пакеты `Ramayana_*_12.10.25`, авторский текст, шрифты, архивы скриптов и несвязанные файлы не изменяются. Производственные изменения живут только в версионных копиях и новых additive инструментах.

## Гейт запуска

План готов к автономному исполнению: у каждого deliverable первой волны есть архитектурный контракт, упорядоченные шаги, критерий приёмки и риск. Блокирующих `@DECIDE` нет. Human proof — ожидаемый финальный `WAITING`, а не блок запуска.

## Результат H2589 (14-08-2026, Sonnet 5 `claude-sonnet-5`)

**Шаг 2 (детерминированные инструменты) — выполнен и покрыт тестами.** `Litpam-Indexator/tools/print_ready.py` + пакет `tools/print_ready/`: `repair-workbook`, `audit-idml`, `audit-pdf`, `coverage`, `verify-packet`, `conversion-gate`. 20 pytest-тестов (`tools/tests/`), включая source-hash mismatch и stale-old conflict — не молчаливая перезапись при дрейфе данных.

**Шаг 3 (словник) — выполнен.** 42/43 находок валидатора исправлены детерминированно (дубли по регистру/точные дубли/хвостовой `;`) в `xls/derived/Указатель_к_Рамаяне_1_2_2026_08_12.xlsx`; 1 (`prose_in_forms`, строка 221 «Предметы и термины», `[без тега не искать]`) оставлена `WAITING` — редакционный форк (не форма поиска, а операторская пометка-исключение), решение — за человеком. Ledger: `artifacts/print-readiness/dictionary/correction-ledger.{json,md}`. Original SHA неизменен; второй прогон repair — 0 изменений (идемпотентность подтверждена).

**Шаг 4 (baseline книги I) — выполнен с задокументированной адаптацией.** На этой машине COM-автоматизация видит только InDesign 2026 (`InDesign.Application` → CLSID InDesign 2026; отдельного ProgID для InDesign 2022 не зарегистрировано) — живой прогон `export_print_evidence.jsx` в InDesign 2022 недостижим отсюда. Baseline вместо этого — статический аудит уже закоммиченного пакета `Ramayana_I_12.10.25` (его `designmap.xml` подтверждает `product="17.4(51)"`, PDF `Creator: Adobe InDesign 17.4 (Windows)` — это подлинный InDesign-2022-нативный экспорт, не восстановленный задним числом). `prepare_workspace.py` скопировал пакет в два рабочих каталога с побайтовым SHA-256-подтверждением; `audit-idml`/`audit-pdf` дали baseline evidence packet (`artifacts/print-readiness/book-I/baseline-2022/`, `verify-packet` PASS).

**Шаг 5 (conversion gate) — выполнен, вердикт FAIL.** Живой прогон `export_print_evidence.jsx` в InDesign 2026 через COM (`idJavascript`/`idNeverInteract`/`idNo`-константы читались напрямую из `Resources for Visual Basic.tlb`, не угадывались) на полном пакете книги I (442 стр.), после гладкого smoke-теста на учебном примере Golden Fish. `page_count`/`story_count` совпадают с baseline (442/64); шрифты все `INSTALLED`. Провал по двум пунктам (`artifacts/print-readiness/book-I/conversion-2026/gate-report.json`):
- **`DFT-I-0002` (blocker): overset после конвертации в 3 историях**, включая историю, чей текст начинается с алфавитного фрагмента указателя («c-абхиджит 58, 307 c-агнихотра …») — с высокой вероятностью САМ Именной указатель не помещается в рамку после 2022→2026. Является ли это новым дрейфом версии или уже было в 2022 — **неизвестно** (эта машина не может открыть InDesign 2022 живьём для сравнения).
- **`DFT-I-0001` (material, `WAITING`): 6 ссылок `LINK_MISSING`** (`102.eps`, `28.eps`×2, `29.eps`, `LP.tif`, `линейка21.eps`) — этих файлов нет нигде в репозитории (`git ls-tree` — 0 совпадений), т.е. правдоподобно отсутствовали уже в оригинальном пакете, а не потеряны при конвертации — но подтвердить нельзя тем же ограничением.

**Шаг 6 (пилот книги I) — НЕ запущен.** Собственное условие входа шага 6 — «только после conversion gate» (PASS). Гейт FAIL — по контракту это создаёт defect packet и НЕ останавливает независимую работу (rulings 23/24), но и не открывает шаг 6 сам по себе. Продолжать нормализацию/регенерацию указателей поверх непроверенной по overset вёрстки означало бы маскировать находку, а не исправлять её.

**Итоговый статус: `HUMAN_REVIEW_WAITING` (частичный, evidence-backed).** Инструментарий готов и протестирован; конверсионный гейт книги I прогнан на реальных данных и корректно НЕ прошёл с конкретной, воспроизводимой находкой. Открыто человеку/Fable 5: (1) подтвердить/опровергнуть overset в Именном указателе непосредственно в InDesign (2022 и/или 2026, вручную — на машине с доступом к обеим версиям через COM или GUI), (2) решить судьбу `[без тега не искать]` в строке 221, (3) при необходимости — минт residual-handoff для книги II (H2590 остаётся gated тем же conversion gate).

## Адъюдикация DFT-I-0002 (14-08-2026, H2770, Fable 5 `claude-fable-5`)

Пункт (1) выше закрыт **без InDesign**: overset не хранится в IDML, но его следствие хранит PDF (overset-текст не рендерится). [`tools/overset_textdiff.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/overset_textdiff.py) дал два результата ([полный разбор](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/overset-adjudication-2026/OVERSET_TEXTDIFF_ADJUDICATION_BOOK_I_2026.md)):

- **Пруф 2022 и конвертация 2026 посимвольно идентичны на всех 442 страницах** (whitespace-insensitive постраничный дифф: 0 отличий) — конвертация не изменила ни текст, ни пагинацию.
- **Все три overset-истории безобидны**: 2019=`u7e3` титульная строка, 2085=`u825` копирайт-нотис — контент 100 % в обоих PDF; 12223=`u2fbf` — тегированная рабочая история категорий `c-`/`d-` (не Именной указатель — ошибочная атрибуция в исходном дефекте), все 381 заголовков рендерятся без префикса в обоих PDF.

**DFT-I-0002: blocker → cosmetic / pre-existing-by-design.** Остаётся человеку: формальный waiver гейта (критерий «0 overset stories» как написан всё равно FAIL — рекомендуемый фикс: whitelist трёх story-ID или правило «tagged working stories не считаются») и строка 221. После waiver — шаг 6 книги I и H2590.

## Шаг 6 запущен: waiver применён, машинная половина выполнена (15-08-2026, H2776, Fable 5 `claude-fable-5`)

Waiver принят МГ 15-08-2026 («whitelist трёх story-ID и запускай шаг 6»). Сделано:

- **Гейт**: `conversion-gate` получил waiver-каналы (`--waive-overset-story-id` ×3, `--waive-missing-links`, обязательный `--waiver-note`; waived-пункты остаются в defect ledger) — [gate-report-waived.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/gate-report-waived.json): **`PASS_WITH_WAIVERS`, exit 0** — формальное условие входа шага 6 выполнено. 23 pytest.
- **Pilot workspace**: SHA-верифицированная копия пакета 2025 → `work/print-readiness/pilot-I/` (вне Git), версионная копия `Ramayana_I_pilot_2026.indd` (InDesign 2026, 21.0.1.6).
- **Overset снят: 3 → 0** ([resolve_overset.py](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/resolve_overset.py)/[`.jsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/resolve_overset.jsx) — additive: 5 extension-фреймов на pasteboard, метка `H2776-overset-extension`, текст не удалялся; иначе собственные проверки стадий `[1]`/`[3]` отказали бы в запуске). Диагноз: 2019 — «схлопнутый» фрейм © на стр. 4 (0 видимых симв.), 2085 — 11 хвостовых симв., 12223 — 12 588/13 091 симв. рабочей истории. [Отчёты](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/prep).
- **Контент-нейтральность доказана**: PDF pilot-копии посимвольно идентичен conversion-PDF на всех 442 страницах ([pilot-vs-conversion-pages.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/prep/pilot-vs-conversion-pages.json)); шрифты INSTALLED, OVERSET_COUNT=0.
- **Corrected workbook подключён** в workspace. **Строка 221 закрыта рулингом МГ 15-08-2026** («удалить из колонки C»): repair перегнан с оригинала с новым каналом `--clear-prose SHEET:ROW` + обязательной `--ruling-note` (не-whitelisted проза остаётся `WAITING` — рулинг поячеечный, не бланкетный). Итог: **43/43 fixed, 0 WAITING, `validate_dictionary.py` чист, второй прогон 0 операций**; актуальный словник `xls/derived/Указатель_к_Рамаяне_1_2_2026_08_15.xlsx` (файл `…08_12` упразднён), [ledger](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/dictionary/correction-ledger.md) перевыпущен.

**Операторская половина** (стадии `[1]`–`[4]` авторскими скриптами, по рулингу 8 не автоматизируется) — по [PILOT_BOOK_I_OPERATOR_RUNBOOK_2026.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/PILOT_BOOK_I_OPERATOR_RUNBOOK_2026.md); ≈3–6 ч, стадия `[3]` — непрерывный блок ≈1,5 ч. Финальная агентская фиксация (coverage/refs/packet/status) — после стадии `[4]`.

## Стадии [1]+[3] выполнены агентом; H2776 закрыт частичной поставкой (15-08-2026, Fable 5 `claude-fable-5`)

MG-override'ы 15-08 («стадию [1] сам через COM» · «Backfill (а)» · «гони стадию [3]») исполнены:

- **Backfill (а)**: 18 кураторских терминов 2025 внесены в словник → `…08_15b.xlsx` (валидатор чист; [ledger](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/dictionary/backfill-2025-ledger.json)); стадия `[1]` пересобрана: **сводная 1516 строк** ([PR #70](https://github.com/gasyoun/RussianRamayana/pull/70)).
- **Стадия `[3]` выполнена** ([PR #71](https://github.com/gasyoun/RussianRamayana/pull/71)): **1318 topics** (a=761 авторской палитрой + b=183/183, c=286/287, d=88/88 аддитивным индексатором), пилот сохранён. Авторская палитра headless под 2026 не работает — **три DOM-регрессии** (flatten `everyItem().cells`, пустые `contents` на everyItem-цепочках, `rows.itemByRange().select()` → Invalid parameter), задокументированы с repro; по guardrail H2589 применён «additive equivalent wrapper» [index_letter.jsx](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/index_letter.jsx). [Триаж лога](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/stage3/STAGE3_LOG_TRIAGE.md): 138 «не найдено» = 133 ожидаемых (термины тома II общего словника) + 5 подозрительных (скобочные пояснения) + 0 ошибок.
- **Evidence стадии [3]**: экспорт проиндексированного пилота — 442 стр., **OVERSET=0**, 6 `LINK_MISSING` (те же pre-existing, waived); [idml/pdf-аудиты](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/stage3) закоммичены.
- **Остаток — стадия `[4]`** (Построить указатель ≈4 мин + `ProcNumberLines` + `SplitStory` + «См.»/рубрики по [INDEX_STYLE_SPEC.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/INDEX_STYLE_SPEC.md)) + финальный пилотный packet: **уходит в волну H2590 / оператору**. H2776 закрыт частичной поставкой по указанию МГ («как закончит evidence — закрывай H2776 и открывай H2590»).

_Dr. Mārcis Gasūns_
