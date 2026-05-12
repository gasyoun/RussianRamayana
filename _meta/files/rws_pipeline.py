#!/usr/bin/env python3
from __future__ import annotations
"""
╔══════════════════════════════════════════════════════════════════╗
║   RuWritingStyles — стилометрический пайплайн v1.2              ║
║   github.com/gasyoun/RuWritingStyles                            ║
╚══════════════════════════════════════════════════════════════════╝

ИСПОЛЬЗОВАНИЕ:
    python3 rws_pipeline.py <режим> <файл> <handle> [«Имя Автора»]

    Режимы входных данных:
      tg   — Telegram JSON (Settings → Export chat history → JSON)
      txt  — UTF-8 текст (параграфы разделены пустой строкой)
      csv  — CSV с колонками text/content/body, date/timestamp

    Примеры:
      python3 rws_pipeline.py tg  gasuns.json    gasuns_telegram "М. Ю. Гасунс"
      python3 rws_pipeline.py txt melchuk.txt    melchuk         "И. А. Мельчук"
      python3 rws_pipeline.py csv zaliznyak.csv  zaliznyak       "А. А. Зализняк"
      python3 rws_pipeline.py txt gaspanov.txt   gaspanov        "М. Л. Гаспаров"
      python3 rws_pipeline.py tg  apresyan.json  apresyan        "Ю. Д. Апресян"

    Подготовка корпуса для разных форматов:
      PDF → TXT:   pdftotext -layout file.pdf file.txt
                   python3 -c "import fitz; d=fitz.open('f.pdf'); print('\n\n'.join(p.get_text() for p in d))" > f.txt
      YouTube:     yt-dlp --write-auto-sub --sub-lang ru --skip-download URL
                   (затем конвертировать .vtt → .txt)
      Сайт/блог:  scrapy / beautifulsoup → CSV с колонками text, date
      VK:          vk_scraper → posts.csv
      Habr:        habr-scraper → articles.csv

ВЫХОД (все файлы в ./out/):
    <handle>_stylometry.md    числовые таблицы + бенчмарки + интерпретации
    <handle>_rules.md         поведенческие правила ← ПРОВЕРИТЬ ВРУЧНУЮ!
    <handle>_dh_section.md    DH-раздел для вставки в _style.md
    <handle>.yml              машиночитаемый паспорт агента (валидируется)

ТРЕБОВАНИЯ:
    pip install pyyaml

═══════════════════════════════════════════════════════════════════
АВТОРЫ ПРОЕКТА RuWritingStyles / styles/passports/
═══════════════════════════════════════════════════════════════════

Подтверждено в репозитории (styles/passports/*.yml):
    melchuk           И. А. Мельчук — МТТ, лексические функции,
                      Монреаль/Москва, «Толково-комбинаторный словарь»

Добавлен в ходе этой сессии:
    gasuns_telegram   М. Ю. Гасунс — санскритология, Telegram 2022–2026

─────────────────────────────────────────────────────────────────
Приоритетные кандидаты — корпусы публично доступны
─────────────────────────────────────────────────────────────────

handle              Полное имя                 Основной вклад / источник
──────────────────────────────────────────────────────────────────────────
zaliznyak           А. А. Зализняк             Берестяные грамоты, акцентология,
                    (1935–2017)                «О русском словоизменении» — лекции
                                               на YouTube, публ. в «Знании-силе»
                                               Корпус: субтитры лекций + статьи PDF

gaspanov            М. Л. Гаспаров             Стиховедение, переводы, «Записи
                    (1935–2005)                и выписки», «Занимательная Греция»
                                               Корпус: сканы книг → OCR → TXT

lotman              Ю. М. Лотман               Семиотика, «Беседы о русской культуре»
                    (1922–1993)                (телецикл), «Структура художественного
                                               текста», письма
                                               Корпус: PDF монографий + субтитры

apresyan            Ю. Д. Апресян              НОСС, «Избранные труды», лексические
                    (1930–2023)                функции, интегральное описание языка
                                               Корпус: PDF статей из ВЯ, НТИ

shmyolev            А. Д. Шмелёв               «Русская языковая модель мира»,
                    (р. 1956)                  концепты, Telegram-канал (если есть)
                                               Корпус: монографии PDF + интервью

paducheva           Е. В. Падучева              Референция, нарратив, видо-временная
                    (р. 1935)                  система, «Семантические исследования»
                                               Корпус: PDF + RuThes публикации

plungyan            В. А. Плунгян              Грамматическая семантика, НКРЯ,
                    (р. 1960)                  «Введение в грамматическую семантику»
                                               Корпус: лекции YouTube + PDF

kibrik_aa           А. Е. Кибрик               Полевая лингвистика, эргативность,
                    (р. 1946)                  дагестанские языки, лекции на ПостНауке
                                               Корпус: субтитры + PDF

uspensky_ba         Б. А. Успенский            Семиотика, «Поэтика композиции»,
                    (р. 1937)                  история русского языка, богословие
                                               Корпус: PDF монографий

arutyunova          Н. Д. Арутюнова            Метафора, логический анализ языка,
                    (1923–2018)                «Типы языковых значений»
                                               Корпус: PDF сборников

ivanov_vyach        Вяч. Вс. Иванов            Семиотика, индоевропеистика,
                    (1929–2017)                «Нечет и чёт», мемуарная проза
                                               Корпус: PDF + воспоминания

averintsev          С. С. Аверинцев            Поэтика, патристика, риторика,
                    (1937–2004)                переводы псалмов, эссеистика
                                               Корпус: PDF + аудиолекции → субтитры

toprov_vn           В. Н. Топоров              «Петербургский текст», мифопоэтика,
                    (1928–2005)                индоевропейские исследования
                                               Корпус: PDF монографий

lyashevskaya        О. Н. Ляшевская            Частотные словари, НКРЯ, аспектология
                    (р. 1971)                  Корпус: академические статьи PDF

─────────────────────────────────────────────────────────────────
Кандидаты с Telegram / блогами (живые авторы)
─────────────────────────────────────────────────────────────────

handle              Полное имя                 Платформа / специализация
──────────────────────────────────────────────────────────────────────────
krongauz            М. А. Кронгауз             Telegram-канал, «Русский язык на
                    (р. 1958)                  грани нервного срыва», социолингвистика
                                               Корпус: TG export + книги PDF

orehov_boris        Б. В. Орехов               НИУ ВШЭ, цифровые гуманитарные,
                    (р. 1985)                  Telegram (@postnauka_digital)
                                               Корпус: TG export

somin_anton         А. Сомин                   НИУ ВШЭ, корпусная лингвистика,
                                               Telegram-канал про язык
                                               Корпус: TG export

pekelis_olga        О. Е. Пекелис              Синтаксис, дискурс, соцсети
                    (р. ~1975)                 Корпус: Facebook/VK + PDF статей

plungyan_public     В. А. Плунгян              Публичные лекции (ПостНаука, Арзамас)
                    (р. 1960)                  Корпус: субтитры YouTube

iomdin_boris        Б. Л. Иомдин               Эксперименты с языком, «Лексические
                                               иллюзии», популяризация
                                               Корпус: статьи + интервью

kopotev_mikhail     М. В. Копотев              Корпусная лингвистика, Хельсинки
                                               Корпус: академические PDF

─────────────────────────────────────────────────────────────────
Классики — требуют OCR/сканирования
─────────────────────────────────────────────────────────────────

handle              Полное имя                 Примечание
──────────────────────────────────────────────────────────────────────────
vinogradov_vv       В. В. Виноградов            Стилистика, история языка — только PDF
                    (1894–1969)
jakobson            Р. О. Якобсон              Русские тексты 1910–1920-х — сканы
                    (1896–1982)
bakhtin             М. М. Бахтин               Диалог, карнавал — PDF есть в открытом доступе
                    (1895–1975)
tynyanov            Ю. Н. Тынянов              Научная проза — PDF, архивы
                    (1894–1943)
shklovsky           В. Б. Шкловский            Публицистика, мемуары, остранение
                    (1893–1984)
likhachev           Д. С. Лихачёв              «Письма о добром» — открытый текст
                    (1906–1999)

═══════════════════════════════════════════════════════════════════
КОНФИГУРАЦИЯ ДЛЯ КАЖДОГО АВТОРА (DEFAULT_CONFIG ниже в коде)
═══════════════════════════════════════════════════════════════════

Обязательно адаптировать перед запуском:

1. personal_kw   — личные темы (семья, здоровье, быт, города)
                   Пример для Гаспарова: ['детство', 'война', 'мама', 'отец',
                                          'московск', 'ленинград', 'эвакуация']

2. work_kw       — профессиональные темы (ключевые термины поля)
                   Пример для Апресяна: ['семантика', 'лексическая функция',
                                         'толкование', 'синоним', 'НОСС']

3. thematic_top  — топ-5 тем для паспорта
                   Из тематического атласа (ручной анализ постов)

4. l2_pattern    — regex второго языка:
                   Латышский:  r'[āēīūžčšģķļņŗ]'   (Гасунс)
                   Французский: r'[àâçéèêëîïôùûüÿ]' (Мельчук)
                   Немецкий:   r'[äöüÄÖÜß]'
                   Нет L2:     r'(?!)'

5. manual_limits — из раздела «Что исключать» в _style.md
                   (то, что не выводится из чисел: этика, табу, позиция)

6. EPISTEMIC['ironic_cite'] — расширить маркерами иронии конкретного автора
                   Гасунс:    ['ибо сказано', 'ибо', 'сиречь']
                   Гаспаров:  ['как известно каждому', 'само собой разумеется']
                   Шкловский: ['остранение', 'приём', 'как сказал бы']

7. subcorpus НКРЯ для keyness:
                   Telegram/блог → 'blogs'
                   Публицистика  → 'paper'
                   Академик      → 'main' с жанровым фильтром

═══════════════════════════════════════════════════════════════════
АРХИТЕКТУРА ПАЙПЛАЙНА
═══════════════════════════════════════════════════════════════════

    Корпус
      │
      ├─ [load_tg / load_txt / load_csv]
      │
      ├─ ИЗМЕРЕНИЯ (шаги 1–13):
      │   ttr → pos_profile → nominalization → keyness →
      │   epistemic_modality → syntactic_depth →
      │   incipit_explicit → negation → style_dynamics →
      │   codeswitching → link_density → posting_rhythm →
      │   academic_baseline
      │
      ├─ ТРАНСЛЯЦИЯ [translate()]:
      │   каждое измерение → BehavioralRule(type, id, label, source, strength)
      │
      ├─ РЕНДЕР:
      │   render_stylometry() → <handle>_stylometry.md
      │   render_rules()      → <handle>_rules.md  ← ПРОВЕРИТЬ ВРУЧНУЮ
      │   render_dh()         → <handle>_dh_section.md
      │   generate_passport() → <handle>.yml  ← yaml.safe_load() валидация
      │
      └─ СЛЕДУЮЩИЕ ШАГИ:
          1. Открыть _rules.md, проверить противоречия
          2. Добавить правила, которые числа не уловят (этика, табу)
          3. Разместить .yml → styles/passports/
          4. Написать _style.md (качественная часть) + вставить _dh_section.md
"""

