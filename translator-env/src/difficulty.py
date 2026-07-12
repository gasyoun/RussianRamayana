# -*- coding: utf-8 -*-
"""Движок трудности (H764 Wave 0, шаг 1).

Для каждой шлоки сарг 1–2 Сундараканды: SLP1-леммы -> 4 сигнала -> ранжированный
список кандидатов на сноску.

Сигналы (рулинг МГ 12-07-2026, все четыре):
  (а) расхождение классиков  — >=2 существенно разных русских передач слова
       в НЕ-леоновских работах корпуса (глоссарий);
  (б) редкость               — корпусная частота n <= RARE_N;
  (в) лог 499 запросов        — СТАБ: данных нет до экспорта с машины Леонова
       (@WAITING), сигнал реализован, но вклад = 0 до подключения лога;
  (г) селф-TM Леонова         — есть ли у слова устоявшаяся ЕГО передача.
       Если да (>=2 согласованных вхождения в его Сундараканде) — подавляем
       (слово он знает); если нет — лёгкий плюс.

Кандидат = difficulty_score >= CAND_THRESHOLD; служебные слова отсеяны в common.

Запуск:  python difficulty.py  [--sargas 1,2]  [--out ../data/candidates.json]
Автор: Opus 4.8 (`claude-opus-4-8`).
"""
import argparse
import json
import re
from collections import Counter, defaultdict

import common as C

# --- Пороги / веса (задокументированы, выставлены после прогона распределений) ---
RARE_N = 2            # слово с корпусной частотой <= 2 считается редким
DIVERGENCE_MIN = 2    # >=2 разных СЕМЕЙ основ классических передач = расхождение
# Расхождение считаем по СЕМЬЯМ основ (common.ru_family), не по строкам: флексия
# (велик-ое/-ий/-ая) дробит одну передачу на сотни строк и раздувала сигнал на
# частотных словах (mahat n=994 давал «229 передач»). Семья substantive, если
# её доля массы >= FAM_SUPPORT или вхождений >= FAM_MIN_OCC. Расхождение = >=2
# substantive-семьи И ни одна не доминирует (доля топ-семьи <= FAM_DOMINANT_MAX).
FAM_SUPPORT = 0.15        # семья должна нести >=15% массы передач…
FAM_MIN_OCC = 2           # …или встретиться >=2 раз
FAM_DOMINANT_MAX = 0.70   # если топ-семья >70% массы — консенсус, не расхождение
RARE_SAMPLE = 3           # при <=3 вхождениях выборка мала: >=2 семьи = расхождение
# Частотный потолок расхождения. Гиперчастотное слово (mahat n=994, abravīt
# n=1524, dṛṣṭvā n=1857) даёт много синонимов в большом корпусе, но переводчик
# видел его сотни раз — сноска на «сказал» — чистый шум. Расхождение считаем
# сигналом трудности ТОЛЬКО ниже потолка; выше — слово освоенное, не сноскуем.
# Порог откалиброван по валидации сарги 1 (см. VALIDATION_SARGA1.md).
DIV_FREQ_MAX = 80
# Расхождение классиков — ГЛАВНЫЙ сигнал трудности (случай kālāntaka): именно
# ради него строится среда. Редкость поверхностной формы — слабый сигнал (её
# раздувают флективные формы глаголов), поэтому одной редкости на кандидата не
# хватает; редкость лишь усиливает слово, у которого уже есть классическая глосса.
# Две задачи среды → два яруса кандидатов (ранжируются баллом):
#   Ярус A (расхождение): классики передают слово по-разному → показать варианты.
#   Ярус B (комментаризация): слово нечастотное, но у него ЕСТЬ аттестованная
#     передача классика → показать её, чтобы переводчик не лез в словарь.
# Обе задачи прямо у Леонова в цели («сноски вместо ручных запросов»).
W_DIVERGENCE = 2.0        # ярус A
W_MIDRARE_GLOSSED = 1.0   # ярус B: нечастотное (n<=MID_RARE_N) слово с глоссой
W_NO_SELFTM = 0.0     # у слова нет устоявшейся передачи у самого Леонова (нейтрально)
W_SELFTM_SUPPRESS = -2.0  # есть устоявшаяся своя передача — подавить
W_LOG499 = 0.0        # СТАБ: лог запросов ещё не экспортирован
W_VERBAL_SUPPRESS = -3.0  # очевидная глагольная форма — не словарная лемма
MID_RARE_N = 50       # потолок «нечастотности» для яруса B (калибровка по сарге 1)
CAND_THRESHOLD = 1.0  # ярус A (2.0) и ярус B (1.0) проходят; голая редкость без глоссы — нет


