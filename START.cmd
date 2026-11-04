@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Hay cai Node.js 22 tro len tu https://nodejs.org roi mo lai file nay.
 pause
 exit /b 1
)
echo Mo http://127.0.0.1:3210 trong trinh duyet.
echo Giu cua so nay mo trong khi choi. Ctrl+C de dung.
node server.mjs
pause
