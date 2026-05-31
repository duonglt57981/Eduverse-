@echo off
title Eduverse Launcher ^& Git Sync
cd /d "%~dp0.."

echo.

:CHOOSE_BRANCH
echo Please choose the branch you want to work on:
echo [1] main
echo [2] duonglt
echo [3] LuongHau
set /p BRANCH_CHOICE="Enter choice (1, 2, or 3): "

if "%BRANCH_CHOICE%"=="1" (
    set TARGET_BRANCH=main
    goto :BRANCH_CONFIRMED
)
if "%BRANCH_CHOICE%"=="2" (
    set TARGET_BRANCH=duonglt
    goto :BRANCH_CONFIRMED
)
if "%BRANCH_CHOICE%"=="3" (
    set TARGET_BRANCH=LuongHau
    goto :BRANCH_CONFIRMED
)

echo Invalid choice. Please try again.
goto :CHOOSE_BRANCH

:BRANCH_CONFIRMED
echo.
echo Selected branch: %TARGET_BRANCH%
echo.

goto :GIT_SYNC

:GIT_SYNC
echo.
echo Checking for local changes...
set HAS_CHANGES=0
for /f "tokens=*" %%i in ('git status --porcelain') do set HAS_CHANGES=1

if "%HAS_CHANGES%"=="1" (
    echo Local changes detected. Stashing your changes...
    git stash -u
    set STASHED=1
) else (
    set STASHED=0
)

echo Switching to main branch...
git checkout main

echo Pulling latest code on main...
git pull origin main

echo Switching to %TARGET_BRANCH%...
git checkout %TARGET_BRANCH%

if not "%TARGET_BRANCH%"=="main" (
    echo Merging main into %TARGET_BRANCH%...
    git merge main
)

if "%STASHED%"=="1" (
    echo Restoring your local changes...
    git stash pop
)
echo Git synchronization and merge complete.
echo.
goto :START_APPS


:START_APPS
echo Starting applications...
call "%~dp0run_all.bat"
