# -*- coding: utf-8 -*-
"""Парсер ручного аппарата Леонова (H764 Wave 0, валидационная база).

Из Leitan-Sundarakanda/_Перевод сундараканды.md вытаскиваем словарные
заголовки (headwords) сарги 1 — это множество слов, которые Леонов ВРУЧНУЮ счёл
достойными словарной строки. Против него меряем recall движка трудности.

Формат словарной строки в аппарате (после заголовков `## Стр. N`):
    **II śrī** *f.***;** сияние, красота ...
    **praṇīta** (*pp.* \\< ni) **;** приведенный, осужденный
    > *ayana* n. walking, a road ...
    > **tilaka** m. ...

OCR-разметка `<span class="mark">kh</span>` встроена внутрь IAST-слов — снимаем.

Автор: Opus 4.8 (`claude-opus-4-8`).
"""
import json
import re
import sys

import common as C

# IAST-буквы (со всеми диакритиками, что встречаются в файле)
IAST_CHARS = "a-zāīūṛṝḷḹṅñṭḍṇśṣṁṃḥ'’ĀĪŪṚṜ"
ROMAN = r"(?:I{1,3}V?|IV|VI{0,3}|\d+\\?\.?)"  # I, II, III, IV, V.., или "2."


def strip_markup(s: str) -> str:
    s = re.sub(r"</?span[^>]*>", "", s)
    s = re.sub(r"<img[^>]*/?>", "", s)
    s = s.replace("\\|", "|")
    return s


def is_headword(tok: str) -> bool:
    """Одиночное IAST-слово (возможно с дефисами), не длинная пратика."""
    t = tok.strip().strip("’'")
    if not t or " " in t:
        return False
    # только IAST-буквы и дефисы
    if not re.fullmatch(r"[" + IAST_CHARS + r"\-]{2,40}", t):
        return False
    # хотя бы одна гласная
    if not re.search(r"[aāiīuūṛṝeéoēōĀĪŪ]", t):
        return False
    return True


# маркеры словарной статьи (грамматика/глосса), стоящие ПОСЛЕ заголовка
_DEF_MARKER = re.compile(
    r"(\*\*?\s*;|;|"                                    # разделитель глоссы
    r"\(\s*\*?(pp|pt|ppr|pf|caus|desid|pass)\b|"        # (pp. / (caus. ...
    r"\*?\b(m|f|n|mfn|mf|adj|ind|pron|num|pcl|part|"    # POS-аббревиатуры
    r"nom|acc|gen|dat|loc|abl|instr|voc|du|pl|sg)\b\.?\s*\*?)"
)


def extract_headwords(md_text: str):
    """Вернуть список (raw_iast, slp1) заголовков-лемм из аппарата сарги 1.

    Правило (задокументировано в VALIDATION): словарная строка = ЖИРНЫЙ
    заголовок `**X**`, за которым НА ТОЙ ЖЕ СТРОКЕ идёт грамматический маркер
    или разделитель глоссы. Внутренние курсивные кросс-ссылки MW-цитат
    (`cf. naimiṣāyana`, ...) НЕ считаются — это не собственные строки Леонова.
    """
    md = strip_markup(md_text)
    lines = md.splitlines()

    start = 0
    for i, ln in enumerate(lines):
        if re.match(r"^##\s*Стр\.", ln):
            start = i
            break
    apparatus = lines[start:]

    heads = []
    seen = set()
    bold = re.compile(r"\*\*\s*(" + ROMAN + r"\s+)?([" + IAST_CHARS + r"\-]{2,40})\s*\*\*")

    for ln in apparatus:
        for m in bold.finditer(ln):
            hw = m.group(2)
            if not is_headword(hw):
                continue
            tail = ln[m.end():m.end() + 40]   # что идёт сразу за заголовком
            if _DEF_MARKER.match(tail.lstrip(" *")):
                _add(hw, heads, seen)
    return heads


def _add(hw, heads, seen):
    hw = hw.strip("’'-")
    try:
        slp1 = C.iast_to_slp1(hw)
    except Exception:
        return
    if not slp1 or slp1 in seen:
        return
    seen.add(slp1)
    heads.append({"iast": hw, "slp1": slp1})


def run(out_path):
    path = C.apparatus_path()
    md = open(path, encoding="utf-8").read()
    heads = extract_headwords(md)
    print(f"[apparatus] {path.name}: {len(heads)} уникальных заголовков (сарга 1)")
    import os
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump({
            "_meta": {"source": path.name, "sarga": 1,
                      "count": len(heads),
                      "model": "Opus 4.8 (claude-opus-4-8)", "handoff": "H764"},
            "headwords": heads,
        }, fh, ensure_ascii=False, indent=1)
    print("[apparatus] примеры:", ", ".join(h["iast"] for h in heads[:15]))
    return heads


if __name__ == "__main__":
    out = str(C.Path(__file__).resolve().parents[1] / "data" / "apparatus_sarga1.json")
    if len(sys.argv) > 1:
        out = sys.argv[1]
    run(out)
