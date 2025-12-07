const { db } = require('../config/database');
const fs = require('fs');
const path = require('path');

// 读取 SQL 文件
const schemaPath = path.join(__dirname, '..', 'database', 'shopping_schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('开始初始化采购清单表...');

try {
  // 执行 SQL 语句
  db.exec(schema);
  console.log('✅ 采购清单表创建成功！');
  
  // 验证表是否创建
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='shopping_list'").get();
  
  if (table) {
    console.log('✅ 表验证成功: shopping_list');
    
    // 显示表结构
    console.log('\n📋 表结构:');
    const columns = db.prepare('PRAGMA table_info(shopping_list)').all();
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
  } else {
    console.log('❌ 表验证失败');
  }
  
} catch (error) {
  console.error('❌ 初始化失败:', error.message);
  process.exit(1);
}

console.log('\n✨ 采购清单表初始化完成！');
console.log('\n可以使用的分类:');
console.log('  - 会亲家');
console.log('  - 订婚');
console.log('  - 结婚');
console.log('  - 其他');
console.log('\n可以使用的状态:');
console.log('  - 待购买');
console.log('  - 已购买');
console.log('  - 已取消');
console.log('\n优先级:');
console.log('  - 1: 高');
console.log('  - 2: 中 (默认)');
console.log('  - 3: 低');

