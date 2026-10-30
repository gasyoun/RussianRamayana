"""H7506: замок drafts.html — absence-grep + 4 сценария под node.

Плейсхолдерный хеш пароля должен исчезнуть из кодовой базы, а
node-сценарии (tests/drafts_gate.test.js) обязаны проходить: отказ /
default-deny / вход / кап. Запускается обычным pytest (CI: job Pytest).
"""

import pathlib
import shutil
import subprocess

import pytest

REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
SCANNED_SUFFIXES = {".css", ".html", ".js", ".json", ".md", ".py", ".yml", ".yaml"}

# Токен собирается из частей: сам файл-сканер тоже в репо и тоже не должен
# содержать литерал (критерий приёмки H7506 — 0 вхождений по всему репо).
PLACEHOLDER_TOKEN = "PLACEHOLDER" + "_HASH"


def test_no_placeholder_hash_anywhere():
    """grep -r <плейсхолдерный токен> по репо → 0 hits (критерий приёмки H7506)."""
    hits = []
    for path in REPO_ROOT.rglob("*"):
        if not path.is_file() or ".git" in path.parts:
            continue
        if path.suffix.lower() not in SCANNED_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if PLACEHOLDER_TOKEN in text:
            hits.append(path.relative_to(REPO_ROOT).as_posix())
    assert hits == [], f"плейсхолдерный токен остался в: {hits}"


def test_drafts_gate_scenarios():
    """4 сценария замка (отказ / default-deny / вход / кап) под node → exit 0."""
    node = shutil.which("node")
    if node is None:
        pytest.fail("node не найден в PATH — сценарии замка нечем запустить")
    script = REPO_ROOT / "tests" / "drafts_gate.test.js"
    proc = subprocess.run(
        [node, str(script)],
        check=False,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert proc.returncode == 0, f"node-сценарии красные:\n{proc.stdout}\n{proc.stderr}"
    assert "all 4 gate scenarios green" in proc.stdout