__version__ = "1.2.0"
import sys, json, re, math, os, yaml
from collections import Counter, defaultdict
from datetime import datetime
from dataclasses import dataclass, field
from typing import Literal

OUT = "out"
os.makedirs(OUT, exist_ok=True)

# ═══════════════════════════════════════════════════════════════════
# 0. ЗАГРУЗКА
# ═══════════════════════════════════════════════════════════════════

def load_tg(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    out = []
    for m in data.get("messages", []):
        if m.get("type") != "message": continue
        t = m.get("text", "")
        if isinstance(t, list):
            t = "".join(p if isinstance(p, str) else p.get("text","") for p in t)
        if len(t.strip()) > 20:
            out.append({"date": m.get("date",""), "text": t.strip()})
    return out

def load_txt(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    # Split on double newlines → paragraphs as posts
    paras = [p.strip() for p in re.split(r"\n{2,}", raw) if len(p.strip()) > 20]
    return [{"date": "", "text": p} for p in paras]

def load_csv(path):
    import csv
    out = []
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = row.get("text") or row.get("content") or row.get("body","")
            date = row.get("date") or row.get("timestamp","")
            if len(text.strip()) > 20:
                out.append({"date": date, "text": text.strip()})
    return out

def load(mode, path):
    if mode == "tg":  return load_tg(path)
    if mode == "txt": return load_txt(path)
    if mode == "csv": return load_csv(path)
    raise ValueError(f"Неизвестный режим: {mode}")

def corpus_stats(texts):
    tokens = re.findall(r"[а-яёА-ЯЁ]{3,}",
                        " ".join(d["text"] for d in texts).lower())
    dates = [d["date"][:7] for d in texts if d.get("date")]
    return {
        "posts": len(texts),
        "tokens_ru": len(tokens),
        "types_ru": len(set(tokens)),
        "date_range": (min(dates, default="?"), max(dates, default="?")),
    }

# ═══════════════════════════════════════════════════════════════════
# 1–12. ИЗМЕРЕНИЯ (компактные версии)
# ═══════════════════════════════════════════════════════════════════

def ttr(texts, window=500):
    tokens = re.findall(r"[а-яёА-ЯЁ]{2,}",
                        " ".join(d["text"] for d in texts).lower())
    if not tokens: return {}
    wins = [tokens[i:i+window] for i in range(0, len(tokens)-window, window)]
    return {
        "tokens": len(tokens), "types": len(set(tokens)),
        "ttr": round(len(set(tokens))/len(tokens), 4),
        "msttr_500": round(sum(len(set(w))/window for w in wins)/max(len(wins),1), 4),
    }

def pos_ru(w):
    if re.search(r"(аю|яю|ую|ею|аешь|ишь|ит(?:ся)?|ают|яют|уют|ат(?:ся)?|ят(?:ся)?|ил(?:ся)?|ила(?:сь)?|или(?:сь)?)$", w): return "V"
    if re.search(r"(ть|ться|чь)$", w) and len(w)>3: return "V"
    if re.search(r"((?:н|ск|ов|ев|ив|чив|лив|ист)(?:ый|ая|ое|ые|ого|ой|ому|ым|ых|ими))$", w): return "A"
    if re.search(r"(льно|ально|ично|ачно|ски|цки)$", w): return "Adv"
    if re.search(r"(ость|ство|ние|ение|ание|тие|ция|изм|тор|тель|щик|чик|ник)$", w): return "Nnom"
    return "N"

def pos_profile(texts):
    tokens = re.findall(r"[а-яёА-ЯЁ]{3,}",
                        " ".join(d["text"] for d in texts).lower())
    c = Counter(pos_ru(w) for w in tokens)
    cont = sum(c[k] for k in ["V","A","Adv","N","Nnom"])
    return {
        "verbs": c["V"], "nouns": c["N"], "deverbal": c["Nnom"],
        "adjectives": c["A"], "adverbs": c["Adv"], "total_content": cont,
        "verb_noun_ratio": round(c["V"]/max(c["N"],1), 3),
        "adj_noun_ratio": round(c["A"]/max(c["N"],1), 3),
        "nominalization_pct": round(100*c["Nnom"]/max(cont,1), 1),
        "pct_verbs": round(100*c["V"]/max(cont,1), 1),
        "pct_adjectives": round(100*c["A"]/max(cont,1), 1),
    }

def nominalization(texts):
    corp = " ".join(d["text"] for d in texts).lower()
    dv = re.findall(r"\b\w+(?:ние|ение|ание|тие|ость|ство|ция|ций|циях)\b", corp)
    vb = re.findall(r"\b\w+(?:аю|яю|ует|ает|яет|ают|яют|уют|ит\b|ил\b|ила\b|ать\b|ять\b|еть\b|ить\b)\b", corp)
    return {"deverbal": len(dv), "verbs": len(vb),
            "ratio": round(len(dv)/max(len(vb),1), 3),
            "top": Counter(dv).most_common(5)}

REF_IPM = {
    "год":3200,"человек":2800,"время":2400,"дело":1800,"жизнь":1700,
    "день":1600,"рука":1200,"работа":1100,"слово":1000,"место":950,
    "язык":680,"народ":550,"мир":510,"история":690,"страна":880,
    "любовь":470,"текст":290,"автор":285,"наука":380,"перевод":140,
    "занятие":180,"курс":160,"студент":150,"учитель":130,
    "санскрит":8,"деванагари":2,"ревнители":2,"рассада":8,"огород":15,
}
STOP = {"это","что","как","так","все","при","они","его","она","нас","нам",
        "вас","вам","нет","уже","ещё","еще","был","была","были","есть",
        "для","про","без","над","тут","там","вот","даже","хотя","тоже",
        "лишь","ведь","мне","меня","себя","тебя"}

def keyness(texts, ref=None, top=20, min_c=5):
    if ref is None: ref = REF_IPM
    tokens = re.findall(r"[а-яёА-ЯЁ]{3,}",
                        " ".join(d["text"] for d in texts).lower())
    freq = Counter(tokens); total = len(tokens)
    results = []
    for w, cnt in freq.items():
        if cnt < min_c or w in STOP: continue
        r = ref.get(w, 20)
        cipm = cnt/total*1e6
        O1,O2 = cnt, int(r*1e6/1e6)
        O2 = max(O2,1)
        E1 = total*(O1+O2)/(total+1e6)
        E2 = 1e6*(O1+O2)/(total+1e6)
        if E1>0 and E2>0 and O1>0 and O2>0:
            ll = 2*(O1*math.log(O1/E1)+O2*math.log(O2/E2))
            sign = "+" if cipm > r else "-"
            results.append({"word":w,"ll":round(ll,1),"sign":sign,
                            "corp_ipm":round(cipm),"ref_ipm":r,"n":cnt})
    results.sort(key=lambda x:-x["ll"])
    return {"overrepresented": [r for r in results if r["sign"]=="+"][:top],
            "underrepresented": [r for r in results if r["sign"]=="-"][:10],
            "total_tokens": total}

EPISTEMIC = {
    "assertion": ["конечно","несомненно","безусловно","очевидно","разумеется",
                  "действительно","именно","точно","определённо","бесспорно"],
    "hedge": ["вероятно","пожалуй","видимо","похоже","кажется","наверное",
              "скорее всего","должно быть","может быть","возможно"],
    "doubt": ["не уверен","не знаю","сомневаюсь","непонятно","неясно"],
    "evidential": ["по словам","как сообщает","согласно","судя по",
                   "как известно","якобы","говорят"],
    "ironic_cite": ["ибо сказано","как сказано","ибо","сиречь"],
}

def epistemic_modality(texts, markers=None):
    if markers is None: markers = EPISTEMIC
    full = " ".join(d["text"] for d in texts).lower()
    tokens = re.findall(r"[а-яёА-ЯЁ]{3,}", full)
    total = len(tokens)
    res = {}
    for cat, ml in markers.items():
        cnt = sum(full.count(m) for m in ml)
        res[cat] = {"n": cnt, "ipm": round(1e6*cnt/max(total,1))}
    res["hedge_assert_ratio"] = round(
        res["hedge"]["n"]/max(res["assertion"]["n"],1), 2)
    all_m = [(m, full.count(m)) for ml in markers.values() for m in ml]
    res["top_markers"] = sorted([(m,c) for m,c in all_m if c>0],
                                key=lambda x:-x[1])[:8]
    return res

def syntactic_depth(texts):
    full = " ".join(d["text"] for d in texts)
    sents = [s for s in re.split(r"[.!?]", full) if len(s.strip())>20]
    n = max(len(sents),1)
    hypo = len(re.findall(
        r"\b(который|которая|которые|которого|которому|потому\s+что|"
        r"так\s+как|хотя|несмотря|чтобы|если|когда|пока)\b", full.lower()))
    para = len(re.findall(r"\b(и |а |но |да |либо )\b", full.lower()))
    commas = full.count(",")
    clauses = re.split(r"[.,;!?—]", full)
    cl_lens = [len(re.findall(r"[а-яёА-ЯЁ]{2,}",c))
               for c in clauses if len(c.strip())>5]
    avg_cl = sum(cl_lens)/max(len(cl_lens),1)
    hp = round(hypo/n, 3); pp = round(para/n, 3)
    ratio = round(hp/max(pp,0.01), 3)
    return {"hypotaxis_per_sent": hp, "parataxis_per_sent": pp,
            "hypo_para_ratio": ratio,
            "commas_per_sent": round(commas/n,2),
            "avg_clause_words": round(avg_cl,1),
            "style_signal": ("академический" if ratio>0.5 else
                             "смешанный" if ratio>0.3 else "координационный")}

def incipit_explicit(texts, top=15):
    inc, exp = [], []
    for d in texts:
        t = re.sub(r"^[\U00010000-\U0010ffff\U00002600-\U000027FF\s]+",
                   "", d["text"]).strip()
        fm = re.match(r"^(\S+)", t)
        if fm: inc.append(fm.group(1).rstrip(".,!?:;—").lower())
        ce = re.sub(r"https?://\S+","",d["text"]).strip()
        lm = re.search(r"(\S+)\s*$", ce)
        if lm: exp.append(lm.group(1).rstrip(".,!?:;—").lower())
    q_words = {"кто","что","как","почему","зачем","откуда","куда","неужели"}
    return {"top_incipits": Counter(inc).most_common(top),
            "top_explicits": Counter(exp).most_common(top),
            "date_openings": sum(1 for w in inc if re.match(r"\d",w)),
            "question_openings": sum(1 for w in inc if w in q_words)}

def negation(texts):
    full = " ".join(d["text"] for d in texts)
    words = re.findall(r"[а-яёА-ЯЁ]{2,}", full.lower())
    ne = full.lower().count(" не ")
    rhet = [s.strip() for d in texts
            for s in re.split(r"[.!]", d["text"])
            if "?" in s and re.search(r"\bне\b",s,re.I) and 10<len(s)<150]
    return {"ne_total":ne, "ne_per_1k":round(1000*ne/max(len(words),1),1),
            "nyet":full.lower().count("нет"),
            "nikto":len(re.findall(r"\bникто\b",full.lower())),
            "nikogda":len(re.findall(r"\bникогда\b",full.lower())),
            "rhetorical_q":len(rhet), "examples":rhet[:3]}

def style_dynamics(texts, personal_kw, work_kw):
    by_year = defaultdict(list)
    for d in texts:
        by_year[d["date"][:4]].append(d["text"])
    res = {}
    for yr, posts in sorted(by_year.items()):
        if not yr or yr=="": continue
        res[yr] = {
            "n": len(posts),
            "avg_len": round(sum(len(t) for t in posts)/len(posts)),
            "pct_personal": round(100*sum(1 for t in posts
                if any(k in t.lower() for k in personal_kw))/len(posts),1),
            "pct_work": round(100*sum(1 for t in posts
                if any(k in t.lower() for k in work_kw))/len(posts),1),
            "pct_links": round(100*sum(1 for t in posts
                if "http" in t)/len(posts),1),
        }
    return res

def codeswitching(texts, l2=r"[āēīūžčšģķļņŗ]"):
    l2re = re.compile(l2, re.I)
    dev = re.compile(r"[\u0900-\u097F]")
    lat = re.compile(r"\b[a-zA-Z]{3,}\b")
    pos = defaultdict(Counter); bl = 0
    for d in texts:
        lines = [l.strip() for l in d["text"].split("\n") if l.strip()]
        n = len(lines)
        for i, line in enumerate(lines):
            p = "incipit" if i==0 else ("explicit" if i==n-1 else "medial")
            if dev.search(line): pos[p]["devanagari"] += 1
            if l2re.search(line): pos[p]["l2"] += 1
        for b in re.findall(r"\(([^)]{3,60})\)", d["text"]):
            if lat.search(b): bl += 1
    return {"positions": dict(pos), "latin_in_brackets": bl}

def link_density(texts):
    total = len(texts)
    wl = sum(1 for d in texts if "http" in d["text"])
    lo = sum(1 for d in texts if "http" in d["text"] and
             len(re.sub(r"https?://\S+","",d["text"]).strip())<30)
    doms = Counter()
    for d in texts:
        for u in re.findall(r"https?://([^/\s]+)", d["text"]):
            doms[u] += 1
    return {"pct_with_link":round(100*wl/max(total,1),1),
            "pct_link_only":round(100*lo/max(total,1),1),
            "top_domains":doms.most_common(5)}

def posting_rhythm(texts):
    hours, wdays, stamps = [], [], []
    for d in texts:
        try:
            dt = datetime.fromisoformat(d["date"])
            hours.append(dt.hour); wdays.append(dt.weekday())
            stamps.append(dt)
        except (ValueError, KeyError, TypeError): pass
    if not stamps:
        return {"note": "нет временны́х меток"}
    stamps.sort()
    bursts = sum(1 for i in range(len(stamps)-1)
                 if (stamps[i+1]-stamps[i]).seconds<600
                 and stamps[i+1].date()==stamps[i].date())
    dc = Counter(wdays); avg = sum(dc.values())/max(len(dc),1)
    cv = round((max(dc.values())-min(dc.values()))/max(avg,1), 3)
    dn = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"]
    return {"peak_hours": Counter(hours).most_common(3),
            "peak_day": dn[dc.most_common(1)[0][0]] if dc else "?",
            "weekday_cv": cv,
            "bursts_10min": bursts,
            "rhythm_type": ("дневниковый" if cv<0.15 else
                            "слабое расписание" if cv<0.30 else "редакционное"),
            "impulse_type": ("обдуманный" if bursts<5 else
                             "умеренно импульсный" if bursts<30 else "импульсный")}

def academic_baseline(texts):
    INTRO = ["актуальность","цель работы","задачи","объект исследования",
             "предмет исследования","научная новизна","степень разработанности"]
    CONCL = ["таким образом","в заключение","подводя итоги",
             "итак","в результате исследования","выводы"]
    FORM  = ["следует отметить","необходимо подчеркнуть","как отмечает",
             "по мнению","в соответствии с","на наш взгляд","представляется",
             "в рамках","в контексте","применительно к"]
    ESSAY = ["мне кажется","я думаю","по моему мнению","я считаю",
             "хочу отметить","замечу"]
    CITE  = [r"\[\d+,\s*с\.\s*\d+", r"\([А-ЯЁA-Z][а-яёa-z]+,\s*\d{4}",
             r"цит\.\s*по", r"там же"]
    full = " ".join(d["text"] for d in texts).lower()
    tokens = re.findall(r"[а-яёА-ЯЁ]{3,}", full)
    total = max(len(tokens),1)
    intro_n = sum(full.count(m) for m in INTRO)
    concl_n = sum(full.count(m) for m in CONCL)
    form_n  = sum(full.count(m) for m in FORM)
    essay_n = sum(full.count(m) for m in ESSAY)
    cite_n  = sum(len(re.findall(p," ".join(d["text"] for d in texts)))
                  for p in CITE)
    ad = round(1000*(intro_n+concl_n+form_n)/total, 2)
    ed = round(1000*essay_n/total, 2)
    cd = round(1000*cite_n/total, 2)
    fi = round((intro_n+concl_n+form_n)/max(intro_n+concl_n+form_n+essay_n,1),3)
    gs = ("эссе" if ed>ad else "реферат/курсовая" if ad>3*ed else
          "смешанный" if ad>0 and ed>0 else "нейтральный")
    return {"academic_density":ad,"essay_density":ed,
            "citation_density":cd,"formality_index":fi,"genre_signal":gs,
            "raw":{"intro":intro_n,"concl":concl_n,"formal":form_n,
                   "essay":essay_n,"cite":cite_n}}


# ═══════════════════════════════════════════════════════════════════
# ПРОВЕРКА СООТВЕТСТВИЯ ТРЕБОВАНИЯМ ЖУРНАЛА
#
# Источники норм:
#   СПбГУ Психология: psyjournal.spbu.ru/public/journals/16/
#                     psyjournal_requirements_for_article_rus.pdf
#   ВШЭ: Методические рекомендации 2019 (academic_baseline выше)
#
# Добавить новый журнал: добавить словарь в JOURNAL_PROFILES и
# вызвать journal_check(texts, journal='my_journal').
# ═══════════════════════════════════════════════════════════════════

JOURNAL_PROFILES = {

    # ── Вестник СПбГУ. Психология ─────────────────────────────────
    # Источник: psyjournal.spbu.ru (май 2026)
    "spbu_psychology": {
        "name": "Вестник СПбГУ. Психология",
        "url": "https://psyjournal.spbu.ru",

        # Объём статьи
        "chars_min": 20_000,     # с пробелами
        "chars_max": 38_000,

        # Аннотация
        "abstract_words_min": 230,
        "abstract_words_max": 250,
        "abstract_single_para": True,    # единый абзац
        "abstract_no_lists": True,       # без нумер./маркиров. списков
        "abstract_no_citations": True,   # без библиографических ссылок
        "abstract_no_abbr": True,        # без аббревиатур

        # Ключевые слова
        "keywords_min": 5,
        "keywords_max": 7,
        "keywords_no_abbr": True,
        "keywords_no_complex_phrases": True,

        # Источники
        "sources_empirical_min": 15,
        "sources_empirical_max": 20,
        "sources_theoretical_min": 40,
        "sources_recent_years": 5,       # предпочтительно за последние N лет

        # Структура (эмпирическая статья)
        "required_sections_empirical": [
            "введение", "методы", "результаты",
            "обсуждение", "выводы", "ограничения",
        ],
        # Структура (теоретическая/обзорная статья)
        "required_sections_theoretical": [
            "введение", "проблема", "анализ", "выводы",
        ],

        # Двуязычность
        "bilingual_required": True,      # название, авторы, аннотация, ключевые слова
        "two_bibliographies": True,       # Литература (ГОСТ) + References (APA)

        # Цитирование
        "citation_style_ru": "ГОСТ",
        "citation_style_en": "APA",
        "transliteration_system": "Library of Congress (BSI)",

        # Технические
        "figures_separate_files": True,
        "figures_min_dpi": 300,
        "tables_in_word_excel": True,
        "no_scanned_tables": True,

        # Сокращения
        "abbreviations_decode_first_use": True,
        "foreign_authors_original_spelling": True,  # при первом упоминании
    },

    # ── Вестник СПбГУ — гуманитарные серии ───────────────────────────
    # Источник: documents.spbu.ru/images/vestnik/trebovaniya_k_statye.pdf
    # Охватывает: Философия, История, Психология(?), Экономика и др.
    # Отличия от spbu_psychology: объём больше, аннотация шире,
    # ключевых слов больше, структура 5 разделов (не 6), другое цитирование
    "spbu_humanities": {
        "name": "Вестник СПбГУ (гуманитарные серии)",
        "url": "https://documents.spbu.ru/images/vestnik/trebovaniya_k_statye.pdf",

        # Объём
        "chars_min": 30_000,
        "chars_max": 50_000,

        # Форматирование (проверяется косвенно)
        "font": "Times New Roman",
        "font_size": 12,
        "line_spacing": 1.5,
        "margins_mm": 25,

        # Аннотация
        "abstract_words_min": 200,
        "abstract_words_max": 300,
        "abstract_single_para": True,
        "abstract_no_lists": True,
        "abstract_no_citations": True,
        "abstract_no_abbr": True,

        # Ключевые слова
        "keywords_min": 1,
        "keywords_max": 10,       # «до 10»
        "keywords_no_abbr": True,

        # Структура — IMRDC (5 разделов обязательно)
        "required_sections_empirical": [
            "введение", "методы", "результаты", "дискуссия", "заключение",
        ],
        "required_sections_theoretical": [
            "введение", "заключение",
        ],

        # Аббревиатуры: строже, чем у psbu_psychology
        # Запрещены: т.д., в т.ч., т.н., др. — только полные формы
        "abbreviations_decode_first_use": True,
        "forbidden_abbreviations": ["т.д.", "в т.ч.", "т.н.", " др."],

        # Двуязычность
        "bilingual_required": True,
        "two_bibliographies": True,       # Литература + References

        # Цитирование
        "citation_style_ru": "авторский (Фамилия, год)",
        "citation_style_en": "авторский (Author, year)",
        # НЕ APA и не ГОСТ — собственная система журнала
        # References: название статьи переводится на англ., журнал транслитерируется
        # Издательства: добавляется Publ. (кроме University Press)
        "transliteration_system": "Library of Congress",
        "references_in_russian_translated": True,

        # Таблицы и рисунки
        "tables_captioned_above": True,        # «Таблица 1. Название» над таблицей
        "figures_captioned_below": True,       # «Рис. 1» под рисунком
        "all_tables_figures_cited_in_text": True,
        "tables_not_scanned": True,

        # Нормативные акты — только в постраничные сноски
        "no_legal_docs_in_bibliography": True,

        # Страницы в ссылках: только при прямом цитировании
        "pages_in_citations_only_direct": True,

        # Источники (ориентир из документа — нет жёсткого min/max)
        "sources_recent_years": 5,
    },

    # ── Философия хозяйства (ЭФ МГУ) ─────────────────────────────────
    # Источник: econ.msu.ru/departments/lfh/cd673/
    # Журнал Лаборатории философии хозяйства ЭФ МГУ им. М.В.Ломоносова
    #
    # Ключевые отличия от СПбГУ-профилей:
    # - Объём меньше: до 35 000 зн.
    # - Цитирование: ГОСТ 7.0.5–2008 с номерами в скобках [1, 3], НЕ автор-год
    # - Аннотация короче: 100–150 слов (только англ.); русская — без лимита
    # - Требуются УДК + ББК
    # - Рисунки ТОЛЬКО чёрно-белые, максимум 5 рисунков, 8 всего (рис.+табл.)
    # - В тексте только курсив; жирный, подчёркивание — запрещены
    # - Нет сканированных и интернет-графических материалов
    # - Формулы только через редактор формул MS Word
    # - References: транслитерация или перевод русских источников (не полный APA)
    "mgu_filosofiya_hozyaystva": {
        "name": "Философия хозяйства (ЭФ МГУ)",
        "url": "https://www.econ.msu.ru/departments/lfh/cd673/",

        # Объём
        "chars_min": 0,
        "chars_max": 35_000,           # «до 35000 знаков с пробелами»

        # Форматирование (в docx не проверяется автоматически — rule в _rules.md)
        "font": "Times New Roman",
        "font_size": 14,               # 14pt (vs 12pt у СПбГУ)
        "line_spacing": 1.5,
        "first_line_indent_cm": 1,

        # Аннотация
        # Русская: объём не ограничен, информативная (цель + результаты + применение + выводы)
        # Английская: 100–150 слов (короче, чем у СПбГУ)
        "abstract_words_min": 100,
        "abstract_words_max": 150,
        "abstract_single_para": False,  # явно не требуется единый абзац
        "abstract_no_lists": False,
        "abstract_no_citations": False,
        "abstract_no_abbr": False,
        # Русская и английская аннотации должны соответствовать друг другу
        "abstract_ru_en_match": True,

        # Ключевые слова
        "keywords_min": 1,
        "keywords_max": 99,            # лимит не указан

        # Структура — не регламентирована (философский журнал)
        "required_sections_empirical": [],
        "required_sections_theoretical": [],

        # Двуязычность
        "bilingual_required": True,    # название, аннотация, ключевые слова, сведения об авторе
        "two_bibliographies": True,    # Литература + References (транслитерация/перевод)

        # Цитирование — ГОСТ 7.0.5–2008 с номерами в квадратных скобках
        # НЕ автор-год, а [1, 3] или [1, 15; 8]
        "citation_style_ru": "ГОСТ 7.0.5–2008 [номер, страница]",
        "citation_style_en": "транслитерация/перевод (не APA)",
        "citation_brackets_numeric": True,  # проверять наличие [цифра] ссылок
        "references_in_russian_transliterated": True,  # не полный APA — только транслит/перевод

        # Индексы
        "requires_udc": True,          # УДК обязателен
        "requires_bbk": True,          # ББК обязателен (после аннотации и ключевых слов)

        # Форматирование текста
        "only_italics_allowed": True,  # никаких жирных и подчёркиваний в тексте
        "title_lowercase_centered": True,  # заголовок строчными, по центру

        # Таблицы и рисунки
        "figures_bw_only": True,       # ТОЛЬКО чёрно-белые рисунки
        "figures_max": 5,              # максимум 5 рисунков
        "tables_figures_max_total": 8, # таблиц + рисунков суммарно ≤ 8
        "figures_max_width_cm": 11,
        "figures_max_height_cm": 14,
        "figures_font_size": 10,
        "figures_title_below": True,   # название под рисунком
        "no_scanned_figures": True,    # нет сканов и интернет-графики
        "tables_not_scanned": True,
        "all_tables_figures_cited_in_text": True,

        # Формулы
        "formulas_in_editor": True,    # только через редактор формул Word

        # Публикация
        "publication_fee": 0,          # бесплатно
    },

    # ── ВШЭ (из Методических рекомендаций 2019) ──────────────────
    "hse_student": {
        "name": "ВШЭ (учебные работы)",
        "chars_empirical": 2000,          # знаков на страницу
        "essay_pages": (8, 10),
        "referat_pages": (12, 15),
        "kursovaya_pages": (30, 35),
        "citation_style_ru": "ГОСТ",
        "bilingual_required": False,
        "two_bibliographies": False,
        "sources_recent_years": 10,
    },
}


def journal_check(texts: list[dict],
                  journal: str = "spbu_psychology",
                  article_type: str = "empirical",
                  abstract_text: str = "",
                  keywords: list[str] = None,
                  section_headers: list[str] = None,
                  source_count: int = 0,
                  has_references_apa: bool = False) -> dict:
    """
    Проверить текст на соответствие требованиям конкретного журнала.

    Параметры:
      journal        — ключ из JOURNAL_PROFILES
      article_type   — 'empirical' или 'theoretical'
      abstract_text  — текст аннотации отдельно (для подсчёта слов)
      keywords       — список ключевых слов
      section_headers— заголовки разделов (для проверки структуры)
      source_count   — кол-во источников в списке литературы
      has_references_apa — есть ли блок References (APA) отдельно

    Возвращает:
      {
        'profile':  название журнала,
        'passed':   list[str],   — выполненные требования
        'warnings': list[str],   — предупреждения (мягкие нарушения)
        'failed':   list[str],   — нарушения (жёсткие требования)
        'metrics':  dict,        — числовые значения
      }
    """
    p = JOURNAL_PROFILES.get(journal)
    if not p:
        return {"error": f"Журнал '{journal}' не найден. Доступны: {list(JOURNAL_PROFILES)}"}

    full_text = " ".join(d["text"] for d in texts)
    char_count = len(full_text)
    passed, warnings, failed = [], [], []
    metrics = {}

    # ── Объём статьи ──────────────────────────────────────────────
    if "chars_min" in p:
        metrics["chars"] = char_count
        lo, hi = p["chars_min"], p["chars_max"]
        if lo <= char_count <= hi:
            passed.append(f"Объём: {char_count:,} знаков (норма {lo:,}–{hi:,})")
        elif char_count < lo:
            failed.append(f"Объём мал: {char_count:,} знаков (минимум {lo:,})")
        else:
            failed.append(f"Объём велик: {char_count:,} знаков (максимум {hi:,})")

    # ── Аннотация ─────────────────────────────────────────────────
    if abstract_text and "abstract_words_min" in p:
        abst_words = len(abstract_text.split())
        metrics["abstract_words"] = abst_words
        lo, hi = p["abstract_words_min"], p["abstract_words_max"]
        if lo <= abst_words <= hi:
            passed.append(f"Аннотация: {abst_words} слов (норма {lo}–{hi})")
        else:
            failed.append(f"Аннотация: {abst_words} слов (норма {lo}–{hi})")

        # Единый абзац = нет двойного переноса
        if p.get("abstract_single_para"):
            if "\n\n" in abstract_text or "\n \n" in abstract_text:
                failed.append("Аннотация: должна быть единым абзацем (найдены разрывы)")
            else:
                passed.append("Аннотация: единый абзац ✓")

        # Нет маркеров списков
        if p.get("abstract_no_lists"):
            list_markers = re.findall(r"(?m)^[\s]*[•\-\*\d]+[\.\)]\s", abstract_text)
            if list_markers:
                failed.append(f"Аннотация: найдены элементы списка ({len(list_markers)} шт.) — запрещено")
            else:
                passed.append("Аннотация: нет списков ✓")

        # Нет библиографических ссылок
        if p.get("abstract_no_citations"):
            cit = re.findall(r"\(\w+,\s*\d{4}\)|\[\d+\]", abstract_text)
            if cit:
                failed.append(f"Аннотация: найдены ссылки ({cit[:3]}) — запрещено")
            else:
                passed.append("Аннотация: нет библиографических ссылок ✓")

        # Нет аббревиатур (кроме общеизвестных)
        if p.get("abstract_no_abbr"):
            abbr = re.findall(r"\b[А-ЯЁA-Z]{2,5}\b", abstract_text)
            known = {"США","РФ","ООН","ЕС","АПА","APA","PhD","DOI","URL",
                     "РФФИ","РАН","СПбГУ","НИУ","ВШЭ","НКРЯ","ИЛИ"}
            unknown_abbr = [a for a in set(abbr) if a not in known]
            if unknown_abbr:
                warnings.append(f"Аннотация: возможные аббревиатуры {unknown_abbr[:5]} — проверить")
            else:
                passed.append("Аннотация: аббревиатуры не обнаружены ✓")

    # ── Ключевые слова ────────────────────────────────────────────
    if keywords is not None and "keywords_min" in p:
        metrics["keywords_count"] = len(keywords)
        lo, hi = p["keywords_min"], p["keywords_max"]
        if lo <= len(keywords) <= hi:
            passed.append(f"Ключевые слова: {len(keywords)} (норма {lo}–{hi}) ✓")
        else:
            failed.append(f"Ключевые слова: {len(keywords)} (норма {lo}–{hi})")

        if p.get("keywords_no_abbr"):
            kw_abbr = [k for k in keywords
                       if re.search(r"\b[А-ЯЁA-Z]{2,}\b", k)]
            if kw_abbr:
                warnings.append(f"Ключевые слова: аббревиатуры нежелательны: {kw_abbr}")

        if p.get("keywords_no_complex_phrases"):
            kw_long = [k for k in keywords if len(k.split()) > 4]
            if kw_long:
                warnings.append(f"Ключевые слова: слишком длинные фразы: {kw_long}")

    # ── Источники ─────────────────────────────────────────────────
    if source_count > 0:
        metrics["source_count"] = source_count
        if article_type == "empirical" and "sources_empirical_min" in p:
            lo, hi = p["sources_empirical_min"], p["sources_empirical_max"]
            if lo <= source_count <= hi:
                passed.append(f"Источников: {source_count} (норма {lo}–{hi} для эмпирической) ✓")
            elif source_count < lo:
                warnings.append(f"Источников мало: {source_count} (рекомендуется {lo}–{hi})")
            else:
                warnings.append(f"Источников много: {source_count} — для эмпирической обычно {lo}–{hi}")
        elif article_type == "theoretical" and "sources_theoretical_min" in p:
            lo = p["sources_theoretical_min"]
            if source_count >= lo:
                passed.append(f"Источников: {source_count} (норма ≥{lo} для теоретической) ✓")
            else:
                warnings.append(f"Источников мало: {source_count} (рекомендуется ≥{lo})")

    # ── Двуязычность (проверяем наличие английского блока) ────────
    if p.get("bilingual_required"):
        has_en = bool(re.search(r'[A-Za-z]{20,}', full_text))
        if has_en:
            passed.append("Английский блок присутствует ✓")
        else:
            failed.append("Требуется английская версия: название, авторы, аннотация, ключевые слова")

    if p.get("two_bibliographies"):
        has_references = has_references_apa or bool(
            re.search(r'(?i)references', full_text))
        has_literatura = bool(re.search(r'(?i)литература', full_text))
        if has_references and has_literatura:
            passed.append("Два списка литературы: Литература (ГОСТ) + References (APA) ✓")
        elif has_literatura and not has_references:
            failed.append("Отсутствует блок References (APA) — обязателен для данного журнала")
        elif not has_literatura:
            failed.append("Отсутствует блок Литература (ГОСТ)")

    # ── Структура статьи ──────────────────────────────────────────
    if section_headers is not None:
        headers_lower = [h.lower() for h in section_headers]
        if article_type == "empirical":
            required = p.get("required_sections_empirical", [])
        else:
            required = p.get("required_sections_theoretical", [])
        missing = [s for s in required
                   if not any(s in h for h in headers_lower)]
        if not missing:
            passed.append(f"Структура: все обязательные разделы присутствуют ✓")
        else:
            failed.append(f"Структура: отсутствуют разделы: {missing}")

    # ── Аббревиатуры в тексте (первое употребление) ───────────────
    if p.get("abbreviations_decode_first_use"):
        abbr_no_decode = re.findall(r"\b([А-ЯЁ]{2,6})\b(?!\s*[\(（])", full_text)
        common = {"РФ","США","ООН","ВОЗ","РАН","ЕС","НКРЯ","ВШЭ","СПбГУ",
                  "МГУ","АПА","URL","DOI","PDF","XML","CSV","API"}
        rare_abbr = set(a for a in abbr_no_decode if a not in common
                        and len(a) <= 6 and a.isupper())
        if rare_abbr and len(rare_abbr) < 10:
            warnings.append(f"Аббревиатуры без расшифровки при первом упоминании: "
                            f"{sorted(rare_abbr)[:6]} — проверить")
        elif not rare_abbr:
            passed.append("Аббревиатуры: расшифровки найдены или аббревиатур нет ✓")

    # ── Запрещённые сокращения (Вестник СПбГУ, гуманитарные серии) ──
    # §«Требования к аббревиатурам»: запрещены т.д., в т.ч., т.н., др.
    # Вместо них: «так далее», «в том числе», «так называемый», «другие»
    forbidden = p.get("forbidden_abbreviations", [])
    if forbidden:
        found_forbidden = [f for f in forbidden if f in full_text]
        if found_forbidden:
            failed.append(
                f"Запрещённые сокращения: {found_forbidden} — "
                f"заменить на полные формы (требование Вестника СПбГУ)")
        else:
            passed.append("Запрещённые сокращения не найдены ✓")

    # ── Структура таблиц / рисунков ──────────────────────────────────
    if p.get("all_tables_figures_cited_in_text"):
        # Ищем упоминания таблиц и рисунков в тексте
        tbl_refs = len(re.findall(r'(табл\.|таблица|table)\s*\d', full_text, re.I))
        fig_refs = len(re.findall(r'(рис\.|рисунок|figure|fig\.)\s*\d', full_text, re.I))
        metrics["table_refs_in_text"] = tbl_refs
        metrics["figure_refs_in_text"] = fig_refs
        if tbl_refs > 0:
            passed.append(f"Таблицы упомянуты в тексте: {tbl_refs} ссылок ✓")
        if fig_refs > 0:
            passed.append(f"Рисунки упомянуты в тексте: {fig_refs} ссылок ✓")

    # ── УДК + ББК (Философия хозяйства МГУ) ─────────────────────────
    if p.get("requires_udc"):
        if re.search(r'\bУДК\b', full_text):
            passed.append("УДК присутствует ✓")
        else:
            failed.append("Отсутствует индекс УДК — обязателен для данного журнала")

    if p.get("requires_bbk"):
        if re.search(r'\bББК\b', full_text):
            passed.append("ББК присутствует ✓")
        else:
            failed.append("Отсутствует индекс ББК — обязателен (после аннотации и ключевых слов)")

    # ── Цитирование: числовые скобки [1, 3] vs. автор-год ────────────
    if p.get("citation_brackets_numeric"):
        bracket_num = len(re.findall(r'\[\d+(?:,\s*\d+)?(?:;\s*\d+(?:,\s*\d+)?)*\]',
                                      full_text))
        author_year = len(re.findall(r'\([А-ЯЁA-Z][а-яёa-z]+,\s*\d{4}\)', full_text))
        metrics["numeric_citations"] = bracket_num
        metrics["author_year_citations"] = author_year
        if bracket_num > 0 and author_year == 0:
            passed.append(f"Цитирование: числовые ссылки [{bracket_num} шт.], "
                          f"формат ГОСТ [номер, страница] ✓")
        elif author_year > 0 and bracket_num == 0:
            failed.append(f"Цитирование: найдены ссылки автор-год ({author_year} шт.) — "
                          f"требуется формат ГОСТ [номер, страница]")
        elif author_year > 0 and bracket_num > 0:
            warnings.append(f"Смешанное цитирование: числовые [{bracket_num}] "
                            f"и автор-год ({author_year}) — выбрать один стиль")
        else:
            warnings.append("Ссылки в тексте не обнаружены — убедиться в наличии")

    # ── Рисунки: максимальное количество ────────────────────────────
    if p.get("figures_max"):
        fig_count = len(re.findall(r'(рис\.|рисунок)\s*\d', full_text, re.I))
        metrics["figure_count_approx"] = fig_count
        max_f = p["figures_max"]
        if fig_count <= max_f:
            passed.append(f"Рисунков ~{fig_count} (максимум {max_f}) ✓")
        else:
            failed.append(f"Рисунков ~{fig_count} > максимум {max_f}")

    if p.get("tables_figures_max_total"):
        tbl_count = len(re.findall(r'(табл\.|таблица)\s*\d', full_text, re.I))
        fig_count = metrics.get("figure_count_approx", 0)
        total = tbl_count + fig_count
        max_t = p["tables_figures_max_total"]
        metrics["tables_figures_total"] = total
        if total <= max_t:
            passed.append(f"Таблиц+рисунков ~{total} (максимум {max_t}) ✓")
        else:
            failed.append(f"Таблиц+рисунков ~{total} > максимум {max_t}")

    # ── Чёрно-белые рисунки (rule, не автоматическая проверка) ───────
    if p.get("figures_bw_only"):
        warnings.append("Рисунки: только чёрно-белые — проверить вручную "
                        "(цвет в .docx автоматически не проверяется)")

    # ── Только курсив (не жирный, не подчёркивание) ──────────────────
    if p.get("only_italics_allowed"):
        warnings.append("Выделения в тексте: разрешён только курсив — "
                        "жирный и подчёркивание запрещены (проверить в .docx вручную)")

    # ── Нормативные акты в сносках, не в библиографии ────────────────
    if p.get("no_legal_docs_in_bibliography"):
        legal_patterns = [
            r'федеральный закон', r'постановление правительства',
            r'указ президента', r'гост\s+р?\s*\d', r'приказ\s+\w',
        ]
        legal_in_text = sum(len(re.findall(p_re, full_text.lower()))
                            for p_re in legal_patterns)
        if legal_in_text > 0:
            warnings.append(
                f"Найдено ~{legal_in_text} упоминаний нормативных актов — "
                f"убедиться, что они в постраничных сносках, не в списке «Литература»")

    # ── Ссылка на страницы только при прямом цитировании ─────────────
    if p.get("pages_in_citations_only_direct"):
        # Ищем ссылки со страницами, которые не являются прямыми цитатами
        # (прямая цитата = кавычки перед ссылкой)
        inline_pages = re.findall(r'(?<![«»""])\s*\([А-ЯЁA-Z][а-яёa-z]+,\s*\d{4},\s*с\.\s*\d+\)',
                                  full_text)
        if inline_pages:
            warnings.append(
                f"Страницы в ссылках ({len(inline_pages)} случаев) — "
                f"указывать только при прямом цитировании (Вестник СПбГУ)")

    return {
        "profile": p["name"],
        "article_type": article_type,
        "passed":   passed,
        "warnings": warnings,
        "failed":   failed,
        "metrics":  metrics,
        "summary": (
            f"✅ {len(passed)} выполнено  "
            f"⚠️ {len(warnings)} предупреждений  "
            f"❌ {len(failed)} нарушений"
        ),
    }


def print_journal_report(result: dict) -> None:
    """Вывести отчёт journal_check() в читаемом виде."""
    print(f"\n{'═'*60}")
    print(f"Журнал: {result['profile']}")
    print(f"Тип статьи: {result.get('article_type','?')}")
    print(result["summary"])
    print(f"{'─'*60}")
    if result["metrics"]:
        print("Метрики:")
        for k, v in result["metrics"].items():
            print(f"  {k}: {v:,}" if isinstance(v, int) else f"  {k}: {v}")
    if result["passed"]:
        print("\n✅ Выполнено:")
        for r in result["passed"]:
            print(f"  {r}")
    if result["warnings"]:
        print("\n⚠️  Предупреждения:")
        for r in result["warnings"]:
            print(f"  {r}")
    if result["failed"]:
        print("\n❌ Нарушения:")
        for r in result["failed"]:
            print(f"  {r}")
    print(f"{'═'*60}")



# ═══════════════════════════════════════════════════════════════════
# МАТРИЦА ТРАНСЛЯЦИИ
# ═══════════════════════════════════════════════════════════════════

@dataclass
class Rule:
    type: str   # check | limit | prompt_rule | vocab_rule
    id: str
    label: str
    source: str
    strength: str  # hard | soft
    value: float = 0.0

def translate(ttr_d, pos_d, key_d, ep_d, syn_d, inc_d,
              neg_d, cs_d, lnk_d, rhy_d, acad_d,
              manual_limits=None, manual_checks=None):
    R = []

    # TTR
    m = ttr_d.get("msttr_500",0)
    if m>0.75:
        R.append(Rule("check","lexical_variety",
            "Варьировать лексику, не повторять слово в соседних предложениях",
            f"MSTTR={m}","soft",m))
    elif m<0.65:
        R.append(Rule("prompt_rule","repetition_ok",
            "Повторение ключевых слов допустимо — последовательность важнее",
            f"MSTTR={m}","soft",m))

    # POS
    vn = pos_d.get("verb_noun_ratio",0)
    an = pos_d.get("adj_noun_ratio",0)
    nom = pos_d.get("nominalization_pct",0)
    if vn<0.15:
        R.append(Rule("prompt_rule","nominal_style_ok",
            "Именной стиль: термины называются напрямую, без парафраза",
            f"V/N={vn}","hard",vn))
        R.append(Rule("limit","no_paraphrase_terms",
            "Не заменять термин описанием: называть, а не пересказывать",
            f"V/N={vn}","hard",vn))
    elif vn>0.25:
        R.append(Rule("prompt_rule","verbal_style",
            "Глагольный стиль: действие через глагол, а не отглагольное сущ.",
            f"V/N={vn}","soft",vn))
    if an<0.10:
        R.append(Rule("limit","spare_adjectives",
            "Прилагательных мало — называть, не описывать",
            f"A/N={an}","soft",an))
    if nom<0.4:
        R.append(Rule("limit","no_nominalization",
            "Избегать отглагольных существительных: «перевёл», не «осуществление перевода»",
            f"nom={nom}%","soft",nom))

    # Keyness
    over = key_d.get("overrepresented",[])
    under = key_d.get("underrepresented",[])
    sig = [r["word"] for r in over if r["ll"]>300]
    if sig:
        R.append(Rule("vocab_rule","signature_words",
            f"Сигнатурные слова (использовать свободно): {', '.join(sig[:8])}",
            "keyness overrepresented","soft",0))
    avoid = [r["word"] for r in under if r["ll"]>30]
    if avoid:
        R.append(Rule("vocab_rule","avoid_abstract",
            f"Избегать абстрактных концептов: {', '.join(avoid[:6])}",
            "keyness underrepresented","soft",0))
    q_words = {"кто","что","как","почему","зачем","откуда"}
    if any(r["word"] in q_words for r in over[:10]):
        R.append(Rule("prompt_rule","question_as_opening",
            "Вопрос — естественная форма открытия поста или раздела",
            "keyness: вопросительные слова в топе","soft",0))

    # Epistemic
    ha = ep_d.get("hedge_assert_ratio",1)
    ironic = ep_d.get("ironic_cite",{}).get("ipm",0)
    evid = ep_d.get("evidential",{}).get("ipm",0)
    doubt = ep_d.get("doubt",{}).get("ipm",0)
    if ha>1.3:
        R.append(Rule("prompt_rule","hedge_before_assert",
            "Хеджировать утверждения: «вероятно», «пожалуй» перед небезусловными суждениями",
            f"hedge/assert={ha}","soft",ha))
    elif ha<0.7:
        R.append(Rule("prompt_rule","assert_confidently",
            "Утверждать уверенно, без лишних оговорок",
            f"hedge/assert={ha}","soft",ha))
    else:
        R.append(Rule("check","epistemic_balance",
            "Баланс уверенности и хеджирования: не уклоняться и не быть безапелляционным",
            f"hedge/assert={ha}","soft",ha))
    if ironic>1000:
        R.append(Rule("check","ironic_register_consistency",
            "Ирония через архаичный регистр: не объяснять — читатель должен понять сам",
            f"ironic_cite={ironic}ipm","hard",ironic))
        R.append(Rule("limit","no_irony_explanation",
            "Никогда не помечать иронию (смайлами, словами «шутка»)",
            f"ironic_cite={ironic}ipm","hard",ironic))
    if evid>400:
        R.append(Rule("check","source_attribution",
            "Указывать источник: имя автора + текст при любом заимствовании",
            f"evidential={evid}ipm","soft",evid))
    if doubt<200:
        R.append(Rule("limit","no_public_doubt",
            "Не выражать публичных сомнений в компетентности",
            f"doubt={doubt}ipm","soft",doubt))

    # Syntax
    hp = syn_d.get("hypo_para_ratio",0)
    cl = syn_d.get("avg_clause_words",0)
    if hp<0.3:
        R.append(Rule("prompt_rule","paratactic_rhythm",
            "Координационный синтаксис: соединять через «а», «и», «но»",
            f"hypo/para={hp}","soft",hp))
        R.append(Rule("limit","no_deep_subordination",
            "Не строить вложенных придаточных (3+ уровня)",
            f"hypo/para={hp}","soft",hp))
    elif hp>0.5:
        R.append(Rule("prompt_rule","hypotactic_ok",
            "Сложноподчинённые конструкции уместны",
            f"hypo/para={hp}","soft",hp))
    if cl<5:
        R.append(Rule("prompt_rule","montage_style",
            "Монтажный стиль: предложение из коротких блоков через запятые или тире",
            f"avg_clause={cl}","soft",cl))

    # Incipit
    q_opens = inc_d.get("question_openings",0)
    d_opens = inc_d.get("date_openings",0)
    total_inc = sum(c for _,c in inc_d.get("top_incipits",[]))
    if q_opens/max(total_inc,1)>0.12:
        R.append(Rule("prompt_rule","question_opening",
            "Открывать вопросом, когда уместно: сигнал диалогичности",
            f"question_openings={q_opens}","soft",q_opens))
    if d_opens/max(total_inc,1)>0.05:
        R.append(Rule("prompt_rule","temporal_anchor",
            "Привязывать к конкретному моменту: «сегодня», дата, год",
            f"date_openings={d_opens}","soft",d_opens))

    # Closure pattern from top explicits
    geo = {"москве","петербурге","индии","риге","обнинске","латвии","краснодаре"}
    top_exp = [w for w,_ in inc_d.get("top_explicits",[])[:15]]
    if any(w in geo for w in top_exp):
        R.append(Rule("prompt_rule","concrete_closure",
            "Заканчивать конкретным: топоним, имя, факт — не общим выводом",
            "explicit: топонимы в финале","soft",0))

    # Negation
    rate = neg_d.get("ne_per_1k",0)
    rhet = neg_d.get("rhetorical_q",0)
    if rate>18:
        R.append(Rule("check","polemic_negation",
            "Высокое отрицание: убедиться, что оно аналитическое, не полемическое",
            f"не={rate}/1k","soft",rate))
    if rhet>30:
        R.append(Rule("prompt_rule","rhetorical_q_neg",
            "«Не пора ли…» — основная форма мягкого утверждения",
            f"rhetorical_q={rhet}","soft",rhet))

    # Code-switching
    pos_cs = cs_d.get("positions",{})
    medial = sum(pos_cs.get("medial",{}).values())
    explicit_ = sum(pos_cs.get("explicit",{}).values())
    if medial>explicit_*3:
        R.append(Rule("prompt_rule","codeswitching_medial",
            "Иноязычные вставки — в середине текста, не в финале (финал — только для личного)",
            "codeswitching medial dominant","soft",0))
    if cs_d.get("latin_in_brackets",0)>50:
        R.append(Rule("prompt_rule","foreign_in_brackets",
            "Иноязычные слова и транслитерация — в скобках",
            f"latin_in_brackets={cs_d['latin_in_brackets']}","soft",0))

    # Links
    lo = lnk_d.get("pct_link_only",0)
    if lo>15:
        R.append(Rule("prompt_rule","link_as_main",
            "Ссылки как основной носитель: минимальный комментарий допустим",
            f"link_only={lo}%","soft",lo))
    elif lo<10:
        R.append(Rule("prompt_rule","link_as_supplement",
            "Ссылки — дополнение к тексту, не замена; текст самодостаточен",
            f"link_only={lo}%","soft",lo))

    # Rhythm
    cv = rhy_d.get("weekday_cv",0)
    bursts = rhy_d.get("bursts_10min",0)
    if cv<0.15:
        R.append(Rule("prompt_rule","daily_cadence",
            "Дневниковый ритм: один пост — одна мысль",
            f"weekday_cv={cv}","soft",cv))
    if isinstance(bursts,int) and bursts<5:
        R.append(Rule("prompt_rule","deliberate_posts",
            "Обдуманные публикации: каждый пост — отдельное решение",
            f"bursts={bursts}","hard",bursts))

    # Academic baseline
    fi = acad_d.get("formality_index",0)
    gs = acad_d.get("genre_signal","")
    cd = acad_d.get("citation_density",0)
    if fi>0.8:
        R.append(Rule("prompt_rule","formal_academic",
            "Безличный академический регистр: «следует отметить», «представляется»",
            f"formality={fi}","soft",fi))
        R.append(Rule("limit","no_first_person_academic",
            "Избегать «я думаю» в академических разделах; допустимо «на наш взгляд»",
            f"formality={fi}","soft",fi))
    elif fi<0.4 and fi>0:
        R.append(Rule("prompt_rule","essayistic_personal",
            "Эссеистический регистр: личное мнение в первом лице уместно",
            f"formality={fi}","soft",fi))
    if "смешанный" in gs:
        R.append(Rule("check","genre_consistency",
            "Не смешивать безличный реферативный и личный эссеистический регистры без маркировки",
            f"genre={gs}","soft",0))
    if cd>0 and cd<0.5:
        R.append(Rule("limit","source_required",
            "Любое заимствование идеи — со ссылкой на источник (ВШЭ-норма)",
            f"citation_density={cd}/1k","hard",cd))

    # Manual
    if manual_limits:
        for i,lim in enumerate(manual_limits):
            R.append(Rule("limit",f"manual_{i}",lim,"ручной анализ","hard",0))
    if manual_checks:
        for i,chk in enumerate(manual_checks):
            R.append(Rule("check",f"manual_chk_{i}",chk,"ручной анализ","soft",0))
    return R

# ═══════════════════════════════════════════════════════════════════
# РЕНДЕР ФАЙЛОВ
# ═══════════════════════════════════════════════════════════════════

def render_stylometry(author, handle, stats, ttr_d, pos_d, nom_d,
                      key_d, ep_d, syn_d, inc_d, neg_d, dyn_d,
                      cs_d, lnk_d, rhy_d, acad_d):
    L = [f"# Стилеметрия: {author}", "",
         f"Корпус: {stats['posts']} постов · {stats['tokens_ru']:,} токенов · "
         f"{stats['types_ru']:,} типов · период {stats['date_range'][0]}–{stats['date_range'][1]}",
         "", "## Сводная таблица", "",
         "| Метрика | Значение |", "|---|---|",
         f"| MSTTR (500) | **{ttr_d.get('msttr_500','?')}** |",
         f"| Verb/Noun | **{pos_d.get('verb_noun_ratio','?')}** |",
         f"| Adj/Noun | {pos_d.get('adj_noun_ratio','?')} |",
         f"| Номинализация % | {pos_d.get('nominalization_pct','?')}% |",
         f"| Hedge/Assert | **{ep_d.get('hedge_assert_ratio','?')}** |",
         f"| Гипотаксис/паратаксис | **{syn_d.get('hypo_para_ratio','?')}** → {syn_d.get('style_signal','')} |",
         f"| «не» / 1000 слов | {neg_d.get('ne_per_1k','?')} |",
         f"| Постов со ссылкой | {lnk_d.get('pct_with_link','?')}% |",
         f"| Rhythm | {rhy_d.get('rhythm_type','?')} (CV={rhy_d.get('weekday_cv','?')}) |",
         f"| Formality index | {acad_d.get('formality_index','?')} → {acad_d.get('genre_signal','?')} |",
         "", "## Кейнесс — перепредставленные слова", "",
         "| Слово | ipm | НКРЯ | G² |", "|---|---|---|---|"]
    for r in key_d.get("overrepresented",[])[:12]:
        if r["ll"]>200:
            L.append(f"| {r['word']} | {r['corp_ipm']} | {r['ref_ipm']} | {r['ll']} |")
    L += ["", "**Недопредставлены:** " +
          ", ".join(r["word"] for r in key_d.get("underrepresented",[])[:6]), ""]
    L += ["## Эпистемическая модальность", ""]
    for cat, lbl in [("assertion","Уверенность"),("hedge","Хеджирование"),
                     ("ironic_cite","Ирония/архаика"),("evidential","Эвиденциальность"),
                     ("doubt","Сомнение")]:
        d = ep_d.get(cat,{})
        L.append(f"- **{lbl}**: n={d.get('n',0)}, {d.get('ipm',0)} ipm")
    L += [f"", f"Hedge/Assert: **{ep_d.get('hedge_assert_ratio','?')}**",
          "Топ маркеры: " + ", ".join(f"«{m}»({c})"
              for m,c in ep_d.get("top_markers",[])[:5]), ""]
    L += ["## Динамика по годам", "",
          "| Год | n | Ср.длина | % лич. | % раб. | % ссылки |",
          "|---|---|---|---|---|---|"]
    for yr, d in dyn_d.items():
        L.append(f"| {yr} | {d['n']} | {d['avg_len']} | "
                 f"{d['pct_personal']} | {d['pct_work']} | {d['pct_links']} |")
    return "\n".join(L)

def render_rules(author, rules):
    L = [f"# Поведенческие правила: {author}", "",
         "> Проверить вручную перед generate_passport().",
         "> (H) = hard, (S) = soft", ""]
    by_type = {"check":[],"limit":[],"prompt_rule":[],"vocab_rule":[]}
    for r in rules:
        by_type[r.type].append(r)
    labels = {"check":"## Проверки","limit":"## Лимиты",
              "prompt_rule":"## Правила промпта","vocab_rule":"## Лексика"}
    for rt, hd in labels.items():
        if not by_type[rt]: continue
        L += [hd, ""]
        for r in by_type[rt]:
            s = "(H)" if r.strength=="hard" else "(S)"
            L += [f"- **{r.id}** {s}", f"  {r.label}",
                  f"  *← {r.source}*", ""]
    return "\n".join(L)

def render_dh_section(author, key_d, pos_d, ep_d, syn_d, acad_d):
    L = [f"## DH-измерения: {author}", "",
         "### 1. Кейнесс", "",
         "| Слово | ipm | НКРЯ | G² |", "|---|---|---|---|"]
    for r in key_d.get("overrepresented",[])[:8]:
        if r["ll"]>300:
            L.append(f"| {r['word']} | {r['corp_ipm']} | {r['ref_ipm']} | {r['ll']} |")
    L += ["", "**Недопредставлены:** " +
          ", ".join(r["word"] for r in key_d.get("underrepresented",[])[:5]), "",
          "### 2. POS-профиль", "",
          f"V/N={pos_d.get('verb_noun_ratio')} · A/N={pos_d.get('adj_noun_ratio')} · "
          f"Nom={pos_d.get('nominalization_pct')}% · "
          f"Глаголы {pos_d.get('pct_verbs')}% · Прилаг. {pos_d.get('pct_adjectives')}%",
          "", "### 3. Эпистемическая модальность", ""]
    for cat, lbl in [("assertion","Уверенность"),("hedge","Хеджирование"),
                     ("ironic_cite","Ирония"),("evidential","Эвиденциальность")]:
        d = ep_d.get(cat,{})
        L.append(f"- {lbl}: n={d.get('n',0)} ({d.get('ipm',0)} ipm)")
    L += [f"Hedge/Assert: **{ep_d.get('hedge_assert_ratio')}**", "",
          "### 4. Синтаксис", "",
          f"Гипо/пара: **{syn_d.get('hypo_para_ratio')}** → *{syn_d.get('style_signal')}*  ",
          f"Запятых/предл.: {syn_d.get('commas_per_sent')} · "
          f"Ср. клауза: {syn_d.get('avg_clause_words')} сл.", "",
          "### 5. Академический базелайн (ВШЭ-норма)", "",
          f"Formality index: **{acad_d.get('formality_index')}** → *{acad_d.get('genre_signal')}*  ",
          f"Академические маркеры: {acad_d.get('academic_density')}/1k · "
          f"Эссеистические: {acad_d.get('essay_density')}/1k · "
          f"Цитатные: {acad_d.get('citation_density')}/1k"]
    return "\n".join(L)

def generate_passport(handle, author, level, thematic_top, can_reply_to,
                      rules, key_d, rewrite_allowed=False):
    def cluster(topics):
        m = {"санскрит":"ling_sanskrit","лингвистика":"ling_general",
             "перевод":"ling_translation","берестяные":"ling_slavic",
             "поэзия":"lit_poetry","история":"hist_general"}
        for t in topics:
            for kw,cl in m.items():
                if kw in t.lower(): return cl
        return "ling_general"
    def role(rules, key_d):
        ids = {r.id for r in rules}
        if "nominal_style_ok" in ids: return "terminological_annotator"
        if "question_opening" in ids: return "dialogic_moderator"
        if "ironic_register_consistency" in ids: return "ironic_commentator"
        return "narrative_commentator"
    def priority(key_d):
        top = key_d.get("overrepresented",[{}])[0].get("ll",0)
        return ("extreme" if top>2000 else "high" if top>800 else
                "medium" if top>300 else "low")
    checks = [r.id for r in rules if r.type=="check"]
    hard_L = [r.label for r in rules if r.type=="limit" and r.strength=="hard"]
    soft_L = [r.label for r in rules if r.type=="limit" and r.strength=="soft"]
    pr     = [r.label for r in rules if r.type=="prompt_rule"]
    voc    = {r.id:r.label for r in rules if r.type=="vocab_rule"}
    passport = {
        "id": handle, "name": author, "level": level,
        "cluster": cluster(thematic_top),
        "source_prompt":    f"ClaudeStyles/{handle}_style.md",
        "source_rules":     f"ClaudeStyles/{handle}_rules.md",
        "source_stylometry":f"ClaudeStyles/{handle}_stylometry.md",
        "role": role(rules, key_d), "language": "ru",
        "best_for": thematic_top,
        "checks": checks,
        "limits": {"hard": hard_L, "soft": soft_L},
        "prompt_rules": pr,
        "review_mode": {"rewrite_allowed": rewrite_allowed,
                        "requires_span_ids": True,
                        "output_format": "findings_json"},
        "council": {"can_reply_to": can_reply_to,
                    "conflict_priority": {"default": priority(key_d)}},
    }
    if voc: passport["vocab"] = voc
    return yaml.dump(passport, allow_unicode=True,
                     default_flow_style=False, sort_keys=False)

# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════
# КОНФИГУРАЦИЯ — настраивать для каждой пары (автор, жанр)
#
# КЛЮЧЕВОЕ ОТКРЫТИЕ: один автор → несколько стилевых профилей.
# Зализняк имеет 8 субстилей по жанрам. Handle = [автор]-[жанр].
#
# Конвенция имён в RuWritingStyles:
#   ClaudeStyles/[автор]-[жанр]-style.md    ← дескриптивный портрет
#   styles/passports/[автор].yml            ← паспорт (один на автора)
#
# Примеры реальных handle из репозитория:
#   zalizniak-ocherk       Зализняк, жанр «грамматический очерк»
#   zalizniak-enklitiki    Зализняк, жанр «реконструкция механизма»
#   zalizniak-udarenie     Зализняк, жанр «историческая акцентология»
#   zalizniak-shkolnikov_1 Зализняк, жанр «объяснение неспециалистам»
#   zaliznyak-novgorod     Зализняк, жанр «анализ берестяных грамот»
#   zalizniak-imennoe      Зализняк, жанр «формальное словоизменение»
#   zalizniak-slovo        Зализняк, жанр «разбор подлинности памятника»
#   zalizniak-zametki      Зализняк, жанр «полемика с любит. лингвистикой»
#   albedil-sbornik        Albedil, жанр «востоковедный юбилейный сборник»
#   kazanskiy-korpus       Казанский, жанр «филологический комментарий»
#   lidova-commentary      Лидова, жанр «история комментария/канона»
#   tronsky-readings       Tronsky-Readings, жанр «классич. филология»
#   melchuk                Мельчук, системный грамматический рецензент
#   gasuns_telegram        Гасунс, Telegram-канал 2022–2026
#
# КАК ЗАПУСКАТЬ ДЛЯ НОВОГО (АВТОР, ЖАНР):
#   1. Собрать корпус только текстов этого жанра (не смешивать!)
#   2. Задать handle = «автор-жанр» (напр. zalizniak-ocherk)
#   3. Заполнить GENRE_CONFIG ниже
#   4. Запустить пайплайн
#   5. Вручную написать поле main_intonation (главная интонация)
#
# ГЛАВНАЯ ИНТОНАЦИЯ (main_intonation) — прескриптивная цель:
#   Это то, ЧТО должен воспроизводить агент, а не то, что измерено.
#   Примеры из репозитория:
#     «Системная точность и спокойная научная уверенность» (Зализняк-очерк)
#     «Понятная научная полемика с точной иронией» (Зализняк-заметки)
#     «Историко-грамматическая доказательность, умеренная полемика» (энклитики)
#     «Ясность, уважение к читателю, доступность без упрощения» (школьникам)
#     «Научная предметность с тёплой интонацией дара» (Albedil-сборник)
# ══════════════════════════════════════════════════════════════════════

DEFAULT_CONFIG = {
    # ── Идентификация жанра ─────────────────────────────────────────────
    # Обязательно для каждой новой пары (автор, жанр)!
    'genre': 'telegram_channel',   # тип жанра (см. GENRE_TYPES ниже)
    'main_intonation': '',         # заполнить вручную после анализа

    # ── Ключевые слова для разбивки постов на личные/рабочие ────────────
    'personal_kw': [
        'бабушк', 'жена', 'дети', 'огород', 'рассада', 'переезд',
        'иглоукалывани', 'тому назад', 'вырос', 'краснодар', 'обнинск',
    ],
    'work_kw': [
        'занятие', 'курс', 'группа', 'санскрит', 'деванагари', 'зализняк',
        'конференц', 'вебинар', 'набор', 'ревнители', 'регистрац',
    ],

    # ── Топ-5 тем для паспорта (из тематического атласа) ────────────────
    'thematic_top': [
        'санскрит и обучение',
        'индия и культура',
        'лингвистика и корпуса',
        'берестяные грамоты',
        'каллиграфия деванагари',
    ],

    # ── Домены экспертизы для AI Council ────────────────────────────────
    'can_reply_to': [
        'sanskrit_terminology',
        'slavic_linguistics',
        'multilingual_register',
    ],

    # ── Ручные правила из _style.md (раздел «Что исключать») ────────────
    'manual_limits': [
        'Не использовать инфлюенсерскую оценочную лексику (крутой, шикарный)',
        'Не призывать к подписке, лайкам, репостам',
        'Военную и политическую тему обходить стороной',
    ],
    'manual_checks': [
        'Проверить: санскритские термины без перевода (если контекст позволяет)',
        'Проверить: конкретная деталь вместо общего утверждения',
    ],

    # ── Параметры анализа ────────────────────────────────────────────────
    'level': 'public',
    'l2_pattern': r'[āēīūžčšģķļņŗ]',  # латышский (Гасунс)
}

# ── ТИПОЛОГИЯ ЖАНРОВ (genre field) ──────────────────────────────────────────
# Определяет ожидаемый academic_baseline и формирует дополнительные checks
GENRE_TYPES = {
    # Научные жанры
    'ocherk':        'грамматический очерк (определение → правило → пример → итог)',
    'statya':        'академическая статья',
    'monografiya':   'монография / глава',
    'kommentariy':   'филологический комментарий к источнику',
    'recenziya':     'рецензия',
    'sbornik':       'юбилейный / тематический сборник',
    'readings':      'доклад на конференции / чтения',
    'rekonstrukciya':'реконструкция скрытого механизма по корпусу',
    'polemika':      'научная полемика / критика',
    'populyarno':    'популяризация для неспециалистов',
    # Личные жанры
    'telegram_channel': 'личный Telegram-канал',
    'blog':          'публичный блог',
    'memoir':        'мемуары / воспоминания',
    'pismo':         'письма / переписка',
    # Промежуточные
    'esse':          'эссе',
    'zametki':       'заметки / записки (смешанный жанр)',
    'lektsiya':      'публичная лекция (транскрипт)',
}


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    mode   = sys.argv[1]
    path   = sys.argv[2]
    handle = sys.argv[3]
    author = ' '.join(sys.argv[4:]) if len(sys.argv) > 4 else handle
    cfg    = DEFAULT_CONFIG

    print(f'[1/5] Загрузка ({mode}: {path})…')
    texts = load(mode, path)
    if not texts:
        print(f'\u274c Корпус пуст: {path}')
        sys.exit(1)
    if len(texts) < 30:
        print(f'\u26a0\ufe0f  Мало текстов: {len(texts)} — надёжные метрики от 100')
    stats = corpus_stats(texts)
    print(f'      {stats["posts"]} постов · {stats["tokens_ru"]:,} токенов')
    if stats['posts'] < 30:
        print('      ⚠️  Мало текстов. Рекомендуется 200+ для надёжных измерений.')

    print('[2/5] Измерения…')
    ttr_d  = ttr(texts)
    pos_d  = pos_profile(texts)
    nom_d  = nominalization(texts)
    key_d  = keyness(texts)
    ep_d   = epistemic_modality(texts)
    syn_d  = syntactic_depth(texts)
    inc_d  = incipit_explicit(texts)
    neg_d  = negation(texts)
    dyn_d  = style_dynamics(texts, cfg['personal_kw'], cfg['work_kw'])
    cs_d   = codeswitching(texts, cfg['l2_pattern'])
    lnk_d  = link_density(texts)
    rhy_d  = posting_rhythm(texts)
    acad_d = academic_baseline(texts)

    print('[3/5] Трансляция → правила…')
    rules = translate(
        ttr_d, pos_d, key_d, ep_d, syn_d, inc_d,
        neg_d, cs_d, lnk_d, rhy_d, acad_d,
        cfg['manual_limits'], cfg['manual_checks'])
    n_hard = sum(1 for r in rules if r.strength == 'hard')
    n_soft = sum(1 for r in rules if r.strength == 'soft')
    print(f'      {len(rules)} правил ({n_hard} hard, {n_soft} soft)')

    print('[4/5] Генерация файлов…')
    sty = render_stylometry(author, handle, stats, ttr_d, pos_d, nom_d,
                            key_d, ep_d, syn_d, inc_d, neg_d, dyn_d,
                            cs_d, lnk_d, rhy_d, acad_d)
    rl  = render_rules(author, rules)
    dh  = render_dh_section(author, key_d, pos_d, ep_d, syn_d, acad_d)
    passport = generate_passport(
        handle, author, cfg['level'],
        cfg['thematic_top'], cfg['can_reply_to'], rules, key_d)

    # Вставить main_intonation в паспорт если задана
    if cfg.get('main_intonation'):
        passport = passport.replace(
            f'id: {handle}\n',
            f'id: {handle}\nmain_intonation: "{cfg["main_intonation"]}"\n')

    fns = {
        '_stylometry.md': sty,
        '_rules.md': rl,
        '_dh_section.md': dh,
        '.yml': passport,
    }
    for suffix, content in fns.items():
        fp = f'{OUT}/{handle}{suffix}'
        open(fp, 'w', encoding='utf-8').write(content)
        if suffix == '.yml':
            yaml.safe_load(content)

    print(f'[5/5] Готово → {OUT}/')
    for suffix in fns:
        fp = f'{OUT}/{handle}{suffix}'
        tag = ' ← ПРОВЕРИТЬ ВРУЧНУЮ' if suffix == '_rules.md' else ''
        print(f'      {handle}{suffix:<32} {os.path.getsize(fp):>6,} байт{tag}')

    # Быстрый отчёт
    genre = cfg.get('genre', '?')
    intonation = cfg.get('main_intonation', '(заполнить вручную)')
    print(f'\n── ОТЧЁТ [{handle}] ────────────────────────────────────')
    print(f'  Жанр:        {genre}')
    print(f'  Интонация:   {intonation}')
    print(f'  MSTTR {ttr_d.get("msttr_500")}  '
          f'V/N {pos_d.get("verb_noun_ratio")}  '
          f'H/A {ep_d.get("hedge_assert_ratio")}  '
          f'hypo/para {syn_d.get("hypo_para_ratio")}')
    print(f'  Формальность {acad_d.get("formality_index")} '
          f'→ {acad_d.get("genre_signal")}')
    top3 = [(r['word'], r['ll']) for r in key_d.get('overrepresented', [])[:3]]
    print(f'  Keyness топ-3: {top3}')
    top_ep = ep_d.get('top_markers', [])[:3]
    print(f'  Эпист. топ:   {[(m, c) for m, c in top_ep]}')
    if rhy_d.get('rhythm_type'):
        print(f'  Ритм: {rhy_d["rhythm_type"]} '
              f'(CV={rhy_d.get("weekday_cv")}, bursts={rhy_d.get("bursts_10min")})')
    print()
    print('  Следующие шаги:')
    print(f'  1. Открыть out/{handle}_rules.md — проверить правила вручную')
    print(f'  2. Задать main_intonation в DEFAULT_CONFIG (главная интонация жанра)')
    print(f'  3. Уточнить EPISTEMIC["ironic_cite"] под специфику автора')
    print(f'  4. Разместить out/{handle}.yml → styles/passports/')
    print(f'  5. Написать ClaudeStyles/{handle}-style.md (качественная часть)')
    print()
    print('  Проверка требований журнала (если академическая статья):')
    print('    journal_check(texts, journal="spbu_psychology", article_type="empirical",')
    print('                  abstract_text="...", keywords=[...], source_count=N)')
    print('    Доступные журналы:', list(JOURNAL_PROFILES.keys()))

if __name__ == '__main__':
    main()
