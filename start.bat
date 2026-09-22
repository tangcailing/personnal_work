@echo off
chcp 65001 >nul
echo ========================================
echo   个人工作台 - 本地服务器
echo ========================================
echo.
echo 正在启动服务器...
echo.

cd /d "%~dp0"

:: 尝试使用 Python 3
python -m http.server 8000 2>nul
if %errorlevel% equ 0 goto :end

:: 如果失败，尝试 Python 2
python -m SimpleHTTPServer 8000 2>nul
if %errorlevel% equ 0 goto :end

:: 如果还是失败，给出提示
echo.
echo ❌ 未检测到 Python！
echo.
echo 请安装 Python 或使用其他方法：
echo 1. 访问 https://www.python.org 下载安装
echo 2. 或使用下面的 Node.js 方法
echo.
pause
exit

:end
echo.
echo ✅ 服务器已停止
pause
