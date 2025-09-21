@echo off
echo Iniciando AppSemillero...
echo.

echo Instalando dependencias...
call npm run install-all

echo.
echo Iniciando servidor y cliente...
call npm run dev

pause
