# -*- coding: utf-8 -*-
"""Общие утилиты среды переводчика (H764, Wave 0).

Загрузка внешних активов ПО ПУТЯМ (корпус SamudraManthanam, глоссарий
RussianTranslation, заметки CommentaryStrategies) — ничего не копируем в этот
репозиторий (архитектурное правило проекта). Транслитерация — только через
indic_transliteration.sanscript, свой транслит не пишем.

Автор: Opus 4.8 (`claude-opus-4-8`), H764.
"""
import json
import os
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from indic_transliteration import sanscript

# --- Пути -------------------------------------------------------------------
# translator-env/src/common.py -> translator-env -> <repo> -> GitHub/
GITHUB_ROOT = Path(os.environ.get("GITHUB_ROOT", Path(__file__).resolve().parents[3]))

CORPUS_SUNDARA = GITHUB_ROOT / "SamudraManthanam" / "web" / "corpus_builder" / "jsonl" / "05_ramayana-sundarakanda.jsonl"
SURFACE_GLOSSARY = GITHUB_ROOT / "SanskritLexicography" / "RussianTranslation" / "glossary" / "surface_glossary.jsonl"
LEONOV_NOTES = GITHUB_ROOT / "CommentaryStrategies" / "data" / "leonov_own_notes.json"
APPARATUS_MD = GITHUB_ROOT / "RussianRamayana" / "Leitan-Sundarakanda" / "_Перевод сундараканды.md"
# при запуске из воркри-дерева apparatus лежит рядом; резолвим оба варианта
_APPARATUS_LOCAL = Path(__file__).resolve().parents[2] / "Leitan-Sundarakanda" / "_Перевод сундараканды.md"

# Собственные переводы Леонова, доступные как self-TM (сигнал г).
# Для пилота используем только 05_ramayana-sundarakanda — это ОДНОЗНАЧНО Леонов.
# shatakatrayam / buddhacarita / amaru отложены: авторство текста в корпусе не
# подтверждено (H764 предупреждает про Бальмонта в Буддхачарите) — см. VALIDATION.
LEONOV_WORKS = {"05_ramayana-sundarakanda"}

# Ярлыки работ -> переводчик + источник (для locus в сноске).
WORK_LABELS = {
    "05_ramayana-sundarakanda": ("Леонов", "Рам. V"),
    "04_ramayana-kishkindhakanda": ("Гринцер", "Рам. IV"),
    "03_ramayana-aranyakanda": ("Гринцер", "Рам. III"),
    "02_ramayana-ayodhyakanda": ("Гринцер", "Рам. II"),
    "01_ramayana-balakanda": ("Гринцер", "Рам. I"),
}

# --- Транслитерация ---------------------------------------------------------
def iast_to_slp1(s: str) -> str:
    return sanscript.transliterate(s, sanscript.IAST, sanscript.SLP1)

def slp1_to_iast(s: str) -> str:
    return sanscript.transliterate(s, sanscript.SLP1, sanscript.IAST)

def slp1_to_deva(s: str) -> str:
    return sanscript.transliterate(s, sanscript.SLP1, sanscript.DEVANAGARI)

# --- Нормализация русского --------------------------------------------------
_YO = str.maketrans({"ё": "е", "Ё": "Е"})  # ё->е, Ё->Е

def norm_ru(s: str) -> str:
    """Нормализация русской передачи для сравнения (регистр, ё->е, пробелы,
    пунктуация по краям)."""
    s = (s or "").translate(_YO).lower().strip()
    s = re.sub(r"[\s]+", " ", s)
    s = s.strip(" .,;:!?–—«»\"'()")
    return s

# --- Грубый русский стеммер (для кластеризации передач по смыслу) ------------
# Флексия дробит ОДНУ лексическую передачу на много строк (велик-ое/-ий/-ая/-ой).
# Чтобы «расхождение классиков» ловило смысловое несогласие (kālāntaka:
# поглотитель времени / Всеразрушитель / Яма-Погубитель), а не морфологию,
# схлопываем словоформы к грубой основе и сравниваем СЕМЬИ основ.
# Порядок суффиксов — от длинных к коротким.
_RU_SUFFIXES = [
    "иями", "ями", "ами", "иях", "ях", "ах", "ыми", "ими", "ого", "его",
    "ому", "ему", "ыми", "ой", "ей", "ий", "ый", "ое", "ее", "ая", "яя",
    "ую", "юю", "ом", "ем", "их", "ых", "ство", "ости", "ость",
    "ешь", "ете", "ели", "ало", "ила", "ыла", "ать", "ять", "еть",
    "тель", "ние", "нье", "ами", "у", "ю", "а", "я", "о", "е", "и", "ы", "ь",
]
_RU_STOP = {
    "в", "во", "и", "с", "со", "к", "ко", "на", "по", "о", "об", "от", "до",
    "у", "за", "из", "не", "ни", "то", "же", "бы", "ли", "как", "что", "это",
    "при", "для", "или", "а", "но", "их", "он", "она", "оно",
}

def ru_stem(word: str) -> str:
    """Очень грубая основа русского слова (обрезка частых флексий, мин. 3 буквы)."""
    w = (word or "").translate(_YO).lower().strip(" .,;:!?–—«»\"'()[]-")
    for suf in _RU_SUFFIXES:
        if len(w) - len(suf) >= 3 and w.endswith(suf):
            return w[: -len(suf)]
    return w

