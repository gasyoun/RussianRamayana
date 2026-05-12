# RuWritingStyles: DH-модуль — Инструкция для Codex

**Проект:** [github.com/gasyoun/RuWritingStyles](https://github.com/gasyoun/RuWritingStyles)  
**Версия инструкции:** 1.0, май 2026  
**Назначение:** полная методология создания стилистического портрета русскоязычного автора на материале Telegram-экспорта (расширяется на другие форматы).

---

## Архитектура проекта

```
RuWritingStyles/
├── README.md
├── rws_pipeline.py           # единый скрипт: шаги 0–12 + трансляция + паспорт
├── rnc_integration.py        # модуль связи с НКРЯ API
├── ref_data/
│   ├── freq_rnc_lemmas.tsv   # Ляшевская–Шаров 2009
│   ├── freq_rnc_paper.tsv    # подкорпус публицистики НКРЯ
│   ├── freq_rnc_blogs.tsv    # подкорпус блогов НКРЯ
│   └── epistemic_markers_ru.json
├── ClaudeStyles/
│   ├── [автор]-[жанр]-style.md    # дескриптивный портрет (частично вручную)
│   ├── [автор]-[жанр]_stylometry.md  # числовые данные (авто)
│   ├── [автор]-[жанр]_rules.md       # правила (авто → проверить вручную)
│   └── [автор]-[жанр]_dh_section.md  # DH-раздел для вставки в style.md
└── styles/
    └── passports/
        └── [автор].yml               # паспорт агента (один на автора)
```

**Ключевое устройство репозитория:**

Один автор может иметь **несколько стилевых профилей по жанрам**. Зализняк представлен 8 субстилями:

| Handle | Жанр | Главная интонация |
|---|---|---|
| `zalizniak-ocherk` | Грамматический очерк | Системная точность, научная уверенность |
| `zalizniak-enklitiki` | Реконструкция механизма | Историко-грамматическая доказательность |
| `zalizniak-udarenie` | Историческая акцентология | Словарная осторожность |
| `zalizniak-shkolnikov_1` | Объяснение неспециалистам | Ясность без упрощения |
| `zaliznyak-novgorod` | Берестяные грамоты | Техническая точность работы с источником |
| `zalizniak-imennoe` | Формальное словоизменение | Сухая алгоритмическая ясность |
| `zalizniak-slovo` | Разбор подлинности памятника | Судебно-филологическая проверка |
| `zalizniak-zametki` | Полемика с любит. лингвистикой | Научная полемика с точной иронией |

Остальные авторы в репозитории:

| Handle | Автор | Жанр | Главная интонация |
|---|---|---|---|
| `albedil-sbornik` | Albedil | Востоковедный юбилейный сборник | Научная предметность с тёплой интонацией |
| `kazanskiy-korpus` | Казанский | Филологический комментарий | Академическая осторожность |
| `lidova-commentary` | Лидова | История комментария/канона | Историко-филологическая аргументация |
| `tronsky-readings` | Tronsky-Readings | Классическая филология | Плотная источниковедческая работа |
| `melchuk` | И. А. Мельчук | Системный грамматический рецензент | Формальная строгость МТТ |
| `gasuns_telegram` | М. Ю. Гасунс | Личный Telegram-канал | Живой санскритологический дневник |

**Конвенция именования:**
- `ClaudeStyles/[автор]-[жанр]-style.md` — один файл на пару (автор, жанр)
- `styles/passports/[автор].yml` — один паспорт на автора (суммирует все жанры)

Пайплайн трёхступенчатый:

```
Корпус (жанрово однородный!)
  │
  ├─ rws_pipeline.py: 13 измерений
  │
  ├─ translate(): измерения → BehavioralRule
  │              (check | limit | prompt_rule | vocab_rule)
  │
  └─ render: _stylometry.md + _rules.md* + _dh_section.md + .yml
                                     *ПРОВЕРИТЬ ВРУЧНУЮ
```

**Ключевой принцип:** корпус должен быть **жанрово однородным**. Зализняк-очерк и Зализняк-заметки — разные корпусы, разные пайплайны, разные файлы.

---

## Типы выходных файлов

Для каждой пары (автор, жанр) создаются ЧЕТЫРЕ автоматических файла:

**`[автор]-[жанр]_stylometry.md`** — числа, таблицы, бенчмарки. Для межавторского сравнения.

**`[автор]-[жанр]_rules.md`** — поведенческие правила, выведенные из измерений. Обязательна ручная проверка перед следующим шагом.

**`[автор]-[жанр]_dh_section.md`** — DH-раздел для вставки в _style.md.

**`styles/passports/[автор].yml`** — машиночитаемый паспорт агента.

И один ручной файл:

**`ClaudeStyles/[автор]-[жанр]-style.md`** — полный дескриптивный портрет. Пишется вручную с использованием DH-раздела. Содержит обязательное поле `main_intonation` — **главную интонацию жанра** (прескриптивная цель, не описание).

---

## Полный пайплайн: пошаговая инструкция для Codex

### Шаг 0. Получить и проверить данные

```python
import json, re, math
from collections import Counter, defaultdict
from datetime import datetime

def load_tg(path: str) -> list[dict]:
    """
    Загрузить Telegram JSON-экспорт.
    Возвращает list[dict] с полями 'date' и 'text'.
    Фильтрует: только type=message, len > 20 символов.
    """
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    out = []
    for m in data.get('messages', []):
        if m.get('type') != 'message':
            continue
        t = m.get('text', '')
        if isinstance(t, list):
            t = ''.join(p if isinstance(p, str) else p.get('text','') for p in t)
        t = t.strip()
        if len(t) > 20:
            out.append({'date': m.get('date',''), 'text': t})
    return out

def corpus_stats(texts: list[dict]) -> dict:
    """Базовая статистика корпуса."""
    tokens = re.findall(r'[а-яёА-ЯЁ]{3,}',
                        ' '.join(d['text'] for d in texts).lower())
    return {
        'posts': len(texts),
        'tokens_ru': len(tokens),
        'types_ru': len(set(tokens)),
        'date_range': (texts[0]['date'][:7], texts[-1]['date'][:7]),
    }
```

**Адаптация для других форматов:**
- txt-файл: `[{'date': '', 'text': line} for line in open(path)]`
- CSV: `pd.read_csv(path).rename(columns={'content':'text','timestamp':'date'}).to_dict('records')`
- VK JSON: аналогично TG, поле `text` в `items`

---

### Шаг 1. Лексическое богатство (TTR / MSTTR)

```python
def ttr(texts: list[dict], window: int = 500) -> dict:
    tokens = re.findall(r'[а-яёА-ЯЁ]{2,}',
                        ' '.join(d['text'] for d in texts).lower())
    full_ttr = len(set(tokens)) / len(tokens) if tokens else 0
    windows = [tokens[i:i+window] for i in range(0, len(tokens)-window, window)]
    msttr = sum(len(set(w))/window for w in windows)/len(windows) if windows else 0
    return {
        'tokens': len(tokens),
        'types': len(set(tokens)),
        'ttr': round(full_ttr, 4),
        'msttr_500': round(msttr, 4),
    }
```

**Пороги интерпретации:**
- MSTTR < 0,65 → бедная лексика, шаблонный/анонсный канал
- 0,65–0,75 → средняя
- > 0,75 → богатая (авторский, интеллектуальный канал)
- > 0,80 → уровень художественной прозы

---

### Шаг 2. POS-профиль (сигнатурный вектор)

```python
def pos_ru(w: str) -> str:
    """
    Rule-based POS для русского. Точность ~70%.
    Для точного анализа: pip install pymorphy3
    и заменить на MorphAnalyzer().parse(w)[0].tag.POS
    """
    if re.search(r'(аю|яю|ую|ею|аешь|яешь|уешь|ишь|ит(?:ся)?|им|'
                 r'ают|яют|уют|ат(?:ся)?|ят(?:ся)?|'
                 r'ил(?:ся)?|ила(?:сь)?|или(?:сь)?)$', w):
        return 'V'
    if re.search(r'(ть|ться|чь|чься)$', w) and len(w) > 3:
        return 'V'
    if re.search(r'((?:н|ск|ов|ев|ив|чив|лив|ист)'
                 r'(?:ый|ая|ое|ые|ого|ой|ому|ым|ых|ими))$', w):
        return 'A'
    if re.search(r'(льно|ально|ично|ачно|ожно|ашно|ски|цки)$', w):
        return 'Adv'
    if re.search(r'(ость|ство|ние|ение|ание|тие|ция|изм|ент|'
                 r'тор|тель|щик|чик|ник)$', w):
        return 'Nnom'
    return 'N'

def pos_profile(texts: list[dict]) -> dict:
    tokens = re.findall(r'[а-яёА-ЯЁ]{3,}',
                        ' '.join(d['text'] for d in texts).lower())
    counts = Counter(pos_ru(w) for w in tokens)
    content = sum(counts[k] for k in ['V','A','Adv','N','Nnom'])
    return {
        'verbs': counts['V'],
        'nouns': counts['N'],
        'deverbal_nouns': counts['Nnom'],
        'adjectives': counts['A'],
        'adverbs': counts['Adv'],
        'total_content': content,
        'verb_noun_ratio': round(counts['V']/max(counts['N'],1), 3),
        'adj_noun_ratio': round(counts['A']/max(counts['N'],1), 3),
        'nominalization_pct': round(100*counts['Nnom']/max(content,1), 1),
        'pct_verbs': round(100*counts['V']/max(content,1), 1),
        'pct_adjectives': round(100*counts['A']/max(content,1), 1),
    }
```

**Пороги интерпретации:**
- verb/noun > 0,25 → глагольный, разговорный стиль
- verb/noun 0,15–0,25 → смешанный
- verb/noun < 0,15 → именной стиль (термины, имена собственные)
- adj/noun > 0,20 → описательный (беллетристика, рецензии)
- adj/noun < 0,10 → конкретный, не описательный
- nominalization % > 8 → академический/бюрократический

---

### Шаг 3. Номинализация

```python
def nominalization(texts: list[dict]) -> dict:
    corpus = ' '.join(d['text'] for d in texts).lower()
    deverbal = re.findall(
        r'\b\w+(?:ние|ение|ание|тие|ость|ство|ция|циях|ций)\b', corpus)
    verbs = re.findall(
        r'\b\w+(?:аю|яю|ую|ею|аешь|яешь|ает|яет|ают|яют|'
        r'ишь|ит\b|ил\b|ила\b|или\b|ать\b|ять\b|еть\b|ить\b)\b', corpus)
    ratio = len(deverbal) / max(len(verbs), 1)
    return {
        'deverbal': len(deverbal),
        'verbs': len(verbs),
        'ratio': round(ratio, 3),
        'top_deverbal': Counter(deverbal).most_common(10),
    }
```

**Пороги:** < 0,4 разговорный / 0,4–0,6 смешанный / > 0,8 академический

---

### Шаг 4. Кейнесс (Keyness)

```python
# Загрузить из ref_data/freq_rnc_paper.tsv (для публицистов)
# или freq_rnc_blogs.tsv (для блогеров)
# Формат TSV: lemma \t ipm

def load_ref_freq(path: str) -> dict:
    ref = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 2:
                try: ref[parts[0]] = float(parts[1])
                except: pass
    return ref

# Встроенный минимальный словарь (fallback если нет файла):
REF_IPM_DEFAULT = {
    'год': 3200, 'человек': 2800, 'время': 2400, 'дело': 1800,
    'жизнь': 1700, 'день': 1600, 'рука': 1200, 'работа': 1100,
    'слово': 1000, 'место': 950, 'язык': 680, 'народ': 550,
    'мир': 510, 'история': 690, 'страна': 880, 'любовь': 470,
    'текст': 290, 'автор': 285, 'наука': 380, 'перевод': 140,
    'занятие': 180, 'курс': 160, 'студент': 150, 'учитель': 130,
}
REF_DEFAULT = 20   # ipm для неизвестных слов
REF_TOTAL = 1_000_000

STOPWORDS = {
    'это','что','как','так','все','при','они','его','она','нас','нам',
    'вас','вам','нет','уже','ещё','еще','был','была','были','есть',
    'для','про','без','над','тут','там','вот','даже','хотя','тоже',
    'лишь','ведь','мне','меня','себя','себе','тебя','тебе','него','них',
}

def keyness(texts: list[dict],
            ref_ipm: dict = None,
            top_n: int = 25,
            min_count: int = 5) -> dict:
    if ref_ipm is None:
        ref_ipm = REF_IPM_DEFAULT
    tokens = re.findall(r'[а-яёА-ЯЁ]{3,}',
                        ' '.join(d['text'] for d in texts).lower())
    freq = Counter(tokens)
    total = len(tokens)
    results = []
    for word, cnt in freq.items():
        if cnt < min_count or word in STOPWORDS:
            continue
        ref = ref_ipm.get(word, REF_DEFAULT)
        corp_ipm = (cnt / total) * 1_000_000
        O1, O2 = cnt, int(ref * REF_TOTAL / 1_000_000)
        E1 = total * (O1+O2) / (total + REF_TOTAL)
        E2 = REF_TOTAL * (O1+O2) / (total + REF_TOTAL)
        if E1 > 0 and E2 > 0 and O1 > 0 and O2 > 0:
            ll = 2*(O1*math.log(O1/E1) + O2*math.log(O2/E2))
            sign = '+' if corp_ipm > ref else '-'
            results.append({
                'word': word, 'll': round(ll,1), 'sign': sign,
                'corp_ipm': round(corp_ipm), 'ref_ipm': ref, 'n': cnt,
            })
    results.sort(key=lambda x: -x['ll'])
    return {
        'overrepresented': [r for r in results if r['sign']=='+'][:top_n],
        'underrepresented': [r for r in results if r['sign']=='-'][:15],
        'total_tokens': total,
    }
```

**Важно для нового автора:** добавить специализированную лексику автора в `ref_ipm` с реалистичным ipm:
- Узкоспециальный термин (санскрит, тохарский) → 2–10 ipm
- Дисциплинарный термин (грамматика, корпус) → 50–100 ipm
- Общеакадемический (анализ, исследование) → 200–300 ipm

---

### Шаг 5. Эпистемическая модальность

```python
# Основа: Апресян Ю.Д. «Интегральное описание языка», 1995
# Шмелёв А.Д. «Русская языковая модель мира», 2002
# Падучева Е.В. «Высказывание и его соотнесённость с действительностью»

EPISTEMIC_MARKERS = {
    'assertion': [
        'конечно','несомненно','безусловно','очевидно','разумеется',
        'действительно','именно','точно','определённо','определенно','бесспорно',
    ],
    'hedge': [
        'вероятно','пожалуй','видимо','похоже','кажется','наверное','наверняка',
        'по-видимому','скорее всего','должно быть','может быть','возможно',
    ],
    'doubt': [
        'не уверен','не знаю','сомневаюсь','непонятно','неясно','трудно сказать',
    ],
    'evidential': [
        'по словам','как сообщает','согласно','судя по','как известно',
        'как пишет','как отмечает','якобы','говорят',
    ],
    'ironic_cite': [
        # Расширять индивидуально для каждого автора!
        'ибо сказано','как сказано','по преданию','ибо','сиречь','глаголет',
    ],
}
# Примечание: 'ironic_cite' — авторская категория, в стандартных словарях
# хеджирования не фигурирует. Для каждого нового автора проверить,
# есть ли псевдоцитатная ирония и каковы её маркеры.

def epistemic_modality(texts: list[dict],
                       markers: dict = None) -> dict:
    if markers is None:
        markers = EPISTEMIC_MARKERS
    full = ' '.join(d['text'] for d in texts).lower()
    tokens = re.findall(r'[а-яёА-ЯЁ]{3,}', full)
    total = len(tokens)
    result = {}
    for cat, mlist in markers.items():
        cnt = sum(full.count(m) for m in mlist)
        result[cat] = {'n': cnt, 'ipm': round(1_000_000*cnt/max(total,1))}
    hedge_n = result.get('hedge',{}).get('n',0)
    assert_n = result.get('assertion',{}).get('n',0)
    result['hedge_assert_ratio'] = round(hedge_n/max(assert_n,1), 2)
    all_markers = [(m, full.count(m))
                   for cat_m in markers.values() for m in cat_m]
    result['top_markers'] = sorted(
        [(m,c) for m,c in all_markers if c>0], key=lambda x:-x[1])[:10]
    return result
```

**Пороги:**
- hedge/assert > 1,3 → уклончивый, высокое хеджирование
- hedge/assert 0,7–1,3 → паритет
- hedge/assert < 0,7 → ассертивный, авторитетный тон
- ironic_cite ipm > 1000 → ирония через архаику как стилевая черта

---

### Шаг 6. Синтаксическая глубина

```python
def syntactic_depth_proxy(texts: list[dict]) -> dict:
    """
    Прокси-метрики без парсера.
    Для точного analysis: UDPipe + ru_syntagrus модель
    https://lindat.mff.cuni.cz/repository/xmlui/handle/11234/1-3131
    """
    full = ' '.join(d['text'] for d in texts)
    sentences = [s for s in re.split(r'[.!?]', full) if len(s.strip()) > 20]
    n = max(len(sentences), 1)

    hypotaxis = len(re.findall(
        r'\b(который|которая|которые|которого|которому|'
        r'потому\s+что|так\s+как|хотя|несмотря|чтобы|если|когда|'
        r'пока|после\s+того|перед\s+тем)\b', full.lower()))
    parataxis = len(re.findall(r'\b(и |а |но |да |либо )\b', full.lower()))
    commas = full.count(',')
    clauses = re.split(r'[.,;!?—]', full)
    clause_lens = [len(re.findall(r'[а-яёА-ЯЁ]{2,}', c))
                   for c in clauses if len(c.strip()) > 5]
    avg_clause = sum(clause_lens)/len(clause_lens) if clause_lens else 0

    hypo_rate = hypotaxis / n
    para_rate = parataxis / n
    ratio = round(hypo_rate / max(para_rate, 0.01), 3)

    return {
        'hypotaxis_per_sent': round(hypo_rate, 3),
        'parataxis_per_sent': round(para_rate, 3),
        'hypo_para_ratio': ratio,
        'commas_per_sent': round(commas/n, 2),
        'avg_clause_words': round(avg_clause, 1),
        'style_signal': (
            'академический/книжный' if ratio > 0.5 else
            'смешанный' if ratio > 0.3 else
            'координационный/разговорный'
        ),
    }

# UDPipe-версия (установить: pip install ufal.udpipe):
# def syntactic_depth_udpipe(texts, model_path='russian-syntagrus.udpipe'):
#     from ufal.udpipe import Model, Pipeline
#     model = Model.load(model_path)
#     pipeline = Pipeline(model, 'tokenize', Pipeline.DEFAULT,
#                         Pipeline.DEFAULT, 'conllu')
#     depths = []
#     for d in texts:
#         for line in pipeline.process(d['text']).split('\n'):
#             if line and not line.startswith('#') and '\t' in line:
#                 parts = line.split('\t')
#                 if len(parts) > 6 and parts[6].isdigit():
#                     depths.append(int(parts[6]))
#     return {'mean_dep_dist': round(sum(depths)/len(depths),2) if depths else 0}
```

**Пороги:**
- hypo/para > 0,5 → книжный, подчинительный синтаксис
- hypo/para 0,3–0,5 → смешанный
- hypo/para < 0,3 → разговорный, координационный

---

### Шаг 7. Базовые стилеметрические измерения

```python
def incipit_explicit(texts: list[dict], top_n: int = 20) -> dict:
    incipits, explicits = [], []
    for d in texts:
        t = re.sub(r'^[\U00010000-\U0010ffff\U00002600-\U000027FF\s]+',
                   '', d['text']).strip()
        first = re.match(r'^(\S+)', t)
        if first:
            incipits.append(first.group(1).rstrip('.,!?:;—').lower())
        clean = re.sub(r'https?://\S+', '', d['text']).strip()
        last = re.search(r'(\S+)\s*$', clean)
        if last:
            explicits.append(last.group(1).rstrip('.,!?:;—').lower())
    return {
        'top_incipits': Counter(incipits).most_common(top_n),
        'top_explicits': Counter(explicits).most_common(top_n),
        'date_openings': sum(1 for w in incipits if re.match(r'\d', w)),
        'question_openings': sum(1 for w in incipits
                                 if w in {'кто','что','как','почему','зачем',
                                          'когда','где','куда','откуда','неужели'}),
    }

def negation(texts: list[dict]) -> dict:
    full = ' '.join(d['text'] for d in texts)
    words = re.findall(r'[а-яёА-ЯЁ]{2,}', full.lower())
    ne = full.lower().count(' не ')
    rhet = [s.strip() for d in texts
            for s in re.split(r'[.!]', d['text'])
            if '?' in s and re.search(r'\bне\b', s, re.I) and 10 < len(s) < 150]
    return {
        'ne_total': ne,
        'ne_per_1k': round(1000*ne/max(len(words),1), 1),
        'nyet': full.lower().count('нет'),
        'nikto': len(re.findall(r'\bникто\b', full.lower())),
        'nikogda': len(re.findall(r'\bникогда\b', full.lower())),
        'rhetorical_q': len(rhet),
        'examples': rhet[:5],
    }

def style_dynamics(texts: list[dict],
                   personal_kw: list[str],
                   work_kw: list[str]) -> dict:
    by_year = defaultdict(list)
    for d in texts:
        by_year[d['date'][:4]].append(d['text'])
    result = {}
    for yr, posts in sorted(by_year.items()):
        result[yr] = {
            'n': len(posts),
            'avg_len': round(sum(len(t) for t in posts)/len(posts)),
            'pct_personal': round(
                100*sum(1 for t in posts
                        if any(k in t.lower() for k in personal_kw))/len(posts), 1),
            'pct_work': round(
                100*sum(1 for t in posts
                        if any(k in t.lower() for k in work_kw))/len(posts), 1),
            'pct_links': round(
                100*sum(1 for t in posts if 'http' in t)/len(posts), 1),
        }
    return result

def codeswitching(texts: list[dict],
                  l2_pattern: str = r'[āēīūžčšģķļņŗ]') -> dict:
    """
    l2_pattern: regex для второго языка автора.
    По умолчанию: латышский. Заменить для других авторов:
    - армянский: r'[\u0530-\u058F]'
    - грузинский: r'[\u10A0-\u10FF]'
    - иврит: r'[\u0590-\u05FF]'
    - арабский: r'[\u0600-\u06FF]'
    """
    l2 = re.compile(l2_pattern, re.I)
    dev = re.compile(r'[\u0900-\u097F]')
    lat = re.compile(r'\b[a-zA-Z]{3,}\b')
    positions = defaultdict(Counter)
    bracket_lat = 0
    for d in texts:
        lines = [l.strip() for l in d['text'].split('\n') if l.strip()]
        n = len(lines)
        for i, line in enumerate(lines):
            pos = 'incipit' if i==0 else ('explicit' if i==n-1 else 'medial')
            if dev.search(line): positions[pos]['devanagari'] += 1
            if l2.search(line): positions[pos]['l2'] += 1
        for b in re.findall(r'\(([^)]{3,60})\)', d['text']):
            if lat.search(b): bracket_lat += 1
    return {'positions': dict(positions), 'latin_in_brackets': bracket_lat}

def link_density(texts: list[dict]) -> dict:
    total = len(texts)
    with_link = sum(1 for d in texts if 'http' in d['text'])
    link_only = sum(1 for d in texts if 'http' in d['text'] and
                    len(re.sub(r'https?://\S+','',d['text']).strip()) < 30)
    domains = Counter()
    for d in texts:
        for url in re.findall(r'https?://([^/\s]+)', d['text']):
            domains[url] += 1
    return {
        'pct_with_link': round(100*with_link/total, 1),
        'pct_link_only': round(100*link_only/total, 1),
        'top_domains': domains.most_common(10),
    }

def posting_rhythm(texts: list[dict]) -> dict:
    hours, weekdays, stamps = [], [], []
    for d in texts:
        try:
            dt = datetime.fromisoformat(d['date'])
            hours.append(dt.hour)
            weekdays.append(dt.weekday())
            stamps.append(dt)
        except: pass
    stamps.sort()
    bursts = sum(1 for i in range(len(stamps)-1)
                 if (stamps[i+1]-stamps[i]).seconds < 600
                 and stamps[i+1].date() == stamps[i].date())
    day_c = Counter(weekdays)
    days_avg = sum(day_c.values())/7 if day_c else 1
    cv = round((max(day_c.values(),default=0) - min(day_c.values(),default=0))
               / days_avg, 3) if day_c else 0
    day_names = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
    return {
        'peak_hours': Counter(hours).most_common(3),
        'peak_day': day_names[Counter(weekdays).most_common(1)[0][0]] if weekdays else '?',
        'weekday_cv': cv,
        'bursts_10min': bursts,
        'rhythm_type': (
            'дневниковый' if cv < 0.15 else
            'слабое расписание' if cv < 0.3 else
            'редакционное расписание'
        ),
        'impulse_type': (
            'обдуманный' if bursts < 10 else
            'умеренно импульсный' if bursts < 30 else
            'импульсный'
        ),
    }
```

---

### Шаг 8. Интеграция с НКРЯ

```python
# ── НКРЯ REST API ─────────────────────────────────────────────────
# Документация: https://ruscorpora.ru/api/v1/docs
# Python-обёртка: pip install ruscorpora (kunansy/rnc)
# Локальный XML-дамп: github.com/kmike/ruscorpora-tools

def rnc_word_freq(word: str,
                  subcorpus: str = 'paper') -> dict:
    """
    Получить ipm слова в подкорпусе НКРЯ.
    subcorpus: 'main' | 'paper' | 'regional' | 'blogs'
    Использовать вместо встроенного REF_IPM_DEFAULT.

    Ручная альтернатива:
    1. ruscorpora.ru → Портрет подкорпуса → настроить жанр
    2. Скачать CSV частотного словаря подкорпуса
    3. Загрузить: ref = dict(pd.read_csv('freq_subcorp.csv')[['lemma','ipm']].values)
    """
    import urllib.request, json, urllib.parse
    url = (f"https://ruscorpora.ru/api/v1/freq?"
           f"word={urllib.parse.quote(word)}&corpus={subcorpus}")
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read())
            return {'ipm': data.get('ipm', REF_DEFAULT), 'n': data.get('count',0)}
    except:
        return {'ipm': REF_DEFAULT, 'n': 0}

def rnc_collocations(word: str,
                     subcorpus: str = 'paper',
                     metric: str = 'mi3',
                     n: int = 10) -> list[dict]:
    """
    Топ-N коллокатов слова из НКРЯ.
    metric: 'mi3' (редкие, специфичные) | 'tscore' (частотные)

    Применение в стилеметрии:
    1. Получить коллокаты ключевого слова из НКРЯ
    2. Получить его контекстное окружение в корпусе автора (±3 слова)
    3. Сравнить: что автор использует ИНАЧЕ, чем норма НКРЯ?
       -> это авторские коллокационные предпочтения
    """
    import urllib.request, json, urllib.parse
    url = (f"https://ruscorpora.ru/api/v1/collocations?"
           f"key={urllib.parse.quote(word)}&corpus={subcorpus}"
           f"&metric={metric}&limit={n}")
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return json.loads(r.read())
    except Exception as e:
        return [{'error': str(e), 'note': 'Проверить API на ruscorpora.ru'}]

def rnc_verify_construction(cql_query: str) -> dict:
    """
    CQL-запросы для верификации нестандартных конструкций.
    Запустить вручную на ruscorpora.ru/search или через rnc.MainCorpus()

    Примеры CQL для верификации нестандартного синтаксиса:
    - "N лет тому назад":
      [word="[0-9]+"] [lemma="год"] [word="тому"] [word="назад"]
    - "всеравно" слитно:
      [word="всеравно"]
    - "кто" + глагол мн.ч.:
      [lemma="кто"] []{0,5} [tag="V.*pl.*"]
    - Числительное + ед.ч. при числах 11-19:
      [word="1[1-9][0-9]*"] [tag="S.*sg.*"]
    """
    return {'cql': cql_query,
            'url': f'https://ruscorpora.ru/search?text={cql_query}&mode=main'}

def semantic_neighbors(word: str,
                       pos: str = 'NOUN',
                       model: str = 'ruscorpora_upos_cbow_300_10_2021',
                       n: int = 10) -> list[tuple]:
    """
    Семантические соседи слова из rusvectores.org.
    Связан с НКРЯ: модели обучены на корпусе.
    
    pos: NOUN | VERB | ADJ | ADV
    Список моделей: https://rusvectores.org/ru/models/
    
    Применение: сравнить соседей ключевых слов автора в rusvectores
    с тем, рядом с какими словами те же слова стоят в авторском корпусе.
    Расхождение = авторская семантическая специфика.
    """
    import urllib.request, json
    url = f"https://rusvectores.org/{model}/{word}__{pos}/api/json/"
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read())
            return [(item[0], round(item[1], 3))
                    for item in data.get('neighbors', [])[:n]]
    except Exception as e:
        return [('error', str(e))]
```

---

### Шаг 9. Рендер отчётов

```python
def render_stylometry_md(author: str, handle: str,
                         stats: dict, ttr_d: dict, pos_d: dict,
                         nom_d: dict, key_d: dict, ep_d: dict,
                         syn_d: dict, inc_d: dict, neg_d: dict,
                         dyn_d: dict, cs_d: dict, lnk_d: dict,
                         rhy_d: dict) -> str:
    """
    Генерирует [handle]_stylometry.md
    """
    lines = [
        f'# Стилеметрия: {author}',
        f'',
        f'**Корпус:** {stats["posts"]} постов, '
        f'{stats["tokens_ru"]:,} токенов, '
        f'{stats["types_ru"]:,} типов',
        f'**Период:** {stats["date_range"][0]} — {stats["date_range"][1]}',
        f'**Проект:** [RuWritingStyles](https://github.com/gasyoun/RuWritingStyles)',
        '',
        '## Сводная таблица',
        '',
        '| Метрика | Значение |',
        '|---|---|',
        f'| MSTTR (500) | **{ttr_d["msttr_500"]}** |',
        f'| Verb/Noun | **{pos_d["verb_noun_ratio"]}** |',
        f'| Adj/Noun | {pos_d["adj_noun_ratio"]} |',
        f'| Номинализация % | {pos_d["nominalization_pct"]}% |',
        f'| Hedge/Assert | **{ep_d["hedge_assert_ratio"]}** |',
        f'| Гипотаксис/паратаксис | **{syn_d["hypo_para_ratio"]}** → {syn_d["style_signal"]} |',
        f'| «не» / 1000 слов | {neg_d["ne_per_1k"]} |',
        f'| Постов со ссылкой | {lnk_d["pct_with_link"]}% |',
        f'| Ритм | {rhy_d["rhythm_type"]} (CV={rhy_d["weekday_cv"]}) |',
        f'| Импульсность | {rhy_d["impulse_type"]} |',
        '',
    ]

    # Keyness
    lines += ['## Кейнесс — перепредставленные слова', '',
              '| Слово | ipm автора | ipm НКРЯ | G² |',
              '|---|---|---|---|']
    for r in key_d['overrepresented'][:12]:
        if r['ll'] > 200:
            lines.append(
                f"| {r['word']} | {r['corp_ipm']} | {r['ref_ipm']} | {r['ll']} |")
    lines += ['', '**Недопредставлены:** ' +
              ', '.join(r['word'] for r in key_d['underrepresented'][:8]), '']

    # Epistemic
    lines += ['## Эпистемическая модальность', '']
    for cat, label in [('assertion','Уверенность'),('hedge','Хеджирование'),
                       ('ironic_cite','Ирония/архаика'),
                       ('evidential','Эвиденциальность'),('doubt','Сомнение')]:
        d = ep_d.get(cat, {})
        lines.append(f'- **{label}**: n={d.get("n",0)}, {d.get("ipm",0)} ipm')
    lines += [f'', f'Hedge/Assert: **{ep_d["hedge_assert_ratio"]}**',
              f'Топ маркеры: ' +
              ', '.join(f'«{m}»({c})' for m,c in ep_d['top_markers'][:5]), '']

    # Dynamics
    lines += ['## Динамика по годам', '',
              '| Год | Постов | Ср.длина | % личного | % рабочего | % ссылки |',
              '|---|---|---|---|---|---|']
    for yr, d in dyn_d.items():
        lines.append(
            f"| {yr} | {d['n']} | {d['avg_len']} | "
            f"{d['pct_personal']} | {d['pct_work']} | {d['pct_links']} |")

    return '\n'.join(lines)


def render_dh_section(author: str, key_d: dict, pos_d: dict,
                      ep_d: dict, syn_d: dict) -> str:
    """
    Генерирует раздел ## DH-измерения для вставки в _style.md
    """
    lines = [f'## DH-измерения: {author}', '']
    lines += ['### 1. Кейнесс', '',
              '| Слово | ipm | НКРЯ | G² |', '|---|---|---|---|']
    for r in key_d['overrepresented'][:10]:
        if r['ll'] > 300:
            lines.append(f"| {r['word']} | {r['corp_ipm']} | {r['ref_ipm']} | {r['ll']} |")
    lines += ['', '**Недопредставлены:** ' +
              ', '.join(r['word'] for r in key_d['underrepresented'][:6]), '']
    lines += ['### 2. POS-профиль', '',
              f"V/N={pos_d['verb_noun_ratio']} | A/N={pos_d['adj_noun_ratio']} | "
              f"Nom={pos_d['nominalization_pct']}% | "
              f"Глаголы {pos_d['pct_verbs']}% | Прилаг. {pos_d['pct_adjectives']}%", '']
    lines += ['### 3. Эпистемическая модальность', '']
    for cat, lbl in [('assertion','Уверенность'),('hedge','Хеджирование'),
                     ('ironic_cite','Ирония'),('evidential','Эвиденциальность')]:
        d = ep_d.get(cat, {})
        lines.append(f'- {lbl}: n={d.get("n",0)} ({d.get("ipm",0)} ipm)')
    lines += [f'Hedge/Assert: **{ep_d["hedge_assert_ratio"]}**', '']
    lines += ['### 4. Синтаксис', '',
              f"Гипо/пара: **{syn_d['hypo_para_ratio']}** → *{syn_d['style_signal']}*  ",
              f"Запятых/предл.: {syn_d['commas_per_sent']} | "
              f"Ср. клауза: {syn_d['avg_clause_words']} сл.", '']
    return '\n'.join(lines)
```

---

### Шаг 10. Матрица трансляции: измерения → поведенческие правила

Это центральный шаг, которого не хватало. Каждое измерение из шагов 1–9 порождает **структурированное правило** одного из четырёх типов:

- `check` — что верифицировать в выходном тексте
- `limit` — что запрещено
- `prompt_rule` — как инструктировать модель
- `vocab_rule` — лексические предписания и запреты

```python
# ── translation_matrix.py ─────────────────────────────────────────
# Универсальная матрица для любого русскоязычного автора.
# Не зависит от конкретного идиолекта — только от измерений.

from dataclasses import dataclass, field
from typing import Literal

RuleType = Literal['check', 'limit', 'prompt_rule', 'vocab_rule']

@dataclass
class BehavioralRule:
    type: RuleType
    id: str           # machine-readable key для YAML
    label: str        # человекочитаемая формулировка
    source: str       # какое измерение породило правило
    strength: Literal['hard', 'soft']  # hard = нельзя нарушать, soft = предпочтение
    value: float = 0.0  # числовое значение, породившее правило


def translate_ttr(ttr_d: dict) -> list[BehavioralRule]:
    rules = []
    m = ttr_d['msttr_500']
    if m > 0.75:
        rules.append(BehavioralRule(
            type='check', id='lexical_variety',
            label='Варьировать лексику: не повторять одно слово '
                  'в соседних трёх предложениях',
            source=f'MSTTR={m}', strength='soft', value=m))
        rules.append(BehavioralRule(
            type='prompt_rule', id='no_filler_repetition',
            label='Каждый пост должен вводить слова, '
                  'которых не было в предыдущем',
            source=f'MSTTR={m}', strength='soft', value=m))
    elif m < 0.65:
        rules.append(BehavioralRule(
            type='prompt_rule', id='repetition_acceptable',
            label='Повторение ключевых слов допустимо — '
                  'последовательность важнее разнообразия',
            source=f'MSTTR={m}', strength='soft', value=m))
    return rules


def translate_pos(pos_d: dict) -> list[BehavioralRule]:
    rules = []
    vn = pos_d['verb_noun_ratio']
    an = pos_d['adj_noun_ratio']
    nom = pos_d['nominalization_pct']

    if vn < 0.15:
        rules.append(BehavioralRule(
            type='prompt_rule', id='nominal_style_ok',
            label='Именной стиль: термины и имена собственные '
                  'называются напрямую, без парафраза',
            source=f'V/N={vn}', strength='hard', value=vn))
        rules.append(BehavioralRule(
            type='limit', id='no_paraphrase_of_terms',
            label='Не заменять термин описанием: '
                  '«деванагари», а не «индийское слоговое письмо»',
            source=f'V/N={vn}', strength='hard', value=vn))
    elif vn > 0.25:
        rules.append(BehavioralRule(
            type='prompt_rule', id='verbal_style',
            label='Глагольный стиль: действие через глагол, '
                  'а не через отглагольное существительное',
            source=f'V/N={vn}', strength='soft', value=vn))

    if an < 0.10:
        rules.append(BehavioralRule(
            type='limit', id='spare_adjectives',
            label='Прилагательных мало — называть, не описывать; '
                  'одно существительное вместо «красивое слово»',
            source=f'A/N={an}', strength='soft', value=an))
    elif an > 0.20:
        rules.append(BehavioralRule(
            type='prompt_rule', id='descriptive_allowed',
            label='Описательный стиль: развёрнутые характеристики '
                  'через прилагательные уместны',
            source=f'A/N={an}', strength='soft', value=an))

    if nom < 0.4:
        rules.append(BehavioralRule(
            type='limit', id='no_nominalization',
            label='Избегать отглагольных существительных: '
                  '«перевёл» вместо «осуществление перевода»',
            source=f'nom={nom}%', strength='soft', value=nom))
    elif nom > 0.8:
        rules.append(BehavioralRule(
            type='prompt_rule', id='nominalization_acceptable',
            label='Номинализация в норме — академический регистр',
            source=f'nom={nom}%', strength='soft', value=nom))
    return rules


def translate_keyness(key_d: dict) -> list[BehavioralRule]:
    rules = []
    over = key_d['overrepresented']
    under = key_d['underrepresented']

    # Сигнатурные слова — использовать свободно
    sig_words = [r['word'] for r in over if r['ll'] > 300]
    if sig_words:
        rules.append(BehavioralRule(
            type='vocab_rule', id='signature_words',
            label=f'Сигнатурные слова (использовать свободно): '
                  f'{", ".join(sig_words[:10])}',
            source='keyness overrepresented', strength='soft', value=0))

    # Недопредставленные — избегать
    avoid_words = [r['word'] for r in under if r['ll'] > 30]
    if avoid_words:
        rules.append(BehavioralRule(
            type='vocab_rule', id='avoid_abstract_concepts',
            label=f'Избегать абстрактных концептов: '
                  f'{", ".join(avoid_words[:8])}',
            source='keyness underrepresented', strength='soft', value=0))

    # Если вопросительные слова в топе keyness
    question_words = {'кто', 'что', 'как', 'почему', 'зачем', 'откуда', 'куда'}
    if any(r['word'] in question_words for r in over[:10]):
        rules.append(BehavioralRule(
            type='prompt_rule', id='question_as_opening',
            label='Вопрос — естественная форма открытия: '
                  'использовать, когда читатель может знать ответ',
            source='keyness: вопросительные слова в топе',
            strength='soft', value=0))
    return rules


def translate_epistemic(ep_d: dict) -> list[BehavioralRule]:
    rules = []
    ha = ep_d['hedge_assert_ratio']
    ironic = ep_d.get('ironic_cite', {}).get('ipm', 0)
    evid = ep_d.get('evidential', {}).get('ipm', 0)
    doubt = ep_d.get('doubt', {}).get('ipm', 0)

    if ha > 1.3:
        rules.append(BehavioralRule(
            type='prompt_rule', id='hedge_before_assert',
            label='Хеджировать утверждения: «вероятно», «пожалуй», '
                  '«кажется» перед небезусловными суждениями',
            source=f'hedge/assert={ha}', strength='soft', value=ha))
    elif ha < 0.7:
        rules.append(BehavioralRule(
            type='prompt_rule', id='assert_confidently',
            label='Утверждать уверенно, без лишних оговорок',
            source=f'hedge/assert={ha}', strength='soft', value=ha))
    else:
        rules.append(BehavioralRule(
            type='check', id='epistemic_balance',
            label='Баланс уверенности и хеджирования — '
                  'не уклоняться и не быть безапелляционным',
            source=f'hedge/assert={ha}', strength='soft', value=ha))

    if ironic > 1000:
        rules.append(BehavioralRule(
            type='check', id='ironic_register_consistency',
            label='Ирония через архаичный или официальный регистр: '
                  'не объяснять — читатель должен понять сам',
            source=f'ironic_cite={ironic}ipm', strength='hard', value=ironic))
        rules.append(BehavioralRule(
            type='limit', id='no_irony_explanation',
            label='Никогда не помечать иронию («шутка», «ирония», смайлы)',
            source=f'ironic_cite={ironic}ipm', strength='hard', value=ironic))

    if evid > 400:
        rules.append(BehavioralRule(
            type='check', id='source_attribution',
            label='Указывать источник: «по словам», «согласно», '
                  'имя автора + название текста',
            source=f'evidential={evid}ipm', strength='soft', value=evid))

    if doubt < 200:
        rules.append(BehavioralRule(
            type='limit', id='no_public_doubt',
            label='Не выражать публичных сомнений в себе: '
                  'хеджировать суждения, но не сомневаться в компетентности',
            source=f'doubt={doubt}ipm', strength='soft', value=doubt))
    return rules


def translate_syntax(syn_d: dict) -> list[BehavioralRule]:
    rules = []
    hp = syn_d['hypo_para_ratio']
    cl = syn_d['avg_clause_words']
    cp = syn_d['commas_per_sent']

    if hp < 0.3:
        rules.append(BehavioralRule(
            type='prompt_rule', id='paratactic_rhythm',
            label='Координационный синтаксис: соединять клаузы '
                  'через «а», «и», «но», а не через придаточные',
            source=f'hypo/para={hp}', strength='soft', value=hp))
        rules.append(BehavioralRule(
            type='limit', id='no_deep_subordination',
            label='Не строить глубоко вложенных придаточных (3+ уровня): '
                  'разбить на отдельные предложения',
            source=f'hypo/para={hp}', strength='soft', value=hp))
    elif hp > 0.5:
        rules.append(BehavioralRule(
            type='prompt_rule', id='hypotactic_ok',
            label='Сложноподчинённые конструкции уместны',
            source=f'hypo/para={hp}', strength='soft', value=hp))

    if cl < 5:
        rules.append(BehavioralRule(
            type='prompt_rule', id='montage_style',
            label='Монтажный стиль: предложение из коротких блоков, '
                  'разделённых запятыми или тире',
            source=f'avg_clause={cl}', strength='soft', value=cl))
    elif cl > 8:
        rules.append(BehavioralRule(
            type='prompt_rule', id='flowing_periods',
            label='Развёрнутые периоды: клаузы могут быть длинными',
            source=f'avg_clause={cl}', strength='soft', value=cl))
    return rules


def translate_incipit(inc_d: dict) -> list[BehavioralRule]:
    rules = []
    top = [w for w, _ in inc_d['top_incipits'][:10]]
    q_opens = inc_d['question_openings']
    d_opens = inc_d['date_openings']
    total = sum(c for _, c in inc_d['top_incipits'])

    if q_opens / max(total, 1) > 0.12:
        rules.append(BehavioralRule(
            type='prompt_rule', id='question_opening',
            label='Открывать вопросом, когда уместно: '
                  'это сигнал диалогичности, не риторика',
            source=f'question_openings={q_opens}', strength='soft', value=q_opens))
    if d_opens / max(total, 1) > 0.05:
        rules.append(BehavioralRule(
            type='prompt_rule', id='temporal_anchor',
            label='Привязывать к конкретному моменту: '
                  '«сегодня», «вчера», дата, год',
            source=f'date_openings={d_opens}', strength='soft', value=d_opens))
    return rules


def translate_explicit(inc_d: dict) -> list[BehavioralRule]:
    rules = []
    top_closings = [w for w, _ in inc_d['top_explicits'][:15]]
    # Проверить преобладание топонимов и имён
    geo_words = {'москве', 'петербурге', 'индии', 'риге', 'обнинске',
                 'петербург', 'москва', 'латвии', 'краснодаре'}
    has_geo_closing = any(w in geo_words for w in top_closings)
    if has_geo_closing:
        rules.append(BehavioralRule(
            type='prompt_rule', id='concrete_closure',
            label='Заканчивать конкретным: топоним, имя человека, факт — '
                  'не общим выводом или моралью',
            source='explicit: топонимы в финале', strength='soft', value=0))
    return rules


def translate_negation(neg_d: dict) -> list[BehavioralRule]:
    rules = []
    rate = neg_d['ne_per_1k']
    rhet = neg_d['rhetorical_q']

    if rate > 18:
        rules.append(BehavioralRule(
            type='check', id='polemic_negation_check',
            label='Высокая частота отрицания: '
                  'убедиться, что оно не полемическое, а аналитическое',
            source=f'не={rate}/1k', strength='soft', value=rate))
    if rhet > 30:
        rules.append(BehavioralRule(
            type='prompt_rule', id='rhetorical_question_neg',
            label='Риторический вопрос с «не» — '
                  'основная форма мягкого утверждения: «Не пора ли…»',
            source=f'rhetorical_q={rhet}', strength='soft', value=rhet))
    return rules


def translate_codeswitching(cs_d: dict) -> list[BehavioralRule]:
    rules = []
    positions = cs_d.get('positions', {})
    bracket_lat = cs_d.get('latin_in_brackets', 0)

    medial = sum(positions.get('medial', {}).values())
    explicit_ = sum(positions.get('explicit', {}).values())

    if medial > explicit_ * 3:
        rules.append(BehavioralRule(
            type='prompt_rule', id='codeswitching_medial',
            label='Иноязычные вставки — в середине текста, '
                  'не в финальной позиции (финал — только для личного)',
            source='codeswitching: medial dominant', strength='soft', value=0))
    if bracket_lat > 50:
        rules.append(BehavioralRule(
            type='prompt_rule', id='foreign_in_brackets',
            label='Иноязычные слова и транслитерация — в скобках: '
                  '«деванагари (devanāgarī)»',
            source=f'latin_in_brackets={bracket_lat}', strength='soft', value=bracket_lat))
    return rules


def translate_links(lnk_d: dict) -> list[BehavioralRule]:
    rules = []
    lo = lnk_d['pct_link_only']
    wl = lnk_d['pct_with_link']
    top_dom = [d for d, _ in lnk_d['top_domains'][:3]]

    if lo > 15:
        rules.append(BehavioralRule(
            type='prompt_rule', id='link_commentary',
            label='Ссылки как основной носитель информации: '
                  'минимальный комментарий допустим',
            source=f'link_only={lo}%', strength='soft', value=lo))
    elif lo < 10 and wl > 20:
        rules.append(BehavioralRule(
            type='prompt_rule', id='link_as_supplement',
            label='Ссылки — дополнение к тексту, не замена; '
                  'текст должен быть самодостаточен',
            source=f'link_only={lo}%', strength='soft', value=lo))

    # Собственный сайт в топе доменов
    personal_domains = [d for d in top_dom
                        if not any(x in d for x in ['youtube', 'youtu', 'vk.',
                                                      't.me', 'telegram', 'github'])]
    if personal_domains:
        rules.append(BehavioralRule(
            type='prompt_rule', id='ecosystem_linking',
            label=f'Ссылаться на собственные ресурсы '
                  f'({", ".join(personal_domains)}): '
                  f'автор — часть связной экосистемы',
            source='top_domains: личный сайт', strength='soft', value=0))
    return rules


def translate_rhythm(rhy_d: dict) -> list[BehavioralRule]:
    rules = []
    cv = rhy_d['weekday_cv']
    bursts = rhy_d['bursts_10min']

    if cv < 0.15:
        rules.append(BehavioralRule(
            type='prompt_rule', id='daily_cadence',
            label='Дневниковый ритм: один пост — одна мысль, '
                  'без серийных выбросов',
            source=f'weekday_cv={cv}', strength='soft', value=cv))
    elif cv > 0.30:
        rules.append(BehavioralRule(
            type='prompt_rule', id='scheduled_cadence',
            label='Плановый ритм: допустимо группировать '
                  'посты по дням или темам',
            source=f'weekday_cv={cv}', strength='soft', value=cv))

    if bursts < 5:
        rules.append(BehavioralRule(
            type='prompt_rule', id='deliberate_posts',
            label='Обдуманные публикации: каждый пост — '
                  'отдельное решение, не импульс',
            source=f'bursts={bursts}', strength='hard', value=bursts))
    return rules


# ── ГЛАВНАЯ ФУНКЦИЯ ТРАНСЛЯЦИИ ────────────────────────────────────

def translate_all_measurements(
    ttr_d: dict, pos_d: dict, nom_d: dict,
    key_d: dict, ep_d: dict, syn_d: dict,
    inc_d: dict, neg_d: dict,
    cs_d: dict, lnk_d: dict, rhy_d: dict,
    manual_limits: list[str] = None,  # из раздела «Что исключать» в _style.md
    manual_checks: list[str] = None,  # из ручного анализа стиля
) -> list[BehavioralRule]:
    """
    Транслирует ВСЕ измерения в полный список поведенческих правил.

    manual_limits: лимиты из качественного анализа
                   (раздел «Что исключать» в _style.md)
    manual_checks: проверки из ручного анализа
                   (раздел «Тезисно» или «Чего нет»)

    Возвращает list[BehavioralRule], пригодный для:
    - render_rules_md()  → _rules.md (человекочитаемый)
    - generate_passport() → .yml (машиночитаемый)
    """
    rules = []
    rules += translate_ttr(ttr_d)
    rules += translate_pos(pos_d)
    rules += translate_keyness(key_d)
    rules += translate_epistemic(ep_d)
    rules += translate_syntax(syn_d)
    rules += translate_incipit(inc_d)
    rules += translate_explicit(inc_d)
    rules += translate_negation(neg_d)
    rules += translate_codeswitching(cs_d)
    rules += translate_links(lnk_d)
    rules += translate_rhythm(rhy_d)

    # Добавить ручные правила как hard limits
    if manual_limits:
        for i, lim in enumerate(manual_limits):
            rules.append(BehavioralRule(
                type='limit', id=f'manual_limit_{i}',
                label=lim, source='ручной анализ',
                strength='hard', value=0))
    if manual_checks:
        for i, chk in enumerate(manual_checks):
            rules.append(BehavioralRule(
                type='check', id=f'manual_check_{i}',
                label=chk, source='ручной анализ',
                strength='soft', value=0))
    return rules


def render_rules_md(author: str, rules: list[BehavioralRule]) -> str:
    """
    Генерирует промежуточный [handle]_rules.md —
    человекочитаемый список правил для ручной проверки
    перед генерацией YAML.
    """
    lines = [
        f'# Поведенческие правила: {author}',
        '',
        '> Промежуточный файл. Проверить вручную перед generate_passport().',
        '> Правила помечены: (H) = hard / нельзя нарушать, (S) = soft / предпочтение.',
        '',
    ]
    by_type = {'check': [], 'limit': [], 'prompt_rule': [], 'vocab_rule': []}
    for r in rules:
        by_type[r.type].append(r)

    labels = {
        'check':       '## Проверки (checks)',
        'limit':       '## Лимиты (limits)',
        'prompt_rule': '## Правила промпта (prompt_rules)',
        'vocab_rule':  '## Лексические правила (vocab_rules)',
    }
    for rtype, heading in labels.items():
        if not by_type[rtype]:
            continue
        lines.append(heading)
        lines.append('')
        for r in by_type[rtype]:
            strength = '(H)' if r.strength == 'hard' else '(S)'
            lines.append(f'- **{r.id}** {strength}')
            lines.append(f'  {r.label}')
            lines.append(f'  *← {r.source}*')
            lines.append('')
    return '\n'.join(lines)
```

---

### Шаг 11. Генерация YAML-паспорта из правил

```python
# ── passport_generator.py ─────────────────────────────────────────
import yaml

def generate_passport(
    handle: str,
    author_name: str,
    level: str,
    thematic_top: list[str],
    can_reply_to: list[str],
    rules: list[BehavioralRule],
    key_d: dict,
    rewrite_allowed: bool = False,
    output_format: str = 'findings_json',
) -> str:
    """
    Из полного списка BehavioralRule генерирует YAML-паспорт.
    rules — результат translate_all_measurements().

    Ключевое: паспорт теперь несёт полноту дескриптивного документа,
    переведённую в машиночитаемые правила.
    """
    def infer_cluster(topics):
        mapping = {
            'санскрит': 'ling_sanskrit', 'лингвистика': 'ling_general',
            'перевод': 'ling_translation', 'берестяные': 'ling_slavic',
            'поэзия': 'lit_poetry', 'история': 'hist_general',
        }
        for t in topics:
            for kw, cl in mapping.items():
                if kw in t.lower(): return cl
        return 'ling_general'

    def infer_role(rules, key_d):
        ids = {r.id for r in rules}
        top = [r['word'] for r in key_d['overrepresented'][:5]]
        if 'nominal_style_ok' in ids and 'no_paraphrase_of_terms' in ids:
            return 'terminological_annotator'
        if 'question_opening' in ids:
            return 'dialogic_moderator'
        if 'ironic_register_consistency' in ids:
            return 'ironic_commentator'
        return 'narrative_commentator'

    def conflict_priority(key_d):
        top_ll = key_d['overrepresented'][0]['ll'] if key_d['overrepresented'] else 0
        if top_ll > 2000: return 'extreme'
        if top_ll > 800:  return 'high'
        if top_ll > 300:  return 'medium'
        return 'low'

    # Сортировка правил по типу
    checks      = [r.id for r in rules if r.type == 'check']
    limits      = [r.label for r in rules if r.type == 'limit']
    prompt_rules= [r.label for r in rules if r.type == 'prompt_rule']
    vocab_rules = {r.id: r.label for r in rules if r.type == 'vocab_rule'}

    # Разделение на hard / soft
    hard_limits = [r.label for r in rules
                   if r.type == 'limit' and r.strength == 'hard']
    soft_limits = [r.label for r in rules
                   if r.type == 'limit' and r.strength == 'soft']

    passport = {
        'id': handle,
        'name': author_name,
        'level': level,
        'cluster': infer_cluster(thematic_top),
        'source_prompt': f'ClaudeStyles/{handle}_style.md',
        'source_rules': f'ClaudeStyles/{handle}_rules.md',
        'source_stylometry': f'ClaudeStyles/{handle}_stylometry.md',
        'role': infer_role(rules, key_d),
        'language': 'ru',
        'best_for': thematic_top,
        'checks': checks,
        'limits': {
            'hard': hard_limits,
            'soft': soft_limits,
        },
        'prompt_rules': prompt_rules,
        'vocab': vocab_rules if vocab_rules else None,
        'review_mode': {
            'rewrite_allowed': rewrite_allowed,
            'requires_span_ids': True,
            'output_format': output_format,
        },
        'council': {
            'can_reply_to': can_reply_to,
            'conflict_priority': {
                'default': conflict_priority(key_d),
            },
        },
    }
    # Убрать None-поля
    passport = {k: v for k, v in passport.items() if v is not None}
    return yaml.dump(passport, allow_unicode=True,
                     default_flow_style=False, sort_keys=False)
```

---

### Шаг 12. Полный запуск: от корпуса до YAML

```python
def full_pipeline(
    export_path: str,
    author_name: str,
    handle: str,
    # Конфигурация автора:
    personal_kw: list[str],
    work_kw: list[str],
    thematic_top: list[str],
    can_reply_to: list[str],
    manual_limits: list[str],   # из ручного чтения _style.md
    manual_checks: list[str],   # из ручного чтения _style.md
    # Параметры:
    level: str = 'public',
    l2_pattern: str = r'(?!)',
    ref_freq_path: str = None,
    subcorpus: str = 'paper',
    rewrite_allowed: bool = False,
) -> None:
    """
    Полный пайплайн: JSON → MD × 3 + YAML.
    """
    import os
    os.makedirs('ClaudeStyles', exist_ok=True)
    os.makedirs('styles/passports', exist_ok=True)

    # 1. Загрузка
    texts = load_tg(export_path)
    stats = corpus_stats(texts)
    ref = load_ref_freq(ref_freq_path) if ref_freq_path else REF_IPM_DEFAULT

    # 2. Все измерения
    ttr_d = ttr(texts)
    pos_d = pos_profile(texts)
    nom_d = nominalization(texts)
    key_d = keyness(texts, ref_ipm=ref)
    ep_d  = epistemic_modality(texts)
    syn_d = syntactic_depth_proxy(texts)
    inc_d = incipit_explicit(texts)
    neg_d = negation(texts)
    dyn_d = style_dynamics(texts, personal_kw, work_kw)
    cs_d  = codeswitching(texts, l2_pattern)
    lnk_d = link_density(texts)
    rhy_d = posting_rhythm(texts)

    # 3. _stylometry.md
    sty = render_stylometry_md(
        author_name, handle, stats, ttr_d, pos_d, nom_d,
        key_d, ep_d, syn_d, inc_d, neg_d, dyn_d, cs_d, lnk_d, rhy_d)
    with open(f'ClaudeStyles/{handle}_stylometry.md', 'w', encoding='utf-8') as f:
        f.write(sty)

    # 4. Трансляция измерений → правила
    rules = translate_all_measurements(
        ttr_d, pos_d, nom_d, key_d, ep_d, syn_d,
        inc_d, neg_d, cs_d, lnk_d, rhy_d,
        manual_limits=manual_limits,
        manual_checks=manual_checks,
    )

    # 5. _rules.md (промежуточный, для ручной проверки)
    rules_md = render_rules_md(author_name, rules)
    with open(f'ClaudeStyles/{handle}_rules.md', 'w', encoding='utf-8') as f:
        f.write(rules_md)
    print(f'✓ {handle}_rules.md — проверьте вручную перед следующим шагом')

    # 6. DH-раздел для _style.md
    dh = render_dh_section(author_name, key_d, pos_d, ep_d, syn_d)
    with open(f'ClaudeStyles/{handle}_dh_section.md', 'w', encoding='utf-8') as f:
        f.write(dh)

    # 7. YAML-паспорт
    passport = generate_passport(
        handle, author_name, level, thematic_top, can_reply_to,
        rules, key_d, rewrite_allowed=rewrite_allowed)
    with open(f'styles/passports/{handle}.yml', 'w', encoding='utf-8') as f:
        f.write(passport)
    # Валидация
    import yaml
    yaml.safe_load(passport)  # упадёт если YAML невалиден

    print(f'✓ Готово:')
    print(f'  ClaudeStyles/{handle}_stylometry.md')
    print(f'  ClaudeStyles/{handle}_rules.md  ← ПРОВЕРИТЬ ВРУЧНУЮ')
    print(f'  ClaudeStyles/{handle}_dh_section.md')
    print(f'  styles/passports/{handle}.yml')
```

**Важно:** шаг 5 (_rules.md) — обязательная точка ручной проверки. Codex генерирует правила автоматически, но человек должен:
- Убрать противоречия (например, `nominal_style_ok` и `no_nominalization` одновременно не должны быть hard)
- Добавить правила, не выводимые из чисел (авторская этика, табуированные темы)
- Проверить, что `manual_limits` из _style.md не дублируются автоматическими

---



```python
def analyze(export_path: str,
            author_name: str,
            handle: str,
            personal_kw: list[str],
            work_kw: list[str],
            l2_pattern: str = r'[āēīūžčšģķļņŗ]',
            ref_freq_path: str = None,
            subcorpus: str = 'paper') -> None:
    """
    Главная функция. Запустить для каждого нового автора.

    Обязательно настроить:
    - personal_kw: личные темы автора (семья, здоровье, быт)
    - work_kw: профессиональные темы (ключевые термины поля)
    - l2_pattern: паттерн второго языка автора
    - ref_freq_path: путь к TSV частотного словаря подкорпуса НКРЯ
    - subcorpus: 'paper' для публицистов, 'blogs' для блогеров,
                 'main' для академиков
    """
    texts = load_tg(export_path)
    stats = corpus_stats(texts)
    print(f"Загружено: {stats}")

    ref = load_ref_freq(ref_freq_path) if ref_freq_path else REF_IPM_DEFAULT

    ttr_d  = ttr(texts)
    pos_d  = pos_profile(texts)
    nom_d  = nominalization(texts)
    key_d  = keyness(texts, ref_ipm=ref)
    ep_d   = epistemic_modality(texts)
    syn_d  = syntactic_depth_proxy(texts)
    inc_d  = incipit_explicit(texts)
    neg_d  = negation(texts)
    dyn_d  = style_dynamics(texts, personal_kw, work_kw)
    cs_d   = codeswitching(texts, l2_pattern)
    lnk_d  = link_density(texts)
    rhy_d  = posting_rhythm(texts)

    # Файл 1: только стилеметрия
    sty_md = render_stylometry_md(
        author_name, handle, stats, ttr_d, pos_d, nom_d,
        key_d, ep_d, syn_d, inc_d, neg_d, dyn_d, cs_d, lnk_d, rhy_d)
    with open(f'ClaudeStyles/{handle}_stylometry.md', 'w', encoding='utf-8') as f:
        f.write(sty_md)

    # Файл 2: DH-раздел для вставки в _style.md
    dh_md = render_dh_section(author_name, key_d, pos_d, ep_d, syn_d)
    with open(f'ClaudeStyles/{handle}_dh_section.md', 'w', encoding='utf-8') as f:
        f.write(dh_md)

    print(f"Сохранено: {handle}_stylometry.md, {handle}_dh_section.md")
```

---

## Конфигурация для нового автора: чеклист

Перед запуском `analyze()` для каждого нового автора ответить на 6 вопросов:

**1. Жанр?** → выбрать `subcorpus`:
- Личный Telegram / блог → `'blogs'`
- Публицистика / СМИ → `'paper'`
- Научный текст / академик → `'main'` с жанровым фильтром
- Художественная проза → `'main'` с фильтром genre=fiction

**2. Второй язык?** → настроить `l2_pattern`:
- Латышский / литовский: `r'[āēīūžčšģķļņŗ]'`
- Армянский: `r'[\u0530-\u058F]'`
- Грузинский: `r'[\u10A0-\u10FF]'`
- Немецкий (умляуты): `r'[äöüÄÖÜß]'`
- Нет L2: `r'(?!)'` (никогда не совпадает)

**3. Специализированная лексика?** → добавить в `ref_ipm`:
- Найти 10–15 ключевых терминов поля
- Оценить реалистичный ipm (узкоспециальный = 2–10, дисциплинарный = 50–150)
- Без этого кейнесс завысит G² для всех терминов

**4. Личные темы?** → `personal_kw`:
Список из 10–15 слов для определения «личных» постов в динамике.
Пример для историка: `['семья', 'архив', 'экспедиция', 'деревня', 'дача']`

**5. Рабочие темы?** → `work_kw`:
Список из 10–15 слов для определения «рабочих» постов.
Пример для историка: `['исследование', 'источник', 'документ', 'конференц', 'статья']`

**6. Псевдоцитатная ирония?** → расширить `EPISTEMIC_MARKERS['ironic_cite']`:
Прочитать 30–50 постов, найти характерные формулы иронии.
Добавить в словарь до запуска анализа.

**7. Журнальные требования?** (для академических статей) → `journal_check()`:
Если текст подаётся в журнал — запустить отдельно после пайплайна:
```python
result = journal_check(
    texts, journal='spbu_psychology', article_type='empirical',
    abstract_text='...', keywords=[...], source_count=N)
print_journal_report(result)
```
Доступные профили: `spbu_psychology`, `hse_student`.  
Добавить новый: словарь в `JOURNAL_PROFILES` (ключи см. в коде).

---

---

## Требования журналов: проверочный модуль

**Источник:** Вестник СПбГУ. Психология — требования к оформлению статьи (май 2026).  
URL: psyjournal.spbu.ru/public/journals/16/psyjournal_requirements_for_article_rus.pdf

### Что проверяется автоматически (`journal_check`)

| Требование СПбГУ | § документа | Метод проверки |
|---|---|---|
| Объём 20 000–38 000 знаков | §1 | `len(full_text)` |
| Аннотация 230–250 слов | §3.1 | `len(abstract.split())` |
| Аннотация — единый абзац | §3.2 | поиск `\n\n` в abstract |
| Нет маркированных списков в аннотации | §3.3 | regex на `^[•\-\*\d]+[\.\)]` |
| Нет библиографических ссылок в аннотации | §3.4 | regex на `\(\w+, \d{4}\)` |
| Нет аббревиатур в аннотации | §3.5 | поиск CAPS без расшифровки |
| Ключевых слов 5–7 | §4.1 | `len(keywords)` |
| Нет аббревиатур в ключевых словах | §4.3 | regex |
| Нет сложных фраз в ключевых словах | §4.4 | `len(kw.split()) > 4` |
| Два списка литературы (ГОСТ + APA) | §8 | поиск «Литература» + «References» |
| Двуязычные метаданные | образец | наличие латинского блока |
| Структура: все обязательные разделы | образец | сравнение с required_sections |
| Источников 15–20 (эмпирическая) / ≥40 (теоретическая) | §8 | `source_count` |
| Аббревиатуры расшифрованы при первом упоминании | §7.6 | heuristic по CAPS без `(` |
| Нет анонимных источников в списке литературы | §8.2 | rule в _rules.md |
| Рисунки ≥300 dpi, не сканированные | §6.3 | rule (файлы не проверяются) |

### Что требует ручной проверки

- Содержание аннотации по структуре Background/Objective/Design/Results/Conclusion
- Правильность транслитерации (Library of Congress) — проверять на translit.ru/lc
- Перевод названий русскоязычных источников в References
- Разрешение изображений 300 dpi (EXIF)
- Порядок авторов (вклад или алфавит)
- Актуальность источников (последние 5 лет)
- Совпадение ключевых слов с типичными поисковыми запросами

### Как добавить профиль нового журнала

```python
JOURNAL_PROFILES['novyi_zhurnal'] = {
    "name": "Название журнала",
    "chars_min": 25_000,
    "chars_max": 60_000,
    "abstract_words_min": 200,
    "abstract_words_max": 300,
    "abstract_single_para": True,
    "abstract_no_lists": True,
    "abstract_no_citations": True,
    "keywords_min": 5,
    "keywords_max": 10,
    "sources_empirical_min": 20,
    "sources_theoretical_min": 50,
    "sources_recent_years": 5,
    "required_sections_empirical": [
        "введение", "методы", "результаты", "обсуждение", "выводы"
    ],
    "bilingual_required": True,
    "two_bibliographies": True,
    "citation_style_ru": "ГОСТ",
    "citation_style_en": "APA",
    "abbreviations_decode_first_use": True,
    "foreign_authors_original_spelling": True,
    "figures_min_dpi": 300,
}
```

---



**Источник:** Методические рекомендации по написанию письменных работ, НИУ ВШЭ, 2019.  
URL: hse.ru/data/2020/02/06/1571404206/…

### Зачем это нужно RuWritingStyles

Большинство авторов в проекте — русскоязычные лингвисты и филологи. Их Telegram-каналы, эссе и публичные тексты существуют в постоянном диалоге с академическим регистром: кто-то его воспроизводит, кто-то намеренно ломает, кто-то переключается между ним и разговорным. Чтобы измерить это отклонение, нужен **нормативный нулевой уровень** — что ВШЭ считает «правильным» академическим письмом.

Отклонение от академической нормы = часть идиолекта. Гасунс с его `verb/noun = 0,127` и `hypo/para = 0,251` находится на границе академического и разговорного, хотя пишет о сугубо академических предметах. Это диагностически важно именно потому, что норма известна и измерима.

---

### Жанровая таксономия ВШЭ как разметочная схема

Документ вводит чёткую иерархию жанров с параметрами объёма:

| Жанр | Объём | Ключевая функция |
|---|---|---|
| Контрольная работа | 3–5 стр. | Проверка знания |
| Домашнее задание | 5–8 стр. | Применение |
| Эссе | **8–10 стр.** | Аргументированное личное мнение |
| Реферат | **12–15 стр.** | Обзор + собственные суждения |
| Курсовая работа | **30–35 стр.** | Оригинальное исследование |

**Применение в RuWritingStyles:** при анализе академических текстов автора (не Telegram) — определять жанровую принадлежность каждого текста по объёму и структуре. Затем измерять, насколько автор соответствует жанровым нормам или их нарушает. Нарушение нормы — стилистический факт.

Ключевое различие ВШЭ между жанрами: реферат — это **обзор чужих идей + собственные выводы**, эссе — **творческое, поисковое, с элементами исследования**. Авторы, смешивающие эти жанры (пишущие эссе как реферат или наоборот), имеют измеримый жанровый сдвиг.

---

### Нормативные параметры академического текста

ВШЭ-норма задаёт конкретные числа, которые становятся порогами для измерений:

**Структурные требования:**
- Введение: 3–4 стр. (обязательные элементы: актуальность, цель, задачи, объект, предмет, методы, гипотезы)
- Заключение: 2–3 стр. (итоги + выводы)
- Каждый раздел с новой страницы

**Форматные параметры (=маркеры академического регистра):**
- Times New Roman 14pt, интервал 1,5
- Поля: левое 35мм, правое 15мм — это знаково для машинописной культуры
- ~2000 знаков на странице

**Требования к цитированию:**
- Прямая цитата → кавычки + `[N, с. N]`
- Пересказ → `(Автор, год)` без страниц
- Два стиля допустимы одновременно

**Аббревиатуры:** первое употребление — расшифровка в скобках, далее без расшифровки.

---

### Новый измерительный модуль: Индекс академического отклонения

```python
# ── academic_baseline.py ──────────────────────────────────────────
# Измеряет отклонение идиолекта автора от ВШЭ-нормы академического
# письма. Применять к академическим текстам автора, если они есть
# в корпусе — не к Telegram-постам.

# Индикаторы академического регистра (из ВШЭ-методрекомендаций)
ACADEMIC_MARKERS = {
    # Структурные маркеры введения
    'intro_markers': [
        'актуальность', 'цель работы', 'задачи', 'объект исследования',
        'предмет исследования', 'методы исследования', 'научная новизна',
        'теоретическая база', 'эмпирическая база', 'гипотеза',
        'степень разработанности',
    ],
    # Маркеры заключения
    'conclusion_markers': [
        'таким образом', 'в заключение', 'подводя итоги',
        'обобщая вышесказанное', 'итак', 'в результате исследования',
        'проведённый анализ показал', 'выводы', 'рекомендации',
    ],
    # Цитатные маркеры
    'citation_patterns': [
        r'\[\d+,\s*с\.\s*\d+',        # [15, с. 237]
        r'\([А-ЯЁA-Z][а-яёa-z]+,\s*\d{4}',  # (Иванов, 2019)
        r'там же',                      # ibid
        r'цит\. по',                    # цит. по
        r'указ\. соч\.',               # указ. соч.
    ],
    # Формальные коннекторы
    'formal_connectors': [
        'следует отметить', 'необходимо подчеркнуть', 'следует указать',
        'как отмечает', 'по мнению', 'согласно', 'в соответствии с',
        'на наш взгляд', 'представляется', 'очевидно, что',
        'как было показано выше', 'из вышесказанного следует',
        'в рамках', 'в контексте', 'применительно к',
    ],
    # Жанровые маркеры эссе (по ВШЭ: творческий, поисковый)
    'essay_markers': [
        'мне кажется', 'я думаю', 'по моему мнению', 'я считаю',
        'хочу отметить', 'обращу внимание', 'замечу', 'признаюсь',
    ],
    # Аббревиатуры с расшифровкой (признак академического)
    'abbreviation_intro': [r'\b[А-ЯЁ]{2,}\b\s*\([^)]{5,40}\)'],
}

# Параметры ВШЭ-нормы по жанрам
HSE_GENRE_NORMS = {
    'эссе':    {'min_pages': 8,  'max_pages': 10,  'chars_per_page': 2000},
    'реферат': {'min_pages': 12, 'max_pages': 15,  'chars_per_page': 2000},
    'курсовая':{'min_pages': 30, 'max_pages': 35,  'chars_per_page': 2000},
}

# Критерии качества из ВШЭ (→ checks в паспорте)
HSE_QUALITY_CRITERIA = [
    'содержание и актуальность',
    'самостоятельность подготовки',
    'оригинальность выводов',
    'полнота использования источников',
    'язык и стиль изложения',
    'профессиональность',
]

def academic_deviation_index(texts: list[dict]) -> dict:
    """
    Измеряет отклонение корпуса от ВШЭ-нормы академического письма.
    
    Применять к:
    - Академическим статьям автора (если есть в корпусе)
    - Публичным лекциям и докладам (текстовые версии)
    - НЕ к Telegram-постам (там норма другая)
    
    Возвращает:
    - academic_density: плотность академических маркеров на 1000 слов
    - essay_density: плотность эссеистических маркеров
    - citation_density: плотность цитатных паттернов
    - formality_index: 0 (разговорный) → 1 (академический)
    - genre_signal: 'эссе' | 'реферат' | 'смешанный' | 'нейтральный'
    """
    import re
    full = ' '.join(d['text'] for d in texts).lower()
    tokens = re.findall(r'[а-яёА-ЯЁ]{3,}', full)
    total = len(tokens)

    # Считаем академические маркеры
    intro_n    = sum(full.count(m) for m in ACADEMIC_MARKERS['intro_markers'])
    concl_n    = sum(full.count(m) for m in ACADEMIC_MARKERS['conclusion_markers'])
    formal_n   = sum(full.count(m) for m in ACADEMIC_MARKERS['formal_connectors'])
    essay_n    = sum(full.count(m) for m in ACADEMIC_MARKERS['essay_markers'])
    citation_n = sum(len(re.findall(p, ' '.join(d['text'] for d in texts)))
                     for p in ACADEMIC_MARKERS['citation_patterns'])

    academic_density = round(1000*(intro_n+concl_n+formal_n)/max(total,1), 2)
    essay_density    = round(1000*essay_n/max(total,1), 2)
    citation_density = round(1000*citation_n/max(total,1), 2)

    # Indeks formality: академические vs. эссеистические маркеры
    formality = round(
        (intro_n+concl_n+formal_n) /
        max(intro_n+concl_n+formal_n+essay_n, 1), 3)

    # Жанровый сигнал
    if essay_density > academic_density:
        genre_signal = 'эссе (личный, поисковый)'
    elif academic_density > 3 * essay_density:
        genre_signal = 'реферат/курсовая (безличный, обзорный)'
    elif academic_density > 0 and essay_density > 0:
        genre_signal = 'смешанный (эссе + академический)'
    else:
        genre_signal = 'нейтральный'

    return {
        'academic_density_per1k':  academic_density,
        'essay_density_per1k':     essay_density,
        'citation_density_per1k':  citation_density,
        'formality_index':         formality,
        'genre_signal':            genre_signal,
        'raw': {
            'intro_markers': intro_n,
            'conclusion_markers': concl_n,
            'formal_connectors': formal_n,
            'essay_markers': essay_n,
            'citation_refs': citation_n,
        }
    }


def detect_genre_by_length(text: str) -> str:
    """
    Определить жанр академического текста по объёму
    в соответствии с ВШЭ-нормой.
    """
    chars = len(text)
    pages = chars / 2000  # ВШЭ: ~2000 знаков/страница

    if pages < 5:   return 'контрольная/домашнее задание'
    if pages < 8:   return 'домашнее задание'
    if pages < 12:  return 'эссе'
    if pages < 30:  return 'реферат'
    if pages < 40:  return 'курсовая работа'
    return 'дипломная/монография'


def hse_citation_style(texts: list[dict]) -> dict:
    """
    Анализ стиля цитирования: ВШЭ допускает два формата.
    Определяет, какой из них использует автор и насколько последовательно.
    """
    import re
    full = ' '.join(d['text'] for d in texts)
    
    # Формат [N, с. N]
    bracket_num = len(re.findall(r'\[\d+,?\s*с\.\s*\d+', full))
    # Формат (Автор, год)
    author_year = len(re.findall(
        r'\([А-ЯЁA-Z][а-яёa-z]+,\s*(?:19|20)\d{2}[а-я]?\)', full))
    # Footnote-style (число с точкой)
    footnote = len(re.findall(r'(?<!\d)\d{1,2}(?!\d)\s*(?=\n|$)', full))
    
    total = bracket_num + author_year + footnote
    dominant = max(
        [('bracket_num', bracket_num),
         ('author_year', author_year),
         ('footnote', footnote)],
        key=lambda x: x[1])[0] if total > 0 else 'none'
    
    return {
        'bracket_num_citations': bracket_num,
        'author_year_citations': author_year,
        'footnote_refs': footnote,
        'dominant_style': dominant,
        'consistency': round(max(bracket_num, author_year, footnote) /
                             max(total, 1), 2),
        'total_citations': total,
    }
```

---

### Матрица трансляции: академические отклонения → правила

```python
def translate_academic_baseline(acad_d: dict,
                                 cite_d: dict) -> list[BehavioralRule]:
    """
    Добавить к основному translate_all_measurements().
    """
    rules = []
    fi = acad_d['formality_index']
    gs = acad_d['genre_signal']
    ed = acad_d['essay_density_per1k']
    ad = acad_d['academic_density_per1k']
    cd = acad_d['citation_density_per1k']

    # Формальность
    if fi > 0.8:
        rules.append(BehavioralRule(
            type='prompt_rule', id='formal_academic_register',
            label='Безличный академический регистр: '
                  '«следует отметить», «представляется», «как показывает анализ»',
            source=f'formality_index={fi}', strength='soft', value=fi))
        rules.append(BehavioralRule(
            type='limit', id='no_first_person_academic',
            label='Избегать «я думаю», «мне кажется» в академических разделах; '
                  'допустимо «на наш взгляд», «автор полагает»',
            source=f'formality_index={fi}', strength='soft', value=fi))
    elif fi < 0.4:
        rules.append(BehavioralRule(
            type='prompt_rule', id='essayistic_personal',
            label='Эссеистический регистр: '
                  'личное мнение в первом лице уместно и ожидаемо',
            source=f'formality_index={fi}', strength='soft', value=fi))

    # Жанровый сигнал
    if 'смешанный' in gs:
        rules.append(BehavioralRule(
            type='check', id='genre_consistency',
            label='Проверить жанровую последовательность: '
                  'не смешивать безличный реферативный и личный эссеистический '
                  'регистры в одном тексте без маркировки перехода',
            source=f'genre_signal={gs}', strength='soft', value=0))

    # Плотность цитирования
    if cd < 0.5:
        rules.append(BehavioralRule(
            type='limit', id='source_attribution_required',
            label='Любое заимствование идеи — со ссылкой на источник, '
                  'даже без прямой цитаты: ВШЭ-норма это требует явно',
            source=f'citation_density={cd}/1k', strength='hard', value=cd))
    elif cd > 5:
        rules.append(BehavioralRule(
            type='check', id='citation_vs_argument',
            label='Высокая плотность цитирования: '
                  'убедиться, что цитаты не заменяют собственный аргумент',
            source=f'citation_density={cd}/1k', strength='soft', value=cd))

    # Стиль цитирования
    if cite_d['consistency'] < 0.7:
        rules.append(BehavioralRule(
            type='limit', id='citation_style_consistency',
            label=f'Унифицировать стиль цитирования: '
                  f'выбрать один формат из допустимых ВШЭ '
                  f'([N, с. N] или (Автор, год)) и применять последовательно',
            source=f'citation_consistency={cite_d["consistency"]}',
            strength='soft', value=cite_d['consistency']))

    # Структурные маркеры
    if acad_d['raw']['intro_markers'] == 0 and ad > 1:
        rules.append(BehavioralRule(
            type='check', id='intro_structure',
            label='Академический текст без явных маркеров введения: '
                  'добавить актуальность, цель, задачи — '
                  'или это намеренный жанровый сдвиг?',
            source='intro_markers=0', strength='soft', value=0))
    return rules
```

---

### ВШЭ-критерии качества как `checks` в паспорте

ВШЭ-документ перечисляет критерии оценки письменных работ:

```python
# Прямое отображение критериев ВШЭ → поля YAML
HSE_CRITERIA_TO_CHECKS = {
    'содержание и актуальность':    'content_relevance',
    'самостоятельность':            'originality_of_argument',
    'оригинальность выводов':       'novel_conclusions',
    'полнота источников':           'source_coverage',
    'язык и стиль':                 'register_appropriateness',
    'профессиональность':           'terminological_accuracy',
}
# Использовать при генерации паспорта для авторов академических текстов:
# checks += list(HSE_CRITERIA_TO_CHECKS.values())
```

---

### Жанровый сдвиг как стилистический факт

Самое ценное в ВШЭ-документе для RuWritingStyles — не сами нормы, а **возможность измерить отклонение от них**.

Три типа жанрового сдвига, диагностически значимых:

**Сдвиг вниз** (академик пишет как блогер): высокий `essay_density`, низкий `formality_index` в текстах, которые должны быть академическими. Признак: автор намеренно выходит из академического регистра — это стилистический выбор, а не ошибка. У Гасунса — систематический.

**Сдвиг вверх** (блогер пишет как академик): высокий `formality_index` в Telegram-постах. Признак: автор не снимает академической брони даже в личном канале. Контрпример к Гасунсу.

**Смешанный регистр**: `formality_index` около 0,5, `genre_signal = 'смешанный'`. Самый интересный случай — авторы, которые знают оба регистра и переключаются между ними внутри одного текста. Это нужно зафиксировать как отдельный check: `ironic_register_consistency` (уже есть в матрице) + `genre_mixing_intentional`.

---

### Конфигурация для академических авторов

Для авторов, у которых в корпусе есть академические тексты (не только Telegram):

```python
# В full_pipeline() добавить:
if has_academic_texts:
    acad_d = academic_deviation_index(academic_texts)
    cite_d = hse_citation_style(academic_texts)
    rules += translate_academic_baseline(acad_d, cite_d)
    
    # Жанровая разметка каждого текста
    for d in academic_texts:
        d['genre'] = detect_genre_by_length(d['text'])
    
    # Сравнение регистров: Telegram vs. академические
    tg_acad   = academic_deviation_index(telegram_texts)
    pure_acad = academic_deviation_index(academic_texts)
    register_gap = round(
        pure_acad['formality_index'] - tg_acad['formality_index'], 3)
    # register_gap > 0.3 → автор переключает регистры осознанно
    # register_gap < 0.1 → единый регистр во всех жанрах
```

---

### Промпт-дополнение для Codex (академические авторы)

```
Если в корпусе автора есть академические тексты (статьи, тезисы,
учебные материалы) — отдельно от Telegram:

1. Запустить academic_deviation_index() на академических текстах
2. Запустить hse_citation_style() для анализа стиля цитирования
3. Для каждого текста: detect_genre_by_length() → добавить поле 'genre'
4. Сравнить formality_index в Telegram vs. в академических текстах:
   - register_gap > 0.3 → отдельный check 'register_switching_intentional'
   - register_gap < 0.1 → check 'uniform_register_across_genres'
5. Добавить translate_academic_baseline() к общему списку rules
6. В _rules.md добавить раздел ## Академический регистр
7. В YAML: добавить в best_for жанры, в которых автор работает

ПРИМЕЧАНИЕ: ВШЭ-норма — НЕ единственный стандарт.
Для авторов из других институций (МГУ, СПбГУ, РАН) нормы могут
отличаться в деталях цитирования и структуры, но таксономия
жанров (эссе / реферат / курсовая) и критерии качества универсальны
для российской академической традиции.
```

---

### Стилометрические методы

| Метод | Источник | Применение |
|---|---|---|
| MSTTR | Malvern et al. 2004 | Лексическое богатство |
| Log-likelihood G² | Dunning 1993 | Keyness |
| POS-профиль | Burrows 1987; Craig & Kinney 2009 | Авторская подпись |
| Verb/Noun ratio | Biber 1988 | Устность/письменность |
| Hypo/para ratio | Halliday 1985 | Синтаксическая сложность |

### Лингвистические основания (московская школа)

| Концепция | Автор | Применение в анализе |
|---|---|---|
| Интегральное описание языка | Апресян 1995 | Лексические функции, коллокации |
| Концепты русской ментальности | Шмелёв 2002 | Недопредставленные слова кейнесса |
| Эпистемическая модальность | Падучева 1985 | Категории модальности |
| Морфологический словарь | Зализняк 1977/2003 | Падежный профиль |
| Частотный словарь НКРЯ | Ляшевская, Шаров 2009 | Референсный корпус |

### Типология литературного портрета

| Подход | Источник | Применение |
|---|---|---|
| 4 слоя портрета (физический, социальный, духовный, характероцентрический) | Атаманова, Фёдорова, Распопова 2024 | Структура качественного раздела |
| Жанрообразующие признаки (бессюжетность, 3 контекста, «досказывает», пересечение авто/биографии) | Зайцева, Максимова 2022 | Анализ портретных постов |
| Приёмы: сравнение, градация, литота, трансформация регистра | Адаптировано из обеих статей | Художественные приёмы автора |

---

## Интеграция с НКРЯ: протокол

### Уровень 1 (ручной, без кода)
1. Открыть ruscorpora.ru → Портрет подкорпуса
2. Настроить подкорпус по жанру (публицистика / блоги / художественная)
3. Скачать CSV частотного словаря подкорпуса
4. Загрузить как `ref_ipm` в функцию `keyness()`

### Уровень 2 (автоматический через API)
```python
# Обновить REF_IPM для топ-20 ключевых слов автора:
for word in top_keywords:
    freq_data = rnc_word_freq(word, subcorpus='paper')
    ref_ipm[word] = freq_data['ipm']
```

### Уровень 3 (верификация конструкций)
```python
# Для каждой нестандартной конструкции:
constructions = [
    '[word="[0-9]+"] [lemma="год"] [word="тому"] [word="назад"]',
    '[word="всеравно"]',
]
for cql in constructions:
    info = rnc_verify_construction(cql)
    print(info['url'])  # открыть в браузере, записать частоту
```

### Уровень 4 (семантический профиль)
```python
# Для топ-5 ключевых слов:
for word in ['санскрит', 'занятие', 'перевод', 'ревнители', 'горжусь']:
    neighbors = semantic_neighbors(word, pos='NOUN')
    # Сравнить с контекстным окружением в корпусе автора
    context_words = get_context_words(texts, word, window=3)
    # Расхождение = авторская семантическая специфика
```

---

## Промпт для GPT-5.5 в Codex

```
Ты работаешь над стилистическим портретом для проекта RuWritingStyles
(github.com/gasyoun/RuWritingStyles).

АРХИТЕКТУРА ПРОЕКТА:
  Один автор = несколько жанровых субстилей.
  Handle = [автор]-[жанр]  (пример: zalizniak-ocherk, zalizniak-zametki).
  Корпус ОДНОГО прогона = тексты ОДНОГО жанра (не смешивать!).

ИЗВЕСТНЫЕ АВТОРЫ И HANDLES В РЕПОЗИТОРИИ:
  zalizniak-ocherk        А. А. Зализняк, грамматический очерк
  zalizniak-enklitiki     А. А. Зализняк, реконструкция механизма
  zalizniak-udarenie      А. А. Зализняк, историческая акцентология
  zalizniak-shkolnikov_1  А. А. Зализняк, объяснение неспециалистам
  zaliznyak-novgorod      А. А. Зализняк, берестяные грамоты
  zalizniak-imennoe       А. А. Зализняк, формальное словоизменение
  zalizniak-slovo         А. А. Зализняк, подлинность памятника
  zalizniak-zametki       А. А. Зализняк, полемика с любит. лингвистикой
  albedil-sbornik         Albedil, востоковедный юбилейный сборник
  kazanskiy-korpus        Казанский, филологический комментарий
  lidova-commentary       Лидова, история комментария/канона
  tronsky-readings        Tronsky-Readings, классическая филология
  melchuk                 И. А. Мельчук, системный грамматический рецензент
  gasuns_telegram         М. Ю. Гасунс, личный Telegram-канал

ВХОД:
  Автор:  [ИМЯ]
  Жанр:   [ЖАНР из GENRE_TYPES в скрипте]
  Handle: [автор]-[жанр]
  Файл:   [ПУТЬ к жанрово однородному корпусу]
  Режим:  tg | txt | csv

ЗАДАЧА: создать четыре файла:
  ClaudeStyles/[handle]_stylometry.md   — числа и таблицы
  ClaudeStyles/[handle]_rules.md        — правила (ПРОВЕРИТЬ ВРУЧНУЮ!)
  ClaudeStyles/[handle]_dh_section.md   — DH-раздел для _style.md
  styles/passports/[автор].yml          — паспорт (один на автора)

ШАГИ:

1. Загрузить и проверить:
   texts = load(mode, path)
   assert len(texts) >= 30  # для 200+ — надёжные метрики
   Убедиться, что все тексты относятся к одному жанру.

2. В DEFAULT_CONFIG задать:
   genre         — тип из GENRE_TYPES (обязательно)
   main_intonation — '' (заполнить вручную на шаге 5 — ключевое поле!)
   personal_kw   — личные темы (прочитать 30–50 текстов)
   work_kw       — профессиональные темы
   l2_pattern    — regex второго языка автора
   manual_limits — из раздела «Что исключать» в _style.md
   EPISTEMIC['ironic_cite'] — найти вручную формулы иронии в корпусе

3. Запустить:
   python3 rws_pipeline.py [mode] [file] [handle] "[Имя Автора]"

4. ОБЯЗАТЕЛЬНО проверить [handle]_rules.md:
   - Нет противоречий (hard vs soft на одно явление)
   - manual_limits включены корректно
   - Добавить правила, которые числа не уловят:
     жанровая этика, табуированные темы, позиция автора

5. Сформулировать main_intonation — ОДНА прескриптивная фраза:
   Не «что написано», а «что агент должен воспроизводить».
   Примеры:
     «Системная точность и спокойная научная уверенность»
     «Понятная научная полемика с точной иронией»
     «Ясность, уважение к читателю, доступность без упрощения»
     «Научная предметность с тёплой интонацией дара»
     «Судебно-филологическая проверка фактов и веса доказательств»
   Добавить в DEFAULT_CONFIG, перезапустить пайплайн.

6. Разместить файлы:
   ClaudeStyles/[handle]-style.md → писать вручную + вставить _dh_section
   styles/passports/[автор].yml   → один паспорт суммирует все жанры автора

КРИТЕРИИ КАЧЕСТВА:
  _rules.md:  ≥ 10 правил, каждое с полем source
  .yml:       checks ≥ 4, limits.hard ≥ 2, prompt_rules ≥ 5
              main_intonation заполнен (не пустая строка)
  YAML:       yaml.safe_load() без исключений

НКРЯ-ИНТЕГРАЦИЯ (если есть доступ к сети):
  rnc_word_freq(word, subcorpus)    → уточнить ref_ipm для терминов
  rnc_verify_construction(cql)      → проверить нестандартный синтаксис
  semantic_neighbors(word)          → сравнить с контекстом в корпусе
```

---

## Эталонные значения (Гасунс, 2022–2026)

Для калибровки при межавторском сравнении:

| Метрика | Гасунс | Правила, порождаемые |
|---|---|---|
| MSTTR 0,7763 | богатая лексика | `lexical_variety`, `no_filler_repetition` |
| verb/noun 0,127 | именной (термины) | `nominal_style_ok`, `no_paraphrase_of_terms` |
| adj/noun 0,099 | не описательный | `spare_adjectives` |
| nominalization 0,478 | живая речь | `no_nominalization` (soft) |
| hedge/assert 1,05 | паритет | `epistemic_balance` |
| ironic_cite 1773 ipm | ирония через архаику | `ironic_register_consistency` (hard), `no_irony_explanation` (hard) |
| hypo/para 0,251 | координационный | `paratactic_rhythm`, `no_deep_subordination` |
| «не» / 1k 14,4 | умеренное | `rhetorical_question_neg` |
| weekday_cv 0,12 | дневниковый | `daily_cadence`, `deliberate_posts` (hard) |
| bursts 3 | обдуманный | `deliberate_posts` (hard) |
| pct_link_only 11,8% | не агрегатор | `link_as_supplement` |
| keyness: кто G²=1315 | вопрос как форма | `question_as_opening`, `question_opening` |
| underrepresented: человек, жизнь | избегает концептов | `avoid_abstract_concepts` |
| code-switching: medial | в середине | `codeswitching_medial`, `foreign_in_brackets` |

**Покрытие матрицы трансляции:** все 12 измерительных модулей транслируются в правила. Ни одно числовое измерение не остаётся «декоративным».

---

## Методологические основания

### Стилометрические методы

| Метод | Источник | Применение |
|---|---|---|
| MSTTR | Malvern et al. 2004 | Лексическое богатство |
| Log-likelihood G² | Dunning 1993 | Keyness |
| POS-профиль | Burrows 1987; Craig & Kinney 2009 | Авторская подпись |
| Verb/Noun ratio | Biber 1988 | Устность/письменность |
| Hypo/para ratio | Halliday 1985 | Синтаксическая сложность |

### Лингвистические основания: Апресян и Падучева как метатеория

Полное теоретическое обоснование → [`THEORY.md`](THEORY.md)

Здесь — сводка ключевых соответствий: какой модуль пайплайна опирается на какой теоретический концепт.

**Апресян** (интегральное описание, лексические функции, картина мира):

| Модуль | Концепт Апресяна |
|---|---|
| TTR / MSTTR | Семантическая насыщенность — плотность активируемых полей |
| Кейнесс (overrepresented) | Сигнатурное поле идиолекта; лексическая функция как норма отклонения |
| Кейнесс (underrepresented) | Концепты «наивной картины мира» — их отсутствие маркирует специализированный идиолект |
| POS / номинализация | Трансформация событие→объект; статический vs. динамический тип предиката |
| Код-свитчинг | Коннотативное значение слова — его регистровая принадлежность |
| Матрица трансляции | Обратная МТТ: от поверхности к системе предписаний |

**Падучева** (высказывание, точка зрения, модальность):

| Модуль | Концепт Падучевой |
|---|---|
| Эпистемическая модальность | Типология модальности: эпистемическая, эвиденциальная, деонтическая |
| `ironic_cite` | Несобственно-прямая речь — дистанцирование от чужого слова через иронию |
| Синтаксическая глубина | Пропозициональные установки: гипотаксис эксплицирует, паратаксис оставляет имплицитным |
| Отрицание / риторический вопрос | Семантика отрицания; риторический вопрос как хеджирование через синтаксис |
| `main_intonation` | Точка зрения (нарративная перспектива): дейктический центр + эпистемическая позиция |

**Практические следствия:**

1. **Числа объясняются через теорию.** Hypo/para = 0,25 у Гасунса — не «мало придаточных», а «предпочтение имплицитных пропозициональных связей» (Падучева). Это интерпретация, а не просто цифра.

2. **Идиолект отличается от ошибки.** Если признак стабилен во всех жанрах одного автора (системный — в терминах Апресяна), правило `hard`. Если ситуативен — `soft`.

3. **`main_intonation` — падучевская «точка зрения».** Для каждого стиля можно указать дейктический центр, эпистемическую позицию и отношение к чужому слову. Именно это три вопроса должна отвечать строка `main_intonation`.

### Типология литературного портрета

| Подход | Источник | Применение |
|---|---|---|
| 4 слоя портрета | Атаманова, Фёдорова, Распопова 2024 | Структура качественного раздела |
| Жанрообразующие признаки | Зайцева, Максимова 2022 | Анализ портретных постов |
| Академическая норма | ВШЭ, Методрекомендации 2019 | Baseline для академического регистра |
