@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "CONTROLL_DIR=%SCRIPT_DIR%"
set "CONTROLL_PY=%CONTROLL_DIR%.venv\Scripts\python.exe"
set "OLLAMA_EXE=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
set "OLLAMA_MODELS_DIR=C:\Users\kamit\Desktop\AIPA\ai_models"
set "AIPA_OLLAMA_MODEL=qwen2.5:7b"
set "AIPA_OLLAMA_URL=http://127.0.0.1:11434"
set "AIPA_ENABLE_HF_FALLBACK=0"
set "AIPA_WEB_SEARCH_MODE=smart"
set "SERPER_API_KEY="
set "SERPAPI_API_KEY=c629e7a7a90a45a8c084a2663bcd9ccf5837bb88ea711d9a1fa5bf22f4c11abb"
set "OPENAI_API_KEY="
set "GEMINI_API_KEY="

if not exist "%CONTROLL_DIR%chat_server.py" (
  echo [ERROR] Khong tim thay chat_server.py trong: %CONTROLL_DIR%
  pause
  exit /b 1
)

if not exist "%CONTROLL_PY%" (
  echo [ERROR] Khong tim thay Python venv: %CONTROLL_PY%
  echo Hay tao/cai thu vien truoc:
  echo   py -m venv .venv
  echo   .\.venv\Scripts\python -m pip install -r requirements-chat.txt
  pause
  exit /b 1
)

if /i "%~1"=="--dry-run" (
  echo [DRY-RUN] Se chay lenh:
  echo set OLLAMA_MODELS=%OLLAMA_MODELS_DIR%
  echo set AIPA_OLLAMA_MODEL=%AIPA_OLLAMA_MODEL%
  echo set AIPA_OLLAMA_URL=%AIPA_OLLAMA_URL%
  echo set AIPA_WEB_SEARCH_MODE=%AIPA_WEB_SEARCH_MODE%
  echo set SERPER_API_KEY=***hidden***
  echo set SERPAPI_API_KEY=***hidden***
  echo set OPENAI_API_KEY=%OPENAI_API_KEY%
  echo set GEMINI_API_KEY=%GEMINI_API_KEY%
  echo set AIPA_ENABLE_HF_FALLBACK=%AIPA_ENABLE_HF_FALLBACK%
  echo cd /d "%CONTROLL_DIR%" ^&^& "%CONTROLL_PY%" -m uvicorn chat_server:app --host 0.0.0.0 --port 8001
  exit /b 0
)

cd /d "%CONTROLL_DIR%"
if not exist "%OLLAMA_MODELS_DIR%" mkdir "%OLLAMA_MODELS_DIR%"
set "OLLAMA_MODELS=%OLLAMA_MODELS_DIR%"
set "AIPA_OLLAMA_MODEL=%AIPA_OLLAMA_MODEL%"
set "AIPA_OLLAMA_URL=%AIPA_OLLAMA_URL%"
set "AIPA_ENABLE_HF_FALLBACK=%AIPA_ENABLE_HF_FALLBACK%"
set "AIPA_WEB_SEARCH_MODE=%AIPA_WEB_SEARCH_MODE%"
set "SERPER_API_KEY=%SERPER_API_KEY%"
set "SERPAPI_API_KEY=%SERPAPI_API_KEY%"
set "OPENAI_API_KEY=%OPENAI_API_KEY%"
set "GEMINI_API_KEY=%GEMINI_API_KEY%"
set "OLLAMA_OK=0"

if "%SERPER_API_KEY%%SERPAPI_API_KEY%"=="" (
  echo [WARN] Chua co SERPAPI_API_KEY/SERPER_API_KEY. Cau hoi can tra cuu/tai lieu se khong tim tren Google.
)

if exist "%OLLAMA_EXE%" (
  set "PATH=%LOCALAPPDATA%\Programs\Ollama;%PATH%"
  powershell -NoProfile -Command "try { Invoke-RestMethod -Uri '%AIPA_OLLAMA_URL%/api/tags' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
  if not errorlevel 1 set "OLLAMA_OK=1"
  if errorlevel 1 (
    echo Khoi dong Ollama serve ^(hidden^)...
    powershell -NoProfile -Command "$env:OLLAMA_MODELS='%OLLAMA_MODELS_DIR%'; Start-Process -FilePath '%OLLAMA_EXE%' -ArgumentList 'serve' -WindowStyle Hidden"
    for /l %%I in (1,1,30) do (
      powershell -NoProfile -Command "try { Invoke-RestMethod -Uri '%AIPA_OLLAMA_URL%/api/tags' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
      if not errorlevel 1 (
        set "OLLAMA_OK=1"
        goto :ollama_ready
      )
      timeout /t 1 >nul
    )
  )
) else (
  echo [WARN] Chua tim thay Ollama tai: %OLLAMA_EXE%
)

:ollama_ready
if "%OLLAMA_OK%"=="1" (
  echo Ollama API san sang: %AIPA_OLLAMA_URL%
) else (
  echo [WARN] Khong ket noi duoc Ollama API: %AIPA_OLLAMA_URL%
  echo [WARN] AI se fallback neu local model chua san sang.
)
echo Dang chay backend voi local model: %AIPA_OLLAMA_MODEL%
"%CONTROLL_PY%" -m uvicorn chat_server:app --host 0.0.0.0 --port 8001

endlocal
