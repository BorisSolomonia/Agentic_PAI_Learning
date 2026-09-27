@echo off
setlocal
cd /d "%~dp0build\engine-room-v2"
echo Opening the LifeOS visual learning guide.
echo Keep this window open while using the guide. Close it to stop the local server.
echo.
start "" "http://127.0.0.1:4178/"
node scripts\serve.mjs
pause
