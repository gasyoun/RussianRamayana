# Phase 1: Data Contracts

## Цель

Зафиксировать минимальные JSON-структуры для первой фазы.

## `data/fundraising/summary.json`

```json
{
  "goal_rub": 1000000,
  "monthly_goal_rub": 166000,
  "collected_rub": 0,
  "donor_count": 0,
  "updated_at": "2026-05-14"
}
```

Критерии:

- `goal_rub` равно `1000000`;
- `monthly_goal_rub` равно `166000`;
- `collected_rub` можно обновлять вручную;
- `donor_count` можно оставить `0`, если число доноров пока не публикуется;
- `updated_at` хранится в формате `YYYY-MM-DD`.

## `data/project-status.json`

```json
{
  "books": [
    {
      "id": "book-4",
      "status": "blocked",
      "public_note": "Книга IV задерживается из-за незавершенной вступительной статьи Серебряного; текущий сбор не может ускорить этот этап."
    },
    {
      "id": "book-5",
      "status": "in-progress",
      "public_note": "Перевод завершен; комментарии требуют примерно года работы; рукопись ориентировочно в 2027 году."
    },
    {
      "id": "book-6",
      "status": "draft-ready",
      "public_note": "Черновой литературный перевод готов полностью; оптимальный ориентир дальнейшей работы — 2029 год."
    }
  ]
}
```

Критерии:

- есть ровно три записи для книг IV-VI;
- статусы не должны обещать невозможного;
- книга IV явно отделена от текущего сбора;
- книга VI не публикует закрытый черновик.

## `data/payment-methods.json`

```json
{
  "methods": [
    { "id": "boosty", "label": "Boosty", "type": "subscription", "url": "" },
    { "id": "sber", "label": "Сбер", "type": "one-time", "url": "" },
    { "id": "patreon", "label": "Patreon", "type": "subscription", "url": "" },
    { "id": "paypal-proxy", "label": "PayPal через посредника", "type": "one-time", "url": "" },
    { "id": "bank-transfer", "label": "Банковский перевод", "type": "one-time", "url": "" }
  ]
}
```

Критерии:

- пустые `url` допустимы как placeholder;
- не добавлять криптовалюту;
- не добавлять реальные реквизиты без явной команды;
- зарубежные способы отделены от рублевых.
