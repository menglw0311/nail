const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, '..', 'database', 'accounting.db');

console.log('📦 开始初始化礼金记录表...');
console.log('数据库路径:', dbPath);

// 检查数据库文件是否存在
if (!fs.existsSync(dbPath)) {
  console.error('❌ 错误：数据库文件不存在！');
  console.error('请先运行 npm run init-db 初始化数据库');
  process.exit(1);
}

try {
  // 连接数据库
  const db = new Database(dbPath);
  
  console.log('✅ 数据库连接成功');

  // 读取并执行 SQL 脚本
  const sqlPath = path.join(__dirname, '..', 'database', 'gift_schema.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ 错误：SQL 脚本文件不存在！');
    console.error('路径:', sqlPath);
    process.exit(1);
  }

  const sqlScript = fs.readFileSync(sqlPath, 'utf8');
  
  // 分割并执行每个 SQL 语句
  const statements = sqlScript
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`\n执行 ${statements.length} 条 SQL 语句...\n`);

  statements.forEach((statement, index) => {
    try {
      db.exec(statement);
      console.log(`✅ 语句 ${index + 1} 执行成功`);
    } catch (error) {
      // 如果表已存在，忽略错误
      if (error.message.includes('already exists')) {
        console.log(`⚠️  语句 ${index + 1}: 表已存在，跳过`);
      } else {
        throw error;
      }
    }
  });

  // 验证表是否创建成功
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='gift_records'").all();
  
  if (tables.length > 0) {
    console.log('\n✅ gift_records 表创建成功！');
    
    // 显示表结构
    const columns = db.prepare("PRAGMA table_info(gift_records)").all();
    console.log('\n📋 表结构:');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

    // 显示索引
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='gift_records'").all();
    if (indexes.length > 0) {
      console.log('\n🔑 索引:');
      indexes.forEach(idx => {
        console.log(`  - ${idx.name}`);
      });
    }

    console.log('\n🎉 礼金记录模块初始化完成！');
    console.log('\n📝 下一步:');
    console.log('1. 重启后端服务器 (npm start 或 npm run dev)');
    console.log('2. 刷新前端页面');
    console.log('3. 在左侧菜单中找到 "🎁 礼金记录" 开始使用');
  } else {
    console.error('\n❌ 表创建失败！');
    process.exit(1);
  }

  db.close();
} catch (error) {
  console.error('\n❌ 初始化失败:', error.message);
  console.error(error);
  process.exit(1);
}

