# 麻将模块设置说明

## ✅ 已完成的工作

### 后端开发

1. **数据库表结构** (`database/mahjong_schema.sql`)
   - 创建 `mahjong_records` 表
   - 字段包括：游戏日期、时间、玩家、分数、盈亏金额、游戏类型、地点、备注等
   - 添加索引优化查询性能

2. **数据模型** (`models/MahjongRecord.js`)
   - CRUD 操作方法
   - 统计查询方法：总体统计、每日统计、游戏类型统计、月度统计

3. **控制器** (`controllers/mahjongController.js`)
   - 完整的 REST API 端点处理
   - 数据验证和错误处理

4. **路由** (`routes/mahjongRoutes.js`)
   - RESTful API 路由配置
   - JWT 认证保护

5. **服务器集成** (`server.js`)
   - 注册麻将路由到 `/api/mahjong`
   - 添加到 API 文档

### 前端开发

1. **麻将记录页面** (`frontend/src/pages/Mahjong.js` + `Mahjong.css`)
   - 记录列表展示
   - 添加/编辑/删除记录功能
   - 多筛选条件支持
   - 动态玩家/分数输入
   - 响应式设计

2. **麻将统计页面** (`frontend/src/pages/MahjongStatistics.js` + `MahjongStatistics.css`)
   - 统计卡片展示（场次、胜率、盈亏等）
   - 游戏类型统计
   - 每日趋势柱状图
   - 月度统计表格
   - 月份筛选功能

3. **路由配置** (`frontend/src/App.js`)
   - 添加麻将记录路由 `/mahjong`
   - 添加麻将统计路由 `/mahjong-statistics`

4. **导航菜单** (`frontend/src/components/Layout.js`)
   - 添加 "🀄 麻将记录" 菜单项
   - 添加 "🎲 麻将统计" 菜单项

### 脚本和工具

1. **初始化脚本** (`scripts/initMahjongTables.js`)
   - 一键创建麻将记录表
   - npm 命令：`npm run init-mahjong`

2. **文档**
   - 更新 `README.md`
   - 创建 `MAHJONG_GUIDE.md` 使用指南
   - 创建 `MAHJONG_SETUP.md` 设置说明

## 🚀 启动步骤

### 第一次使用

1. **初始化麻将表**
```bash
npm run init-mahjong
```

2. **重启后端服务器**
```bash
# 如果后端正在运行，先停止（Ctrl+C）
npm start
# 或开发模式
npm run dev
```

3. **前端无需更改**
   - 前端会自动加载新菜单
   - 刷新浏览器页面即可看到麻将模块

### API 端点

所有端点都需要 JWT 认证：

- `GET /api/mahjong` - 获取麻将记录列表
- `POST /api/mahjong` - 创建新记录
- `GET /api/mahjong/:id` - 获取单条记录
- `PUT /api/mahjong/:id` - 更新记录
- `DELETE /api/mahjong/:id` - 删除记录
- `GET /api/mahjong/statistics` - 获取总体统计
- `GET /api/mahjong/statistics/daily` - 获取每日统计
- `GET /api/mahjong/statistics/game-types` - 获取游戏类型统计
- `GET /api/mahjong/statistics/monthly` - 获取月度统计

### 筛选参数

记录列表和统计接口支持以下筛选参数：
- `start_date` - 开始日期（YYYY-MM-DD）
- `end_date` - 结束日期（YYYY-MM-DD）
- `game_type` - 游戏类型
- `result_type` - 结果类型（win/lose）

## 📊 功能特性

### 记录管理
- ✅ 支持多人游戏记录（最少 2 人）
- ✅ 记录玩家姓名和分数
- ✅ 追踪个人盈亏
- ✅ 记录游戏类型和地点
- ✅ 添加备注信息
- ✅ 多条件筛选
- ✅ 编辑和删除记录

### 统计分析
- ✅ 总场次统计
- ✅ 胜率计算
- ✅ 总盈亏和均场盈亏
- ✅ 单局最佳/最差记录
- ✅ 游戏类型统计分析
- ✅ 每日趋势图
- ✅ 月度统计表
- ✅ 月份筛选

### UI/UX
- ✅ 扁平化设计风格
- ✅ 响应式布局
- ✅ 渐变色彩
- ✅ 平滑动画效果
- ✅ 直观的数据可视化
- ✅ 友好的交互反馈

## 🔧 技术实现

### 后端技术栈
- Node.js + Express.js
- SQLite (better-sqlite3)
- JWT 认证
- RESTful API 设计

### 前端技术栈
- React 18
- React Router 6
- Axios
- CSS3（渐变、动画）

### 数据库设计
- 外键关联 users 表
- 用户数据隔离
- JSON 字段存储玩家和分数数组
- 索引优化查询性能

## 📝 数据示例

### 创建记录请求
```json
{
  "game_date": "2025-12-02",
  "game_time": "14:30",
  "players": ["张三", "李四", "王五", "我"],
  "scores": [150, -50, -30, -70],
  "win_amount": -70,
  "game_type": "血战",
  "location": "小王家",
  "notes": "手气不好"
}
```

### 统计响应示例
```json
{
  "success": true,
  "data": {
    "total_games": 25,
    "win_games": 12,
    "lose_games": 13,
    "draw_games": 0,
    "total_amount": 350.50,
    "avg_amount": 14.02,
    "max_win": 280.00,
    "min_lose": -150.00
  }
}
```

## 🎯 使用建议

1. **游戏类型命名要一致**
   - 建议使用：血战、血流、二五八万等
   - 避免使用变体：血战麻将、血战到底等

2. **及时记录**
   - 游戏结束后立即记录，确保准确性

3. **定期分析**
   - 每周或每月查看统计数据
   - 分析不同游戏类型的表现
   - 找出优势和劣势

4. **备份数据**
   - 定期备份 `database/accounting.db` 文件
   - 避免数据丢失

## 🔐 安全性

- ✅ 用户数据完全隔离
- ✅ JWT 令牌认证
- ✅ 所有 API 需要认证
- ✅ 用户只能访问自己的数据

## 📱 响应式设计

- ✅ 桌面端优化（≥1200px）
- ✅ 平板适配（768px - 1199px）
- ✅ 移动端支持（<768px）
- ✅ 触摸友好的交互

## 🚀 性能优化

- ✅ 数据库索引
- ✅ 批量查询优化
- ✅ 前端组件懒加载
- ✅ CSS 动画硬件加速

## 📖 相关文档

- `README.md` - 项目总体说明
- `MAHJONG_GUIDE.md` - 麻将模块使用指南
- `DEPLOYMENT.md` - 部署指南

---

**麻将模块已完全集成到系统中，可以立即使用！** 🎉

