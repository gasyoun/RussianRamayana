#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deepseek_common.py — общий клиент DeepSeek для копилот-инструментов Litpam-Indexator.

Использование из соседних скриптов:

    from deepseek_common import DeepSeekClient
    client = DeepSeekClient()                    # читает .env в корне репозитория
    answer = client.chat("system prompt", "user prompt")
    print(client.cost_line())                    # текущая накопленная стоимость

Правила (H377, решения MG 08-07-2026):
  * модель — дешёвая нерассуждающая `deepseek-chat` (из .env, DEEPSEEK_MODEL);
  * жёсткий бюджет прогона — $20 по умолчанию (--budget / BUDGET_USD меняют);
    клиент печатает running-стоимость после каждого вызова и ОСТАНАВЛИВАЕТ
    работу исключением BudgetExceeded при достижении 95% лимита;
  * ключ берётся из `RussianRamayana/.env` (gitignored) — переменная
    DEEPSEEK_API_KEY; в git ключ не попадает.

Стоимость считается по usage-токенам ответа API и тарифам DeepSeek
(задаются константами ниже; при смене тарифов поправить PRICE_IN/PRICE_OUT —
или переопределить переменными окружения DEEPSEEK_PRICE_IN/DEEPSEEK_PRICE_OUT,
$ за 1M токенов).

Зависимости: только стандартная библиотека (urllib).

_Автор: Dr. Mārcis Gasūns · создан 10-07-2026 (H377)._
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# Тарифы deepseek-chat, $ за 1M токенов (cache-miss вход; выход).
# Источник: api-docs.deepseek.com/quick_start/pricing (проверено 10-07-2026).
PRICE_IN = float(os.environ.get("DEEPSEEK_PRICE_IN", "0.27"))
PRICE_OUT = float(os.environ.get("DEEPSEEK_PRICE_OUT", "1.10"))

DEFAULT_BUDGET_USD = 20.0
BUDGET_STOP_SHARE = 0.95  # останов при 95% бюджета — недоход до жёсткого лимита


class BudgetExceeded(RuntimeError):
    """Прогон остановлен: накопленная стоимость подошла к лимиту бюджета."""


def find_repo_root(start=None):
    """Подняться от start (или этого файла) до папки с .env / .git."""
    d = os.path.abspath(start or os.path.dirname(__file__))
    while True:
        if os.path.isfile(os.path.join(d, ".env")) or os.path.isdir(os.path.join(d, ".git")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            raise FileNotFoundError(".env не найден ни в одной родительской папке")
        d = parent


def load_env(path=None):
    """Минимальный парсер .env (KEY=VALUE, # — комментарий). Ничего не печатает."""
    if path is None:
        path = os.path.join(find_repo_root(), ".env")
    env = {}
    with open(path, "r", encoding="utf-8-sig") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            env[key.strip()] = value.strip()
    return env


class DeepSeekClient:
    """Тонкий клиент chat-completions с учётом стоимости и бюджетным стопом."""

    def __init__(self, budget_usd=None, quiet=False):
        env = load_env()
        self.api_key = env.get("DEEPSEEK_API_KEY", "")
        if not self.api_key:
            raise RuntimeError("DEEPSEEK_API_KEY отсутствует в .env")
        self.base_url = env.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
        self.model = env.get("DEEPSEEK_MODEL", "deepseek-chat")
        if budget_usd is None:
            budget_usd = float(os.environ.get("BUDGET_USD", DEFAULT_BUDGET_USD))
        self.budget_usd = budget_usd
        self.quiet = quiet
        self.tokens_in = 0
        self.tokens_out = 0
        self.calls = 0

    # -- стоимость -----------------------------------------------------------

    def cost_usd(self):
        return self.tokens_in / 1e6 * PRICE_IN + self.tokens_out / 1e6 * PRICE_OUT

    def cost_line(self):
        return ("[deepseek] вызовов: %d · токены in/out: %d/%d · стоимость: $%.4f"
                " (бюджет $%.2f)" % (self.calls, self.tokens_in, self.tokens_out,
                                     self.cost_usd(), self.budget_usd))

    def _check_budget(self):
        if self.cost_usd() >= self.budget_usd * BUDGET_STOP_SHARE:
            raise BudgetExceeded(
                "Стоимость $%.4f достигла %.0f%% бюджета $%.2f — прогон остановлен. "
                "Результаты до этой точки сохранены; продолжить можно повторным "
                "запуском с --budget побольше." % (
                    self.cost_usd(), BUDGET_STOP_SHARE * 100, self.budget_usd))

    # -- вызов ---------------------------------------------------------------

    def chat(self, system, user, temperature=0.2, max_tokens=2000, retries=3):
        """Один chat-запрос; возвращает текст ответа. Печатает running-стоимость."""
        self._check_budget()
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        req = urllib.request.Request(
            self.base_url + "/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer " + self.api_key,
            },
        )
        last_err = None
        for attempt in range(retries):
            try:
                with urllib.request.urlopen(req, timeout=180) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                break
            except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
                last_err = e
                wait = 5 * (attempt + 1)
                if not self.quiet:
                    print("[deepseek] сбой (%s), повтор через %d с…" % (e, wait),
                          file=sys.stderr)
                time.sleep(wait)
        else:
            raise RuntimeError("DeepSeek недоступен после %d попыток: %s"
                               % (retries, last_err))

        usage = data.get("usage", {})
        self.tokens_in += usage.get("prompt_tokens", 0)
        self.tokens_out += usage.get("completion_tokens", 0)
        self.calls += 1
        if not self.quiet:
            print(self.cost_line())
        self._check_budget()
        return data["choices"][0]["message"]["content"]
