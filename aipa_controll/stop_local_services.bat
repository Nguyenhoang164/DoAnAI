@echo off
setlocal

echo Dang tat cac service da start cho AIPA...
powershell -NoProfile -Command ^
  "$targets = Get-CimInstance Win32_Process | Where-Object { " ^
  "($_.Name -eq 'python.exe' -and $_.CommandLine -match 'uvicorn\\s+chat_server:app') -or " ^
  "($_.Name -eq 'ollama.exe' -and $_.CommandLine -match '\\sserve(\\s|$)')" ^
  "}; " ^
  "$targets | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; " ^
  "Write-Output ('Da tat ' + ($targets | Measure-Object | Select-Object -ExpandProperty Count) + ' process.')"

echo Hoan tat.
endlocal
