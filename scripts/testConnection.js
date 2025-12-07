const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

function testConnection() {
  console.log('正在测试 SQLite 数据库连接...\n');
  
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'accounting.db');
  
  console.log('当前配置:');
  console.log('  DB_PATH:', dbPath);
  console.log('');

  try {
    // 检查数据库文件是否存在
    if (!fs.existsSync(dbPath)) {
      console.log('⚠️  数据库文件不存在');
      console.log('请先运行: npm run init-db');
      return;
    }

    // 测试连接
    console.log('步骤 1: 测试数据库连接...');
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    
    // 测试查询
    db.prepare('SELECT 1').get();
    console.log('✅ 数据库连接成功！\n');

    // 检查表是否存在
    console.log('步骤 2: 检查数据库表...');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    if (tables.length === 0) {
      console.log('⚠️  数据库中没有表');
      console.log('请运行: npm run init-db');
    } else {
      console.log(`✅ 找到 ${tables.length} 个表:`);
      tables.forEach(table => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log(`  - ${table.name} (${count.count} 条记录)`);
      });
    }

    db.close();
    console.log('\n✅ 所有连接测试通过！');
    
  } catch (error) {
    console.error('\n❌ 连接失败！\n');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    
    console.log('\n可能的原因和解决方案:');
    console.log('1. 数据库文件不存在');
    console.log('   - 运行: npm run init-db');
    console.log('');
    console.log('2. 数据库文件权限问题');
    console.log('   - 检查文件权限');
    console.log('   - 确保有读写权限');
    console.log('');
    console.log('3. 数据库文件损坏');
    console.log('   - 删除数据库文件后重新初始化');
    
    process.exit(1);
  }
}

testConnection();
