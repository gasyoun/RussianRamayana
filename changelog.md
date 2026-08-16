# Changelog

Рабочий журнал изменений, решений и уточнений по проекту `RussianRamayana`.

## 2026-08-16

### Книга II запущена: baseline+conversion evidence, gate PASS_WITH_WAIVERS, стадии [1]/[1b] выполнены (H2590)

Baseline-2022 (статический аудит) + живая 2026 COM-конверсия (668 стр., 53 истории);
Step5 gate FAIL на тех же классах дефектов, что книга I (`DFT-II-0001`: 7 LINK_MISSING,
3/5 имён совпадают с книгой I; `DFT-II-0002`: 3 overset). Адъюдицировано
`overset_textdiff.py` (переиспользован без изменений): 0/668 страниц отличий,
все 3 истории рендерятся 100% —
[адъюдикация](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-II/overset-adjudication-2026/OVERSET_TEXTDIFF_ADJUDICATION_BOOK_II_2026.md).
МГ применил waiver-прецедент книги I (H2776) →
`PASS_WITH_WAIVERS` ([PR #75](https://github.com/gasyoun/RussianRamayana/pull/75), merged).

Стадия `[1]` (`drive_stage1.py`, COM, авторские скрипты без модификаций): все 4 листа
общего словника → IndexList-001..004.indd (784/201/443/88 строк — та же сумма, что
книга I, общий словник). Стадия `[1b]` (`drive_stage1b.py`): маркеры a/b/c/d + 3 мерджа
→ сводная `IndexList[@]001.indd` (1516 строк). Остаток: стадия `[3]` (индексирование,
ожидаются те же DOM-регрессии InDesign 2026, что H2776 задокументировал для книги I) →
стадия `[4]` (сборка/оформление) → финальный evidence packet.

## 2026-08-15

### Стадия [3] выполнена: 1318 topics; три DOM-регрессии InDesign 2026 задокументированы (H2776)

Backfill (а) → словник `…08_15b.xlsx` → стадия `[1]` пересобрана (сводная 1516 строк,
[PR #70](https://github.com/gasyoun/RussianRamayana/pull/70)) → **стадия `[3]`**
([PR #71](https://github.com/gasyoun/RussianRamayana/pull/71)): **1318 topics**
(a=761 авторской палитрой + b/c/d аддитивным индексатором
[`index_letter.jsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/index_letter.jsx)
— авторский ProcStoryOrDoс headless под 2026 не работает: flatten
`everyItem().cells`, пустые `contents` на everyItem-цепочках,
`rows.itemByRange().select()` → Invalid parameter; per-guardrail «additive
equivalent wrapper», архив не тронут). Evidence: 442 стр., OVERSET=0;
[триаж лога](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/stage3/STAGE3_LOG_TRIAGE.md)
— 138 «не найдено» = 133 ожидаемых (том II) + 5 подозрительных + 0 ошибок.
Остаток: стадия `[4]` → волна H2590.

### Стадия [1] пилота выполнена агентом через COM: сводная IndexList[@]001, сравнение с 2025 (H2776)

MG-override («Попробуй стадию [1] сам через COM»): генерационная стадия `[1]`
прогнана headless на **авторских скриптах без модификаций** —
[`drive_stage1.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/drive_stage1.py)
строит 2-колоночные таблицы из словника
([`build_indexlist_table.jsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/build_indexlist_table.jsx))
и запускает `UseReadyTable.v.7.jsx` ×4 (782/199/429/88 строк; 30/2/12/1 мин;
модальные alert'ы перехвачены шимом в его persistent engine);
[`drive_stage1b.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/drive_stage1b.py)
ставит маркеры `a`–`d` (аддитивный твин цикла `AddMarker.jsx`) и гонит авторский
`MergeTwoIndexListTables.jsx` ×3 → **сводная `IndexList[@]001.indd`, 1498 строк,
5 колонок** (вне Git, в pilot-workspace).

Сравнение с типографскими указателями 2025 (страницы 415–438 пруфа;
[`compare_stage1_2025.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/compare_stage1_2025.py)
+ read-only дампер [`dump_indexlist.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/dump_indexlist.py)):
union common 1073, потерь строк словника нет; **находка — ~15–20 терминов 2025
отсутствуют в словнике** (добавлены в 2025 напрямую в вёрстку при разборе
`log.txt`, в `.xlsx` не возвращены) — вердикт и список:
[SVODNAYA_VS_2025_STAGE1_COMPARISON.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/stage1/SVODNAYA_VS_2025_STAGE1_COMPARISON.md).
Канал backfill — решение человека; иначе восстановить на стадии `[3]`.

### Словник закрыт 43/43: строка 221 очищена по рулингу МГ (H2776)

Рулинг МГ 15-08-2026: `[без тега не искать]` удалено из колонки `C` строки 221
листа «Предметы и термины». `repair-workbook` получил канал `--clear-prose SHEET:ROW`
(+ обязательная `--ruling-note`, фиксируется в ledger; не-whitelisted проза остаётся
`WAITING`). Repair перегнан с оригинала 05_18: **43/43 fixed, 0 WAITING, валидатор
чист, второй прогон 0 операций.** Новый канон —
[`xls/derived/Указатель_к_Рамаяне_1_2_2026_08_15.xlsx`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/xls/derived)
(`…08_12.xlsx` упразднён), [ledger](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/dictionary/correction-ledger.md)
перевыпущен; workspace пилота обновлён. 25 pytest. Ловушка MANUAL «проза в C завешивает
стадию [3]» для пилота снята.

### Шаг 6 (пилот книги I) запущен: waiver гейта применён, машинная половина выполнена (H2776)

Waiver МГ 15-08-2026 по адъюдикации H2770 (Fable 5 `claude-fable-5`):

- `conversion-gate` — waiver-каналы (`--waive-overset-story-id`, `--waive-missing-links`,
  обязательный `--waiver-note`; waived-пункты остаются в ledger); вердикт
  **`PASS_WITH_WAIVERS`** для книги I —
  [gate-report-waived.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/gate-report-waived.json). 23 pytest.
- Новый additive-инструмент
  [`tools/indesign/resolve_overset.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/resolve_overset.py)
  + [`resolve_overset.jsx`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/indesign/resolve_overset.jsx):
  снял 3 waived overset-истории в версионной pilot-копии тредингом 5 extension-фреймов
  на pasteboard (текст не удалялся; страницы посимвольно идентичны — 0/442 отличий).
- Pilot workspace + corrected workbook подключены; операторская половина — по
  [PILOT_BOOK_I_OPERATOR_RUNBOOK_2026.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/PILOT_BOOK_I_OPERATOR_RUNBOOK_2026.md)
  (стадии `[1]`–`[4]`, ≈3–6 ч; строка 221 словника — `WAITING` до решения человека).

## 2026-08-14

### Overset книги I адъюдицирован без InDesign — DFT-I-0002 опровергнут как blocker (H2770)

Ответ на открытый пункт H2589 (Fable 5 `claude-fable-5`): overset — результат
вёрстки, которого IDML не хранит, но overset-текст не попадает в PDF, поэтому
дифф IDML-историй против рендера + постраничный дифф пруфов решают вопрос
детерминированно. Новый инструмент
[`Litpam-Indexator/tools/overset_textdiff.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/overset_textdiff.py)
(режимы `stories` / `pages`, переиспользуем для книги II):

- **0 из 442 страниц** отличаются между пруфом 2022 и конвертацией 2026 —
  посимвольная идентичность текста и пагинации;
- все три overset-истории безобидны (титульная строка, копирайт, тегированная
  рабочая история `c-`/`d-` — не Именной указатель, вопреки атрибуции дефекта);
- **DFT-I-0002: blocker → cosmetic / pre-existing-by-design**; человеку остаётся
  формальный waiver гейта + строка 221 словника.

Разбор: [`OVERSET_TEXTDIFF_ADJUDICATION_BOOK_I_2026.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/overset-adjudication-2026/OVERSET_TEXTDIFF_ADJUDICATION_BOOK_I_2026.md).

### Deterministic print-readiness tooling + conversion gate книги I = FAIL (H2589)

Шаги 2–5 плана print-readiness (работа Sonnet 5 `claude-sonnet-5`; сессия упала до
коммита — crash-recovery доставка Fable 5 `claude-fable-5`,
[PR #65](https://github.com/gasyoun/RussianRamayana/pull/65)):

- **[`Litpam-Indexator/tools/print_ready.py`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/tools/print_ready.py)** + пакет
  [`tools/print_ready/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/tools/print_ready):
  `repair-workbook` / `audit-idml` / `audit-pdf` / `coverage` / `verify-packet` /
  `conversion-gate`; 20 pytest-тестов зелёные.
- **Словник**: 42/43 находок валидатора исправлены идемпотентно в
  [`xls/derived/Указатель_к_Рамаяне_1_2_2026_08_12.xlsx`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/xls/derived);
  ledger — [`artifacts/print-readiness/dictionary/correction-ledger.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/dictionary/correction-ledger.md);
  1 `WAITING` (строка 221 `[без тега не искать]` — решение за человеком).
- **Conversion gate книги I: FAIL** —
  [`gate-report.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/conversion-2026/gate-report.json):
  DFT-I-0002 (blocker) — 3 overset-истории после 2022→2026, вероятно сам Именной
  указатель; DFT-I-0001 (material) — 6 `LINK_MISSING`, правдоподобно pre-existing.
  Шаг 6 (пилот) по собственному условию входа не запускался; книга II (H2590)
  остаётся gated. Статус: `HUMAN_REVIEW_WAITING` — полный разбор в
  [`PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/PLAN_LITPAM_INDEXATOR_PRINT_READINESS_2026.md).

### Print-контракт четырёх указателей книг I–II (H2588)

Первая волна плана print-readiness (шаг 1, Fable 5 `claude-fable-5`): измеренный по
PDF-пруфам 12.10.25 единый контракт оформления указателей.

- **[`Litpam-Indexator/docs/print-readiness/INDEX_STYLE_SPEC.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/INDEX_STYLE_SPEC.md)** —
  геометрия полосы/колонок, сетка отступов двух уровней, шрифтовая система,
  локаторы/диапазоны/полужирные ссылки примечаний, модель «см.», фурнитура;
  таблица D1–D10 межтомных различий с классификацией
  intentional / defect / review-required.
- **[`DEFECT_POLICY.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/DEFECT_POLICY.md)** —
  классы blocker/material/cosmetic, default-диспозиции по рулингу 23, формат
  defect ledger.
- **[`BOOK_I_REVIEW_CHECKLIST.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/BOOK_I_REVIEW_CHECKLIST.md)** —
  детерминированная выборка ручной проверки (A1–A10 по статьям, B1–B5 по полосам).
- **[`Litpam-Indexator/config/print-readiness.json`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/config/print-readiness.json)** —
  машиночитаемые пороги/defaults; субъективное одобрение как test PASS не
  кодируется (`notes_bold_page_ranges` = null до baseline IDML в H2589).
- `.gitignore` — `/Litpam-Indexator/work/print-readiness/` (рабочие копии пакетов).
- Production-файлы (packages, PDF, XLSX, `.jsx`) не тронуты — только additive docs/config.

## 2026-08-05

### Публичные аннотации каталога переводов (H1857)

Каждая запись каталога [`translations.html`](https://github.com/gasyoun/RussianRamayana/blob/main/translations.html) получила русскую
аннотацию в 2–4 предложения: что это за перевод/пересказ, с чего выполнен, подход
и кому подойдёт.

- **`data/translations.json`** — новое поле `annotation` у всех 6 записей; факты
  взяты только из уже закоммиченных источников ([`data/editions.json`](https://github.com/gasyoun/RussianRamayana/blob/main/data/editions.json),
  [`reception.html`](https://github.com/gasyoun/RussianRamayana/blob/main/reception.html), правила контента в [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/CLAUDE.md)/[`roadmap.md`](https://github.com/gasyoun/RussianRamayana/blob/main/roadmap.md)). Незафиксированные
  детали (год Книги IV, годы русских изданий пересказов) явно помечены как
  неизвестные, не выдуманы.
- **`data/retellings.json`** — `description` всех 3 записей расширен до полной
  аннотации; пересказы последовательно маркированы как «не перевод с санскрита»
  (правило «Эрман = пересказ»).
- **`translations.html`** — карточка перевода теперь рендерит `item.annotation`
  над строками «Охват»/«Издание» (пересказы уже рендерили `description`).
- **`data/schema/translations.schema.json`** — поле `annotation` задекларировано;
  `scripts/validate_data.py` — 18 schema-validated, 0 failed.
- Оценочный язык — описательный (подход, охват, адресат), без ранжирования
  переводчиков.
- Аннотации: Fable 5 (`claude-fable-5`).

## 2026-08-01

### DH_ROADMAP Фаза 0 закрыта (H2061) — stale-tick + audio URL switch

Пункт drain Tier-2: [`docs/DH_ROADMAP.md`](docs/DH_ROADMAP.md) Фаза 0.

- Truth-pass: `.ai_state.md`, `_meta/` gitignore-disposition, `web-src/cover-og.png` — уже
  сделаны 2026-06-12; чекбоксы в DH_ROADMAP были stale и отмечены.
- **`resolveAudioUrl(track)`** в [`js/utils.js`](js/utils.js): единая точка замены хоста
  аудио (`ia_url` → `url`, https-only). Подключено в `audio.html`, `index.html`,
  `media.html` вместо прямого `track.url`. Когда Фаза 1 заполнит `ia_url` (archive.org),
  плееры переключатся без правок страниц. Сейчас `url` по-прежнему raw.github.

## 2026-07-27

### Импорт донатов Boosty/Patreon → summary.json (H1515)

Роадмап-пункт «Настройка автоматического импорта донатов из Boosty и Patreon в
`summary.json`» (roadmap.md:184-198 + architecture.md §Учёт пожертвований).

- **`scripts/import_donations.py`** — нормализует выгрузку Boosty/Patreon/generic
  CSV в приватный реестр (поля: date/platform/amount/currency/amount_rub/fee/
  net_amount_rub/donor_name/public_name/anonymous/reward_level/comment/source_id),
  сливает по `source_id` (повторный запуск идемпотентен), публикует в
  `data/fundraising/summary.json` **только агрегаты**
  (`onetime.collected_rub/donor_count`, `monthly.pledged_rub/supporter_count`,
  `updated_at`) — бакет one-time/subscription берётся из уже существующего
  `data/payment-methods.json`. Имена доноров в публичный файл никогда не попадают.
- Реального экспорта Boosty/Patreon в репозитории ещё нет — раскладки колонок
  best-effort, проверены на синтетических фикстурах (`tests/fixtures/`); свериться
  с реальной выгрузкой при первом реальном импорте.
- Приватный реестр (`donations_private.csv`, уже в `.gitignore`) в репозиторий не
  попадает.

## 2026-07-14

### Среда переводчика — Wave 3: контекст сноски (H943, ответ на отзыв Леонова)

Отзыв М. В. Леонова по [issue #35](https://github.com/gasyoun/RussianRamayana/issues/35):
форма **А** удобна и выбрана, но «сама идея не работает — в Пахтании я вижу
контекст, а здесь контекста нет, всё равно придётся смотреть Пахтание». Сноска
давала передачи классиков + глоссу БЕЗ контекста. Рулинг МГ: сделать все три вида
контекста, Леонов сам выберет, какой убирает поход в «Пахтание» (SamudraManthanam).

- **Новый модуль `translator-env/src/context.py`** — три контекст-слоя из того же
  корпуса JSONL, что читает SamudraManthanam (движок не дублируется):
  **(1) конкорданс** (KWIC: где ещё форма встречается в корпусе Рамаяны, строка +
  русская параллель, слово выделено); **(2) пассаж-источник** (резолв locus
  `work:passage` → строку корпуса за передачей классика, с предпочтением одиночной
  строфы Рамаяны и KWIC-окном для диапазонных loci МБ/кавьи); **(3) соседние шлоки**.
- **`src/gen_sheets.py`** — форма А (лист-обозрение) несёт все три слоя, цветокодированы,
  с легендой-вопросом Леонову. Флаг `--context all|none|concord,passage,neighbors`
  (после выбора Леонова лист пересобирается с одним слоем).
- Русская параллель есть у кн. I–V (Гринцер I–IV, Леонов V); VI–VII — только санскрит.
- Приватность без изменений: листы/данные в `.gitignore`, в репозиторий только код.
  [PR](https://github.com/gasyoun/RussianRamayana/pulls) · метадок — [`VALIDATION_SARGA1.meta.md`](https://github.com/gasyoun/RussianRamayana/blob/main/translator-env/VALIDATION_SARGA1.meta.md).

## 2026-07-12

### Среда переводчика — Wave 0, пилот на Сундараканде (H764)

- **`translator-env/`** — новый подпроект: автосноски по трудным словам для
  перевода Рамаяны М. В. Леонова (кн. 5–7). Пилот на саргах 1–2 Сундараканды.
- **Движок трудности** (`src/difficulty.py`), 2 яруса: **A** — расхождение
  классиков по семьям основ (взвешено вхождениями, с частотным потолком: ловит
  `kālāntaka` n=6/4 передачи, не `mahat` n=994/флексия); **B** — нечастотное
  слово с аттестованной передачей. Плюс селф-TM Леонова, дедуп против его
  заметок + tier-2 аппарата, подавление глагольных/служебных форм. Сигнал (в)
  лог-499 запросов — СТАБ до экспорта с машины Леонова.
- **Листы в 3 формах** (`src/gen_sheets.py` + `src/render_docx.py`): офлайн
  HTML-обозрение, `.docx` с настоящими Word-сносками (pandoc), web-мок reader.
- **Проба DeepSeek** (`src/deepseek_synth.py`) — машинная сводка расхождений на
  первых 5 шлоках, вшита в листы с меткой «(машинная сводка)».
- **Валидация** против ручного аппарата Леонова (`translator-env/VALIDATION_SARGA1.md`):
  difficulty-recall 61.5 %, ~2.5 сноски/шлока. Находка — расхождение рецензий
  аппарат↔корпус (37 % лемм аппарата недостижимы как поверхностная форма).
- ⚠️ **Приватность**: листы (`sheets/`) и промежуточные данные (`data/`)
  встраивают защищённые копирайтом передачи (Кочергина 1987, современные
  переводы, подстрочник Леонова) — в `.gitignore`, НЕ публикуются; в репозиторий
  только код и отчёт. [PR #25](https://github.com/gasyoun/RussianRamayana/pull/25).

## [1.0.0] - 2026-06-13

### Changed
- Released the current changelog state as version 1.

## 2026-06-12

### DH-инфраструктура: роадмап, права, идентификаторы (Фазы 0–3)

- **Роадмап**: создан `docs/DH_ROADMAP.md` (5 фаз приведения к DH-стандартам). Решения: портал (не корпус), аудио → Internet Archive, полный LOD-каркас.
- **Гигиена**: `_meta/` исключена из git (материалы RuWritingStyles); создан отсутствовавший `web-src/cover-og.png` (OG-превью было битым на 13 страницах); `.ai_state.md`.
- **Аудио 1986**: подтверждена атрибуция — перевод В. Потаповой, частная запись Е. Кривецкого; `data/audio.json` дополнен полями `translator`, `file`, `size_bytes`, `sha256`, `rights`; `scripts/audio_inventory.py`; манифест IA-загрузки `docs/ia-upload.md`. ⚠️ Разрешение Кривецкого (2026) покрывает только запись; права на текст Потаповой не урегулированы — публичность IA-item заблокирована (см. `docs/RIGHTS.md`).
- **Права**: раздельное лицензирование — Apache 2.0 (код), CC BY 4.0 (`LICENSE-data.md`, данные и документация); реестр прав `docs/RIGHTS.md`; поле `rights` в audio/videos/drafts.json; обложки подтверждены как ИИ-генерация (CC BY).
- **Цитируемость**: `CITATION.cff`; экспорт библиографии `scripts/export_bibliography.py` → `data/export/bibliography.{csl.json,bib}`, ссылки на `bibliography.html`.
- **Идентификаторы (проверены по Wikidata)**: Гринцер Q4149672/VIAF 35823334, Потапова Q15720383, Серебряный Q4417419, Эрман Q4532534, Нарайян Q334252, Вальмики Q715607, Рамаяна Q37293, серия ЛП Q4263826 — внесены в `people.json`, `editions.json`, `retellings.json`. ISBN изданий: кн. I–II 5-86218-454-6, кн. III 978-5-86218-522-5. У Леонова и Кривецкого items в Wikidata нет.
- **Исправления каталога**: пересказ Эрмана — на деле «Рамаяна» Э.Н. Темкина и В.Г. Эрмана, М.: Наука, **1965** (не 1980); издание Потаповой 1986 — отдельная книга «Худлит», ~6000 строк, до эпохи ISBN.
- **JSON-LD**: `index.html` (WebSite + about Q37293), `translations.html` (CollectionPage + Book/ISBN/sameAs), `audio.html` (Audiobook + readBy/translator), `project.html` (Person + sameAs).

## 2026-05-15

### Фаза 1: Краудфандинговый каркас

- **Созданы JSON-данные**:
  - `data/fundraising/summary.json` — счётчик сбора.
  - `data/project-status.json` — статусы книг IV-VI.
  - `data/payment-methods.json` — способы оплаты.
- **Создана страница поддержки**:
  - `support.html` — центральный узел сбора средств с прогресс-барами, способами оплаты и описанием статуса проекта.
- **Обновлена главная страница**:
  - Добавлен акцентированный блок поддержки (CTA) "Поддержать перевод" на первый экран `index.html`.
  - Внедрена краткая формула: "Гринцер начал, Леонов продолжает".
  - Указаны статусы книг V и VI.
- **Архитектура**:
  - Внедрена загрузка данных через `fetch` для `support.html`, обеспечивающая легкое обновление цифр через JSON.

### Фаза 2: Каталог переводов и пересказов

- **Созданы JSON-данные**:
  - `data/translations.json` — каталог академических переводов и подстрочников с санскрита.
  - `data/retellings.json` — каталог пересказов (Эрман, Нарайян) и адаптаций.
- **Создана страница каталога**:
  - `translations.html` — структурированный каталог с жестким разделением типов (Перевод, Подстрочник, Пересказ, Адаптация).
- **Обновлена главная страница**:
  - Добавлен блок входа в каталог переводов под блоком поддержки.
- **Контент**:
  - Систематизированы данные по Гринцеру, Леонову, Серебряному и Потаповой.
  - Эрман и кришнаитские материалы вынесены в отдельный раздел пересказов.

### Фаза 3: Страница проекта (Гринцер -> Леонов)

- **Созданы JSON-данные**:
  - `data/people.json` — реестр ключевых участников проекта с описанием их ролей (Гринцер, Леонов, Костина, Гасунс).
  - `data/videos.json` — реестр видеоматериалов и цитат.
- **Создана страница проекта**:
  - `project.html` — подробная история перевода, объяснение преемственности от академической школы П.А. Гринцера к М.В. Леонову, статус "Литературных памятников" и видео-блок.
- **Обновлена главная страница**:
  - Добавлен блок входа в историю проекта под каталогом переводов.
- **Контент**:
  - Сформулирована позиция по "проблеме Книги IV" (Серебряный).
  - Зафиксирована роль Е.А. Костиной как редактора и М.Ю. Гасунса как руководителя.

### Фаза 4: Хронология и начало Сундараканды

- **Созданы JSON-данные**:
  - `data/timeline.json` — вехи русской Рамаяны (1986–2029).
  - `data/comparison-episodes.json` — данные для curated-чтения (санскрит, подстрочник, поэзия).
- **Созданы новые разделы**:
  - `timeline.html` — визуальная хронология проекта.
  - `compare/sundarakanda-start.html` — первая страница сравнительного чтения (начало 5-й книги).
- **Обновлена главная страница**:
  - Добавлены блоки входа для хронологии и сравнительного чтения.
- **Интеграция**:
  - Обеспечена связь сравнительного чтения с внешним корпусом на `samskrtam.ru`.

### Фаза 5: Инвентаризация материалов и медиа

- **Создан реестр материалов**:
  - `docs/content-inventory.md` — полный аудит аудио, видео, текстов и изображений с назначением статусов готовности.
- **Созданы JSON-данные**:
  - `data/audio.json` — метаданные аудиокниги 1986 года (длительность, чтец, ссылки).
- **Создана страница медиа-архива**:
  - `media.html` — галерея видеоматериалов и интерактивный плейлист аудиокниги.
- **Обновлена главная страница**:
  - Добавлен блок входа в медиа-архив.
- **Организация**:
  - Намечены этапы обработки материалов из Яндекс Диска, ВК и Telegram на следующие кварталы.

## 2026-05-14

### Добавлено

- Создан `roadmap.md` с долгосрочной дорожной картой проекта.
- Зафиксирована миссия сайта: главный русскоязычный ресурс о переводах, пересказах, аудио, сканах, OCR, библиографии, видео и параллельном корпусе Валмики-Рамаяны.
- Зафиксирована центральная задача: поддержка продолжения проекта П.А. Гринцера и завершение первого полного русского поэтического академического перевода Валмики-Рамаяны с санскрита М.В. Леоновым.
- Зафиксирована цель краудфандинга: `1 000 000 руб.`
- Зафиксирована команда проекта:
  - М.Ю. Гасунс — руководитель проекта;
  - М.В. Леонов — переводчик;
  - Костина — редактор.
- Создан текущий `changelog.md`.

### Уточнено

- Эрмана следует описывать как автора пересказа, а не перевода.
- Потабенко не включается как переводчик Рамаяны.
- Кришнаитские материалы предварительно относятся к пересказам и адаптациям, а не к переводам избранных мест.
- Основная аудитория сайта — широкая публика.
- Английская версия пока не планируется.
- Поиск по текстам не нужен на этом сайте, так как он уже сделан в другом репозитории.
- Права на публикацию материалов есть.
- Связь с серией `Литературные памятники` можно формулировать публично.

### Статус Работы

- Книга IV: застряла на вступительной статье; проект пока не может повлиять на этот блокер.
- Книга V: перевод завершён; комментарии готовы примерно на две трети; указатели оцениваются примерно в полгода работы.
- Книга VI: черновой литературный перевод готов полностью.

### Краудфандинг

- Основные статьи сбора: перевод, комментарии, в меньшей степени редактура.
- Нужны разовые пожертвования и регулярная подписка.
- Минимальный значимый уровень подписки: `500 руб.` или предпочтительно `1000 руб.` в месяц.
- Нужны разные платёжные каналы: Boosty, Сбер, отдельный вариант для зарубежных доноров.
- Нужны публичный счётчик собранного и ежемесячные отчёты.
- Реалистичные бонусы: отчёты, закрытые черновики, имя в благодарностях на сайте, печатный экземпляр.
- Zoom-встречи не планируются как обязательный бонус.

### Открытые Решения

- Как публично формулировать проблему книги IV.
- Как именно разбить сумму `1 000 000 руб.` на понятные донорские этапы.
- Какие платёжные каналы использовать для зарубежных доноров.
- Какие материалы вынести на главную страницу, а какие оставить на втором уровне.
- Каким тоном писать главную: торжественным, научно-популярным или прямо краудфандинговым.

### Решения После Уточнений

- Книгу IV публично можно описывать прямо с именем Серебряного.
- Книгу IV нужно показывать на странице сбора как часть общей истории проекта, но честно писать, что текущий сбор на неё не влияет.
- Для книг I-II фиксируется библиографическое описание издания `Рамаяна : [в 7 кн.] / подгот. П. А. Гринцер. - Москва : Ладомир : Наука, 2006- ...`.
- Для книги III фиксируется издание `Кн. 3: Араньяканда (книга о лесе). - 2014. - 397, [1] с.; ISBN 978-5-86218-522-5`.
- По книге V публично можно говорить, что до завершения комментария остаётся около года работы.
- Фрагменты чернового литературного перевода книги VI показывать только подписчикам.
- Екатерину Костину указывать как Екатерину Александровну Костину; редактор, исследователь и преподаватель санскрита, хинди и индоарийских языков.
- Для М.В. Леонова выбрана краткая публичная формула: переводчик санскритской литературы, автор опубликованных переводов санскритской поэзии и специалист по передаче поэтической формы оригинала на русском языке.
- Для М.Ю. Гасунса пока использовать краткую формулу: руководитель проекта, санскритолог.
- В институциональном контексте можно указывать издательство `Наука`.
- Цитаты Леонова из видео можно и нужно превращать в текстовые цитаты для страницы сбора.
- Срок сбора `1 000 000 руб.`: полгода.
- Уровни подписки предварительно: `1000`, `3000`, `5000`, `10000` руб.; названия уровней нужны, но суммы и бонусы следует уточнить после анализа прежних сборов на Planeta.ru.
- Бонусы распределить предварительно так: отчёты, закрытые черновики, имя на сайте, печатный экземпляр.
- Зарубежные платежи: PayPal через посредника, Patreon, банковский перевод. Криптовалюту не использовать.
- Первым эпизодом для сравнительного чтения выбрать начало Сундараканды.
- Главный акцент первого экрана главной страницы: сбор на завершение перевода.

### Следующий Раунд Вопросов

- Следующие вопросы перенесены в `roadmap.md` в формате `Q1`, `Q2`, чтобы номера сохранялись при копировании в Notepad.

### Решения Второго Раунда

- Публичная формулировка проблемы книги IV должна быть жёсткой, с именем Серебряного.
- Связь с `Литературными памятниками` формулировать как `готовится для серии`.
- Месячную цель сбора показывать как `166 000 руб.`
- Общий счётчик сбора должен быть на сайте.
- Для учёта поступлений предложена автоматизация: единый приватный реестр поступлений, импорт выгрузок разных платформ, нормализация скриптом и публикация только агрегированных данных в `summary.json`.
- По прежним сборам на Planeta.ru есть данные за 10 кампаний: суммы, число доноров, средний взнос, уровни и бонусы. Эти данные нужно использовать для настройки уровней новой кампании.
- Названия уровней подписки должны быть в образах Рамаяны.
- Материалы лежат на Яндекс Диске, частично в ВК и Telegram-каналах, а также на `samskrtam.ru`.
- Вопрос о немедленной публикации материалов требует отдельного аудита.
- Расшифровки видео нужны для сайта и цитат Леонова.
- Нужна отдельная страница `Хронология русской Рамаяны`.
- Каталог переводов и пересказов пока делать отдельным разделом.
- Переводы, подстрочники, пересказы и адаптации нужно жёстко разделять.
- Карту и аудио оставить вторым уровнем.
- Тон главной страницы: прямой краудфандинговый.
- Ориентировочный срок подготовки книги V: 2027 год.
- Работа над книгой VI продолжится после сбора средств; оптимальный ориентир — 2029 год.
- За подготовку указателей отвечает к.ф.н. М.Ю. Гасунс.
- После завершения перевода и комментариев нужен отдельный сбор на печатную подготовку.

### Новые Открытые Вопросы

- Как назвать уровни подписки в образах Рамаяны.
- Какой технический формат выбрать для реестра пожертвований: локальный CSV/JSON или таблица с экспортом.
- Какие материалы инвентаризировать первыми.
- Какой текст и CTA поставить на первый экран главной.
- Как выдавать закрытые черновики подписчикам.

### Архитектура Внедрения

- Создан `architecture.md` с практической архитектурой перехода от одного `index.html` к статическому data-driven сайту.
- Зафиксирован стартовый принцип: оставить GitHub Pages и не вводить тяжёлый фреймворк на первом этапе.
- Предложена структура `data/*.json` для статусов книг, переводов, пересказов, аудио, видео, хронологии, платёжных способов и публичного счётчика.
- Предложены основные страницы: `support.html`, `project.html`, `translations.html`, `timeline.html`, `audio.html`, `media.html`, `compare/sundarakanda-start.html`.
- Зафиксирован первый внедряемый этап: создать JSON-данные проекта и сбора, добавить новый краудфандинговый первый экран и отдельную страницу поддержки.
- Зафиксировано, что приватные донорские данные не должны попадать в публичный репозиторий.

### Implementation Plan

- Создана папка `docs/implementation/` с планом внедрения для Gemini Flash.
- План разбит на документы короче 100 строк:
  - `README.md`;
  - `phase-1-crowdfunding.md`;
  - `phase-1-data-contracts.md`;
  - `verification-and-tests.md`;
  - `verification-automated.md`;
  - `verification-manual.md`.
- Зафиксированы ограничения для первой фазы: не трогать MP3, PDF, изображения, карту, аудио-логику и приватные данные доноров.
- Зафиксированы критерии приёмки: валидный JSON, наличие `support.html`, видимый CTA, отсутствие приватных данных, отсутствие новых больших файлов, сохранность аудио и карты.
- Добавлены команды автоматической проверки и ручной браузерный чеклист.
