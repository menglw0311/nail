@echo off
chcp 65001 >nul
echo ============================================
echo 快速修复麻将记录表
echo ============================================
echo.
echo 正在创建表...
echo.
node create-mahjong-table.js
echo.
echo ============================================
echo 查看详细日志: mahjong-table-creation.log
echo ============================================
echo.
echo 下一步：
echo 1. 重启后端服务器 (Ctrl+C 然后 npm start)
echo 2. 刷新前端页面
echo 3. 点击"麻将记录"
echo.
pause

