@echo off
title WhatsApp Checker
cd /d "%~dp0"
echo ============================================================
echo   WhatsApp Checker
echo   A Chrome window will open. If it shows a QR code, scan it
echo   on your phone: WhatsApp - Settings - Linked devices.
echo   (Make sure the Leads Manager server is running.)
echo ============================================================
echo.
node check.js
pause
