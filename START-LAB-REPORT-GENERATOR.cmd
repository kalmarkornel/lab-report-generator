@echo off
setlocal
cd /d "%~dp0"

set "LAB_PYTHON=C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%LAB_PYTHON%" goto run_server

where python >nul 2>nul
if not errorlevel 1 set "LAB_PYTHON=python"& goto run_server

where py >nul 2>nul
if not errorlevel 1 set "LAB_PYTHON=py"& goto run_server

echo A helyi tesztoldal inditasahoz Python szukseges.
echo Telepites utan inditsd ujra ezt a fajlt.
pause
exit /b 1

:run_server
start "" "http://localhost:3000/"
"%LAB_PYTHON%" work\preview_server.py

