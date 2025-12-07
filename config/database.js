const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// SQLite 数据库文件路径
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'accounting.db');

// 创建数据库连接
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// 启用外键约束
db.pragma('foreign_keys = ON');

// 测试数据库连接
function testConnection() {
  try {
    db.prepare('SELECT 1').get();
    console.log('数据库连接成功！');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return false;
  }
}

module.exports = {
  db,
  testConnection
};
