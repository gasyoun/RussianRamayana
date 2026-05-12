# RuWritingStyles: Как проверить статью в CLI

Руководство для тех, кто открывает терминал впервые.  
Пример: статья Гасунса «Комментаторские стратегии русских переводчиков санскритского эпоса» vs. стиль `tronsky-readings`.

---

## Что здесь происходит

Вы берёте готовую статью в формате `.docx` и проверяете:
1. **Стилометрически** — совпадают ли числовые параметры с ожиданиями жанра
2. **Качественно** — соответствует ли текст требованиям конкретного стиля из репозитория через Claude

Два этапа, оба в терминале.

---

## Шаг 0. Установка (один раз)

```bash
# Клонировать репозиторий
git clone https://github.com/gasyoun/RuWritingStyles.git
cd RuWritingStyles

# Установить зависимости Python
pip install pyyaml python-docx

# Проверить установку
python3 -c "import yaml, docx; print('OK')"
```

Положить `rws_pipeline.py` в корень репозитория (скачать из сессии или скопировать).

---

## Шаг 1. Конвертировать docx → txt

```bash
python3 - << 'EOF'
from docx import Document
import sys

path = "CommentaryStrategies_Tronsky30_Kostina.docx"   # ← ваш файл
out  = "article.txt"

doc  = Document(path)
text = "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())

with open(out, "w", encoding="utf-8") as f:
    f.write(text)

print(f"Готово: {len(text):,} символов → {out}")
EOF
```

Это создаёт `article.txt` — чистый текст без разметки Word.

> **Альтернатива через pandoc** (если установлен):
> ```bash
> pandoc CommentaryStrategies_Tronsky30_Kostina.docx -t plain -o article.txt
> ```

---

## Шаг 2. Стилометрический прогон

```bash
# Формат: python3 rws_pipeline.py <режим> <файл> <handle> "Имя Автора"
python3 rws_pipeline.py txt article.txt kostina-tronsky30 "М. Ю. Гасунс"
```

Через 3–5 секунд в папке `out/` появятся четыре файла:

```
out/
  kostina-tronsky30_stylometry.md    ← числа и таблицы
  kostina-tronsky30_rules.md         ← поведенческие правила
  kostina-tronsky30_dh_section.md    ← DH-раздел
  kostina-tronsky30.yml              ← машиночитаемый паспорт
```

---

## Шаг 3. Читать отчёт

В конце прогона в терминале — быстрый отчёт. Для данной статьи:

```
MSTTR 0.7726  V/N 0.091  H/A 0.48  hypo/para 0.147
Формальность 1.0 → реферат/курсовая
Keyness топ-3: комментарий, примечание, или
```

### Что означают числа и как сравнивать со стилем `tronsky-readings`

Ожидаемый профиль жанра «Tronsky-Readings» —  
*«Небольшая специальная статья по классической филологии.  
Плотная источниковедческая работа без публицистики.»*

| Метрика | Статья | Ожидание для жанра | Вывод |
|---|---|---|---|
| **MSTTR** (лексическое богатство) | 0.773 | > 0.72 | ✅ Богатая лексика |
| **V/N** (глаголы / существительные) | 0.091 | < 0.15 | ✅ Именной стиль, терминологическая плотность |
| **H/A** (хеджирование / уверенность) | **0.48** | 0.6–1.0 | ⚠️ Слишком ассертивен — меньше оговорок, чем ожидается в академическом тексте |
| **hypo/para** (подчинение / сочинение) | **0.147** | > 0.40 | ⚠️ Неожиданно низкий — в академической статье обычно больше придаточных («который», «потому что») |
| **Формальность** | 1.0 | > 0.8 | ✅ Академический регистр |
| **Keyness** | комментарий, примечание | предметная лексика поля | ✅ Тематически точно |

**Два флага требуют внимания:**

**H/A = 0.48** — автор утверждает уверенно, оговорок мало. Для академической работы по классической филологии это может быть нормой (уверенность в материале), но стоит проверить: не нужно ли добавить «по всей видимости», «можно предположить» там, где аргументация строится на единичных примерах.

**hypo/para = 0.147** — Гасунс соединяет клаузы через «и», «а», «но» чаще, чем через «который» и «потому что». Это не ошибка — это его синтаксический отпечаток, видный ещё в Telegram. В жанре tronsky-readings (плотная источниковедческая работа) это создаёт эффект «разговорной» академичности. Нормально или нет — зависит от требований сборника.

---

## Шаг 4. Качественная проверка через Claude

Это второй уровень — не числа, а чтение. Claude проверяет статью с точки зрения конкретного стиля.

### 4a. Получить текст нужного стиля

```bash
# Стиль tronsky-readings
cat ClaudeStyles/tronsky-readings-style.md
```

### 4b. Использовать Claude CLI (если установлен Claude Code)

```bash
# Проверка на соответствие стилю tronsky-readings
claude -p "$(cat ClaudeStyles/tronsky-readings-style.md)

Ты проверяешь академическую статью на соответствие этому стилю.
Формат ответа:
  ✅ Соответствует: [перечислить что работает]
  ⚠️ Замечания: [конкретные места с цитатой и пояснением]
  ❌ Нарушения: [что явно выбивается из стиля]

Статья:
$(cat article.txt)" 2>/dev/null
```

