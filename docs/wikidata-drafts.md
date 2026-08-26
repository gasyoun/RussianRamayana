# Черновики статей Wikidata для участников проекта

_Created: 13-06-2026 · Last updated: 26-08-2026_

Двух участников проекта нет в Wikidata (проверено 2026-06-13: `wbsearchentities`
по русским меткам возвращает только однофамильцев). Ниже — черновики для ручного
создания через [wikidata.org/wiki/Special:NewItem](https://www.wikidata.org/wiki/Special:NewItem).
После создания вписать полученные QID в `data/people.json` (поле `wikidata`) и в
JSON-LD страниц (`sameAs`).

> ⚠️ Wikidata требует **значимости** (notability): у объекта должна быть либо
> минимум одна достоверная внешняя ссылка-источник, либо устойчивое описание в
> структурированных данных. Перед созданием убедиться, что есть хотя бы один
> внешний источник (публикация, каталожная запись РГБ/РНБ, страница издательства).

---

## 1. Максим Владимирович Леонов

| Свойство | Значение | Примечание |
|---|---|---|
| Label (ru) | Максим Владимирович Леонов | |
| Label (en) | Maxim Leonov | транслитерация |
| Description (ru) | российский переводчик санскритской поэзии | |
| Description (en) | Russian translator of Sanskrit poetry | |
| `instance of` (P31) | Q5 (человек) | |
| `sex or gender` (P21) | Q6581097 (мужской) | |
| `occupation` (P106) | Q333634 (переводчик); Q4263842 ? | проверить QID «переводчик» |
| `country of citizenship` (P27) | Q159 (Россия) | |
| `languages spoken/written` (P1412) | Q7737 (русский), Q11059 (санскрит) | |
| `notable work` (P800) | перевод «Рамаяны», книги V–VI | как только издано в «Лит. памятниках» |
| источник / reference | ⚠️ ЗАПОЛНИТЬ: ссылка на издание или каталог | обязательно для notability |

Дополнительно после публикации книг V–VI: `VIAF`, `RSL`/`RNB` идентификаторы.

---

## 2. Евгений Кривецкий

| Свойство | Значение | Примечание |
|---|---|---|
| Label (ru) | Евгений Кривецкий | ⚠️ уточнить отчество и годы жизни |
| Description (ru) | чтец аудиокниги «Рамаяна» (1986) | |
| Description (en) | narrator of the 1986 Russian Ramayana audiobook | |
| `instance of` (P31) | Q5 (человек) | |
| `sex or gender` (P21) | Q6581097 (мужской) | |
| `occupation` (P106) | Q2405480 (чтец / voice actor) ? | проверить QID |
| `country of citizenship` (P27) | Q159 (Россия) / Q15180 (СССР) | по году |
| источник / reference | ⚠️ ЗАПОЛНИТЬ: ссылка на аудиозапись на Internet Archive | появится после загрузки item |

> Примечание по значимости: у Кривецкого как частного чтеца значимость для
> Wikidata под вопросом. Реалистичный путь — дождаться публичного item на
> Internet Archive (`ramayana-russian-1986`), который и станет источником;
> до тех пор создание статьи может быть отклонено патрулирующими.

---

## После создания

```jsonc
// data/people.json, объект leonov:
"wikidata": "Q…",   // новый QID
// затем добавить sameAs в project.html JSON-LD (блок mentions, объект Леонова)
```

---

## Замер 26-08-2026 (H3558) — что удалось и что нет

Проверка проведена в рамках [H3558](https://github.com/gasyoun/Uprava/blob/main/handoffs/H3558-Opus_multi_stale-roadmap-s5-lane-a-residuals_26.08.26.md)
(Opus 5, `claude-opus-5`) по пункту «Идентификаторы людей» Фазы 3
[docs/DH_ROADMAP.md](https://github.com/gasyoun/RussianRamayana/blob/main/docs/DH_ROADMAP.md).
Метод: `wbsearchentities` (Wikidata API, `language=ru` и `language=en`) и
`viaf.org/viaf/AutoSuggest` по латинской и кириллической формам имени.

| Человек | Wikidata (`wbsearchentities`) | VIAF (`AutoSuggest`) | Итог |
|---|---|---|---|
| П. А. Гринцер | `Q4149672` — было | `35823334` — было | заполнено ранее |
| М. В. Леонов | пусто (ru и en) | пусто (латиница и кириллица) | записи не существует |
| Е. А. Костина | пусто (ru и en) | пусто (латиница и кириллица) | записи не существует |
| М. Ю. Гасунс | пусто (ru и en) | **`1158167565597098750002`** | VIAF проставлен 26-08-2026 |

**Что сделано.** У Гасунса нашлась уже существующая авторитетная запись VIAF —
кластер `1158167565597098750002`, `nameType: Personal`, заголовок
«Gasuns, Marcis Jurʹevič 1983-», кириллическая форма «Гасунс, Марцис, 1983-»,
единственный источник кластера — Немецкая национальная библиотека,
`DNB|1279528044` → [d-nb.info/gnd/1279528044](http://d-nb.info/gnd/1279528044).
Это **поиск существующей записи, а не создание новой**, поэтому поле `viaf`
вписано в `data/people.json`. Близкий по написанию кластер `305381106`
(«Gasūns, Renārs, jurists») — другой человек, использовать его нельзя.

**Чего сделать нельзя и почему.** QID не проставлен ни одному из трёх: поиск
Wikidata подтвердил замер 2026-06-13 — items просто нет. Единственный путь —
создание через `Special:NewItem`, а это внешняя правка, на которую по
[.ai_state.md](https://github.com/gasyoun/RussianRamayana/blob/main/.ai_state.md)
нужно согласие М. Г.; задание H3558 прямо относит создание Wikidata-items к
дорожке C. Поэтому в роадмапе пункт разделён: агентская половина (VIAF по
существующим записям) закрыта, half-C (создание items) остаётся открытой.

**Техническая заметка на будущее.** Старые REST-пути VIAF для кластера
(`/viaf/<id>/viaf.json`, `/viaf/<id>/`, `/en/viaf/<id>`) отдают HTTP 404
`no Route matched with those values`; рабочий вызов — POST на
`https://viaf.org/api/cluster-record` с телом
`{"reqValues":{"field":"local.viafID","index":"VIAF","recordId":"<id>"},"meta":{"env":"prod","pageIndex":0,"pageSize":1}}`.
GET на тот же путь отдаёт 405.

_Dr. Mārcis Gasūns_
