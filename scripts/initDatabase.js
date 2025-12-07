const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function initDatabase() {
  try {
    console.log('正在初始化 SQLite 数据库...\n');
    
    // 数据库文件路径
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'accounting.db');
    const dbDir = path.dirname(dbPath);
    
    // 确保数据库目录存在
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`✅ 创建数据库目录: ${dbDir}`);
    }
    
    // 如果数据库已存在，先删除（可选，用于重置）
    // if (fs.existsSync(dbPath)) {
    //   fs.unlinkSync(dbPath);
    // }
    
    // 创建数据库连接
    const db = new Database(dbPath);
    
    // 启用外键约束
    db.pragma('foreign_keys = ON');
    
    console.log(`✅ 数据库文件: ${dbPath}\n`);
    
    console.log('正在执行数据库初始化脚本...');
    
    // 开始事务
    db.exec('BEGIN TRANSACTION');
    
    try {
      // 创建用户表
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
      
      // 创建分类表
      db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          description TEXT,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // 创建记账记录表
      db.exec(`
        CREATE TABLE IF NOT EXISTS records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          category_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          description TEXT,
          record_date DATE NOT NULL,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // 创建索引
      db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_records_type ON records(type)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_records_date ON records(record_date)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_records_category ON records(category_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_records_user ON records(user_id)');
      
      // 插入默认分类数据
      const insertCategory = db.prepare(`
        INSERT OR IGNORE INTO categories (name, type, description) VALUES (?, ?, ?)
      `);
      
      const defaultCategories = [
        ['工资', 'income', '工资收入'],
        ['奖金', 'income', '奖金收入'],
        ['投资收益', 'income', '投资收益'],
        ['其他收入', 'income', '其他收入'],
        ['餐饮', 'expense', '餐饮支出'],
        ['交通', 'expense', '交通支出'],
        ['购物', 'expense', '购物支出'],
        ['娱乐', 'expense', '娱乐支出'],
        ['医疗', 'expense', '医疗支出'],
        ['教育', 'expense', '教育支出'],
        ['住房', 'expense', '住房支出'],
        ['其他支出', 'expense', '其他支出']
      ];
      
      const insertMany = db.transaction((categories) => {
        for (const category of categories) {
          insertCategory.run(category[0], category[1], category[2]);
        }
      });
      
      insertMany(defaultCategories);
      
      // 创建麻将记录表
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
      console.log('✅ mahjong_records 表创建成功');
      
      // 创建麻将记录索引
      db.exec('CREATE INDEX IF NOT EXISTS idx_mahjong_user_id ON mahjong_records(user_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_mahjong_game_date ON mahjong_records(game_date)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_mahjong_win_amount ON mahjong_records(win_amount)');
      console.log('✅ mahjong_records 索引创建成功');
      
      // 提交事务
      db.exec('COMMIT');
      
      console.log('✅ 数据库初始化成功！');
      console.log('已创建以下表:');
      console.log('  - users (用户表)');
      console.log('  - categories (分类表)');
      console.log('  - records (记账记录表)');
      console.log('已插入默认分类数据\n');
      
      // 验证表是否创建成功
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log('数据库中的表:');
      tables.forEach(table => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log(`  - ${table.name} (${count.count} 条记录)`);
      });
      
      db.close();
      
    } catch (error) {
      db.exec('ROLLBACK');
      db.close();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 运行初始化
initDatabase();
