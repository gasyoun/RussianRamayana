# 12. Об одной ошибке в xlsx-файле

_Created: 08-07-2026 · Last updated: 08-07-2026_

- 🎬 Видео: <https://www.youtube.com/watch?v=azj_saSPq-c>
- 📄 Сырая ASR-расшифровка: [12 об одной ошибке в xlsx файле.txt](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/12%20%D0%BE%D0%B1%20%D0%BE%D0%B4%D0%BD%D0%BE%D0%B9%20%D0%BE%D1%88%D0%B8%D0%B1%D0%BA%D0%B5%20%D0%B2%20xlsx%20%D1%84%D0%B0%D0%B9%D0%BB%D0%B5%20%5Bazj_saSPq-c%5D.txt)
- 🔧 Стадия: **[1] Подготовка таблиц** · Скрипт: `предупреждение по словарю`

---

Предупреждение по рабочему словарю.

Когда я впервые запустил подготовку указателя по этой таблице, обработка зависла — на экране осталось слово «оружие». Стал разбираться: причина оказалась в комментарии в **третьей колонке (C)** — там был текст-пометка «без тега не искать», и именно он всё остановил.

Решение: этот кусок текста в колонке `C` нужно просто убрать. После этого всё работает.

---

> _Выверено из авто-субтитров: исправлены ошибки распознавания (имена скриптов, стилей и цветов — по_ [`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc) _и_ [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md)_), расставлена пунктуация, добавлена разбивка на шаги. Смысл и порядок действий автора сохранены; сырой файл оставлен как провенанс._
