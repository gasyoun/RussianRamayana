# -*- coding: utf-8 -*-
"""Слой параллельных пассажей DCS для сносок переводчика (H4706).

Вход — датасет kosha `dcs-parallel-passages-full`: выгрузка выравниваний
параллельных пассажей DCS (PARA/Polnorazmernye, 245 файлов, по файлу на
текст-источник). Структура строки:

    <метка-источника>;<адрес>;<санскрит-источника>;<парал-ref>;<парал-текст>;<verdict>;<дельта>;...

Рамаяна (DCS text 248, метки `Rām, K, S: …`) участвует в выгрузке в ОБЕ
стороны: своим файлом `248_1--606.csv` (≈37 тыс. полушилок, из них с
параллелями ≈190) и как ЦЕЛЬ параллелей в ~11 чужих файлах (МБх и др.,
≈50). Числовые метки DCS внутренне непоследовательны (`Rām, 5, 1: 325` +
адрес `1 1` = Сундара 1.1, но также `Rām, 1, 1: 1` + `76 2`), поэтому
адресация строится НЕ по меткам, а ПО ТЕКСТУ: каждая сторона выравнивания
ищется в корпусе SamudraManthanam (тот же JSONL, что читает context.py) —
корпус даёт канонические для среды переводчика координаты
(work, sarga, verse). Параллели из корпусных работ (Рамаяна, МБх)
локуются так же; прочие остаются с сылкой DCS как есть.

Выход:
    data/dcs_parallels.tsv.gz               — полный слой (gzip, детерминированный)
    data/dcs_parallels_sundara_s01_s02.json — срез под пилотные листы (сарги 1–2)

Запуск:
    python build_dcs_parallels.py            # dry-run: только статистика
    python build_dcs_parallels.py --emit     # записать артефакты
    python build_dcs_parallels.py --check    # пересборка == закоммиченный слой

Данные читаются ПО ПУТИ из ../VisualDCS (правило проекта: внешние активы
не копируем в репозиторий; слой — производный, перегенерируемый).
Автор: OxAlpha (opencode/z-ai/glm-5.3-flash), H4706.
"""
import argparse
import collections
import glob
import gzip
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402

PARA_DIR = (C.GITHUB_ROOT / "VisualDCS" / "derived-data" /
            "Paralleli-v-tekstah-korpusa-SRC" / "PARA" / "Polnorazmernye")
DATA = Path(__file__).resolve().parents[1] / "data"
LAYER_GZ = DATA / "dcs_parallels.tsv.gz"
PILOT_JSON = DATA / "dcs_parallels_sundara_s01_s02.json"
PILOT_SARGAS = {("05_ramayana-sundarakanda", s) for s in ("1", "2")}

_JSONL_DIR = C.GITHUB_ROOT / "SamudraManthanam" / "web" / "corpus_builder" / "jsonl"
WORK_LABEL = {
    "01_ramayana-balakanda": "Рамаяна I (Бала)", "02_ramayana-ayodhyakanda": "Рамаяна II (Айодхья)",
    "03_ramayana-aranyakanda": "Рамаяна III (Аранья)", "04_ramayana-kishkindhakanda": "Рамаяна IV (Кишкиндха)",
    "05_ramayana-sundarakanda": "Рамаяна V (Сундара)", "06_ramayana-yuddhakanda": "Рамаяна VI (Юддха)",
    "07_ramayana-uttarakanda": "Рамаяна VII (Уттара)",
    "01_mahabharata-adiparva": "Махабхарата I (Ади)", "02_mahabharata-sabhaparva": "Махабхарата II (Сабха)",
    "03_mahabharata-aranyakaparva": "Махабхарата III (Аранья)", "04_mahabharata-virataparva": "Махабхарата IV (Вирата)",
    "05_mahabharata-udyogaparva": "Махабхарата V (Удьйога)", "06_mahabharata-bhishmaparva": "Махабхарата VI (Бхишма)",
    "07_mahabharata-dronaparva": "Махабхарата VII (Дрона)", "08_mahabharata-karnaparva": "Махабхарата VIII (Карна)",
    "09_mahabharata-shalyaparva": "Махабхарата IX (Шалья)", "10_mahabharata-sauptikaparva": "Махабхарата X (Сауптика)",
    "11_mahabharata-striparva": "Махабхарата XI (Стри)", "12_mahabharata-shantiparva": "Махабхарата XII (Шанти)",
    "13_mahabharata-anushasanaparva": "Махабхарата XIII (Анушасана)",
}

