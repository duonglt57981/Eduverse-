@echo off
title Eduverse API
echo ===================================================
echo Starting Eduverse API (.NET Core)
echo Working directory: %~dp0..\Eduverse_API\Eduverse.Api
echo ===================================================
cd /d "%~dp0..\Eduverse_API\Eduverse.Api"
start http://localhost:5002/swagger
dotnet run --launch-profile http
if %ERRORLEVEL% neq 0 (
    echo.
    echo API encountered an error during execution.
    pause
)
