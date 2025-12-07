@echo off
chcp 65001 >nul
echo ========================================
echo 记账管理系统 - 快速部署脚本
echo ========================================
echo.

echo [1/5] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装
node --version
echo.

echo [2/5] 安装后端依赖...
call npm install
if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 后端依赖安装完成
echo.

echo [3/5] 初始化数据库...
if not exist "database" mkdir database
call npm run init-db
if errorlevel 1 (
    echo ❌ 数据库初始化失败
    pause
    exit /b 1
)
echo ✅ 数据库初始化完成
echo.

echo [4/5] 安装前端依赖...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo ✅ 前端依赖安装完成
cd ..
echo.

echo [5/5] 部署完成！
echo.
echo ========================================
echo 启动说明:
echo ========================================
echo 1. 启动后端: npm start (或 npm run dev)
echo 2. 启动前端: cd frontend ^&^& npm start
echo.
echo 后端地址: http://localhost:3000
echo 前端地址: http://localhost:3000 (或自动分配的端口)
echo.
echo 详细部署指南请查看 DEPLOYMENT.md
echo ========================================
pause

