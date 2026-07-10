# H371 revival audit — the repo is already active, not dormant

_Created: 10-07-2026 · Last updated: 10-07-2026_

**Disposition of handoff [H371](https://github.com/gasyoun/Uprava/blob/main/handoffs/H371-Sonnet_RussianRamayana_revival_audit_roadmap_08.07.26.md)** — "RussianRamayana revival: audit + no-interview roadmap."
Executor Sonnet 5 (`claude-sonnet-5`), 10-07-2026.

## Verdict: no revival needed — the "dormant since 26-06" premise was already stale at mint time

H371 was minted 08-07-2026 from year-roadmap ruling R8 on the premise that this repo has been "dormant since 26-06-2026" and that "nobody has stated what active means" for it. Both are false as measured today:

1. **Not dormant.** `git log` shows continuous work: [PR #12](https://github.com/gasyoun/RussianRamayana/pull/12) (H365, Leitan-Sundarakanda wiring, 08-07), [PR #13](https://github.com/gasyoun/RussianRamayana/pull/13) (H367, bibliography section, 08-07), and a large Litpam-Indexator overhaul ([PR #16](https://github.com/gasyoun/RussianRamayana/pull/16)/[#19](https://github.com/gasyoun/RussianRamayana/pull/19), H377, 10-07-2026 — MANUAL.md rework, 7 code defects fixed, DeepSeek copilot tooling). `roadmap.md` itself was last substantively edited 08-07-2026, the same day H371 was minted.
2. **"What active means" is already stated, in detail, by MG himself.** [`roadmap.md`](https://github.com/gasyoun/RussianRamayana/blob/main/roadmap.md) is not a stub — it carries a mission statement, positioning, team, book-by-book status (I–VI), rights inventory, a full crowdfunding design (goals/tiers/transparency), site architecture, a dated **"Следующие шаги (Задачи на Q3–Q4 2026)"** wave list, a **15-item "Следующие вопросы"** open-decisions log (`Q1`–`Q15`), and an **"Открытые риски"** section. This already *is* the audit-derived, decisions-marked roadmap H371's Mission §2 asked for — it predates this handoff and is more detailed than a fresh no-interview pass would produce from outside.
3. **GTD already tracks the genuine open items**, surfaced 03-07-2026 from `.ai_state.md`/`roadmap.md` (not from this session): the `recension` `@DECIDE` (Baroda critical edition vs. Bombay vulgate — which Sanskrit source Гринцер actually translated from), the fundraising-data `@DO` (real sums/payment URLs), and the Zenodo-DOI `@DO` (deferred org-wide to ≥15-07-2026). See [`GTD_NEXT_ACTIONS.md`](https://github.com/gasyoun/Uprava/blob/main/GTD_NEXT_ACTIONS.md) "Waiting on Me" section.

Writing a parallel `docs/ROADMAP_2026_2027.md` per H371's literal instruction would either duplicate `roadmap.md` (stale the moment either drifts) or fork the single source of truth MG actively edits. Per the org's own "check prior art / build only the gap" rule, that duplication is exactly what not to do.

## What this session actually verified (the audit, honestly)

- **Reuse edges:** no `corpus_lexicon`/SamudraManthanam TM reuse is wired into RussianRamayana's parallel-corpus page (`Параллельный корпус, Сундараканда` links to samskrtam.ru, external to this repo) — that stays a genuine future integration point, not something this audit can resolve without a human call on scope.
- **Text-rights status:** already resolved and documented, not a gap. `roadmap.md` "Права и материалы": rights are held (scans, OCR, audio, bibliography, photos, prefaces, video). The one unresolved rights-adjacent item is the `recension` `@DECIDE` above (a textual-provenance question, not a permissions question) — already in GTD.
- **AfanasiyNikitin A28-pattern comparison:** not applicable here — AfanasiyNikitin's triage was about clearing third-party text rights for corpus inclusion; RussianRamayana's texts are already rights-cleared per MG, so there is no equivalent triage to run.
- **Wave-1 agent-doable unit:** the one concrete, ungated, agent-doable item already exists and is already tracked — [`GTD_NEXT_ACTIONS.md`](https://github.com/gasyoun/Uprava/blob/main/GTD_NEXT_ACTIONS.md) "Litpam-Indexator — прогнать pre-flight-валидатор словаря вживую" (run `Litpam-Indexator/tools/validate_dictionary.py` against the real `.xlsx`, H363/PR #14). No new handoff minted for it — minting a second one would just fork the same task.

## Non-goals (confirmed, not newly decided)

- No content/translation work (H371's own guardrail; also nothing in this audit changes it).
- No new fundraising copy/design — `roadmap.md` §Краудфандинг already owns this.
- No English-language version — `roadmap.md` "Основное позиционирование" rules it out explicitly ("Английская версия пока не нужна").

_Dr. Mārcis Gasūns_
