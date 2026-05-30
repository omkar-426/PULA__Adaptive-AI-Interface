@echo off
title Pula Launcher
color 0A

echo.
echo  ================================
echo        PULA - Starting Up!
echo  ================================
echo.

:: Get current directory
set ROOT=%~dp0

:: Start Django backend
echo  Starting Backend...
start "Pula Backend" cmd /k "cd /d %ROOT%backend && venv\Scripts\activate && python manage.py runserver"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Start React frontend
echo  Starting Frontend...
start "Pula Frontend" cmd /k "cd /d %ROOT%frontend && npm start"

echo.
echo  Backend  → http://localhost:8000
echo  Frontend → http://localhost:3000
echo.
pause