# -*- coding: utf-8 -*-
"""Генератор листов сносок (H764 Wave 0, шаг 2 + шаг 4).

Из data/candidates.json строит по саргам «листы переводчика»: к каждой шлоке —
детерминированные сноски по трудным словам в формате, близком к ручному
аппарату Леонова:

    **word (iast)** — «передача» (Источник locus); «вариант» (Источник locus)
    ┗ словарь (Кочергина): краткая глосса

Ярус A (расхождение классиков) показывает варианты; ярус B (нечастотное слово с
аттестованной передачей) — устоявшуюся передачу, чтобы не лезть в словарь.
Слова, уже объяснённые заметкой Леонова/Костиной или tier-2 аппаратом к ЭТОЙ
шлоке, помечаются already_noted и в свежие сноски не выносятся (шаг дедупа).

Три формы выпуска (шаг 4, все три — рулинг МГ, переводчик выберет):
    sheets/sarga_<N>.html         — автономный лист-обозрение (офлайн, паттерн review-sheet)
    sheets/sarga_<N>.md           — Markdown с pandoc-сносками -> .docx (шаг render_docx.py)
    sheets/web_mock_sarga_<N>.html — статичный мок веб-режима под reader samskrtam.ru

Запуск:  python gen_sheets.py [--sargas 1,2] [--max-fn 8]
Автор: Opus 4.8 (`claude-opus-4-8`), H764.
"""
import argparse
import html
import json
import os
import re
from pathlib import Path

import common as C

DATA = Path(__file__).resolve().parents[1] / "data"
SHEETS = Path(__file__).resolve().parents[1] / "sheets"
KOCHERGINA = C.GITHUB_ROOT / "SamudraManthanam" / "web" / "corpus_builder" / "jsonl" / "kochergina.jsonl"
SUNDARA_ADD = C.GITHUB_ROOT / "CommentaryStrategies" / "data" / "sundara_commentary_to_add.json"

MODEL = "Opus 4.8 (claude-opus-4-8)"

# --- Ярлыки корпусных работ -> читаемый источник + том ----------------------
_ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
          "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII"]
_MB_PARVA = {
    "adiparva": "Ади", "sabhaparva": "Сабха", "aranyakaparva": "Аранья",
    "virataparva": "Вирата", "udyogaparva": "Удьйога", "bhishmaparva": "Бхишма",
    "dronaparva": "Дрона", "karnaparva": "Карна", "shalyaparva": "Шалья",
    "sauptikaparva": "Сауптика", "striparva": "Стри", "shantiparva": "Шанти",
    "anushasanaparva": "Анушасана", "ashvamedhikaparva": "Ашвамедхика",
    "ashramavasikaparva": "Ашрамаваси", "mausalaparva": "Маусала",
}
_RAM_KANDA = {
    "balakanda": "Бала", "ayodhyakanda": "Айодхья", "aranyakanda": "Аранья",
    "kishkindhakanda": "Кишкиндха", "sundarakanda": "Сундара", "yuddhakanda": "Юддха",
    "uttarakanda": "Уттара",
}
_MISC = {
    "raghuvamsha": "Рагхуванша", "buddhacharita": "Буддхачарита",
    "manavadharmashastra": "Ману-смрити", "shukasaptati": "Шукасаптати",
    "bhagavadgita-prabhupada": "Бх.-гита (Прабхупада)", "ch-up": "Чхандогья-уп.",
    "br-up": "Брихадараньяка-уп.", "amarushataka": "Амарушатака",
    "shatakatrayam": "Бхартрихари", "meghaduta": "Мегхадута",
    "kumarasambhava": "Кумарасамбхава", "kiratarjuniya": "Киратарджуния",
}


