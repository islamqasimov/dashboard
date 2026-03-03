@echo off
REM Переходим в папку со скриптом
cd /d "%~dp0"

REM Запускаем Node.js сервер
node server/index.js

REM Если возникла ошибка, ждем перед закрытием окна
pause