_SPLIT_RE = re.compile(r"[।|॥]+")


def norm_loc(t: str) -> str:
    """Агрессивная норма ТОЛЬКО для текстового поиска адреса: без диакритики.

    Корпус местами теряет точечные согласные (ṇ/ṇ, ṣ/s), точное IAST-равенство
    слишком строго для локации; тексты в слое сохраняются дословно.
    """
    t = _SPLIT_RE.sub(" ", t).replace("ṃ", "ṁ")
    t = re.sub(r"[^a-z ]", "", t.lower().translate(str.maketrans(
        "āīūṛṝḷḹṭḍṣṅṇṁḥś", "aiurrlltdsnnmhs")))
    return re.sub(r" +", "", t)


def corpus_indexes():
    """Индексы текстового поиска: (ram_pairs, oth_pairs).

    Каждая корпусная шлока индексируется целиком, каждым данд-куском
    (полушилок/пада) и каждой парой соседних кусков — выгрузка DCS режет
    шлоки по-своему, точное совпадение возможно на любом уровне.
    ram_pairs — только канды Рамаяны (сторона Рамаяны обязана локоваться
    в Рамаяну), oth_pairs — МБх; Рамаяна добавляется вторым индексом для
    внутрирамаянских параллелей.
    """
    ram_pairs = collections.defaultdict(list)
    oth_pairs = collections.defaultdict(list)

    def add(d, work, pas, txt):
        pieces = [p for p in _SPLIT_RE.split(txt) if p.strip()]
        keys = {norm_loc(txt)}
        for i, piece in enumerate(pieces):
            keys.add(norm_loc(piece))
            if i + 1 < len(pieces):
                keys.add(norm_loc(piece + " " + pieces[i + 1]))
        for k in keys:
            if len(k) >= 8:
                d[k].append((work, pas))

    for p in sorted(_JSONL_DIR.glob("*_ramayana-*.jsonl")):
        for ln in open(p, encoding="utf-8"):
            if '"passage"' not in ln:
                continue
            try:
                o = json.loads(ln)
            except Exception:
                continue
            if o.get("seg") == "sa" and o.get("text"):
                add(ram_pairs, p.stem, o["passage"], o["text"])
    for p in sorted(_JSONL_DIR.glob("*_mahabharata-*.jsonl")):
        for ln in open(p, encoding="utf-8"):
            if '"passage"' not in ln:
                continue
            try:
                o = json.loads(ln)
            except Exception:
                continue
            if o.get("seg") == "sa" and o.get("text"):
                add(oth_pairs, p.stem, o["passage"], o["text"])
    return ram_pairs, oth_pairs


def locate(n, ram_pairs, oth_pairs, ram_side):
    """n (норм. фрагмент) -> (work, passage) | None.

    Сторона Рамаяны ищется только в кандах Рамаяны; чужая сторона — в МБх,
    фолбэк в Рамаяну (внутрирамаянские параллели).
    """
    if ram_side:
        hits = ram_pairs.get(n)
    else:
        hits = oth_pairs.get(n) or ram_pairs.get(n)
    return hits[0] if hits else None


def iter_alignments():
    """Все выравнивания экспорта, где участвует Рамаяна, с обеих сторон.

    Yields (ram_ref_raw, ram_text, verdict, delta, other_ref_raw, other_text,
            src_file, direction), direction: 'src' (Рамаяна — источник строки)
    или 'tgt' (Рамаяна — параллель в чужом файле).
    """
    for path in sorted(glob.glob(str(PARA_DIR / "*.csv"))):
        fname = Path(path).name
        is_ram_file = fname.startswith("248_")
        for ln in open(path, encoding="utf-8"):
            parts = ln.rstrip("\n").split(";")
            if len(parts) < 3 or not parts[2] or not parts[0]:
                continue
            src_label, src_text = parts[0], parts[2]
            i = 3
            while i + 2 < len(parts) and parts[i]:
                ref, ptext, verdict = parts[i], parts[i + 1], parts[i + 2]
                delta = parts[i + 3] if i + 3 < len(parts) else ""
                if is_ram_file and src_label.startswith("Rām,"):
                    yield (src_label, src_text, verdict, delta, ref, ptext, fname, "src")
                elif ref.startswith("Rāmāyaṇa"):
                    yield (ref, ptext, verdict, delta, src_label, src_text, fname, "tgt")
                i += 4


