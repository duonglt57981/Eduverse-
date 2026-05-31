@echo off
title Eduverse Docker Builder
cd /d "%~dp0.."

echo ===================================================
echo Welcome to Eduverse Docker Image Builder
echo ===================================================
echo.

:CHOOSE_ENV
echo Please choose the environment to build Docker images:
echo [1] Development (dev)
echo [2] Production (prod)
set /p ENV_CHOICE="Enter choice (1 or 2): "

if "%ENV_CHOICE%"=="1" (
    set TARGET_ENV=dev
    goto :BUILD
)
if "%ENV_CHOICE%"=="2" (
    set TARGET_ENV=prod
    goto :BUILD
)

echo Invalid choice. Please try again.
goto :CHOOSE_ENV

:BUILD
echo.
echo ===================================================
echo Building Docker Images for %TARGET_ENV% environment
echo ===================================================
echo.

if "%TARGET_ENV%"=="dev" (
    echo Building client dev image...
    docker build --target dev -t eduverse-client:dev -f eduverse_client/Dockerfile eduverse_client
    
    echo.
    echo Building API dev image...
    docker build --target dev -t eduverse-api:dev -f Eduverse_API/Dockerfile Eduverse_API
) else (
    echo Building client prod image...
    docker build --target prod -t eduverse-client:prod -f eduverse_client/Dockerfile eduverse_client
    
    echo.
    echo Building API prod image...
    docker build --target prod -t eduverse-api:prod -f Eduverse_API/Dockerfile Eduverse_API
)

echo.
echo ===================================================
echo Docker Build Complete!
echo ===================================================
pause
