#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
triage_log.py — DeepSeek-триаж лога индексирования `<вёрстка>=log.txt` (H377, роль d).

Стадия [3] (`ProcStoryOrDoс`) пишет в лог термины, для которых index-маркер
поставить не удалось (формат: блоки с датой, затем строки с табуляцией
«<термин/образец> [страница | ???]»). Сейчас оператор разбирает лог вручную.
Этот скрипт классифицирует каждую строку через deepseek-chat по трём классам
(решение MG 08-07-2026):

  * markup_error   — ошибка разметки (тег в тексте есть, а grep-запрос его не
                     находит: сандхи-слипание, перенос, кавычки, пунктуация);
  * missing_form   — пропущенная падежная/словоизменительная форма в словнике;
  * frequent_name  — частотное имя (Рама, Сита…), где совпадений слишком много
                     и нужен ручной выбор вхождений.

Результат — `<лог>-triage.md` рядом с логом: таблица «строка → класс →
рекомендация». Лог и вёрстка не изменяются.

Бюджет: $20 по умолчанию (--budget), running-стоимость после каждого вызова,
останов на 95% (уже разобранные строки сохраняются).

Запуск:
    python triage_log.py "<путь к ...=log.txt>"
    python triage_log.py <лог> --batch 20 --budget 5

Зависимости: только stdlib (+ deepseek_common рядом).

_Автор: Dr. Mārcis Gasūns · создан 10-07-2026 (H377)._
"""

import argparse
import datetime
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from deepseek_common import BudgetExceeded, DeepSeekClient  # noqa: E402

SYSTEM_PROMPT = (
    "Ты помогаешь оператору InDesign разбирать лог неудач автоматического "
    "индексирования русского перевода «Рамаяны». Каждая строка лога — термин "
    "указателя (или образец поиска), для которого маркер указателя поставить "
    "не удалось. Классифицируй КАЖДУЮ строку по одному из классов:\n"
    "- markup_error — похоже на ошибку разметки/поиска: пунктуация, кавычки, "
    "переносы, слипания, регекс-артефакты в образце;\n"
    "- missing_form — похоже, что в словнике не хватает словоформы (термин в "
    "косвенном падеже/множественном числе, которого нет в наборе);\n"
    "- frequent_name — частотное имя главного героя/топонима, где вхождений "
    "слишком много и нужен ручной выбор.\n"
    "Отвечай СТРОГО JSON-массивом объектов, по одному на строку, в исходном "
    'порядке: [{"line": "<исходная строка>", "class": "markup_error" | '
    '"missing_form" | "frequent_name", "advice": "одна строка рекомендации '
    'по-русски"}]'
)

LOG_LINE = re.compile(r"^\t(.+)$")


def parse_log(path):
    """Строки-неудачи из лога (без дат-заголовков блоков)."""
    lines = []
    with open(path, "r", encoding="utf-8-sig", errors="replace") as fh:
        for raw in fh:
            m = LOG_LINE.match(raw.rstrip("\r\n"))
            if m:
                lines.append(m.group(1))
    return lines


def classify_batch(client, batch):
    user = "Строки лога:\n" + "\n".join("%d. %s" % (i + 1, s) for i, s in enumerate(batch))
    raw = client.chat(SYSTEM_PROMPT, user, max_tokens=200 + 120 * len(batch))
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw[raw.find("["):raw.rfind("]") + 1]
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return data
    except ValueError:
        pass
    return [{"line": s, "class": "unparsed", "advice": "ответ LLM не разобран"}
            for s in batch]


def main(argv=None):
    ap = argparse.ArgumentParser(description="DeepSeek-триаж лога индексирования")
    ap.add_argument("log", help="путь к <вёрстка>=log.txt")
    ap.add_argument("--batch", type=int, default=20, help="строк на один вызов LLM")
    ap.add_argument("--budget", type=float, default=None, help="бюджет прогона, $")
    ap.add_argument("--report", help="путь к md-отчёту")
    args = ap.parse_args(argv)

    if not os.path.isfile(args.log):
        print("Лог не найден: %s" % args.log, file=sys.stderr)
        return 2
    lines = parse_log(args.log)
    if not lines:
        print("В логе нет строк-неудач (формат: строки с табуляцией).")
        return 0

    client = DeepSeekClient(budget_usd=args.budget)
    results = []
    stopped = ""
    try:
        for i in range(0, len(lines), args.batch):
            results.extend(classify_batch(client, lines[i:i + args.batch]))
    except BudgetExceeded as e:
        stopped = str(e)
        print(stopped, file=sys.stderr)

    counts = {}
    for r in results:
        counts[r.get("class", "?")] = counts.get(r.get("class", "?"), 0) + 1

    report = args.report or (os.path.splitext(args.log)[0] + "-triage.md")
    today = datetime.date.today().strftime("%d-%m-%Y")
    with open(report, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("# Триаж лога индексирования\n\n")
        fh.write("_Created: %s · Last updated: %s_\n\n" % (today, today))
        fh.write("Источник: `%s` · строк: %d · модель: `%s` · %s\n\n"
                 % (os.path.basename(args.log), len(lines), client.model,
                    client.cost_line()))
        fh.write("Классы: %s\n\n" % ", ".join(
            "%s — %d" % (k, v) for k, v in sorted(counts.items())))
        if stopped:
            fh.write("**Прогон остановлен бюджетным стопом:** %s\n\n" % stopped)
        fh.write("| # | Строка лога | Класс | Рекомендация |\n|---|---|---|---|\n")
        for i, r in enumerate(results, 1):
            fh.write("| %d | %s | %s | %s |\n" % (
                i, r.get("line", "").replace("|", "/"), r.get("class", "?"),
                r.get("advice", "").replace("|", "/")))
        fh.write("\n_Сгенерировано `tools/copilot/triage_log.py`; лог не изменялся._\n")
    print("Отчёт: %s · строк: %d · классы: %s" % (report, len(results), counts))
    print(client.cost_line())
    return 0


if __name__ == "__main__":
    sys.exit(main())
