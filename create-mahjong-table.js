const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 使用同步方式写入文件以确保输出
const logFile = path.join(__dirname, 'mahjong-table-creation.log');
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
};

log('========================================');
log('开始创建麻将记录表');
log('========================================');
log('');

try {
  const dbPath = path.join(__dirname, 'database', 'accounting.db');
  log('数据库路径: ' + dbPath);
  
  if (!fs.existsSync(dbPath)) {
    log('');
    log('❌ 错误：数据库文件不存在！');
    log('请先运行: npm run init-db');
    process.exit(1);
  }
  
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  
  log('');
  log('正在创建 mahjong_records 表...');
  
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
    )
  `);
  
  log('✅ mahjong_records 表创建成功！');
  
  // 创建索引
  log('');
  log('正在创建索引...');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_mahjong_user_id ON mahjong_records(user_id)');
  log('✅ idx_mahjong_user_id');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_mahjong_game_date ON mahjong_records(game_date)');
  log('✅ idx_mahjong_game_date');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_mahjong_win_amount ON mahjong_records(win_amount)');
  log('✅ idx_mahjong_win_amount');
  
  // 验证表结构
  log('');
  log('验证表结构:');
  const columns = db.prepare('PRAGMA table_info(mahjong_records)').all();
  columns.forEach(col => {
    log('  - ' + col.name.padEnd(15) + ' ' + col.type);
  });
  
  // 检查记录数
  const count = db.prepare('SELECT COUNT(*) as count FROM mahjong_records').get();
  log('');
  log('当前记录数: ' + count.count);
  
  db.close();
  
  log('');
  log('========================================');
  log('✅ 麻将记录表初始化完成！');
  log('========================================');
  log('');
  log('下一步：');
  log('1. 重启后端服务器 (Ctrl+C 然后 npm start)');
  log('2. 刷新前端页面');
  log('3. 点击"麻将记录"');
  log('');
  log('日志已保存到: mahjong-table-creation.log');
  log('');
  
} catch (error) {
  log('');
  log('❌ 创建表失败: ' + error.message);
  log('');
  log('错误堆栈:');
  log(error.stack);
  log('');
  log('请检查：');
  log('1. 数据库文件是否存在');
  log('2. 是否有写入权限');
  log('3. better-sqlite3 是否正确安装');
  process.exit(1);
}

