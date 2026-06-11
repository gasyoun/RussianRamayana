<#
  update-counter.ps1
  Обновление публичного счётчика сбора из приватного реестра поступлений.

  Читает donations_private.csv из папки _private/ (или указанного пути),
  агрегирует суммы и число доноров, обновляет data/fundraising/summary.json.

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
$donorNames = @{}

foreach ($d in $donations) {
  $amount = [double]$d.amount_rub
  if ($amount -gt 0) {
    $collected += $amount
  }
  $key = if ($d.anonymous -eq 'true') { "anon_$($donorNames.Count)" } else { $d.donor_name }
  $donorNames[$key] = $true
}

$summary = @{
  goal_rub         = 1000000
  monthly_goal_rub = 166000
  collected_rub    = [int]$collected
  donor_count      = $donorNames.Count
  updated_at       = (Get-Date -Format "yyyy-MM-dd")
}

$summary | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $OutputJson -Encoding UTF8

Write-Output "Обновлено: собрано $collected руб., $($donorNames.Count) доноров, дата $($summary.updated_at)"
Write-Output "Записано в: $((Resolve-Path $OutputJson).Path)"
