# -*- coding: utf-8 -*-
"""DeepSeek-синтез сводки расхождений — ПРОБНО на первых 5 шлоках (H764 шаг 5).

Поверх ДЕТЕРМИНИРОВАННОГО списка сносок (движок) добавляем короткий абзац —
машинную сводку: где именно классики расходятся и на что переводчику смотреть.
Помечается «(машинная сводка)»; детерминированный список остаётся первичным.

Бэкенд — openai-совместимый DeepSeek (`deepseek-chat`, temperature 0). Ключ:
env `LLM_API_KEY`/`DEEPSEEK_API_KEY`, иначе `.env` в RussianTranslation/src (та же
конвенция, что build_corpus_lexicon.py). **Anthropic-ключ НЕ запрашиваем.**
Ответы кэшируются в sheets/deepseek_synth_cache.json (ключ = хэш входа), поэтому
повторный прогон не тратит запросы. Нет ключа/баланса/сети → пишем стаб-запись и
идём дальше: это проба, не блокирующий шаг.

Запуск:  python deepseek_synth.py [--n 5] [--sarga 1]
Автор: Opus 4.8 (`claude-opus-4-8`), H764.
"""
import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import common as C

DATA = Path(__file__).resolve().parents[1] / "data"
SHEETS = Path(__file__).resolve().parents[1] / "sheets"
CACHE = SHEETS / "deepseek_synth_cache.json"
API = os.environ.get("LLM_BASE_URL", "https://api.deepseek.com") + "/chat/completions"
MODEL_LLM = os.environ.get("LLM_MODEL", "deepseek-chat")
MODEL = "Opus 4.8 (claude-opus-4-8)"
RT_ENV = C.GITHUB_ROOT / "SanskritLexicography" / "RussianTranslation" / "src" / ".env"

SYS = ("Ты — помощник переводчика санскрита на русский. На ВХОДЕ: шлока (IAST), её "
       "русский подстрочник и список трудных слов с тем, как их передавали классики. "
       "Дай ОДИН короткий абзац (2–3 предложения) по-русски: где передачи существенно "
       "расходятся и на что переводчику обратить внимание. НЕ переводи шлоку заново, НЕ "
       "перечисляй слова списком, НЕ выдумывай передач сверх данных. Только сводка "
       "расхождений. Начни со слова «Расхождения:».")


def _key():
    for var in ("LLM_API_KEY", "DEEPSEEK_API_KEY"):
        if os.environ.get(var):
            return os.environ[var]
    if RT_ENV.exists():
        for line in open(RT_ENV, encoding="utf-8"):
            for var in ("LLM_API_KEY=", "DEEPSEEK_API_KEY="):
                if line.strip().startswith(var):
                    return line.split("=", 1)[1].strip()
    return None


def build_prompt(v):
    lines = [f"Шлока (IAST): {v['iast']}", f"Подстрочник (Леонов): {v['ru']}",
             "Трудные слова и передачи классиков:"]
    for f in v["footnotes"]:
        rs = "; ".join(f"«{r['ru']}»" + (f" ({r['locus']})" if r["locus"] else "")
                       for r in f["renders"]) or "—"
        g = f" [словарь: {f['gloss']}]" if f["gloss"] else ""
        lines.append(f"- {f['iast']} ({f['tier']}): {rs}{g}")
    return "\n".join(lines)


def call_deepseek(prompt, key):
    import requests
    r = requests.post(
        API, headers={"Authorization": "Bearer " + key},
        json={"model": MODEL_LLM, "temperature": 0,
              "messages": [{"role": "system", "content": SYS},
                           {"role": "user", "content": prompt}]},
        timeout=(10, 90))
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()


def run(sarga, n):
    model = json.load(open(DATA / "sheets_model.json", encoding="utf-8"))
    verses = [v for v in model["sargas"].get(str(sarga), {}).get("verses", [])
              if v["footnotes"]][:n]
    cache = json.load(open(CACHE, encoding="utf-8")) if CACHE.exists() else {}
    key = _key()
    if not key:
        print("[deepseek] ключ не найден (env LLM_API_KEY/DEEPSEEK_API_KEY или "
              ".env) — пишу стаб-сводки, живой вызов пропущен.")

    out = []
    live = 0
    for v in verses:
        prompt = build_prompt(v)
        h = hashlib.sha1((MODEL_LLM + "\n" + prompt).encode("utf-8")).hexdigest()[:16]
        rec = cache.get(h)
        if rec and rec.get("summary"):
            status = "cache"
        elif key:
            try:
                summary = call_deepseek(prompt, key)
                rec = {"passage": f"{sarga}.{v['verse']}", "summary": summary,
                       "model_llm": MODEL_LLM, "status": "live"}
                cache[h] = rec
                live += 1
                status = "live"
                time.sleep(0.5)
            except Exception as ex:
                rec = {"passage": f"{sarga}.{v['verse']}",
                       "summary": None, "status": f"error: {str(ex)[:120]}"}
                status = rec["status"]
        else:
            rec = {"passage": f"{sarga}.{v['verse']}", "summary": None,
                   "status": "no_key (stub)"}
            status = "no_key"
        out.append({"passage": f"{sarga}.{v['verse']}",
                    "iast": v["iast"], "summary": rec.get("summary"),
                    "status": rec.get("status", status)})
        print(f"[deepseek] {sarga}.{v['verse']}: {status}")

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    report = {"_meta": {"handoff": "H764", "step": 5, "orchestrator": MODEL,
                        "llm": MODEL_LLM, "note": "проба; сводки помечать «(машинная сводка)»",
                        "sarga": sarga, "n": len(out), "live_calls": live},
              "syntheses": out}
    (SHEETS / f"deepseek_synth_sarga{sarga}.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    ok = sum(1 for o in out if o["summary"])
    print(f"[deepseek] готово: {ok}/{len(out)} со сводкой ({live} новых вызовов) "
          f"-> sheets/deepseek_synth_sarga{sarga}.json")
    return ok


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--sarga", type=int, default=1)
    ap.add_argument("--n", type=int, default=5)
    a = ap.parse_args()
    run(a.sarga, a.n)
