# Тайминговые субтитры (провенанс тайм-кодов)

_Created: 08-07-2026 · Last updated: 08-07-2026_

Здесь лежат **тайминговые авто-субтитры** всех 18 видео-скринкастов — исходник для
посекундных тайм-кодов в [`../MANUAL.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/MANUAL.md#%D1%82%D0%B0%D0%B9%D0%BC-%D0%BA%D0%BE%D0%B4%D1%8B-%D0%BF%D0%BE-%D1%80%D0%BE%D0%BB%D0%B8%D0%BA%D0%B0%D0%BC)
и в очищенных расшифровках [`../clean/`](https://github.com/gasyoun/RussianRamayana/tree/main/Litpam-Indexator/docs/indesign-pipeline/clean).

## Что это

- `NN-<videoId>.ru.json3` — «сырые» тайминговые субтитры в формате YouTube `json3`
  (каждая фраза с `tStartMs`). Это первичный провенанс: секунды тайм-кодов взяты
  отсюда, не выдуманы.
- `txt/NN-<videoId>.txt` — те же субтитры в человекочитаемом виде (`[мм:сс|сек] текст`),
  удобно сверять привязку «шаг → секунда».

## Как получено

Скачано `yt-dlp` по `videoId` (из первой строки каждого сырого `.txt` в родительской
папке):

```sh
yt-dlp --write-auto-sub --sub-lang ru --skip-download --sub-format json3 \
  -o "timed/NN-%(id)s.%(ext)s" "https://www.youtube.com/watch?v=<videoId>"
```

Расшифровка автоматическая (ASR), поэтому текст субтитров содержит ошибки распознавания —
он служит **только для привязки времени**; выверенные формулировки шагов — в `../clean/`
и `../MANUAL.md` (сверены с [`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc)
и [`../../../CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md)).

Deep-ссылка на шаг: `https://www.youtube.com/watch?v=<videoId>&t=<секунды>s`.

_Dr. Mārcis Gasūns_
