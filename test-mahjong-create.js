// 测试麻将记录创建
const MahjongRecord = require('./models/MahjongRecord');
const db = require('./config/database').db;

console.log('🧪 测试麻将记录创建...\n');

try {
  // 1. 检查表是否存在
  console.log('1️⃣ 检查 mahjong_records 表:');
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='mahjong_records'").get();
  
  if (!tableCheck) {
    console.log('❌ mahjong_records 表不存在！');
    console.log('请运行: npm run init-mahjong\n');
    process.exit(1);
  }
  console.log('✅ 表存在\n');

  // 2. 获取测试用户
  console.log('2️⃣ 获取测试用户:');
  const user = db.prepare('SELECT id, username FROM users LIMIT 1').get();
  
  if (!user) {
    console.log('❌ 没有用户，请先注册账户');
    process.exit(1);
  }
  console.log(`✅ 使用用户: ${user.username} (ID: ${user.id})\n`);

  // 3. 测试创建简化的记录（只有日期和金额）
  console.log('3️⃣ 创建简化的麻将记录:');
  const testData = {
    user_id: user.id,
    game_date: '2025-12-03',
    game_time: '',
    players: ['我'],
    scores: [0],
    win_amount: 150,
    game_type: '',
    location: '',
    notes: ''
  };
  
  console.log('测试数据:', JSON.stringify(testData, null, 2));
  
  const recordId = MahjongRecord.create(testData);
  console.log(`✅ 创建成功！记录ID: ${recordId}\n`);

  // 4. 验证记录
  console.log('4️⃣ 验证记录:');
  const record = MahjongRecord.getById(recordId, user.id);
  console.log('查询到的记录:', record);
  
  if (record) {
    console.log('✅ 记录验证成功！');
    console.log(`   - 日期: ${record.game_date}`);
    console.log(`   - 盈亏: ¥${record.win_amount}`);
    console.log(`   - 玩家: ${JSON.stringify(record.players)}`);
    console.log(`   - 分数: ${JSON.stringify(record.scores)}\n`);
  }

  // 5. 测试获取记录列表
  console.log('5️⃣ 测试获取记录列表:');
  const records = MahjongRecord.getAll(user.id, {});
  console.log(`✅ 获取成功，共 ${records.length} 条记录\n`);

  // 6. 清理测试数据
  console.log('6️⃣ 清理测试数据:');
  const deleted = MahjongRecord.delete(recordId, user.id);
  if (deleted) {
    console.log('✅ 测试记录已删除\n');
  }

  console.log('🎉 所有测试通过！麻将记录功能正常！');

} catch (error) {
  console.error('\n❌ 测试失败:', error.message);
  console.error('详细错误:', error);
  console.error('\n可能的原因:');
  console.error('1. mahjong_records 表不存在 - 运行: npm run init-mahjong');
  console.error('2. 数据库连接失败');
  console.error('3. JSON字段序列化问题');
}