def work_label(wk: str) -> str:
    """'03_mahabharata-aranyakaparva' -> 'Махабхарата III (Аранья)'."""
    m = re.match(r"^(\d+)_mahabharata-(\w+)$", wk)
    if m:
        vol = _ROMAN[int(m.group(1))] if int(m.group(1)) < len(_ROMAN) else m.group(1)
        return f"Махабхарата {vol} ({_MB_PARVA.get(m.group(2), m.group(2))})"
    m = re.match(r"^(\d+)_ramayana-(\w+)$", wk)
    if m:
        vol = _ROMAN[int(m.group(1))] if int(m.group(1)) < len(_ROMAN) else m.group(1)
        return f"Рамаяна {vol} ({_RAM_KANDA.get(m.group(2), m.group(2))})"
    m = re.match(r"^(\d+)_(rigveda|atharvaveda|samaveda|yajurveda)$", wk)
    if m:
        veda = {"rigveda": "Ригведа", "atharvaveda": "Атхарваведа",
                "samaveda": "Самаведа", "yajurveda": "Яджурведа"}[m.group(2)]
        vol = _ROMAN[int(m.group(1))] if int(m.group(1)) < len(_ROMAN) else m.group(1)
        return f"{veda} {vol}"
    return _MISC.get(wk, wk)


def locus_str(render):
    """Компактный locus: '(Рамаяна III 12.4; Махабхарата I)'. Берём до двух
    источников с точным пассажем из src_sample, остальные — по названию."""
    works = render.get("works", [])
    loci = render.get("loci", [])
    # loci вида 'work:passage'
    parts = []
    used = set()
    for lc in loci[:2]:
        if ":" in lc:
            wk, ps = lc.split(":", 1)
            parts.append(f"{work_label(wk)} {ps}")
            used.add(wk)
    for wk in works:
        if wk not in used and len(parts) < 3:
            parts.append(work_label(wk))
            used.add(wk)
    return "; ".join(parts)


# --- Словарь Кочергиной (русская лексикографическая глосса) ------------------
def build_kochergina_index(needed_slp1):
    """{slp1 -> краткая русская глосса} по нужным леммам (стрим kochergina.jsonl,
    первая head-запись на лемму). Пустой словарь, если файл недоступен/битый."""
    idx = {}
    if not KOCHERGINA.exists():
        print(f"[gloss] Кочергина не найдена: {KOCHERGINA}")
        return idx
    want = set(needed_slp1)
    # хотим ловить и по усечённой основе — индексируем всё, потом матчим с fallback
    try:
        with open(KOCHERGINA, encoding="utf-8") as fh:
            for ln in fh:
                if '"seg": "head"' not in ln and '"seg":"head"' not in ln:
                    continue
                try:
                    o = json.loads(ln)
                except Exception:
                    continue
                if o.get("seg") != "head":
                    continue
                key = (o.get("slp1") or "").lstrip("-").strip()
                if not key:
                    continue
                gloss = _clean_gloss(o.get("text") or o.get("html") or "")
                if key and gloss and key not in idx:
                    idx[key] = gloss
    except Exception as e:  # mojibake / IO — деградируем без словаря
        print(f"[gloss] Кочергина недоступна ({e}); листы без словарной глоссы")
        return {}
    return idx


_IAST_TAIL = re.compile(r"[-\s]?[a-zāīūṛṝḷṅñṭḍṇśṣṁṃḥ'’]+\s*$", re.I)


def _clean_gloss(text: str) -> str:
    t = re.sub(r"</?[^>]+>", "", text)          # снять html
    t = t.replace("°", "").strip()
    # убрать деванагари и хвостовую IAST-лемму из строки text
    t = re.sub(r"[ऀ-ॿ]+", "", t)
    t = re.sub(r"/[^/]*/", "", t)               # /-ākhyāyin/
    t = _IAST_TAIL.sub("", t).strip(" ,;—-")
    t = re.sub(r"\s+", " ", t)
    return t[:180]


def lookup_gloss(idx, slp1):
    """Найти глоссу по поверхностной форме: точное совпадение, затем усечения
    основы (грубая деинфлексия SLP1)."""
    if slp1 in idx:
        return idx[slp1]
    # грубые усечения окончаний SLP1 (по убыванию длины)
    for cut in (1, 2, 3, 4):
        if len(slp1) - cut >= 3:
            stem = slp1[:-cut]
            if stem in idx:
                return idx[stem]
            # склейка с частыми основообразующими
            for suf in ("a", "as", "an", "i", "u", "A"):
                if stem + suf in idx:
                    return idx[stem + suf]
    return None


