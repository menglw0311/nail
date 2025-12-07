const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function migrateDatabase() {
  try {
    console.log('正在迁移数据库...\n');
    
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'accounting.db');
    
    if (!fs.existsSync(dbPath)) {
      console.log('数据库文件不存在，请先运行 npm run init-db');
      return;
    }
    
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    
    console.log(`✅ 数据库文件: ${dbPath}\n`);
    
    // 检查表是否存在
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map(t => t.name);
    
    // 创建用户表（如果不存在）
    if (!tableNames.includes('users')) {
      console.log('创建用户表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      console.log('✅ 用户表创建成功');
    }
    
    // 检查 categories 表是否有 user_id 列
    const categoryColumns = db.prepare("PRAGMA table_info(categories)").all();
    const hasUserIdInCategories = categoryColumns.some(col => col.name === 'user_id');
    
    if (!hasUserIdInCategories) {
      console.log('更新 categories 表...');
      db.exec('ALTER TABLE categories ADD COLUMN user_id INTEGER');
      db.exec('CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id)');
      console.log('✅ categories 表更新成功');
    }
    
    // 检查 records 表是否有 user_id 列
    const recordColumns = db.prepare("PRAGMA table_info(records)").all();
    const hasUserIdInRecords = recordColumns.some(col => col.name === 'user_id');
    
    if (!hasUserIdInRecords) {
      console.log('更新 records 表...');
      db.exec('ALTER TABLE records ADD COLUMN user_id INTEGER');
      db.exec('CREATE INDEX IF NOT EXISTS idx_records_user ON records(user_id)');
      console.log('✅ records 表更新成功');
    }
    
    // 添加外键约束（SQLite 不支持 ALTER TABLE ADD FOREIGN KEY，需要重建表）
    // 这里只添加索引，外键约束在新建表时会自动添加
    
    console.log('\n✅ 数据库迁移完成！');
    
    db.close();
    
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

migrateDatabase();

