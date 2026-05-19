param(
  [string]$RepoPath = "."
)

$repo = Resolve-Path $RepoPath
Write-Host "[retry-push] start: $repo" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

$count = 0
while ($true) {
  $count++
  Write-Host "[$count] git push..." -NoNewline
  $result = git -C $repo push 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host " OK" -ForegroundColor Green
    break
  }
  Write-Host " FAILED - retry in 15s" -ForegroundColor Red
    Write-Host "    Error: $result" -ForegroundColor Gray
  Start-Sleep -Seconds 15
}
