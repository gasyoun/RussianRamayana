# Аудит и рекомендации: rws_pipeline.py

**Статус репозитория:** GitHub блокирует прямое чтение через robots.txt.  
Аудит проведён на файле из сессии — том, что был загружен в репо.

**Итог:** код работает корректно, существенных уязвимостей нет.  
Найдено **7 проблем** разной степени серьёзности.

---

## Проблемы и исправления

### 🔴 1. `bare except: pass` на строке 510 — скрывает реальные ошибки

**Где:** функция `posting_rhythm()`.

```python
# СЕЙЧАС (плохо)
try:
    dt = datetime.fromisoformat(d["date"])
    hours.append(dt.hour)
    ...
except: pass          # ← ловит ВСЁ, включая KeyboardInterrupt
```

```python
# ИСПРАВЛЕНИЕ
except (ValueError, KeyError, TypeError):
    pass              # ← только ожидаемые ошибки парсинга дат
```

**Почему важно:** `bare except` ловит `KeyboardInterrupt`, `SystemExit`,
`MemoryError` — пользователь не сможет прервать зависший скрипт через Ctrl+C.

---

### 🟡 2. `list[dict]` в аннотациях — требует Python 3.9+

**Где:** `journal_check()` (строки 811–836) и `Rule` dataclass.

```python
# СЕЙЧАС — только Python 3.9+
def journal_check(texts: list[dict],
                  keywords: list[str] = None, ...):
```

```python
# ИСПРАВЛЕНИЕ — совместимо с Python 3.7+
from __future__ import annotations   # добавить в самый верх файла
# или:
from typing import List, Dict, Optional
def journal_check(texts: List[Dict],
                  keywords: Optional[List[str]] = None, ...):
```

**Почему важно:** на многих серверах и в Colab стоит Python 3.8.
Скрипт молча упадёт при импорте.

---

### 🟡 3. Мутабельный глобальный `EPISTEMIC` как default — классический Python-баг

**Где:** `epistemic_modality(texts, markers=EPISTEMIC)`.

```python
# СЕЙЧАС (опасно)
EPISTEMIC = {'assertion': [...], 'ironic_cite': [...], ...}

def epistemic_modality(texts, markers=EPISTEMIC):
    ...
    # Если кто-то сделает markers['ironic_cite'].append('новое') —
    # EPISTEMIC глобально изменится для всех последующих вызовов
```

```python
# ИСПРАВЛЕНИЕ — None-sentinel pattern
def epistemic_modality(texts, markers=None):
    if markers is None:
        markers = EPISTEMIC
    ...
```

То же самое для `pos_ru()` → `STOP` и `keyness()` → `REF_IPM`.

---

### 🟡 4. `load_csv()` тихо возвращает пустой список при неверных колонках

**Где:** `load_csv()`.

```python
# СЕЙЧАС
text = (row.get('text') or row.get('content') or row.get('body') or '')
# Если ни одной колонки нет — text = '' → пост отброшен → пустой список
# Пользователь видит: "0 постов" без объяснения причины
```

```python
# ИСПРАВЛЕНИЕ
def load_csv(path: str) -> list:
    import csv
    out = []
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError(f"Пустой CSV или нет заголовков: {path}")
        text_cols = [c for c in reader.fieldnames
                     if c.lower() in {'text','content','body'}]
        if not text_cols:
            raise ValueError(
                f"Не найдены колонки text/content/body. "
                f"Найдены: {reader.fieldnames}")
        for row in reader:
            text = row.get(text_cols[0], '').strip()
            date = (row.get('date') or row.get('timestamp')
                    or row.get('created_at') or '')
            if len(text) > 20:
                out.append({'date': date, 'text': text})
    return out
```

---

### 🟡 5. Нет проверки пустого корпуса в `main()`

**Где:** `main()` после загрузки.

```python
# СЕЙЧАС
texts = load(mode, path)
stats = corpus_stats(texts)
# Если texts == [] — все функции вернут нули или упадут с ZeroDivisionError
```

