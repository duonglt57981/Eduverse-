@echo off
chcp 65001 >nul
title Eduverse API - Xem ma OTP
setlocal

cd /d "%~dp0Eduverse_API"

echo ================================================================
echo   EduVerse - Bien dich lai API va theo doi ma OTP
echo ================================================================
echo.

echo [1/2] Dang bien dich lai (dotnet build)...
echo.
dotnet build > "%~dp0build-log.txt" 2>&1
set BUILD_RESULT=%ERRORLEVEL%

rem Chi hien cac dong LOI, bo qua warning cho de doc
findstr /C:"error CS" /C:"error MSB" "%~dp0build-log.txt"

if not "%BUILD_RESULT%"=="0" (
    echo.
    echo ================================================================
    echo   BIEN DICH THAT BAI
    echo ================================================================
    echo   Cac dong loi da hien o tren.
    echo   Toan bo nhat ky da luu vao:  build-log.txt
    echo   Gui file do lai de sua nhanh hon chup man hinh.
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================================
echo   BIEN DICH THANH CONG
echo ================================================================
echo.
echo LUU Y: Neu API dang chay san o cua so khac (start.bat - Run API)
echo        hay DONG cua so do lai truoc, roi bam phim bat ky o day.
echo.
pause

echo.
echo [2/2] Dang khoi dong API tai http://localhost:5002
echo.
echo ================================================================
echo   MA OTP SE HIEN NGAY TRONG CUA SO NAY, TRONG KHUNG:
echo.
echo   [EduVerse][SMS] CHE DO GHI LOG
echo     Nguoi nhan : 0987961307
echo     Noi dung   : EduVerse: Ma xac minh ... la 482915 ...
echo.
echo   THAO TAC TREN TRINH DUYET:
echo     Buoc 1 - Cai dat / Tai khoan / bam nut cam "Xac minh ngay"
echo     Buoc 2 - /auth/forgot-password / chon "Qua so dien thoai"
echo.
echo   Nhan Ctrl + C de dung API.
echo ================================================================
echo.

cd Eduverse.Api
dotnet run --launch-profile http

endlocal
