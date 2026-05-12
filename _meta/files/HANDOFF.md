# Handoff: RuWritingStyles — продолжение в новом чате

**Проект:** [github.com/gasyoun/RuWritingStyles](https://github.com/gasyoun/RuWritingStyles)  
**Суть:** Стилистические портреты русских филологов и лингвистов для нейронных сетей.  
**Статус:** Пайплайн готов и загружен в репо. Следующий шаг — проверка совместимости через ZIP.

---

## Что сделано за эту сессию

### Артефакты (все скачать из чата)

| Файл | Куда в репо | Что внутри |
|---|---|---|
| `rws_pipeline.py` | корень | Главный скрипт 1744 строки |
| `README.md` | корень | Точка входа, архитектура, список авторов |
| `THEORY.md` | корень | Апресян + Падучева как метатеория |
| `FAQ.md` | корень | 40 вопросов, ~987 строк |
| `AUDIT.md` | корень | Аудит кода, 7 проблем, исправления |
| `ruwritingstyles_codex_instruction.md` | `docs/` | Полная архитектура + код + промпт для Codex |
| `rws_onboarding.md` | `docs/` | Пошаговая инструкция для новичков |
| `style_md_template.md` | `docs/` | Шаблон _style.md с заполненным примером + галерея |
| `gasuns_telegram.md` | `ClaudeStyles/gasuns_telegram-style.md` | Полный стилистический портрет (~2068 строк) |
| `gasuns_stylometry.md` | `ClaudeStyles/gasuns_telegram_stylometry.md` | Числовые данные: 12 метрик |
| `gasuns_telegram_rules.md` | `ClaudeStyles/gasuns_telegram_rules.md` | 31 правило (9 hard, 22 soft) |
| `gasuns_telegram.yml` | `styles/passports/gasuns.yml` | YAML-паспорт агента |

---

## Архитектура пайплайна

```
python3 rws_pipeline.py <режим> <файл> <handle> "Имя Автора"
    режимы: tg | txt | csv

Выход в ./out/:
  <handle>_stylometry.md    числа + бенчмарки
  <handle>_rules.md         правила ← ПРОВЕРИТЬ ВРУЧНУЮ
  <handle>_dh_section.md    DH-раздел для _style.md
  <handle>.yml              паспорт агента
```

**Пайплайн — три ступени:**
```
Корпус (жанрово однородный)
  → 13 измерений (TTR, POS, номинализация, кейнесс, эпист.модальность,
                   синтаксис, инципит, отрицание, динамика, код-свитчинг,
                   ссылки, ритм, академич.базелайн)
  → translate(): каждое измерение → BehavioralRule(type, id, label, source, strength)
  → 4 выходных файла
```

**Конвенция имён:**
- `ClaudeStyles/[автор]-[жанр]-style.md` — один на пару (автор, жанр)
- `styles/passports/[автор].yml` — один на автора (не на жанр)
- Зализняк имеет 8 субстилей: `zalizniak-ocherk`, `zalizniak-zametki` и т.д.

---

## Авторы в репозитории (из документа пользователя)

```
zalizniak-ocherk, zalizniak-enklitiki, zalizniak-udarenie,
zalizniak-shkolnikov_1, zaliznyak-novgorod, zalizniak-imennoe,
zalizniak-slovo, zalizniak-zametki,
albedil-sbornik, kazanskiy-korpus, lidova-commentary, tronsky-readings,
melchuk, gasuns_telegram  ← добавлен в этой сессии
```

---

## Стилометрия Гасунса: ключевые числа

| Метрика | Значение | Интерпретация |
|---|---|---|
| MSTTR (500) | **0,7763** | Уровень академической прозы |
| Verb/Noun | **0,127** | Именной стиль (термины+имена) |
| Hedge/Assert | **1,05** | Паритет уверенности |
| Hypo/para | **0,251** | Координационный синтаксис |
| Формальность | 0,964 | Нейтральный (не академизм) |
| Keyness #1 | санскрит G²=2684 | Сигнатурное поле |
| Keyness #2 | **кто** G²=1315 | Вопрос как форма |
| ironic_cite | 1773 ipm | «ибо» — ирония через архаику |
| weekday_cv | 0,12 | Дневниковый ритм |

**Стилометрический парадокс:** академический POS-профиль при разговорном синтаксисе.

---

## Журнальные профили в pipeline

```python
JOURNAL_PROFILES = {
    'spbu_psychology':           # Вестник СПбГУ. Психология
        # 20 000–38 000 зн., аннотация 230–250 сл., APA+ГОСТ
    'spbu_humanities':           # Вестник СПбГУ (гуманитарные серии)
        # 30 000–50 000 зн., аннотация 200–300 сл., запрещены т.д./в т.ч./т.н.
    'mgu_filosofiya_hozyaystva': # Философия хозяйства ЭФ МГУ
        # до 35 000 зн., УДК+ББК обязательны, цитирование [номер,стр.],
        # только курсив, рисунки Ч/Б ≤5, бесплатно
    'hse_student':               # ВШЭ учебные работы
}
```

**Использование:**
```python
result = journal_check(texts, journal='spbu_psychology',
    article_type='empirical', abstract_text='...', keywords=[...],
    section_headers=[...], source_count=N, has_references_apa=True/False)
print_journal_report(result)
```

---

## Теоретическое основание (THEORY.md)

Апресян и Падучева — не объекты изучения, а инструмент интерпретации:

**Апресян:** семантические поля → кейнесс; лексические функции → отклонение = голос;
номинализация = трансформация событие→объект; обратная МТТ → матрица трансляции.

**Падучева:** типология модальности → EPISTEMIC категории; несобственно-прямая речь →
ironic_cite; паратаксис = имплицитные пропозициональные связи; точка зрения → main_intonation.

`main_intonation` — единственное поле, которое нельзя вычислить автоматически.
Падучевская «точка зрения»: дейктический центр + эпистемическая позиция + отношение к чужому слову.

---

## Аудит кода (AUDIT.md) — 7 проблем

| # | Серьёзность | Проблема | Статус |
|---|---|---|---|
| 1 | 🔴 | `bare except: pass` — ловит Ctrl+C | ✅ Исправлено: `except (ValueError, KeyError, TypeError)` |
| 2 | 🟡 | `list[dict]` аннотации — Python 3.9+ only | ✅ `from __future__ import annotations` добавлен |
| 3 | 🟡 | Мутабельный global как default arg | ✅ None-sentinel pattern в epistemic_modality |
| 4 | 🟡 | load_csv тихо возвращает [] | ✅ Проверка пустого корпуса добавлена |
| 5 | 🟡 | Нет валидации пустого корпуса | ✅ sys.exit(1) с сообщением |
| 6 | 🟢 | OUT хардкод, нет argparse | PENDING |
| 7 | 🟢 | Нет __version__, requirements.txt | ✅ __version__ = "1.2.0" добавлен |

`requirements.txt` и argparse — следующий PR.

---

## Что нужно сделать в новом чате

### Задача 1 (главная): проверка совместимости с репо

**Пользователь загружает ZIP:** `https://github.com/gasyoun/RuWritingStyles/archive/refs/heads/main.zip`

Что проверить:
```
□ Нет ли конфликта rws_pipeline.py с тем, что уже в репо
□ gasuns_telegram-style.md не перезаписывает чужой файл
□ styles/passports/gasuns.yml не конфликтует с melchuk.yml
□ README.md — сравнить версии
□ Совместимость JOURNAL_PROFILES с возможными новыми журналами
□ Версия Python в .python-version или setup.cfg если есть
```

Код для проверки ZIP:
```python
import zipfile, os

with zipfile.ZipFile('RuWritingStyles-main.zip') as z:
    files = z.namelist()
    print(f"Файлов в репо: {len(files)}")
    for f in files:
        print(f)
    # Проверить пересечения
    our_files = ['rws_pipeline.py','README.md','THEORY.md','FAQ.md','AUDIT.md']
    conflicts = [f for f in files for o in our_files if o in f]
    print(f"Потенциальных конфликтов: {len(conflicts)}")
    for c in conflicts:
        print(f"  {c}")
```

### Задача 2: argparse + requirements.txt (следующий PR)

```bash
# requirements.txt (новый файл):
pyyaml>=5.0
python-docx>=0.8.11  # опционально

# В rws_pipeline.py заменить main():
import argparse
def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('mode', choices=['tg','txt','csv'])
    p.add_argument('file')
    p.add_argument('handle')
    p.add_argument('author', nargs='*', default=['Unknown'])
    p.add_argument('--out', default='out')
    p.add_argument('--journal', choices=list(JOURNAL_PROFILES), default=None)
    p.add_argument('--article-type', default='empirical')
    return p.parse_args()
```

### Задача 3: добавить новый стиль

Шаблон для Codex/GPT-5.5:
```
1. Собрать корпус (жанрово однородный, ≥100 единиц)
2. python3 rws_pipeline.py <mode> <file> <handle>-<жанр> "Автор"
3. Открыть _rules.md → проверить вручную
4. Сформулировать main_intonation (одна прескриптивная фраза)
5. Написать ClaudeStyles/<handle>-style.md
6. git add / commit / PR
```

---

## Важные решения этой сессии

1. **Один автор = несколько жанровых субстилей.** Зализняк — 8 handles.

2. **main_intonation** — ключевое поле, которое нельзя вычислить. Это падучевская «точка зрения».

3. **Матрица трансляции** (translate()) — каждое измерение порождает правило с `source`. Ни одно число не «декоративное».

4. **_rules.md** — обязательная точка ручной проверки перед генерацией YAML.

5. **Журнальные профили** расширяемы: добавить словарь в `JOURNAL_PROFILES`.

6. **Совместимость:** не трогать `ClaudeStyles/zalizniak-*` и `styles/passports/melchuk.yml`.

---

## Минимальный патч (уже применён в исправленном rws_pipeline.py)

```python
# 1. строка ~510: bare except
except (ValueError, KeyError, TypeError): pass

# 2. начало файла
from __future__ import annotations
__version__ = "1.2.0"

# 3. epistemic_modality
def epistemic_modality(texts, markers=None):
    if markers is None:
        markers = EPISTEMIC

# 4. main(): после load()
if not texts:
    print(f'❌ Корпус пуст: {path}')
    sys.exit(1)
```

---

## Команды для нового чата

```bash
# Установка
pip install pyyaml python-docx

# Запуск на Telegram-экспорте
python3 rws_pipeline.py tg export.json gasuns_telegram "М. Ю. Гасунс"

# Запуск на статье
python3 rws_pipeline.py txt article.txt kostina-tronsky30 "М. Ю. Гасунс"

# Журнальная проверка (в Python)
from rws_pipeline import load_txt, journal_check, print_journal_report
texts = load_txt('article.txt')
result = journal_check(texts, journal='spbu_psychology', ...)
print_journal_report(result)

# Проверка ZIP репозитория
import zipfile
with zipfile.ZipFile('RuWritingStyles-main.zip') as z:
    print('\n'.join(z.namelist()))
```