# --- Дедуп: tier-2 аппарат (sundara_commentary_to_add) ----------------------
def load_sundara_add_lemmas():
    """{(sarga, verse) -> set(slp1)} лемм, уже покрытых tier-2 аппаратом."""
    out = {}
    if not SUNDARA_ADD.exists():
        return out
    data = json.load(open(SUNDARA_ADD, encoding="utf-8"))
    for note in data:
        if "shloka" not in note:
            continue
        m = re.match(r"^[VvIiXx]+\.(\d+)\.(\d+)", note.get("shloka", ""))
        if not m:
            continue
        s, v = int(m.group(1)), int(m.group(2))
        lemma = (note.get("lemma_iast") or "").strip()
        if not lemma:
            continue
        try:
            slp1 = C.iast_to_slp1(lemma)
        except Exception:
            continue
        out.setdefault((s, v), set()).add(slp1)
    return out


def _stem_share(a, b, k=4):
    if a == b:
        return True
    if len(a) >= k and a in b:
        return True
    if len(b) >= k and b in a:
        return True
    j = 0
    for x, y in zip(a, b):
        if x != y:
            break
        j += 1
    return j >= k


# --- Модель листа -----------------------------------------------------------
def load_machine_summaries(sargas):
    """{(sarga, verse) -> summary} из проб DeepSeek, если они уже сгенерированы."""
    out = {}
    for s in sargas:
        p = SHEETS / f"deepseek_synth_sarga{s}.json"
        if not p.exists():
            continue
        d = json.load(open(p, encoding="utf-8"))
        for o in d.get("syntheses", []):
            if o.get("summary") and "." in o.get("passage", ""):
                sa, ve = o["passage"].split(".", 1)
                out[(int(sa), int(ve))] = o["summary"]
    return out


def build_model(cand_path, sargas, max_fn):
    cand = json.load(open(cand_path, encoding="utf-8"))
    # нужные леммы для словаря
    needed = set()
    for v in cand["verses"]:
        for c in v["candidates"]:
            needed.add(c["slp1"])
    koch = build_kochergina_index(needed)
    print(f"[gloss] Кочергина: {len(koch)} лемм в индексе; "
          f"нужно {len(needed)} форм")
    sundara = load_sundara_add_lemmas()
    machine = load_machine_summaries(sargas)

    model = {"_meta": {"handoff": "H764", "wave": 0, "model": MODEL,
                       "sargas": sargas, "max_fn_per_verse": max_fn,
                       "source": "candidates.json"},
             "sargas": {}}
    stats = {"verses": 0, "footnotes": 0, "already_noted_suppressed": 0,
             "tierA": 0, "tierB": 0, "with_gloss": 0}

    for v in cand["verses"]:
        if v["sarga"] not in sargas:
            continue
        # пропускаем пустые пассажи корпуса (нет ни #sa, ни #ru) — артефакт
        if not (v.get("slp1") or "").strip() and not (v.get("ru") or "").strip():
            continue
        sarga = v["sarga"]
        snode = model["sargas"].setdefault(str(sarga), {"verses": []})
        add_lemmas = sundara.get((sarga, v["verse"]), set())
        fns = []
        for c in v["candidates"]:
            # дедуп против tier-2 аппарата (already_noted из движка = заметки Леонова)
            noted_add = any(_stem_share(c["slp1"], m) for m in add_lemmas)
            already = bool(c.get("already_noted")) or noted_add
            renders = []
            for r in c.get("classic_renders", []):
                renders.append({"ru": r["ru"], "locus": locus_str(r)})
            gloss = lookup_gloss(koch, c["slp1"])
            fn = {
                "slp1": c["slp1"], "iast": c["iast"],
                "deva": C.slp1_to_deva(c["slp1"]),
                "tier": c.get("tier", ""), "score": c["score"],
                "n_total": c.get("n_total"),
                "renders": renders, "gloss": gloss,
                "already_noted": already,
            }
            fns.append(fn)
        # свежие сноски = не already_noted; сортируем по баллу; режем по max_fn
        fresh = [f for f in fns if not f["already_noted"]]
        suppressed = [f for f in fns if f["already_noted"]]
        fresh.sort(key=lambda f: (-f["score"], f["slp1"]))
        capped = fresh[:max_fn]
        overflow = fresh[max_fn:]
        stats["verses"] += 1
        stats["footnotes"] += len(capped)
        stats["already_noted_suppressed"] += len(suppressed)
        for f in capped:
            stats["tierA"] += f["tier"] == "A"
            stats["tierB"] += f["tier"] == "B"
            stats["with_gloss"] += bool(f["gloss"])
        snode["verses"].append({
            "verse": v["verse"], "passage": v["passage"],
            "slp1": v["slp1"], "iast": v["iast"], "ru": v["ru"],
            "footnotes": capped,
            "machine_summary": machine.get((sarga, v["verse"])),
            "overflow_count": len(overflow),
            "already_noted_count": len(suppressed),
        })
    model["_meta"]["stats"] = stats
    return model