### 4c. Через API (если нет Claude Code)

```bash
# Создать файл проверки
cat > check.py << 'EOF'
import anthropic, sys

style_file = sys.argv[1]    # путь к style.md
article_file = sys.argv[2]  # путь к article.txt

style   = open(style_file,   encoding="utf-8").read()
article = open(article_file, encoding="utf-8").read()

client  = anthropic.Anthropic()          # нужен ANTHROPIC_API_KEY в окружении
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=2000,
    system=style,
    messages=[{
        "role": "user",
        "content": f"""Проверь эту статью на соответствие твоему стилю.

Дай конкретный разбор по трём пунктам:
✅ Что соответствует (с примерами из текста)
⚠️ Замечания (конкретные места, где стиль теряется)
❌ Нарушения (явные отступления от требований жанра)

Статья:
{article[:8000]}"""
    }]
)
print(message.content[0].text)
EOF

# Запустить
export ANTHROPIC_API_KEY="sk-ant-..."   # вставить ключ
python3 check.py ClaudeStyles/tronsky-readings-style.md article.txt
```

---

## Шаг 5. Проверить на несколько стилей сразу

Статья может соответствовать нескольким стилям. Для данной работы релевантны:

```bash
for style in tronsky-readings kazanskiy-korpus lidova-commentary; do
    if [ -f "ClaudeStyles/${style}-style.md" ]; then
        echo ""
        echo "═══ Проверка: ${style} ═══"
        python3 check.py "ClaudeStyles/${style}-style.md" article.txt
    else
        echo "⚠️  ClaudeStyles/${style}-style.md не найден"
    fi
done
```

---

## Шаг 6. Обновить DEFAULT_CONFIG под статью (если нужен паспорт)

По умолчанию скрипт настроен под Telegram-канал Гасунса. Для академической статьи нужно поменять в `rws_pipeline.py`:

```python
DEFAULT_CONFIG = {
    'genre': 'readings',          # ← вместо 'telegram_channel'
    'main_intonation': 'Плотная источниковедческая работа без публицистики',
    'personal_kw': ['корпус', 'репозиторий', 'материал', 'выборка'],
    'work_kw': ['примечание', 'комментарий', 'перевод', 'стратегия',
                'параметр', 'типология', 'корпусный', 'параллельный'],
    'thematic_top': [
        'комментаторские стратегии',
        'параллельный корпус',
        'типология примечания',
        'история востоковедения',
        'санскритский эпос',
    ],
    'can_reply_to': ['indology', 'corpus_linguistics', 'translation_studies'],
    'manual_limits': [
        'Не допускать публицистического тона',
        'Не обобщать без корпусного обоснования',
        'Не смешивать термины традиционной и академической систем без оговорки',
    ],
    'manual_checks': [
        'Все санскритские термины при первом вводе — с расшифровкой',
        'Каждое обобщение — с указанием охвата выборки',
    ],
    'level': 'public',
    'l2_pattern': r'[āēīūžčšģķļņŗ]',   # деванагари и латинская транслитерация
}
```

Затем заново:
```bash
python3 rws_pipeline.py txt article.txt kostina-tronsky30 "М. Ю. Гасунс"
```

---

## Быстрая шпаргалка

```
# Конвертировать docx → txt
python3 -c "from docx import Document; \
open('a.txt','w').write('\n\n'.join(p.text for p in Document('file.docx').paragraphs if p.text.strip()))"

# Стилометрия
python3 rws_pipeline.py txt article.txt handle-genre "Автор"

# Качественная проверка через Claude API
python3 check.py ClaudeStyles/tronsky-readings-style.md article.txt
```

---

## Что делать с результатами

| Сигнал | Что означает | Действие |
|---|---|---|
| hypo/para < 0.30 | Синтаксис слишком координационный для жанра | Проверить: достаточно ли в тексте придаточных при сложных аргументах |
| H/A < 0.60 | Мало хеджирования | Добавить «по всей видимости», «можно предположить» в спорные места |
| MSTTR < 0.68 | Лексика повторяется | Найти ключевые слова-паразиты в keyness и поработать с синонимией |
| Claude: ⚠️ или ❌ | Конкретные места | Правка по указанным цитатам |
| Claude: всё ✅ | Статья соответствует стилю | Файл готов к отправке |

---

## Если что-то не работает

**`ModuleNotFoundError: No module named 'docx'`**
```bash
pip install python-docx
```

**`ModuleNotFoundError: No module named 'yaml'`**
```bash
pip install pyyaml
```

**`ANTHROPIC_API_KEY` не задан**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
# или добавить в ~/.zshrc / ~/.bashrc
```

**Файл стиля не найден (`ClaudeStyles/tronsky-readings-style.md`)**
```bash
ls ClaudeStyles/    # посмотреть, что есть в репо
```
Если файла нет — жанр ещё не добавлен в проект. Можно добавить через PR.
