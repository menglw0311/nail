const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'accounting.db');
const db = new Database(dbPath);

const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='mahjong_records'").get();

if (table) {
  console.log('✅ mahjong_records 表存在！');
  const columns = db.prepare('PRAGMA table_info(mahjong_records)').all();
  console.log('\n表字段:');
  columns.forEach(col => console.log(`  ${col.name}`));
} else {
  console.log('❌ mahjong_records 表不存在');
}

db.close();

