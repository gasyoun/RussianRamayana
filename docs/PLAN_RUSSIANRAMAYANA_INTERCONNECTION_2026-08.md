# Plan — RussianRamayana interconnection, 2026-08

_Created: 26-08-2026 · Last updated: 26-08-2026_

RussianRamayana's slice of the spine-interconnection programme. Programme index:
[PLAN_SPINE_INTERCONNECTION_2026H2.md](https://github.com/gasyoun/Uprava/blob/main/docs/PLAN_SPINE_INTERCONNECTION_2026H2.md).

Architecture and verification are **not** restated here (ruling F13) — they are identical for
all fourteen repos and live once in Uprava:

- [ARCHITECTURE_SPINE_INTERCONNECTION.md](https://github.com/gasyoun/Uprava/blob/main/docs/ARCHITECTURE_SPINE_INTERCONNECTION.md) — the five attachment points and the rules governing them
- [IMPLEMENTATION_SPINE_INTERCONNECTION_W1.md](https://github.com/gasyoun/Uprava/blob/main/docs/IMPLEMENTATION_SPINE_INTERCONNECTION_W1.md) — execution order, per-handoff steps, isolation, risks
- [VERIFICATION_SPINE_INTERCONNECTION.md](https://github.com/gasyoun/Uprava/blob/main/docs/VERIFICATION_SPINE_INTERCONNECTION.md) — the five gates and what "done" means

**Nothing here has executed.** The handoff below is 🟡 queued and runs only when a human
launches it.

## Why RussianRamayana is in scope

Also recorded `standalone-by-design`. Ruling F5 wires it in, **against the recommendation given at the sitting** — its print lane has no identified consumer today, so this is the one row in the programme registered on speculation.

## Measured baseline and target

| | Value |
|---|---|
| Wiring score, 26-08-2026 | **44** / 100 |
| Target after this plan | **56** / 100 |
| How the target is reached | +8 for README hub links, ~+4 for the edge. ⚠️ This target is the one in the programme that could legitimately be **reversed** — if no consumer is named by the next coverage census, the row is retired and the score falls back. |

Measured by [`tools/interconnection_audit.py`](https://github.com/gasyoun/Uprava/blob/main/tools/interconnection_audit.py); full row in
[data/interconnection_audit_2026-08-26.json](https://github.com/gasyoun/Uprava/blob/main/data/interconnection_audit_2026-08-26.json);
report [AUDIT_REPO_INTERCONNECTION_2026-08-26.md](https://github.com/gasyoun/Uprava/blob/main/docs/AUDIT_REPO_INTERCONNECTION_2026-08-26.md).

The score counts artefacts, not whether they are true. It is **report-only** by ruling F2 and no
handoff closes on it — verification Gates 2 to 4 are what actually decide, and Gate 4 is read by
a human.

## Rulings that apply here

| Fork | Ruling |
|---|---|
| F5 | Both `standalone-by-design` ledger verdicts are overturned. The Ramayana edge is explicitly speculative. |
| F1 | Local `FINDINGS.md` in exactly four repos; the other eight get a `CLAUDE.md` pointer line. No repo gains the other seven registries. |
| F11 | Every repo with no spine back-links gains a "How this repo is wired" README section. |

Full rulings table with every fork:
[ASK_BATCH_STAGING_REPO_INTERCONNECTION_2026-08.md](https://github.com/gasyoun/Uprava/blob/main/ASK_BATCH_STAGING_REPO_INTERCONNECTION_2026-08.md) Phase 2.

## What this plan does

1. Register the print lane as an edge in both interlink surfaces, the row carrying **inline** the warning that it has no identified consumer plus a named retirement condition (F5, Gate 2).
2. Flip the ledger verdict citing the print lane and its active H2590 tracking.
3. Do **not** drop the warning or the retirement condition to make the row look like its neighbours. Verification Gate 2 permits exactly one speculative row; a second fails the gate.
4. Add the `CLAUDE.md` pointer line (F1) and the README wiring section (F11) — zero spine back-links today.

## Handoff

- [H3568 (Opus 5) — interconnect ramayana printlane speculative edge](https://github.com/gasyoun/Uprava/blob/main/handoffs/H3568-Opus_RussianRamayana_interconnect-ramayana-printlane-speculative-edge_26.08.26.md) · medium · 🟡 queued

## Autonomy contract

The launching agent may create the files named above, add hub rows, open and merge its PR,
remove its worktree and close its handoff row — without asking.

It must stop and ask if a local `FINDINGS.md` cannot be given two genuine findings (the
documented fallback is to drop the file and take the pointer line, recorded not silent), if a
corpus row would carry an unmasked snapshot or quote a sample, or if a second speculative edge
becomes necessary. It must never turn the wiring score into a failing gate, commit to
`csl-orig`, or add the seven non-FINDINGS registries.

## Open @DECIDE

None. Every fork touching RussianRamayana was ruled in sitting 1 on 26-08-2026, so the autonomy gate
passes and nothing in the wave-1 path stalls on a human.

_Dr. Mārcis Gasūns_