# ------------------------- РЕНДЕРЕРЫ ----------------------------------------
def _fn_text_plain(fn):
    """Однострочный текст сноски (для web-мока/докса)."""
    parts = []
    for r in fn["renders"]:
        loc = f" ({r['locus']})" if r["locus"] else ""
        parts.append(f"«{r['ru']}»{loc}")
    body = "; ".join(parts) if parts else "—"
    if fn["gloss"]:
        body += f". Словарь (Кочергина): {fn['gloss']}"
    return body


def render_html_review(model, sarga, out_path):
    """Автономный офлайн-лист (паттерн review-sheet): шлока + карточки-сноски."""
    sn = model["sargas"][str(sarga)]
    st = model["_meta"]["stats"]
    rows = []
    for v in sn["verses"]:
        fn_html = []
        for i, f in enumerate(v["footnotes"], 1):
            renders = "".join(
                f'<div class="rnd"><span class="ru">«{html.escape(r["ru"])}»</span>'
                f'<span class="loc">{html.escape(r["locus"])}</span></div>'
                for r in f["renders"])
            gloss = (f'<div class="gloss">📖 Кочергина: {html.escape(f["gloss"])}</div>'
                     if f["gloss"] else "")
            tierbadge = f'<span class="tier tier-{f["tier"] or "x"}">{f["tier"] or "·"}</span>'
            fn_html.append(
                f'<div class="fn"><div class="fnhead">{tierbadge}'
                f'<b class="deva">{html.escape(f["deva"])}</b> '
                f'<span class="iast">{html.escape(f["iast"])}</span> '
                f'<span class="score" title="балл трудности / корпусная частота">'
                f'{f["score"]:.1f} · n={f["n_total"]}</span></div>'
                f'{renders}{gloss}</div>')
        extra = ""
        if v["overflow_count"] or v["already_noted_count"]:
            extra = (f'<div class="meta-note">ещё {v["overflow_count"]} ниже порога вывода · '
                     f'{v["already_noted_count"]} уже в заметках Леонова/tier-2 (дедуп)</div>')
        synth = ""
        if v.get("machine_summary"):
            synth = (f'<div class="synth"><span class="synth-tag">машинная сводка</span> '
                     f'{html.escape(v["machine_summary"])}</div>')
        rows.append(
            f'<section class="verse"><div class="vnum">V.{sarga}.{v["verse"]}</div>'
            f'<div class="sa deva">{html.escape(C.slp1_to_deva(v["slp1"]))}</div>'
            f'<div class="sa iast">{html.escape(v["iast"])}</div>'
            f'<div class="ru-podstr">{html.escape(v["ru"])}</div>'
            f'<div class="fns">{"".join(fn_html) or "<i>трудных слов не отобрано</i>"}</div>'
            f'{synth}{extra}</section>')
    doc = _HTML_TMPL.format(
        title=f"Сундараканда · сарга {sarga} · лист сносок",
        sarga=sarga, model=html.escape(MODEL),
        nverses=len(sn["verses"]), nfn=sum(len(v["footnotes"]) for v in sn["verses"]),
        tierA=st["tierA"], tierB=st["tierB"],
        body="\n".join(rows), css=_CSS_REVIEW, mode="Лист-обозрение (офлайн)")
    out_path.write_text(doc, encoding="utf-8")


