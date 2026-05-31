@echo off
title Eduverse Client
echo ===================================================
echo Starting Eduverse Client (Next.js)
echo Working directory: %~dp0eduverse_client
echo ===================================================
cd /d "%~dp0eduverse_client"
start http://localhost:3000
npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo Client encountered an error during execution.
    pause
)
