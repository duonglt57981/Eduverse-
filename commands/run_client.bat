@echo off
title Eduverse Client

cd /d "%~dp0..\eduverse_client"
echo Starting Eduverse Client... Please wait a few seconds for the dev server to start.
echo.
start /b cmd /c "timeout /t 4 >nul && start http://localhost:3000"
npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo Client encountered an error during execution.
    pause
)
