const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const recordRoutes = require('./routes/recordRoutes');
const mahjongRoutes = require('./routes/mahjongRoutes');
const giftRoutes = require('./routes/giftRoutes');
const shoppingRoutes = require('./routes/shoppingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/mahjong', mahjongRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/shopping', shoppingRoutes);

// 调试：打印所有注册的路由
console.log('已注册路由:');
console.log('  - /api/auth/register (POST)');
console.log('  - /api/auth/login (POST)');
console.log('  - /api/auth/me (GET)');
console.log('  - /api/categories/*');
console.log('  - /api/records/statistics (GET)');
console.log('  - /api/records/statistics/categories (GET)');
console.log('  - /api/records/statistics/daily (GET)');
console.log('  - /api/records/*');
console.log('  - /api/mahjong/statistics (GET)');
console.log('  - /api/mahjong/statistics/daily (GET)');
console.log('  - /api/mahjong/statistics/game-types (GET)');
console.log('  - /api/mahjong/statistics/monthly (GET)');
console.log('  - /api/mahjong/*');
console.log('  - /api/gifts/statistics (GET)');
console.log('  - /api/gifts/statistics/event-types (GET)');
console.log('  - /api/gifts/statistics/names (GET)');
console.log('  - /api/gifts/statistics/yearly (GET)');
console.log('  - /api/gifts/*');
console.log('  - /api/shopping/statistics (GET)');
console.log('  - /api/shopping/statistics/categories (GET)');
console.log('  - /api/shopping/*');

// 根路径
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '记账管理系统 API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: '/api/auth/register (POST)',
        login: '/api/auth/login (POST)',
        me: '/api/auth/me (GET)'
      },
      categories: '/api/categories',
      records: '/api/records',
      statistics: '/api/records/statistics',
      mahjong: '/api/mahjong',
      mahjongStatistics: '/api/mahjong/statistics',
      gifts: '/api/gifts',
      giftStatistics: '/api/gifts/statistics',
      shopping: '/api/shopping',
      shoppingStatistics: '/api/shopping/statistics'
    }
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
function startServer() {
  // 测试数据库连接
  const dbConnected = testConnection();
  if (!dbConnected) {
    console.warn('警告: 数据库连接失败，请检查配置');
    console.warn('提示: 如果数据库未初始化，请运行 npm run init-db');
  }

  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API 文档: http://localhost:${PORT}/`);
  });
}

startServer();

module.exports = app;

