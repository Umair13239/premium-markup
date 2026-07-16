@echo off
title PremiumMarkup — one app (site + admin + leads portal)
cd /d "%~dp0"
echo ============================================================
echo   PremiumMarkup  ->  http://localhost:3001
echo   Website        : /
echo   Admin login    : /admin   (then "Leads Portal" in the sidebar)
echo ============================================================
echo.
echo   Starting... (first run compiles; give it a moment)
start "" http://localhost:3001/admin
npm run dev
pause
