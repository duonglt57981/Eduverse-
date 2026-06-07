@echo off
title Eduverse API

cd /d "%~dp0..\Eduverse_API\Eduverse.Api"
start http://localhost:5002/swagger
dotnet run --launch-profile http
if %ERRORLEVEL% neq 0 (
    echo.
    echo API encountered an error during execution.
    pause
)