def render_web_mock(model, sarga, out_path):
    """Статичный мок веб-режима reader: текст с кликабельными маркерами-сносками."""
    sn = model["sargas"][str(sarga)]
    blocks = []
    fn_defs = []
    counter = 0
    for v in sn["verses"]:
        # маркеры сносок после IAST — по номеру
        marks = []
        for f in v["footnotes"]:
            counter += 1
            marks.append((counter, f))
            fn_defs.append(
                f'<li id="fn{counter}"><a class="bk" href="#ref{counter}">↑</a> '
                f'<b>{html.escape(f["iast"])}</b> — {html.escape(_fn_text_plain(f))}</li>')
        sup = "".join(
            f'<sup><a id="ref{n}" href="#fn{n}" class="fnmark" '
            f'title="{html.escape(f["iast"])}: {html.escape(_fn_text_plain(f))}">{n}</a></sup>'
            for n, f in marks)
        synth = (f'<div class="rvsynth"><i>машинная сводка:</i> '
                 f'{html.escape(v["machine_summary"])}</div>') if v.get("machine_summary") else ""
        blocks.append(
            f'<div class="rv"><span class="rvn">{sarga}.{v["verse"]}</span>'
            f'<span class="rvsa">{html.escape(v["iast"])}</span>{sup}'
            f'<div class="rvru">{html.escape(v["ru"])}</div>{synth}</div>')
    doc = _WEBMOCK_TMPL.format(
        title=f"Сундараканда {sarga} · reader (мок)", sarga=sarga,
        model=html.escape(MODEL), body="\n".join(blocks),
        footnotes="\n".join(fn_defs) or "<li>—</li>")
    out_path.write_text(doc, encoding="utf-8")


def render_markdown(model, sarga, out_path):
    """Markdown с pandoc-сносками ([^n]) -> настоящие сноски Word при конверсии."""
    sn = model["sargas"][str(sarga)]
    lines = [f"# Сундараканда — сарга {sarga}", "",
             f"_Лист сносок переводчика. Автосгенерировано ({MODEL}, H764). "
             f"Сноски — Word footnotes через pandoc._", ""]
    fn_block = []
    n = 0
    for v in sn["verses"]:
        marks = ""
        for f in v["footnotes"]:
            n += 1
            marks += f"[^{n}]"
            fn_block.append(f"[^{n}]: **{f['iast']}** ({f['deva']}) — "
                            f"{_fn_text_plain(f).replace(chr(10),' ')}")
        lines.append(f"**{sarga}.{v['verse']}** {v['iast']}{marks}  ")
        lines.append(f"{v['ru']}")
        if v.get("machine_summary"):
            lines.append("")
            lines.append(f"> _(машинная сводка)_ {v['machine_summary']}")
        lines.append("")
    lines.append("")
    lines.extend(fn_block)
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def run(sargas, max_fn):
    os.makedirs(SHEETS, exist_ok=True)
    model = build_model(DATA / "candidates.json", sargas, max_fn)
    (DATA / "sheets_model.json").write_text(
        json.dumps(model, ensure_ascii=False, indent=1), encoding="utf-8")
    st = model["_meta"]["stats"]
    print(f"[sheets] модель: {st['verses']} шлок, {st['footnotes']} сносок "
          f"(A={st['tierA']} B={st['tierB']}), словарь на {st['with_gloss']}; "
          f"дедуп снял {st['already_noted_suppressed']}")
    for sarga in sargas:
        if str(sarga) not in model["sargas"]:
            continue
        render_html_review(model, sarga, SHEETS / f"sarga_{sarga}.html")
        render_web_mock(model, sarga, SHEETS / f"web_mock_sarga_{sarga}.html")
        render_markdown(model, sarga, SHEETS / f"sarga_{sarga}.md")
        print(f"[sheets] сарга {sarga}: sarga_{sarga}.html · web_mock_sarga_{sarga}.html · sarga_{sarga}.md")
    print(f"[sheets] .docx: python render_docx.py  (pandoc {', '.join('sarga_%d.md'%s for s in sargas)})")


