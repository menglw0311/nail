const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

function addMahjongTable() {
  try {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'accounting.db');
    
    console.log('数据库路径:', dbPath);
    const db = new Database(dbPath);
    
    db.pragma('foreign_keys = ON');
    
    console.log('\n开始创建麻将记录表...\n');
    
    // 使用 exec 直接执行所有SQL
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
    
    console.log('✅ 麻将记录表创建成功！\n');
    
    // 验证
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='mahjong_records'").get();
    
    if (tableCheck) {
      console.log('✅ 验证通过：mahjong_records 表已存在\n');
      
      const columns = db.prepare('PRAGMA table_info(mahjong_records)').all();
      console.log('表结构:');
      columns.forEach(col => {
        console.log(`  ${col.cid + 1}. ${col.name.padEnd(15)} ${col.type || 'TEXT'}`);
      });
      
      const count = db.prepare('SELECT COUNT(*) as count FROM mahjong_records').get();
      console.log(`\n当前记录数: ${count.count}\n`);
    } else {
      console.log('❌ 警告：表创建后验证失败\n');
    }
    
    db.close();
    
    console.log('========================================');
    console.log('✅ 完成！');
    console.log('========================================');
    console.log('\n下一步操作:');
    console.log('  1. 重启后端服务器');
    console.log('  2. 刷新浏览器页面');
    console.log('  3. 点击"麻将记录"\n');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ 创建表失败:', error.message);
    console.error('\n完整错误:', error);
    return false;
  }
}

// 直接执行
const success = addMahjongTable();
process.exit(success ? 0 : 1);

