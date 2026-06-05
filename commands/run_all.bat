@echo off
title Eduverse Launcher

start "Eduverse API" cmd /c "%~dp0run_api.bat"
start "Eduverse Client" cmd /c "%~dp0run_client.bat"
echo.
echo Both applications have been started in separate windows.
echo You can close this window now.
timeout /t 5
