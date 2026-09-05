# 13. Перенос в IndexList символьных стилей от теговой разметки

_Created: 08-07-2026 · Last updated: 08-07-2026_

- 🎬 Видео: <https://www.youtube.com/watch?v=XTIfFdqQyeE>
- 📄 Сырая ASR-расшифровка: [13 Перенос в IndexList символьных стилей, созданных при переносе теговой разметки.txt](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/13%20%D0%9F%D0%B5%D1%80%D0%B5%D0%BD%D0%BE%D1%81%20%D0%B2%20IndexList%20%D1%81%D0%B8%D0%BC%D0%B2%D0%BE%D0%BB%D1%8C%D0%BD%D1%8B%D1%85%20%D1%81%D1%82%D0%B8%D0%BB%D0%B5%D0%B9%2C%20%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%20%D0%BF%D1%80%D0%B8%20%D0%BF%D0%B5%D1%80%D0%B5%D0%BD%D0%BE%D1%81%D0%B5%20%D1%82%D0%B5%D0%B3%D0%BE%D0%B2%D0%BE%D0%B9%20%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%82%D0%BA%D0%B8%20%5BXTIfFdqQyeE%5D.txt)
- 🔧 Стадия: **[0]/[1] Стык стадий** · Скрипт: `#GatherStyleNamesInIndexList(new).jsx`

---

Отдельный, но обязательный шаг перед индексированием (вынесен в отдельное видео, чтобы не потерялся): если запустить весь процесс без него — потеряете время впустую.

Нужно перенести из файла вёрстки «Рамаяны» в сводный `IndexList` все **символьные стили**, подготовленные во время теговой разметки. Делается так:

1. Открываем два файла — вёрстку и `IndexList`.
2. В папке `[0. Работа с тегированной разметкой]` есть скрипт сбора имён стилей — `#GatherStyleNamesInIndexList(new).jsx`.
3. Ставим курсор в текст вёрстки, затем ставим курсор в `IndexList`, и запускаем «собрать символьные стили».

В колонке стилей появляются имена (например, «Мир Брахмы») — не в каждой ячейке, местами, там, где были стили в разметке. Всё, что было в разметке, попало сюда. Теперь можно готовить указатель.

## Тайм-коды (по субтитрам ролика)

Посекундные ссылки открывают ролик на нужном моменте (собрано из авто-субтитров, файл-провенанс [`timed/13-XTIfFdqQyeE.ru.json3`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/docs/indesign-pipeline/timed/13-XTIfFdqQyeE.ru.json3)):

- [0:01](https://www.youtube.com/watch?v=XTIfFdqQyeE&t=1s) — Два файла готовы; заводим папку save
- [1:53](https://www.youtube.com/watch?v=XTIfFdqQyeE&t=113s) — Символьные стили перенесены в IndexList

---

> _Выверено из авто-субтитров: исправлены ошибки распознавания (имена скриптов, стилей и цветов — по_ [`ForIndex.jsxinc`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/%23Indexing.%20Ramayana/ForIndex.jsxinc) _и_ [`CLAUDE.md`](https://github.com/gasyoun/RussianRamayana/blob/main/Litpam-Indexator/CLAUDE.md)_), расставлена пунктуация, добавлена разбивка на шаги. Смысл и порядок действий автора сохранены; сырой файл оставлен как провенанс._

_Dr. Mārcis Gasūns_