LAYER_HEADER = ["ram_work", "ram_passage", "ram_ref_raw", "ram_text", "verdict",
                "other_work", "other_passage", "other_ref_raw", "other_text",
                "delta", "direction", "src_file"]


def build():
    """Собрать слой в память: (layer_rows, pilot, stats)."""
    ram_pairs, oth_pairs = corpus_indexes()
    layer, pilot, stats = [], collections.defaultdict(list), collections.Counter()
    seen = set()
    for ram_ref, ram_text, verdict, delta, other_ref, other_text, fname, direction \
            in iter_alignments():
        stats["alignments_raw"] += 1
        ram_loc = locate(norm_loc(ram_text), ram_pairs, oth_pairs, ram_side=True)
        other_loc = locate(norm_loc(other_text), ram_pairs, oth_pairs, ram_side=False)
        if ram_loc:
            stats["ram_located"] += 1
        else:
            stats["ram_unlocated"] += 1
        if other_loc:
            stats["other_located"] += 1
        else:
            stats["other_unlocated"] += 1
        ram_work, ram_passage = ram_loc if ram_loc else ("", "")
        oth_work, oth_passage = other_loc if other_loc else ("", "")
        key = (ram_work, ram_passage, norm_loc(ram_text), norm_loc(other_text))
        if key in seen:
            stats["deduped"] += 1
            continue
        seen.add(key)
        layer.append([ram_work, ram_passage, ram_ref.strip(), ram_text.strip(),
                      verdict.strip(), oth_work, oth_passage, other_ref.strip(),
                      other_text.strip(), delta.strip(), direction, fname])
        if ram_loc and (ram_work, ram_passage.split(".")[0]) in PILOT_SARGAS:
            pilot[ram_passage].append({
                "half_src_file": fname, "direction": direction,
                "ram_text": ram_text.strip(),
                "label": WORK_LABEL.get(oth_work, other_ref.split(",")[0].strip()),
                "work": oth_work, "passage": oth_passage,
                "ref_raw": other_ref.strip(), "text": other_text.strip(),
                "verdict": verdict.strip(), "delta": delta.strip(),
            })
    return layer, pilot, stats


def layer_text(layer):
    return "\t".join(LAYER_HEADER) + "\n" + "".join("\t".join(r) + "\n" for r in layer)


def write_layer(layer):
    """Записать слой; gzip с mtime=0 — контейнер воспроизводим байт-в-байт."""
    payload = layer_text(layer).encode("utf-8")
    with open(LAYER_GZ, "wb") as raw:
        with gzip.GzipFile(fileobj=raw, mode="wb", compresslevel=9, mtime=0) as gz:
            gz.write(payload)


def read_layer():
    with gzip.open(LAYER_GZ, "rt", encoding="utf-8") as fh:
        return fh.read()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--emit", action="store_true", help="записать слой + пилотный срез")
    ap.add_argument("--check", action="store_true", help="пересборка == закоммиченный слой")
    args = ap.parse_args()

    layer, pilot, stats = build()
    print(f"alignments_raw={stats['alignments_raw']} deduped={stats['deduped']} "
          f"layer_rows={len(layer)}")
    print(f"ram_located={stats['ram_located']} ram_unlocated={stats['ram_unlocated']} | "
          f"other_located={stats['other_located']} other_unlocated={stats['other_unlocated']}")
    kanda = collections.Counter(r[0] for r in layer if r[0])
    print("по кандам:", dict(sorted(kanda.items())))
    print(f"pilot_passages={len(pilot)}")

    if args.check:
        assert LAYER_GZ.exists(), "--check: слой не найден, сначала --emit"
        assert read_layer() == layer_text(layer), \
            "CHECK FAIL: перегенерированный слой != закоммиченному"
        print("CHECK PASS: слой воспроизводится байт-в-байт")
    if args.emit:
        DATA.mkdir(parents=True, exist_ok=True)
        write_layer(layer)
        with open(PILOT_JSON, "w", encoding="utf-8") as fh:
            json.dump(pilot, fh, ensure_ascii=False, indent=1, sort_keys=True)
        print(f"WROTE {LAYER_GZ.name} + {PILOT_JSON.name}")


if __name__ == "__main__":
    main()
