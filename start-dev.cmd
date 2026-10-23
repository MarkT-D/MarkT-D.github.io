@echo off
rem One-time setup + dev server for the portfolio site (Windows).
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS from https://nodejs.org and run this again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing packages, this takes a minute...
  call npm install
)

start "" cmd /c "timeout /t 10 >nul & start http://localhost:3100"
call npm run dev
pause
