@echo off
title Eduverse API

cd /d "%~dp0..\Eduverse_API\Eduverse.Api"
echo Starting Eduverse API... Please wait a few seconds for the build to complete.
echo Once the server is running, the browser will open or you can refresh.
echo.
start /b cmd /c "timeout /t 5 >nul && start http://localhost:5002/swagger"
dotnet run --launch-profile http
if %ERRORLEVEL% neq 0 (
    echo.
    echo API encountered an error during execution.
    pause
)
