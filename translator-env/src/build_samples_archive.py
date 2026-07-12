# -*- coding: utf-8 -*-
"""Собрать архив образцов 3 форм листа для отправки переводчику (H764, письмо 1).

Из sheets/ (приватные, копирайт) складывает один .zip: лендинг index.html +
три формы по папкам (браузер / Word / веб-режим), по 2 сарги в каждой. Выход —
в dist/ (gitignored): архив встраивает защищённые копирайтом передачи, в репо не
идёт. Отправляется ЛИЧНО, не публикуется.

Запуск:  python gen_sheets.py … && python render_docx.py … && python build_samples_archive.py
Автор: Opus 4.8 (`claude-opus-4-8`), H764.
"""
import os
import shutil
import sys
import zipfile
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "sheets"
DIST = ROOT / "dist"
STAGE = DIST / "leonov_obraztsy"
ZIP = DIST / "Ramayana_sreda-perevodchika_obraztsy_sarga1-2.zip"

FORMS = {
    "forma-A-stranica-v-brauzere": ["sarga_1.html", "sarga_2.html"],
    "forma-B-Word-so-snoskami": ["sarga_1.docx", "sarga_2.docx"],
    "forma-V-chitatelskiy-rezhim": ["web_mock_sarga_1.html", "web_mock_sarga_2.html"],
}

INDEX = """<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Рамаяна · среда переводчика · образцы форм</title><style>
body{font:17px/1.6 Georgia,serif;background:#fbfaf7;color:#1d1a16;margin:0}
.wrap{max-width:720px;margin:0 auto;padding:30px}
h1{font-size:24px;color:#7a1f1f}h2{font-size:19px;margin-top:1.4em}
.card{border:1px solid #e4ded2;border-radius:8px;padding:16px 18px;margin:14px 0;background:#fff}
.card p{margin:.4em 0;font-size:15px;color:#3a352c}
a.btn{display:inline-block;margin:.3em .5em .1em 0;padding:.35em .8em;background:#7a1f1f;color:#fff;
text-decoration:none;border-radius:5px;font-size:15px}
a.btn.alt{background:#1f527a}
.note{font-size:14px;color:#7a7266;border-top:1px solid #e4ded2;margin-top:24px;padding-top:12px}
</style></head><body><div class="wrap">
<h1>Рамаяна · среда переводчика — образцы</h1>
<p>Уважаемый Максим Владимирович! Здесь три вида одного и того же листа сносок — по
первым двум саргам «Сундараканды». Посмотрите, в каком виде Вам приятнее работать, и
напишите мне букву (А, Б или В). Остальные я делать не буду.</p>
<p style="font-size:14px;color:#7a7266">Файлы <b>.html</b> открываются в браузере (двойным
щелчком). Файл <b>.docx</b> — в Word.</p>

<div class="card"><h2>Форма А — страница в браузере</h2>
<p>Каждая шлока с карточками-сносками: трудное слово, передачи классиков (с источником),
словарная глосса. Ярус <b style="color:#7a1f1f">A</b> — где переводы расходятся;
<b style="color:#1f527a">B</b> — редкое слово с готовой передачей.</p>
<a class="btn" href="forma-A-stranica-v-brauzere/sarga_1.html">Сарга 1</a>
<a class="btn" href="forma-A-stranica-v-brauzere/sarga_2.html">Сарга 2</a></div>

<div class="card"><h2>Форма Б — документ Word со сносками</h2>
<p>Тот же материал, но обычным файлом Word: сноски стоят настоящими сносками внизу
страницы, как в книге. Удобно править и печатать.</p>
<a class="btn" href="forma-B-Word-so-snoskami/sarga_1.docx">Сарга 1 (.docx)</a>
<a class="btn" href="forma-B-Word-so-snoskami/sarga_2.docx">Сарга 2 (.docx)</a></div>

<div class="card"><h2>Форма В — «читательский» веб-режим</h2>
<p>Сплошной текст, как для чтения: над трудными словами — маленькие номера, сноски внизу.
Ближе к тому, как это выглядело бы на сайте.</p>
<a class="btn alt" href="forma-V-chitatelskiy-rezhim/web_mock_sarga_1.html">Сарга 1</a>
<a class="btn alt" href="forma-V-chitatelskiy-rezhim/web_mock_sarga_2.html">Сарга 2</a></div>

<p class="note">Это пробная версия на двух саргах — не финал. Материал содержит защищённые
авторским правом переводы, поэтому он только для Вас, не для публикации.<br>
С уважением, Марцис Гасунс · gasyoun@ya.ru</p>
</div></body></html>"""


def run():
    if not SHEETS.exists():
        print(f"[!] нет {SHEETS} — сначала gen_sheets.py + render_docx.py")
        return 1
    if STAGE.exists():
        shutil.rmtree(STAGE)
    STAGE.mkdir(parents=True)
    (STAGE / "index.html").write_text(INDEX, encoding="utf-8")
    missing = []
    for folder, files in FORMS.items():
        (STAGE / folder).mkdir()
        for fn in files:
            src = SHEETS / fn
            if not src.exists():
                missing.append(fn)
                continue
            shutil.copy2(src, STAGE / folder / fn)
    if missing:
        print("[!] отсутствуют формы:", missing, "— прогнать gen_sheets.py/render_docx.py")
        return 1
    if ZIP.exists():
        ZIP.unlink()
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for base, _, files in os.walk(STAGE):
            for f in files:
                p = Path(base) / f
                z.write(p, p.relative_to(STAGE))
    print(f"[archive] {ZIP} ({ZIP.stat().st_size} байт, {len(FORMS) * 2 + 1} файлов) — "
          f"приватно, отправлять лично")
    return 0


if __name__ == "__main__":
    sys.exit(run())
