@echo off
title Eduverse Elasticsearch
cd /d "%~dp0.."

where docker >nul 2>nul
if errorlevel 1 (
    echo Docker was not found on this machine.
    echo Please install/start Docker Desktop, then run this command again.
    pause
    exit /b 1
)

echo Starting Elasticsearch on http://localhost:9200 ...
docker compose up elasticsearch
