# Пилот книги I: операторский runbook (H2776, шаг 6)

_Created: 15-08-2026 · Last updated: 15-08-2026_

Машинная половина шага 6 выполнена (Fable 5 `claude-fable-5`, 15-08-2026); этот runbook —
операторская половина. Генерационные стадии `[1]`–`[4]` по контракту плана (рулинг 8,
[IMPLEMENTATION §Шаг 6, п. 3](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/IMPLEMENTATION_LITPAM_INDEXATOR_PRINT_READINESS.md))
выполняются существующими авторскими скриптами под оператором; additive-автоматизация
разрешена только для preflight/export/evidence — она уже сделана и перечислена ниже.

## Что уже готово (агент, не повторять)

| Готово | Где | Доказательство |
|---|---|---|
| Conversion gate = `PASS_WITH_WAIVERS` (waiver МГ 15-08-2026) | [gate-report-waived.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/gate-report-waived.json) | exit 0; waived-пункты остались в defect ledger |
| Pilot workspace (SHA-верифицированная копия пакета 2025) | `work/print-readiness/pilot-I/` (вне Git) | `workspace-manifest` prepare_workspace.py |
| Версионная рабочая копия | `work/print-readiness/pilot-I/Ramayana_I_pilot_2026.indd` | InDesign 2026 (21.0.1.6) |
| **Overset снят: 0 историй** (было 3, waived) | там же | [overset-resolution.txt](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/prep/overset-resolution.txt) — 5 extension-фреймов на pasteboard с меткой `H2776-overset-extension`; текст не удалялся, страницы не двигались |
| Контент-нейтральность правки доказана | [pilot-vs-conversion-pages.json](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/prep/pilot-vs-conversion-pages.json) | 0/442 страниц отличий против conversion-PDF |
| Corrected workbook подключён | `work/print-readiness/pilot-I/Указатель_к_Рамаяне_1_2_2026_08_15.xlsx` | 43/43 исправлений (строка 221 — рулинг МГ 15-08), [ledger](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/dictionary/correction-ledger.md) |
| Шрифты все INSTALLED, 442 стр. | [Ramayana_I_pilot_2026.report.txt](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/book-I/pilot-2026/prep/Ramayana_I_pilot_2026.report.txt) | live evidence export |

## ✅ Словник закрыт полностью (обновление 15-08-2026)

Строка 221 («Предметы и термины», `[без тега не искать]`) очищена по рулингу МГ
15-08-2026 — repair перегнан с оригинала: **43/43 fixed, 0 WAITING, валидатор чист,
второй прогон 0 операций.** Актуальный словник:
`work/print-readiness/pilot-I/Указатель_к_Рамаяне_1_2_2026_08_15.xlsx`
(канон в [xls/derived/](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/xls/derived);
[ledger](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/artifacts/print-readiness/dictionary/correction-ledger.md)).
Файл `…2026_08_12.xlsx` упразднён — не использовать. Ловушка MANUAL про прозу в колонке
`C` (видео 12) снята: прозы в словнике больше нет.

## Операторские стадии (по [MANUAL](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md))

Работать ТОЛЬКО в `work/print-readiness/pilot-I/Ramayana_I_pilot_2026.indd`.
Оригиналы 2025 неприкосновенны (рулинг 26). Бюджет: полный проход — не одна сессия;
стадия `[3]` ≈1–1,5 ч непрерывного блока.

1. **`[0]` пропускается** — текст не менялся с 2025, символьные стили уже в вёрстке.
2. **`[1]` Таблицы IndexList** (~30–60 мин): 4 листа corrected workbook (`…2026_08_15.xlsx`) →
   `UseReadyTable.v.7.jsx` → `IndexList-001…004` → `AddMarker.jsx` (`a/b/c/d`) →
   `MergeTwoTables` → сводная `IndexList[@]-001`. Дрилл Golden Fish перед боевым прогоном
   `UseReadyTable` (статическая проверка H377 была, живой прогон в InDesign — нет).
3. **`[2]`** почти пропускается (по info.txt автора).
4. **`[3]` Индексирование** (≈1–1,5 ч + разбор `log.txt`): `ProcStoryOrDoс[09.10.2023].jsx`
   («с» кириллическая), в диалоге отметить «Удалить все имеющиеся записи в индексе»
   (регенерация, не дозапись). `log.txt` → в `save/`, разобрать.
5. **`[4]` Сборка и оформление** (~1–2 ч): «Построить указатель» → `ProcNumberLines…` →
   `SplitStory` → «См.»/прочерки/рубрики по `Очерёдность.txt`; нормализация по
   [INDEX_STYLE_SPEC.md](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/print-readiness/INDEX_STYLE_SPEC.md).

## После каждой стадии — машинная фиксация (агент или оператор, 1 команда)

```powershell
python Litpam-Indexator/tools/indesign/run_evidence_export.py --target "Litpam-Indexator/work/print-readiness/pilot-I/Ramayana_I_pilot_2026.indd" --output-dir "Litpam-Indexator/work/print-readiness/pilot-I/evidence" --base-name "Ramayana_I_pilot_stage<N>" --quit
```

Финал пилота (агентская часть, после стадии `[4]`): coverage по регенерированному IDML,
перепроверка ссылок после pagination, `verify-packet`, versioned IDML + proof-PDF +
manifest в `artifacts/print-readiness/book-I/pilot-2026/`, статус
`AUTOMATED_PASS / HUMAN_REVIEW_WAITING` в PLAN/`.ai_state.md`. Extension-фреймы
`H2776-overset-extension` перед финальным экспортом НЕ удалять (рабочий материал,
в PDF не попадают — pasteboard).

_Dr. Mārcis Gasūns_
