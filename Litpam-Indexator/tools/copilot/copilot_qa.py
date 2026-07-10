#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
copilot_qa.py — интерактивный копилот оператора Litpam-Indexator (H377, роль c).

Отвечает на вопросы оператора о конвейере указателей «Рамаяны», подавая
deepseek-chat контекст из MANUAL.md (+ по запросу — исходник конкретного
скрипта). Замена «искать по 18 видео»: спросить словами, получить ответ со
ссылкой на раздел руководства.

Запуск (интерактивный):
    python copilot_qa.py
    > как удалить ошибочно поставленный маркер?
    > @UseReadyTable.v.7.jsx почему всегда IndexList-000?
    (префикс @имя-файла подгружает исходник скрипта в контекст вопроса)
    > exit

Разовый вопрос:
    python copilot_qa.py --ask "что делает AddMarker?"

Бюджет: $20 по умолчанию (--budget); running-стоимость печатается после
каждого ответа; на 95% лимита сессия завершается.

Зависимости: только stdlib (+ deepseek_common рядом).

_Автор: Dr. Mārcis Gasūns · создан 10-07-2026 (H377)._
"""

import argparse
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from deepseek_common import BudgetExceeded, DeepSeekClient  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
LITPAM = os.path.abspath(os.path.join(HERE, "..", ".."))
MANUAL = os.path.join(LITPAM, "docs", "indesign-pipeline", "MANUAL.md")
SCRIPTS_ROOT = os.path.join(LITPAM, "#Indexing. Ramayana")

# MANUAL.md целиком ~60-80K знаков — на deepseek-chat это дёшево и влезает в
# контекст; при росте руководства сюда напрашивается выборка разделов.
MAX_SCRIPT_CHARS = 40000

SYSTEM_TMPL = (
    "Ты — копилот оператора конвейера построения указателей к «Рамаяне» в Adobe "
    "InDesign (скрипты ExtendScript М. Иванюшина + документация). Отвечай "
    "по-русски, кратко и практично, ссылайся на разделы руководства и имена "
    "скриптов. Если ответа в материалах нет — так и скажи, не выдумывай.\n\n"
    "=== РУКОВОДСТВО (MANUAL.md) ===\n%s"
)


def find_script(name):
    """Найти скрипт по имени (без учёта регистра) под '#Indexing. Ramayana'."""
    low = name.lower()
    for root, _dirs, files in os.walk(SCRIPTS_ROOT):
        for f in files:
            if f.lower() == low or f.lower().startswith(low):
                return os.path.join(root, f)
    return None


def read_text(path, limit=None):
    with open(path, "r", encoding="utf-8-sig", errors="replace") as fh:
        text = fh.read()
    return text[:limit] if limit else text


def answer(client, system, question):
    script_ctx = ""
    if question.startswith("@"):
        name, _, rest = question[1:].partition(" ")
        path = find_script(name)
        if path:
            script_ctx = ("\n\n=== ИСХОДНИК %s ===\n%s"
                          % (os.path.basename(path),
                             read_text(path, MAX_SCRIPT_CHARS)))
            question = rest or ("Объясни, что делает этот скрипт и его известные "
                                "дефекты.")
        else:
            print("(скрипт «%s» не найден — отвечаю только по MANUAL)" % name)
    return client.chat(system + script_ctx, question, max_tokens=1200)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Копилот оператора Litpam-Indexator")
    ap.add_argument("--ask", help="один вопрос без интерактивного режима")
    ap.add_argument("--budget", type=float, default=None, help="бюджет сессии, $")
    args = ap.parse_args(argv)

    if not os.path.isfile(MANUAL):
        print("MANUAL.md не найден: %s" % MANUAL, file=sys.stderr)
        return 2
    system = SYSTEM_TMPL % read_text(MANUAL)
    client = DeepSeekClient(budget_usd=args.budget)

    try:
        if args.ask:
            print(answer(client, system, args.ask))
            return 0
        print("Копилот Litpam-Indexator (модель %s). Вопрос, @скрипт вопрос, "
              "или exit." % client.model)
        while True:
            try:
                q = input("> ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not q or q.lower() in ("exit", "quit", "выход"):
                break
            print(answer(client, system, q))
            print()
    except BudgetExceeded as e:
        print(str(e), file=sys.stderr)
        return 1
    finally:
        print(client.cost_line())
    return 0


if __name__ == "__main__":
    sys.exit(main())
