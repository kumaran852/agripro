@echo off
chcp 65001 >nul
title Farm Direct AI — One-Click Demo Starter
cls

echo.
echo   ╔══════════════════════════════════════════════════════════════╗
echo   ║    🌾 FARM DIRECT AI — ONE-CLICK DEMO STARTER (WINDOWS)     ║
echo   ║                                                              ║
echo   ║    Starts 4 processes:                                       ║
echo   ║      1. MongoDB service check                                ║
echo   ║      2. Python AI (FastAPI)  → http://localhost:5000         ║
echo   ║      3. Node API (Express)   → http://localhost:4000         ║
echo   ║      4. React Web (Vite)     → http://localhost:5173         ║
echo   ╚══════════════════════════════════════════════════════════════╝
echo.

set ROOT=%~dp0
set AI=%ROOT%farmdirect-ai
set API=%ROOT%farmdirect-api
set WEB=%ROOT%farmdirect-web
set PY_EXE=
where py >nul 2>nul && (
  set PY_EXE=py -3.11
)
if "%PY_EXE%"=="" (
  where python >nul 2>nul && (set PY_EXE=python)
)

echo [1/5] Checking MongoDB service...
sc query MongoDB >nul 2>nul
if %errorlevel%==0 (
  echo       → MongoDB service detected. Starting...
  net start MongoDB >nul 2>nul
) else (
  echo       WARNING: MongoDB service not found. Trying to launch mongod.exe directly...
  where mongod >nul 2>nul
  if %errorlevel%==0 (
    if not exist "%ROOT%.mongodb-data" mkdir "%ROOT%.mongodb-data"
    start "MongoDB" /MIN cmd /c mongod --dbpath "%ROOT%.mongodb-data" --port 27017
    echo       Started mongod.exe with data dir: %ROOT%.mongodb-data
  ) else (
    echo       ⚠️  mongod.exe not in PATH. Install MongoDB Community Server, OR set MONGO_URI
    echo          in farmdirect-api\.env to a MongoDB Atlas / remote URI.
  )
)
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Installing Python deps (once) then starting AI service...
cd /d "%AI%"
if not exist "%AI%\.venv" (
  echo       Creating virtualenv .venv in %AI%
  if "%PY_EXE%"=="" (
    echo       ⚠️  No Python found. Install Python 3.11+ and add to PATH.
    pause
    exit /b 1
  )
  %PY_EXE% -m venv "%AI%\.venv"
  call "%AI%\.venv\Scripts\activate.bat"
  python -m pip install --upgrade pip
  python -m pip install -r requirements.txt
) else (
  call "%AI%\.venv\Scripts\activate.bat"
)
start "FarmDirect AI (:5000)" cmd /k "cd /d ""%AI%"" && call ""%AI%\.venv\Scripts\activate.bat"" && python -m uvicorn app.main:app --port 5000"

echo.
echo [3/5] Installing Node deps (once) → seeding DB → starting API on :4000...
cd /d "%API%"
if not exist "%API%\node_modules" (
  call npm install --no-audit --no-fund
)
if not exist "%API%\.env" (
  copy "%API%\.env.example" "%API%\.env" >nul
)
echo       Running seed script (idempotent, clears+re-creates demo data)...
call node src/seed/seed.js
start "FarmDirect API (:4000)" cmd /k "cd /d ""%API%"" && npm run dev"

echo.
echo [4/5] Waiting for API boot, then starting React web on :5173...
timeout /t 5 /nobreak >nul
cd /d "%WEB%"
if not exist "%WEB%\node_modules" (
  call npm install --no-audit --no-fund
)
start "FarmDirect Web (:5173)" cmd /k "cd /d ""%WEB%"" && npm run dev"

echo.
echo [5/5] Waiting for all services...
timeout /t 8 /nobreak >nul

echo.
echo   ✅ All services should be running now:
echo.
echo      🐍 Python AI   http://localhost:5000/internal/ai/health
echo      🔌 Node API    http://localhost:4000/v1/health
echo      🌐 React UI    http://localhost:5173   ← Open this in browser!
echo.
echo   Demo logins (pre-seeded):
echo     👨‍🌾 Farmer  ramesh@farmdirect.ai   / farm1234
echo     🛒 Buyer   priya@farmdirect.ai    / buy1234
echo     ⚙️  Admin   admin@farmdirect.ai    / admin1234
echo.
echo   Tip: On the landing page click [I'm a Farmer] or [I'm a Buyer] for
echo        passwordless 1-click demo login.
echo.
echo   To STOP: close the 3 popup windows (AI, API, Web). MongoDB will keep
echo         running as a service (or close its window if you started it manually).
echo.
pause
start "" "http://localhost:5173"
