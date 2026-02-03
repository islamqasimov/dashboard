Set WshShell = CreateObject("WScript.Shell")
' Замените на полный путь к вашему BAT файлу
WshShell.Run chr(34) & "C:\Users\User\Desktop\Dashboard\start_dashboard.bat" & Chr(34), 0
Set WshShell = Nothing
