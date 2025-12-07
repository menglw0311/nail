const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

function initMahjongTables() {
  try {
    console.log('正在初始化麻将记录表...\n');
    
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'accounting.db');
    const db = new Database(dbPath);
    
    // 启用外键约束
    db.pragma('foreign_keys = ON');
    
    // 读取SQL文件
    const schemaPath = path.join(__dirname, '..', 'database', 'mahjong_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // 分割SQL语句
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    db.exec('BEGIN TRANSACTION');
    
    try {
      // 执行每条SQL语句
      for (const statement of statements) {
        if (statement) {
          db.exec(statement);
        }
      }
      
      db.exec('COMMIT');
      console.log('✅ 麻将记录表创建成功！');
      console.log('\n表结构:');
      console.log('  - mahjong_records: 麻将记录表');
      console.log('    * id: 记录ID');
      console.log('    * user_id: 用户ID');
      console.log('    * game_date: 游戏日期');
      console.log('    * game_time: 游戏时间');
      console.log('    * players: 玩家列表（JSON）');
      console.log('    * scores: 分数列表（JSON）');
      console.log('    * win_amount: 盈利金额');
      console.log('    * game_type: 游戏类型');
      console.log('    * location: 地点');
      console.log('    * notes: 备注');
      
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    } finally {
      db.close();
    }
    
  } catch (error) {
    console.error('❌ 麻将记录表初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initMahjongTables();
}

module.exports = initMahjongTables;