# Явные глагольные/причастные окончания SLP1: аппарат Леонова перечисляет
# ЛЕММЫ (словарную форму), а не спрягаемые формы, поэтому очевидные абсолютивы
# (ā-…-ya, -tvA), причастия (-at/-ant/-antaM) и финитные глаголы — шум фильтра.
_VERBAL = re.compile(
    r"("
    r"tvA$|itvA$|wvA$|zwvA$|dvA$|"    # герундий -tvā (ретрофлекс dfzwvA, звонк. budDvA)
    r"^[aA].*ya$|"                    # ā-абсолютив: AgatYa, AsAdya, AlaBya ...
    r"(anti|ati|asi|AmAsa|izyati|izyanti|izyat|izyAmi|izye|syAmi|syati|syAmas|eti| syati)$|"  # финитные (в т.ч. буд. 1 л.)
    r"(ur|ire|uvur|ere)$|"           # перфект 3 мн./мед.: jagmur, tuzwuvur, cakASire
    r"(ayan|ayann|ann|ayantaM|ayantaH)$|"  # прич. наст. каузатива: vilokayan, pibann
    r"(antaM|antaH|atA|ataH|adBiH|adBis|amAnaM|amAnA|amAnaH)$"  # причастия
    r")"
)


def is_verbal_form(slp1: str) -> bool:
    return bool(_VERBAL.search(slp1))


def leonov_selftm_index(sargas_all=range(1, 69)):
    """Индекс собственных передач Леонова: {slp1_surface -> Counter(norm_ru)}
    из ВСЕЙ его Сундараканды (кн. V) — это его самый чистый self-TM."""
    # Собираем все поверхностные формы всей Сундараканды и их русские соответствия
    # через глоссарий (works=05_ramayana-sundarakanda).
    # Дешевле: для оценки "есть ли устоявшаяся передача" используем поле works
    # в записях глоссария, которые мы и так грузим ниже. Отдельный индекс не нужен.
    return None


