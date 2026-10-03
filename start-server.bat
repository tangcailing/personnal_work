@echo off
chcp 65001 >nul
echo ========================================
echo    📱 个人工作台 - 移动端服务器
echo ========================================
echo.
echo 正在启动服务器...
echo.

cd /d "%~dp0"

python -m http.server 8000

pause