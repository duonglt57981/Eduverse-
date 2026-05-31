@echo off
title Eduverse Dev Manager
cd /d "%~dp0"

:MAIN_MENU
cls
echo ===================================================
echo             EDUVERSE DEVELOPMENT COMMANDS           
echo ===================================================
echo [1] Pull Latest Code
echo [2] Run ALL
echo [3] Run API 
echo [4] Run Client 
echo [5] Build Docker Images
echo [6] Exit
echo ===================================================
set /p MENU_CHOICE="Enter your choice (1-6): "

if "%MENU_CHOICE%"=="1" goto :GIT_SYNC
if "%MENU_CHOICE%"=="2" goto :RUN_ALL
if "%MENU_CHOICE%"=="3" goto :RUN_API
if "%MENU_CHOICE%"=="4" goto :RUN_CLIENT
if "%MENU_CHOICE%"=="5" goto :DOCKER_BUILD
if "%MENU_CHOICE%"=="6" exit

echo Invalid choice. Please press any key to try again...
pause > nul
goto :MAIN_MENU

:GIT_SYNC
call "%~dp0commands\start_dev.bat"
goto :MAIN_MENU

:RUN_ALL
call "%~dp0commands\run_all.bat"
goto :MAIN_MENU

:RUN_API
start "Eduverse API" cmd /c "%~dp0commands\run_api.bat"
goto :MAIN_MENU

:RUN_CLIENT
start "Eduverse Client" cmd /c "%~dp0commands\run_client.bat"
goto :MAIN_MENU

:DOCKER_BUILD
call "%~dp0commands\build_docker.bat"
goto :MAIN_MENU