def score_token(slp1, entry, note_words):
    """Вернуть (score, dict-со-свидетельствами) для одной поверхностной формы."""
    signals = {}
    ev = {}

    translations = entry.get("translations", []) if entry else []
    n_total = entry.get("n", 0) if entry else 0

    # --- классические (не-леоновские) передачи ---
    classic_renders = {}   # norm_ru -> {"ru": raw, "loci": [...], "w": occ}
    leonov_renders = {}     # norm_ru -> count (self-TM)
    for tr in translations:
        works = tr.get("works", {}) or {}
        ru = tr.get("ru", "")
        nru = C.norm_ru(ru)
        loci = tr.get("src_sample", []) or []
        w_occ = tr.get("n", 1)
        is_leonov = any(w in C.LEONOV_WORKS for w in works)
        is_classic = any(w not in C.LEONOV_WORKS for w in works)
        if is_leonov:
            leonov_renders[nru] = leonov_renders.get(nru, 0) + w_occ
        if is_classic:
            if nru not in classic_renders:
                classic_renders[nru] = {"ru": ru, "loci": [], "works": set(), "w": 0}
            classic_renders[nru]["loci"].extend(loci[:2])
            classic_renders[nru]["w"] += w_occ
            for w in works:
                if w not in C.LEONOV_WORKS:
                    classic_renders[nru]["works"].add(w)

    # (а) расхождение классиков — по СЕМЬЯМ основ, взвешенным вхождениями
    fam_w = defaultdict(float)      # семья основ -> суммарная масса
    fam_repr = {}                   # семья -> представительная строка (макс. вес)
    for nru, d in classic_renders.items():
        fam = C.ru_family(d["ru"])
        if not fam:
            continue
        fam_w[fam] += d["w"]
        if fam not in fam_repr or d["w"] > classic_renders.get(fam_repr[fam], {}).get("w", 0):
            fam_repr[fam] = nru
    total_w = sum(fam_w.values())
    substantive = [f for f, w in fam_w.items()
                   if total_w and (w / total_w >= FAM_SUPPORT or w >= FAM_MIN_OCC)]
    top_share = (max(fam_w.values()) / total_w) if total_w else 0.0
    if n_total > DIV_FREQ_MAX:
        # гиперчастотное слово — освоено переводчиком, расхождение не сигналим
        diverge = False
    elif total_w and total_w <= RARE_SAMPLE:
        # малая выборка: любые >=2 разные семьи = неустоявшаяся передача
        diverge = len(fam_w) >= DIVERGENCE_MIN
    else:
        diverge = len(substantive) >= DIVERGENCE_MIN and top_share <= FAM_DOMINANT_MAX
    signals["divergence"] = diverge
    ev["n_families"] = len(fam_w)
    ev["n_substantive_families"] = len(substantive)
    ev["top_family_share"] = round(top_share, 2)
    # Представительные строки для сноски: по одной на семью, самые весомые семьи
    # первыми. Ярус A показывает ВСЕ substantive-семьи (варианты классиков);
    # ярус B — только 1–2 верхние (устоявшаяся передача, чтобы не искать в словаре).
    fams_by_w = sorted(fam_w, key=lambda f: -fam_w[f])
    if diverge:
        pick = [f for f in fams_by_w if f in substantive] or fams_by_w
    else:
        pick = fams_by_w[:2]
    reps = {}
    for f in pick:
        nru = fam_repr.get(f)
        if nru and nru in classic_renders:
            reps[nru] = classic_renders[nru]
    if reps:
        ev["classic_renders"] = reps

    has_gloss = len(classic_renders) >= 1

    # (б) редкость / комментаризация (ярус B)
    rare = 0 < n_total <= RARE_N
    midrare_glossed = 0 < n_total <= MID_RARE_N and has_gloss
    signals["rare"] = rare
    signals["midrare_glossed"] = midrare_glossed
    ev["n_total"] = n_total

    # (в) лог-499 — СТАБ
    signals["log499"] = False  # нет данных

    # (г) селф-TM
    has_selftm = len(leonov_renders) >= 1
    consistent_selftm = has_selftm and max(leonov_renders.values()) >= 2 and len(leonov_renders) == 1
    signals["selftm"] = has_selftm
    signals["selftm_consistent"] = consistent_selftm
    if has_selftm:
        ev["leonov_renders"] = leonov_renders

    verbal = is_verbal_form(slp1)
    signals["verbal"] = verbal
    score = (W_DIVERGENCE * diverge
             + (W_MIDRARE_GLOSSED if midrare_glossed and not diverge else 0.0)
             + W_LOG499 * signals["log499"]
             + (W_NO_SELFTM if not has_selftm and (diverge or midrare_glossed) else 0.0)
             + (W_SELFTM_SUPPRESS if consistent_selftm else 0.0)
             + (W_VERBAL_SUPPRESS if verbal else 0.0))
    # ярус для группировки в листах
    ev["tier"] = "A" if diverge else ("B" if (midrare_glossed and score >= CAND_THRESHOLD) else "")

    already_noted = slp1 in note_words or C.slp1_to_iast(slp1) in " ".join(note_words) if note_words else False
    return score, signals, ev, classic_renders


def note_word_set(raw_texts):
    """Множество IAST/SLP1-слов, упомянутых в заметках Леонова к этой шлоке
    (для пометки already_noted)."""
    words = set()
    for txt in raw_texts:
        # IAST-слова в скобках и латиницей внутри русского текста
        for m in re.findall(r"[a-zāīūṛṝḷṅñṭḍṇśṣ̥ḥṃ'\-]{3,}", txt.lower()):
            words.add(m.strip("'-"))
    return words


