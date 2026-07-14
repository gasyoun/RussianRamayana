# -*- coding: utf-8 -*-
"""Контекстные слои для сносок (H764 Wave 3 — ответ на отзыв Леонова).

Отзыв Леонова по [issue #35](https://github.com/gasyoun/RussianRamayana/issues/35):
форма А удобна, но «сама идея не работает — в Пахтании я вижу контекст, а здесь
контекста нет, всё равно придётся смотреть Пахтание». «Пахтание/Пахтанье океана»
= корпусный инструмент SamudraManthanam. Сноска давала передачи классиков + глоссу
БЕЗ контекста, поэтому не снимала ручной поход в корпус. Здесь — три вида контекста
(рулинг МГ 14-07-2026: сделать все три, Леонов сам выберет, какой убирает поход в
Пахтание):

  (1) конкорданс      — где ещё эта поверхностная форма встречается в корпусе
                        Рамаяны: строка + русская параллель, искомое слово выделено
                        (KWIC — ровно то, что показывает Пахтание);
  (2) пассаж-источник — реальная строка, откуда взята передача классика: резолвим
                        locus `work:passage` -> строку корпуса (санскрит + перевод),
                        чтобы видеть, в каком контексте передача была уместна;
  (3) соседние шлоки  — предыдущая/следующая шлока (локальный нарратив) —
                        собирается в gen_sheets из уже упорядоченного списка.

Данные — тот же корпус JSONL, что читает SamudraManthanam (движок не дублируем,
консюмим общий ассет; см. правило проекта «check prior art / не переизобретать»).
Русская параллель есть у кн. I–V (Гринцер I–IV, Леонов V); VI–VII — только санскрит.

Автор: Opus 4.8 (`claude-opus-4-8`), H764 Wave 3.
"""
import json
import re

import common as C

# Корпусные работы, по которым СТРОИМ конкорданс: канды Рамаяны (тот же текст, что
# переводит Леонов, — самый релевантный контекст; у I–V есть русская параллель).
CONC_WORKS = [
    "01_ramayana-balakanda", "02_ramayana-ayodhyakanda", "03_ramayana-aranyakanda",
    "05_ramayana-sundarakanda", "06_ramayana-yuddhakanda", "07_ramayana-uttarakanda",
]
# Для резолва locus'ов передач классиков грузим ВСЕ доступные корпусные файлы
# (Рамаяна + Махабхарата): передачи классиков часто из МБ.
_JSONL_DIR = C.GITHUB_ROOT / "SamudraManthanam" / "web" / "corpus_builder" / "jsonl"

CONC_RAW_CAP = 12      # сколько вхождений копим на форму в индексе
_SPLIT = re.compile(r"\s+")


def _clean_tok(t: str) -> str:
    return t.strip("।॥.,;:!?–—«»\"'`-").lstrip("'")


