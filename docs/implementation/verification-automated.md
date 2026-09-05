_Created: 15-05-2026 · Last updated: 05-09-2026_

# Automated Verification

Запустить из корня репозитория.

## Git Status

```powershell
git status --short
```

Критерий:

- изменены только ожидаемые файлы;
- нет новых MP3, PDF, изображений;
- нет приватных таблиц доноров.

## Whitespace

```powershell
git diff --check
```

Критерий:

- нет ошибок;
- предупреждение LF/CRLF допустимо.

## JSON Parse

```powershell
node -e "for (const f of ['data/fundraising/summary.json','data/project-status.json','data/payment-methods.json']) { JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('ok', f); }"
```

Критерий:

- все три JSON читаются без ошибок.

## Required Files

```powershell
Test-Path support.html
Test-Path data/fundraising/summary.json
Test-Path data/project-status.json
Test-Path data/payment-methods.json
```

Критерий:

- все команды возвращают `True`.

## Required Text

```powershell
Select-String -Path index.html,support.html -SimpleMatch '1 000 000', '166 000', 'Поддержать перевод'
```

Критерий:

- ключевые тексты найдены.

## No Private Donor Data

```powershell
rg -n "card|паспорт|phone|телефон|email|paypal@|сбер.*\\d{4}" index.html support.html data
```

Критерий:

- нет реальных персональных данных;
- нет реальных реквизитов без явной команды.

## No Oversized New Files

```powershell
git status --porcelain
```

Критерий:

- в списке новых файлов нет MP3, PDF, PNG, JPG, MOV.

_Dr. Mārcis Gasūns_
