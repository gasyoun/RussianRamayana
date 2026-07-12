# -*- coding: utf-8 -*-
"""Валидация движка трудности против ручного аппарата сарги 1 (H764 Wave 0, шаг 3).

Меряем:
  recall  — сколько из N словарных лемм аппарата движок отобрал сам;
  noise   — сколько кандидатов движок добавил СВЕРХ аппарата (precision-подобно);
            ~50 из них выводим для ручной оценки осмысленности.

Согласование лемма<->поверхностная форма: аппарат = леммы, движок = surface
формы после сандхи. Считаем лемму m покрытой, если в ТОЙ ЖЕ сарге есть кандидат
e, где m и e делят основу (одно вложено в другое, длина совпадения >= 4).

Автор: Opus 4.8 (`claude-opus-4-8`).
"""
import json
import sys

import common as C

MIN_OVERLAP = 4


def stem_match(m, e):
    """m (лемма SLP1) покрыта поверхностной формой e?"""
    if m == e:
        return True
    if len(m) >= MIN_OVERLAP and m in e:
        return True
    if len(e) >= MIN_OVERLAP and e in m:
        return True
    # общий префикс
    k = 0
    for a, b in zip(m, e):
        if a != b:
            break
        k += 1
    return k >= max(MIN_OVERLAP, min(len(m), len(e)) - 1)


def load(path):
    return json.load(open(path, encoding="utf-8"))


def run(apparatus_json, candidates_json):
    app = load(apparatus_json)
    cand = load(candidates_json)

    M = [h["slp1"] for h in app["headwords"]]           # леммы аппарата (сарга 1)
    Mset = set(M)

    # кандидаты движка ТОЛЬКО по сарге 1 + ВСЕ токены сарги 1 (для "достижимых")
    eng_all = []
    all_tokens_s1 = set()
    for v in cand["verses"]:
        if v["sarga"] != 1:
            continue
        for t in C.tokenize_slp1(v.get("slp1", "")):
            all_tokens_s1.add(t)
        for c in v["candidates"]:
            eng_all.append(c)
    E = set(e["slp1"] for e in eng_all)

    # достижимые леммы: те, что вообще всплывают в тексте нумерованных шлок
    # (не в мангале, не спрятаны целиком в композите) — потолок recall
    reachable = [m for m in M if any(stem_match(m, t) for t in all_tokens_s1)]
    unreachable = [m for m in M if m not in set(reachable)]

    # --- recall ---
    covered = []
    missed = []
    for m in M:
        if any(stem_match(m, e) for e in E):
            covered.append(m)
        else:
            missed.append(m)
    recall = len(covered) / max(len(M), 1)
    covered_reach = [m for m in reachable if m in set(covered)]
    recall_reachable = len(covered_reach) / max(len(reachable), 1)

    # --- noise / precision-подобно ---
    matched_cand = [c for c in eng_all if any(stem_match(m, c["slp1"]) for m in Mset)]
    extra_cand = [c for c in eng_all if not any(stem_match(m, c["slp1"]) for m in Mset)]
    # уникальные поверхностные формы
    uniq_matched = set(c["slp1"] for c in matched_cand)
    uniq_extra = set(c["slp1"] for c in extra_cand)
    precision = len(uniq_matched) / max(len(E), 1)

    res = {
        "apparatus_lemmas": len(M),
        "reachable_lemmas": len(reachable),
        "unreachable_lemmas": len(unreachable),
        "engine_candidates_sarga1_total": len(eng_all),
        "engine_candidates_sarga1_unique": len(E),
        "recall_all": round(recall, 3),
        "recall_reachable": round(recall_reachable, 3),
        "covered": len(covered),
        "missed": len(missed),
        "precision_like": round(precision, 3),
        "unique_matched": len(uniq_matched),
        "unique_extra": len(uniq_extra),
        "already_noted_among_candidates": sum(1 for c in eng_all if c["already_noted"]),
        "missed_examples": [C.slp1_to_iast(m) for m in missed[:40]],
        "extra_examples": [C.slp1_to_iast(s) for s in sorted(uniq_extra)[:50]],
    }
    print(json.dumps({k: v for k, v in res.items()
                      if k not in ("missed_examples", "extra_examples")},
                     ensure_ascii=False, indent=1))
    print("MISSED (аппарат, движок не взял):", ", ".join(res["missed_examples"][:25]))
    print("EXTRA (движок сверх аппарата):", ", ".join(res["extra_examples"][:25]))
    return res


if __name__ == "__main__":
    base = C.Path(__file__).resolve().parents[1] / "data"
    app = sys.argv[1] if len(sys.argv) > 1 else str(base / "apparatus_sarga1.json")
    cand = sys.argv[2] if len(sys.argv) > 2 else str(base / "candidates.json")
    run(app, cand)