class CorpusContext:
    """Один потоковый проход по корпусу -> индексы для трёх видов контекста.

    by_passage[work][passage] = {"iast": ..., "slp1": ..., "ru": ...}
    conc[slp1_form]           = [(work, passage), ...]  (только формы из wanted)
    """

    def __init__(self, wanted_forms, per_form=3):
        self.wanted = set(wanted_forms)
        self.per_form = per_form
        self.by_passage = {}
        self.conc = {}
        self._build()

    def _corpus_files(self):
        """Все корпусные .jsonl (Рамаяна + Махабхарата), если каталог доступен."""
        if not _JSONL_DIR.exists():
            return []
        files = []
        for p in sorted(_JSONL_DIR.glob("*.jsonl")):
            name = p.stem
            if name in ("kochergina", "ramayana-3-slovar"):
                continue
            files.append((name, p))
        return files

    def _build(self):
        conc_works = set(CONC_WORKS)
        for work, path in self._corpus_files():
            wp = self.by_passage.setdefault(work, {})
            index_conc = work in conc_works
            try:
                with open(path, encoding="utf-8") as fh:
                    for ln in fh:
                        # дешёвый предфильтр
                        if '"passage"' not in ln:
                            continue
                        try:
                            o = json.loads(ln)
                        except Exception:
                            continue
                        passage = o.get("passage")
                        if not passage:
                            continue
                        seg = o.get("seg")
                        rec = wp.setdefault(passage, {"iast": "", "slp1": "", "ru": ""})
                        if seg == "sa":
                            rec["iast"] = o.get("text", "")
                            rec["slp1"] = o.get("slp1", "")
                            if index_conc and rec["slp1"]:
                                self._index_conc(work, passage, rec["slp1"])
                        elif seg == "ru":
                            rec["ru"] = o.get("text", "")
            except OSError:
                continue

    def _index_conc(self, work, passage, slp1_line):
        seen = set()
        for raw in _SPLIT.split(slp1_line):
            tok = _clean_tok(raw)
            if len(tok) < 2 or tok in seen:
                continue
            seen.add(tok)
            if tok in self.wanted:
                lst = self.conc.setdefault(tok, [])
                if len(lst) < CONC_RAW_CAP:
                    lst.append((work, passage))

    # --- (1) конкорданс ------------------------------------------------------
    def concordance(self, slp1_form, exclude=None, limit=None):
        """До `limit` вхождений формы в корпусе Рамаяны: {label, passage, iast_html,
        ru}. Вхождения с русской параллелью и НЕ из текущей шлоки — первыми."""
        limit = limit or self.per_form
        posts = self.conc.get(slp1_form, [])
        out = []
        for work, passage in posts:
            if exclude and (work, passage) == exclude:
                continue
            rec = self.by_passage.get(work, {}).get(passage)
            if not rec or not rec["iast"]:
                continue
            out.append({
                "work": work,
                "label": _work_label(work),
                "passage": passage,
                "iast_html": _kwic_html(rec["iast"], rec["slp1"], slp1_form),
                "ru": rec["ru"],
            })
        # приоритет: сначала с русской параллелью (Пахтание-подобный контекст)
        out.sort(key=lambda o: (0 if o["ru"] else 1))
        return out[:limit]

    # --- (2) пассаж-источник -------------------------------------------------
    def resolve_locus(self, locus, slp1_form=None):
        """'work:passage' -> {label, passage, iast_html, ru} или None.

        Многие работы (Рагхуванша, парвы МБ) хранят пассаж как ДИАПАЗОН строф
        (`12.57-65`) одной записью — целиком это слишком длинно для сноски,
        поэтому санскрит окном обрезаем вокруг искомого слова, а перевод —
        по длине. Одиночные строфы Рамаяны (`1.28`) окно не трогает."""
        if not locus or ":" not in locus:
            return None
        work, passage = locus.split(":", 1)
        rec = self.by_passage.get(work, {}).get(passage)
        if not rec or not rec["iast"]:
            return None
        is_range = ("-" in passage) or (rec["iast"].count("॥") > 2)
        win = 9 if is_range else None
        iast = _kwic_html(rec["iast"], rec["slp1"], slp1_form, window=win)
        ru = _cap_ru(rec["ru"], 240) if is_range else rec["ru"]
        return {"work": work, "label": _work_label(work),
                "passage": passage, "iast_html": iast, "ru": ru}


def _cap_ru(ru: str, limit: int) -> str:
    """Обрезать перевод по границе слова, добавить «…» (для диапазонных loci,
    где строфную выравненность санскрит↔перевод не гарантировать)."""
    ru = (ru or "").strip()
    if len(ru) <= limit:
        return ru
    cut = ru[:limit].rsplit(" ", 1)[0]
    return cut.rstrip(" ,;.") + " …"


# --- ярлык работы (совпадает с gen_sheets.work_label; дублируем, чтобы context.py
#     оставался автономным при импорте из любого места) ------------------------
_ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
          "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII"]
