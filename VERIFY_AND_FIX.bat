@echo off
chcp 65001 >nul
cls
echo.
echo ============================================================
echo   麻将记录表 - 一键修复
echo ============================================================
echo.
echo 正在检查并创建麻将记录表...
echo.

node -e "const Database=require('better-sqlite3');const path=require('path');const db=new Database(path.join(__dirname,'database','accounting.db'));db.exec('CREATE TABLE IF NOT EXISTS mahjong_records(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,game_date DATE NOT NULL,game_time TIME,players TEXT NOT NULL,scores TEXT NOT NULL,win_amount DECIMAL(10,2),game_type VARCHAR(50),location VARCHAR(100),notes TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id)REFERENCES users(id)ON DELETE CASCADE);CREATE INDEX IF NOT EXISTS idx_mahjong_user_id ON mahjong_records(user_id);CREATE INDEX IF NOT EXISTS idx_mahjong_game_date ON mahjong_records(game_date);CREATE INDEX IF NOT EXISTS idx_mahjong_win_amount ON mahjong_records(win_amount);');const t=db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' AND name='mahjong_records'\").get();console.log(t?'✅ 成功！麻将记录表已创建':'❌ 失败！表创建失败');const c=db.prepare('SELECT COUNT(*) as count FROM mahjong_records').get();console.log('📊 当前记录数:',c.count);db.close();"

echo.
echo ============================================================
echo   下一步操作（重要！）
echo ============================================================
echo.
echo   1. 重启后端服务器：
echo      - 在运行后端的窗口按 Ctrl + C
echo      - 重新运行: npm start
echo.
echo   2. 刷新浏览器页面 (按 F5)
echo.
echo   3. 点击侧边栏的 "🀄 麻将记录"
echo.
echo ============================================================
echo.
pause