```python
# ИСПРАВЛЕНИЕ — добавить после load()
if not texts:
    print(f"❌ Корпус пуст: {path}")
    print("   Проверьте формат файла и наличие текстовых данных.")
    sys.exit(1)
if len(texts) < 30:
    print(f"⚠️  Мало текстов: {len(texts)} (надёжные метрики — от 100)")
```

---

### 🟢 6. `OUT = "out"` хардкод — нельзя изменить без правки кода

**Где:** строка `OUT = "out"`.

```python
# ИСПРАВЛЕНИЕ — argparse
import argparse

def parse_args():
    p = argparse.ArgumentParser(
        description='RuWritingStyles pipeline')
    p.add_argument('mode', choices=['tg','txt','csv'])
    p.add_argument('file')
    p.add_argument('handle')
    p.add_argument('author', nargs='*', default=['Unknown'])
    p.add_argument('--out', default='out',
                   help='Output directory (default: out)')
    p.add_argument('--journal', default=None,
                   choices=list(JOURNAL_PROFILES),
                   help='Run journal_check after pipeline')
    p.add_argument('--article-type', default='empirical',
                   choices=['empirical','theoretical'])
    return p.parse_args()
```

Тогда: `python3 rws_pipeline.py tg export.json handle "Author" --out results/`

---

### 🟢 7. Нет `__version__` и `requirements.txt`

```python
# Добавить в начало файла (после shebang):
__version__ = "1.2.0"
__author__ = "gasyoun"
__requires__ = ["pyyaml>=5.0"]
```

```
# requirements.txt (новый файл в корне репо):
pyyaml>=5.0
python-docx>=0.8.11   # опционально, для docx
```

---

## Сводная таблица

| # | Серьёзность | Проблема | Файл / строка | Усилие |
|---|---|---|---|---|
| 1 | 🔴 High | `bare except: pass` — ловит Ctrl+C | L510 | 1 строка |
| 2 | 🟡 Medium | `list[dict]` — только Python 3.9+ | L811–836 | `from __future__ import annotations` |
| 3 | 🟡 Medium | Мутабельный global как default arg | `epistemic_modality`, `keyness` | ~5 строк |
| 4 | 🟡 Medium | `load_csv` тихо возвращает [] | `load_csv()` | ~15 строк |
| 5 | 🟡 Medium | Нет валидации пустого корпуса | `main()` | ~5 строк |
| 6 | 🟢 Low | `OUT` хардкод, нет argparse | `OUT = "out"`, `main()` | ~20 строк |
| 7 | 🟢 Low | Нет `__version__`, `requirements.txt` | — | 2 файла |

---

## Минимальный патч (только критичное)

Три строки, которые стоит поправить прямо сейчас:

```python
# 1. Строка 510: bare except → specific except
except (ValueError, KeyError, TypeError):
    pass

# 2. Начало файла: добавить одну строку
from __future__ import annotations   # совместимость с Python 3.7+

# 3. epistemic_modality: None-sentinel
def epistemic_modality(texts, markers=None):
    if markers is None:
        markers = EPISTEMIC
```

---

## Совместимость с репозиторием

Конфликтов с существующей структурой нет:

| Наш файл | Статус в репо |
|---|---|
| `rws_pipeline.py` | новый файл в корне |
| `README.md` | новый или обновляет существующий |
| `THEORY.md` | новый файл |
| `FAQ.md` | новый файл |
| `ClaudeStyles/gasuns_telegram-style.md` | новый файл |
| `styles/passports/gasuns.yml` | новый файл |
| `ClaudeStyles/zalizniak-*-style.md` | **не трогать** |
| `styles/passports/melchuk.yml` | **не трогать** |

Единственный потенциальный конфликт: если в репо уже появился свой `README.md` —
перед `git push` сделать `git pull --rebase` и сравнить вручную.