_RAM_KANDA = {
    "balakanda": "Бала", "ayodhyakanda": "Айодхья", "aranyakanda": "Аранья",
    "kishkindhakanda": "Кишкиндха", "sundarakanda": "Сундара", "yuddhakanda": "Юддха",
    "uttarakanda": "Уттара",
}
_MB_PARVA = {
    "adiparva": "Ади", "sabhaparva": "Сабха", "aranyakaparva": "Аранья",
    "virataparva": "Вирата", "udyogaparva": "Удьйога", "bhishmaparva": "Бхишма",
    "dronaparva": "Дрона", "karnaparva": "Карна", "shalyaparva": "Шалья",
    "sauptikaparva": "Сауптика", "striparva": "Стри", "shantiparva": "Шанти",
    "anushasanaparva": "Анушасана", "ashvamedhikaparva": "Ашвамедхика",
    "ashramavasikaparva": "Ашрамаваси", "mausalaparva": "Маусала",
}
_MISC = {
    "raghuvamsha": "Рагхуванша", "buddhacharita": "Буддхачарита",
    "manavadharmashastra": "Ману-смрити", "shukasaptati": "Шукасаптати",
    "amarushataka": "Амарушатака", "shatakatrayam": "Бхартрихари",
    "meghaduta": "Мегхадута", "kumarasambhava": "Кумарасамбхава",
    "kiratarjuniya": "Киратарджуния",
}


def _work_label(wk: str) -> str:
    m = re.match(r"^(\d+)_ramayana-(\w+)$", wk)
    if m:
        vol = _ROMAN[int(m.group(1))] if int(m.group(1)) < len(_ROMAN) else m.group(1)
        return f"Рамаяна {vol} ({_RAM_KANDA.get(m.group(2), m.group(2))})"
    m = re.match(r"^(\d+)_mahabharata-(\w+)$", wk)
    if m:
        vol = _ROMAN[int(m.group(1))] if int(m.group(1)) < len(_ROMAN) else m.group(1)
        return f"Махабхарата {vol} ({_MB_PARVA.get(m.group(2), m.group(2))})"
    m = re.match(r"^(\d+)_(rigveda|atharvaveda|samaveda|yajurveda)$", wk)
    if m:
        veda = {"rigveda": "Ригведа", "atharvaveda": "Атхарваведа",
                "samaveda": "Самаведа", "yajurveda": "Яджурведа"}[m.group(2)]
        vol = _ROMAN[int(m.group(1))] if int(m.group(1)) < len(_ROMAN) else m.group(1)
        return f"{veda} {vol}"
    return _MISC.get(wk, wk)


# --- HTML-подсветка KWIC ----------------------------------------------------
import html as _html


def _esc(s: str) -> str:
    return _html.escape(s or "")


def _kwic_html(iast_line: str, slp1_line: str, slp1_form: str, window=None) -> str:
    """Экранированная IAST-строка с выделением искомой формы <b>.

    Строки #sa и #slp1 сегментированы одинаково (один источник, разные письмена),
    поэтому индексы токенов выровнены: находим форму в SLP1, выделяем IAST на том
    же индексе. При рассинхроне длины — деградируем до строки без подсветки.
    `window` (если задан) обрезает вывод до ±window токенов вокруг подсветки
    (KWIC-окно для длинных диапазонных пассажей); None = вся строка."""
    if not iast_line:
        return ""
    ii = _SPLIT.split(iast_line.strip())
    si = _SPLIT.split(slp1_line.strip())
    if len(ii) != len(si):
        line = _esc(iast_line)
        if window and len(ii) > 2 * window + 1:
            line = _esc(" ".join(ii[: 2 * window])) + " …"
        return line
    hi = set()
    for idx, tok in enumerate(si):
        if _clean_tok(tok) == slp1_form:
            hi.add(idx)
    if not hi and slp1_form and len(slp1_form) >= 4:   # мягкий стем-фолбэк
        pref = slp1_form[:4]
        for idx, tok in enumerate(si):
            ct = _clean_tok(tok)
            if len(ct) >= 4 and (ct.startswith(pref) or slp1_form.startswith(ct[:4])):
                hi.add(idx)
    lo, hiix = 0, len(ii)
    if window is not None and hi:
        lo = max(0, min(hi) - window)
        hiix = min(len(ii), max(hi) + window + 1)
    elif window is not None and not hi and len(ii) > 2 * window + 1:
        hiix = 2 * window
    parts = []
    for idx in range(lo, hiix):
        tok = ii[idx]
        parts.append(f"<b>{_esc(tok)}</b>" if idx in hi else _esc(tok))
    out = " ".join(parts)
    if lo > 0:
        out = "… " + out
    if hiix < len(ii):
        out = out + " …"
    return out