def run(sargas, out_path):
    verses = C.load_corpus_sargas(sargas)
    # собрать все поверхностные формы
    all_tokens = []
    verse_tokens = []
    for v in verses:
        toks = C.tokenize_slp1(v["slp1"])
        verse_tokens.append(toks)
        all_tokens.extend(toks)
    uniq = sorted(set(all_tokens))
    print(f"[difficulty] сарги {sargas}: {len(verses)} шлок, "
          f"{len(all_tokens)} токенов, {len(uniq)} уникальных форм")

    gloss = C.load_glossary_for(uniq)
    print(f"[difficulty] глоссарий покрыл {len(gloss)}/{len(uniq)} форм")

    notes = C.load_leonov_notes()

    n_dist = Counter()
    out_verses = []
    total_cand = 0
    for v, toks in zip(verses, verse_tokens):
        sarga = int(v["sarga"])
        verse_no = int(re.sub(r"\D.*$", "", v["passage"].split(".", 1)[1]) or 0)
        raw_notes = notes.get(sarga, {}).get(verse_no, [])
        nwords = note_word_set(raw_notes)
        cands = []
        seen = set()
        for slp1 in toks:
            if slp1 in seen:
                continue
            seen.add(slp1)
            entry = gloss.get(slp1)
            score, signals, ev, classic = score_token(slp1, entry, nwords)
            n_dist[ev.get("n_total", 0)] += 1
            if score >= CAND_THRESHOLD:
                iast = C.slp1_to_iast(slp1)
                already = iast in nwords or slp1 in nwords or any(iast in w or w in iast for w in nwords)
                cands.append({
                    "slp1": slp1,
                    "iast": iast,
                    "score": round(score, 2),
                    "tier": ev.get("tier", ""),
                    "signals": {k: signals.get(k) for k in ("divergence", "rare", "midrare_glossed", "log499", "selftm", "selftm_consistent", "verbal")},
                    "n_total": ev.get("n_total", 0),
                    "top_family_share": ev.get("top_family_share"),
                    "n_substantive_families": ev.get("n_substantive_families"),
                    "already_noted": bool(already),
                    "classic_renders": [
                        {"ru": d["ru"], "loci": d["loci"], "works": sorted(d["works"])}
                        for d in ev.get("classic_renders", {}).values()
                    ],
                    "leonov_renders": ev.get("leonov_renders", {}),
                })
        cands.sort(key=lambda c: (-c["score"], c["slp1"]))
        total_cand += len(cands)
        out_verses.append({
            "sarga": sarga, "verse": verse_no, "passage": v["passage"],
            "slp1": v["slp1"], "iast": v["iast"], "ru": v["ru"],
            "candidates": cands,
        })

    out_path = str(out_path)
    import os
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump({
            "_meta": {
                "handoff": "H764", "wave": 0,
                "model": "Opus 4.8 (claude-opus-4-8)",
                "sargas": list(sargas),
                "params": {"RARE_N": RARE_N, "DIVERGENCE_MIN": DIVERGENCE_MIN,
                           "MID_RARE_N": MID_RARE_N, "DIV_FREQ_MAX": DIV_FREQ_MAX,
                           "FAM_SUPPORT": FAM_SUPPORT, "FAM_DOMINANT_MAX": FAM_DOMINANT_MAX,
                           "CAND_THRESHOLD": CAND_THRESHOLD,
                           "weights": {"divergence": W_DIVERGENCE,
                                       "midrare_glossed": W_MIDRARE_GLOSSED,
                                       "no_selftm": W_NO_SELFTM,
                                       "selftm_suppress": W_SELFTM_SUPPRESS,
                                       "verbal_suppress": W_VERBAL_SUPPRESS,
                                       "log499": W_LOG499}},
                "verses": len(verses), "candidates": total_cand,
            },
            "verses": out_verses,
        }, fh, ensure_ascii=False, indent=1)
    print(f"[difficulty] кандидатов: {total_cand} на {len(verses)} шлок "
          f"(~{total_cand/max(len(verses),1):.1f}/шлока) -> {out_path}")
    # распределение частот (для калибровки RARE_N)
    print("[difficulty] распределение n (частота корпуса) топ:",
          dict(sorted(((k, v) for k, v in n_dist.items()), key=lambda x: x[0])[:8]))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--sargas", default="1,2")
    ap.add_argument("--out", default=str(C.Path(__file__).resolve().parents[1] / "data" / "candidates.json"))
    a = ap.parse_args()
    sargas = [int(x) for x in a.sargas.split(",") if x.strip()]
    run(sargas, a.out)
