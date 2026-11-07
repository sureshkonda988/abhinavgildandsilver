@echo off
TITLE Abhinav Gold and Silver - Live Server Launcher
COLOR 0A

echo ===============================================================================
echo            ABHINAV GOLD AND SILVER - FULL STACK LIVE LAUNCHER
echo ===============================================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/4] Checking and freeing ports (5000 and 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr /i "listening"') do (
    if "%%a" neq "0" taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr /i "listening"') do (
    if "%%a" neq "0" taskkill /F /PID %%a >nul 2>&1
)

echo [2/4] Starting Backend Server (Port 5000)...
cd /d "%ROOT_DIR%backend"
start "Abhinav Backend (Port 5000)" cmd /k "node server/index.js"

echo [3/4] Starting Frontend Server (Port 5173)...
cd /d "%ROOT_DIR%frontend"
start "Abhinav Frontend (Port 5173)" cmd /k "npm.cmd run dev"

echo.
echo Waiting for local servers to initialize...
ping 127.0.0.1 -n 5 >nul

echo [4/4] Starting Cloudflare Live Tunnel (abhinavgoldandsilver.com)...
cd /d "%ROOT_DIR%"
start "Abhinav Cloudflare Tunnel" cmd /k "cloudflared.exe --config cloudflared-config.yml tunnel run abhinav-live-server"

echo.
echo ===============================================================================
echo   ABHINAV GOLD AND SILVER IS LIVE:
echo     * Public Domain:   https://www.abhinavgoldandsilver.com
echo     * Apex Domain:     https://abhinavgoldandsilver.com
echo     * Local Frontend:  http://localhost:5173
echo     * Local Backend:   http://localhost:5000/api
echo.
echo   Keep the opened windows running in the background.
echo ===============================================================================
echo.
