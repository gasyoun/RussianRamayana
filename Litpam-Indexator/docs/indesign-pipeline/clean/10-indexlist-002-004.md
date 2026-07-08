# 10. Подготовка файлов IndexList 002, 003, 004

_Created: 08-07-2026 · Last updated: 08-07-2026_

- 🎬 Видео: <https://www.youtube.com/watch?v=wC62L0XMGSk>
- 📄 Сырая ASR-расшифровка: [10 Подготовка файлов IndexList 002,IndexList 003,IndexList 004.txt](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/10%20%D0%9F%D0%BE%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%BA%D0%B0%20%D1%84%D0%B0%D0%B9%D0%BB%D0%BE%D0%B2%20IndexList%20002%2CIndexList%20003%2CIndexList%20004%20%5BwC62L0XMGSk%5D.txt)
- 🔧 Стадия: **[1] Подготовка таблиц** · Скрипт: `UseReadyTable.v.7.jsx`

---

Дополнение к предыдущему: скрипт сохраняет файлы с нарастающим номером — первый как `IndexList-001`, следующий `002` и т. д.

**Географический указатель (002).**
1. В `.xlsx` выделяем нужные колонки географического листа, копируем.
2. Вставляем в вёрстку. Пустых строк много: выделяем нижнюю пустую, прокручиваем вверх, с `Shift` выделяем весь блок пустых строк — удаляем. Убираем и верхнюю служебную строку.
3. Запускаем `UseReadyTable.v.7.jsx` (отрабатывает меньше чем за минуту). Сохраняем как `002` (скрипт по умолчанию снова предлагает `001` — сохраняем под нужным номером). Закрываем.

**Предметы и термины (003).** Копируем лист, вставляем, так же удаляем пустые и служебную строки, запускаем тот же скрипт, сохраняем как `003`.

**Флора и фауна (004).** То же самое: копируем, вставляем, чистим строки, запускаем скрипт, сохраняем как `004`.

Итого четыре таблицы (`IndexList-001`…`004`). Дальше — как объединить их в одну сводную таблицу, с которой уже работает основной скрипт индексирования.

## Тайм-коды (по субтитрам ролика)

Посекундные ссылки открывают ролик на нужном моменте (собрано из авто-субтитров, файл-провенанс [`timed/10-wC62L0XMGSk.ru.json3`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/timed/10-wC62L0XMGSk.ru.json3)):

- [0:00](https://www.youtube.com/watch?v=wC62L0XMGSk&t=0s) — Скрипт сам сохраняет файл с номером (IndexList-001…)
- [2:25](https://www.youtube.com/watch?v=wC62L0XMGSk&t=145s) — Готовим 002
- [4:13](https://www.youtube.com/watch?v=wC62L0XMGSk&t=253s) — Готовим 003
- [4:34](https://www.youtube.com/watch?v=wC62L0XMGSk&t=274s) — Готовим 004 (флора и фауна)
- [6:05](https://www.youtube.com/watch?v=wC62L0XMGSk&t=365s) — Четыре таблицы готовы — сохраняем
- [6:31](https://www.youtube.com/watch?v=wC62L0XMGSk&t=391s) — Дальше — объединение в сводную таблицу

---

> _Выверено из авто-субтитров: исправлены ошибки распознавания (имена скриптов, стилей и цветов — по_ [`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc) _и_ [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md)_), расставлена пунктуация, добавлена разбивка на шаги. Смысл и порядок действий автора сохранены; сырой файл оставлен как провенанс._
