@echo off
title Eduverse Launcher

start "Eduverse Elasticsearch" cmd /c "%~dp0run_elasticsearch.bat"
start "Eduverse API" cmd /c "%~dp0run_api.bat"
start "Eduverse Client" cmd /c "%~dp0run_client.bat"
echo.
echo Elasticsearch, API, and Client have been started in separate windows.
echo You can close this window now.
timeout /t 5
