#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'accounting.db');
const db = new Database(dbPath);

console.log('\n创建麻将记录表...\n');

try {
  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS mahjong_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game_date DATE NOT NULL,
      game_time TIME,
      players TEXT NOT NULL,
      scores TEXT NOT NULL,
      win_amount DECIMAL(10, 2),
      game_type VARCHAR(50),
      location VARCHAR(100),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_mahjong_user_id ON mahjong_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_mahjong_game_date ON mahjong_records(game_date);
    CREATE INDEX IF NOT EXISTS idx_mahjong_win_amount ON mahjong_records(win_amount);
  `);
  
  console.log('✅ 成功！麻将记录表已创建');
  console.log('\n请重启后端服务器：');
  console.log('  1. 按 Ctrl + C 停止后端');
  console.log('  2. 运行: npm start');
  console.log('  3. 刷新前端页面\n');
  
} catch (err) {
  console.error('❌ 失败:', err.message);
  process.exit(1);
} finally {
  db.close();
}

