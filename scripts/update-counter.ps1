<#
  update-counter.ps1
  Обновление публичного счётчика сбора средств из приватного реестра поступлений.

  Читает donations_private.csv из папки _private/ (или указанного пути),
  агрегирует суммы и число доноров и обновляет ТОЛЬКО блок onetime в
  data/fundraising/summary.json; блок monthly сохраняется из существующего
  файла (этим скриптом он не вычисляется).

  Схема — вложенная структура, которую читают index.html и support.html
  и пишет scripts/import_donations.py:

    { "onetime":  { "goal_rub", "collected_rub", "donor_count" },
      "monthly":  { "goal_rub", "pledged_rub", "supporter_count" },
      "updated_at" }

  (до 23-11-2026 скрипт писал плоский формат {collected_rub, donor_count,
  ...}: data.onetime у потребителей становился undefined, и обе страницы
  падали в аварийную ветку загрузки — багхант 23-11-2026, HIGH).

  Формат CSV: date,platform,amount_rub,donor_name,public_name,anonymous
#>

param(
  [string]$PrivateCsv = "..\_private\donations_private.csv",
  [string]$OutputJson = "..\data\fundraising\summary.json"
)

Set-Location -LiteralPath $PSScriptRoot

if (-not (Test-Path -LiteralPath $PrivateCsv)) {
  Write-Error "Приватный CSV не найден: $PrivateCsv"
  Write-Output "Ожидаемый формат CSV: date,platform,amount_rub,donor_name,public_name,anonymous"
  Write-Output "Создайте папку _private с файлом donations_private.csv и запустите скрипт снова."
  exit 1
}

$donations = Import-Csv -LiteralPath $PrivateCsv

$collected = 0
$donorKeys = @{}

foreach ($d in $donations) {
  $amount = [double]$d.amount_rub
  if ($amount -gt 0) {
    $collected += $amount
  }
  # Донор считается один раз по имени; анонимность не порождает новый ключ
  # (те же правила подсчёта, что в scripts/import_donations.py). Раньше
  # анонимные доноры получали ключ "anon_<N>" на каждую строку, и повторные
  # пожертвования одного человека раздували donor_count.
  $name = if ([string]::IsNullOrWhiteSpace($d.donor_name)) { "unknown" } else { $d.donor_name.Trim() }
  $key = $name.ToLowerInvariant()
  $donorKeys[$key] = $true
}

# Существующий summary.json сохраняется целиком, кроме блока onetime,
# который этот скрипт пересчитывает; при отсутствии/битом файле берутся
# значения по умолчанию (равны текущим данным на main).
$summary = $null
if (Test-Path -LiteralPath $OutputJson) {
  try {
    $summary = Get-Content -LiteralPath $OutputJson -Raw -Encoding UTF8 | ConvertFrom-Json
  } catch {
    Write-Warning "Не удалось разобрать $OutputJson — будет создан заново: $($_.Exception.Message)"
    $summary = $null
  }
}
if ($null -eq $summary) {
  $summary = [pscustomobject]@{}
}
if ($null -eq $summary.onetime) {
  $summary | Add-Member -NotePropertyName onetime -NotePropertyValue ([pscustomobject]@{
    goal_rub = 1000000; collected_rub = 0; donor_count = 0
  })
}
if ($null -eq $summary.monthly) {
  $summary | Add-Member -NotePropertyName monthly -NotePropertyValue ([pscustomobject]@{
    goal_rub = 166000; pledged_rub = 0; supporter_count = 0
  })
}

$summary.onetime.collected_rub = [int]$collected
$summary.onetime.donor_count = $donorKeys.Count
if (-not ($summary.onetime.PSObject.Properties['goal_rub'])) {
  $summary.onetime | Add-Member -NotePropertyName goal_rub -NotePropertyValue 1000000
}
$summary.updated_at = (Get-Date -Format "yyyy-MM-dd")

# BOM-less UTF-8: Set-Content -Encoding UTF8 пишет BOM (PS 5.1), который
# ломает строгие парсеры; WriteAllText + UTF8Encoding($false) даёт чистый
# UTF-8 на Windows PowerShell 5.1 и pwsh 7 одинаково.
$json = $summary | ConvertTo-Json -Depth 5
$full = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputJson)
[System.IO.File]::WriteAllText($full, $json + [Environment]::NewLine, (New-Object System.Text.UTF8Encoding($false)))

Write-Output "Обновлено: собрано $collected руб., $($donorKeys.Count) доноров, дата $($summary.updated_at)"
Write-Output "Записано в: $((Resolve-Path $OutputJson).Path)"