def ru_family(ru: str) -> frozenset:
    """Семья основ передачи — множество основ её знаменательных слов.
    Две передачи «того же смысла» дают одинаковую/пересекающуюся семью;
    лексически разные — непересекающиеся."""
    words = [w for w in re.split(r"[\s–—-]+", norm_ru(ru)) if w]
    stems = {ru_stem(w) for w in words if len(w) >= 3 and w not in _RU_STOP}
    return frozenset(s for s in stems if len(s) >= 3)

# --- Токенизация SLP1 -------------------------------------------------------
_STOP_SLP1 = {
    # частицы, местоимения, союзы, предлоги — то, чего в аппарате не бывает
    "ca", "tu", "hi", "vE", "eva", "na", "iti", "aTa", "atha", "tataH", "tato",
    "sa", "saH", "tam", "tan", "tat", "tad", "tena", "tasya", "teza", "tezAm",
    "yaH", "yat", "yad", "yena", "yasya", "asya", "ayam", "idam", "ime", "imAn",
    "aham", "mama", "me", "tvam", "tava", "vayam", "api", "ha", "u", "uta", "vA",
    "cEva", "tathA", "yathA", "yaTA", "taTA", "atra", "tatra", "yatra", "kim",
    "ho", "aho", "punaH", "punar", " evam", "evam", "sma", "kila", "nu", "hy",
    "asO", "asau", "enam", "enAn", "svam", "sve", "svayam", "tais", "tEs",
    "te", "so", "yo", "ke", "ye", "iva", "iva", "ca ", "'pi", "'sya",
    # местоимения/частицы 1–2 л. и сложения с api/ca — не словарные леммы
    "asmAkaM", "asmABiH", "asmAn", "asmAsu", "asmE", "mAM", "mayA", "mayi",
    "yuzmAkaM", "yuzmABiH", "yuzmAn", "naH", "vaH", "nO", "vO",
    "cApi", "vApi", "hyapi", "tvapi", "cEva", "BUyaH", "BUyas", "BUyo",
    "tvat", "tvayA", "tvayi", "mat", "yuzmat", "asmat",
}

_DANDA = "।॥"  # । ॥

def tokenize_slp1(text: str) -> list:
    """Разбить SLP1-строку шлоки на поверхностные словоформы."""
    text = re.sub(r"[" + _DANDA + r"0-9]", " ", text)
    toks = []
    for raw in text.split():
        t = raw.strip().strip("।॥.,;:!?–—«»\"'`-")
        t = t.lstrip("'")  # аваграха/сандхи-апостроф в начале
        if len(t) < 2:
            continue
        if t in _STOP_SLP1:
            continue
        toks.append(t)
    return toks

# --- Загрузчики -------------------------------------------------------------
def load_corpus_sargas(sargas):
    """Вернуть {(sarga,verse): {"slp1": ..., "iast": ..., "ru": ...}} для
    указанных сарг (по #sa и #ru записям корпуса Сундараканды)."""
    sargas = set(str(s) for s in sargas)
    verses = {}
    with open(CORPUS_SUNDARA, encoding="utf-8") as fh:
        for ln in fh:
            o = json.loads(ln)
            ch = str(o.get("chapter"))
            if ch not in sargas:
                continue
            passage = o.get("passage", "")  # "1.1"
            seg = o.get("seg")
            rec = verses.setdefault(passage, {"sarga": ch, "passage": passage,
                                              "slp1": "", "iast": "", "ru": ""})
            if seg == "sa":
                rec["slp1"] = o.get("slp1", "")
                rec["iast"] = o.get("text", "")
            elif seg == "ru":
                rec["ru"] = o.get("text", "")
    # сортировка по (sarga, verse-номер)
    def key(p):
        a, b = p.split(".", 1)
        return (int(a), int(re.sub(r"\D.*$", "", b) or 0))
    return [verses[p] for p in sorted(verses, key=key)]

def load_glossary_for(tokens):
    """Однопроходный стрим 147-МБ глоссария: вернуть {slp1: entry} только для
    нужных поверхностных форм."""
    want = set(tokens)
    out = {}
    if not SURFACE_GLOSSARY.exists():
        return out
    with open(SURFACE_GLOSSARY, encoding="utf-8") as fh:
        for ln in fh:
            # дешёвый предфильтр по подстроке перед json.loads
            i = ln.find('"slp1":')
            if i < 0:
                continue
            try:
                o = json.loads(ln)
            except Exception:
                continue
            k = o.get("slp1")
            if k in want:
                out[k] = o
    return out

def load_leonov_notes():
    """Вернуть {sarga: {verse: raw_text}} — база дедупа против уже сказанного."""
    if not LEONOV_NOTES.exists():
        return {}
    d = json.load(open(LEONOV_NOTES, encoding="utf-8"))
    by_verse = {}
    for note in d.get("notes", []):
        s = int(note.get("sarga", 0))
        v = int(note.get("verse", 0))
        by_verse.setdefault(s, {}).setdefault(v, [])
        by_verse[s][v].append(note.get("raw_text", ""))
    return by_verse

def apparatus_path():
    return APPARATUS_MD if APPARATUS_MD.exists() else _APPARATUS_LOCAL