# --- Шаблоны/CSS ------------------------------------------------------------
_CSS_REVIEW = """
:root{--bg:#fbfaf7;--ink:#1d1a16;--mut:#7a7266;--line:#e4ded2;--a:#7a1f1f;--b:#1f527a}
*{box-sizing:border-box}body{font:16px/1.55 Georgia,'PT Serif',serif;background:var(--bg);color:var(--ink);margin:0}
.wrap{max-width:900px;margin:0 auto;padding:24px}
header{border-bottom:2px solid var(--line);margin-bottom:18px}
h1{font-size:23px;margin:.2em 0}.sub{color:var(--mut);font-size:13px}
.legend{font-size:13px;color:var(--mut);margin:8px 0 0}
.verse{border:1px solid var(--line);border-radius:8px;padding:14px 16px;margin:14px 0;background:#fff}
.vnum{font-size:12px;color:var(--a);font-weight:bold;letter-spacing:.04em}
.sa.deva{font-size:20px;margin:.15em 0}.sa.iast{font-style:italic;color:#3a352c}
.ru-podstr{margin:.4em 0 .7em;color:#2a271f}
.fns{display:grid;gap:8px}
.fn{border-left:3px solid var(--line);padding:.35em .6em;background:#faf7f0;border-radius:0 6px 6px 0}
.fnhead{font-size:15px}.fnhead .deva{font-size:17px}.iast{font-style:italic;color:#4a4335}
.score{font-size:11px;color:var(--mut);float:right}
.tier{display:inline-block;width:1.4em;text-align:center;border-radius:4px;font-size:11px;color:#fff;margin-right:.4em}
.tier-A{background:var(--a)}.tier-B{background:var(--b)}.tier-x{background:#aaa}
.rnd{font-size:14px;margin:.1em 0}.rnd .ru{color:#1d1a16}.rnd .loc{color:var(--mut);font-size:12px;margin-left:.4em}
.gloss{font-size:13px;color:#4b4436;margin-top:.2em}
.meta-note{font-size:12px;color:var(--mut);margin-top:.5em;font-style:italic}
.synth{font-size:14px;color:#33302a;margin-top:.7em;padding:.5em .7em;background:#f0f3ee;border-left:3px solid var(--b);border-radius:0 6px 6px 0}
.synth-tag{display:inline-block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#1f527a;font-weight:bold;margin-right:.5em}
"""

_HTML_TMPL = """<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><style>{css}</style></head><body><div class="wrap">
<header><h1>Рамаяна · Сундараканда · сарга {sarga}</h1>
<div class="sub">{mode} · {nverses} шлок · {nfn} сносок (ярус A={tierA}, B={tierB}) · {model}</div>
<div class="legend">Ярус <b style="color:#7a1f1f">A</b> — классики передают слово по-разному (показаны варианты).
Ярус <b style="color:#1f527a">B</b> — нечастотное слово с аттестованной передачей (чтобы не искать в словаре).
Приватный лист — не публиковать.</div></header>
{body}
</div></body></html>"""

_WEBMOCK_TMPL = """<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><style>
body{{font:17px/1.7 Georgia,serif;background:#fff;color:#181410;margin:0}}
.wrap{{max-width:760px;margin:0 auto;padding:26px}}
.hdr{{color:#7a1f1f;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:16px}}
.hdr .m{{font-size:12px;color:#998}}
.rv{{margin:.55em 0}}.rvn{{color:#b03;font-size:12px;margin-right:.5em;font-variant:small-caps}}
.rvsa{{font-style:italic}}.rvru{{color:#333;font-size:15px;margin:.1em 0 .2em}}
.fnmark{{color:#7a1f1f;text-decoration:none;font-weight:bold;padding:0 1px}}
.fnmark:hover{{background:#f6e9e9}}
.rvsynth{{font-size:13px;color:#33302a;background:#f0f3ee;border-left:3px solid #1f527a;padding:.35em .6em;margin:.25em 0;border-radius:0 5px 5px 0}}
.notes{{margin-top:26px;border-top:1px solid #eee;padding-top:12px;font-size:14px;color:#333}}
.notes li{{margin:.3em 0}}.bk{{text-decoration:none;color:#b03;margin-right:.2em}}
</style></head><body><div class="wrap">
<div class="hdr"><b>Рамаяна · Сундараканда {sarga}</b> — reader-режим (статичный мок)
<div class="m">Наведите/нажмите на номер: сноска по трудному слову. {model} · H764</div></div>
{body}
<ol class="notes">{footnotes}</ol>
</div></body></html>"""


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--sargas", default="1,2")
    ap.add_argument("--max-fn", type=int, default=8, help="макс. свежих сносок на шлоку")
    a = ap.parse_args()
    sargas = [int(x) for x in a.sargas.split(",") if x.strip()]
    run(sargas, a.max_fn)
