@echo off
REM Переходим в папку со скриптом
cd /d "%~dp0"

REM Запускаем Python сервер
python3 server.py

REM Если возникла ошибка, ждем перед закрытием окна
pause
