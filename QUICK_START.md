# 快速启动指南

## 前提条件

1. **Node.js** - 版本 14 或更高
2. **MongoDB** - 本地安装或使用 MongoDB Atlas

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
# MongoDB 连接（本地）
MONGODB_URI=mongodb://localhost:27017/accounting

# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accounting

# 服务器端口
PORT=3000

# JWT密钥（请修改为你自己的密钥）
JWT_SECRET=your-secret-key-here

# 环境
NODE_ENV=development
```

### 3. 确保 MongoDB 正在运行

#### 本地 MongoDB（Windows）
```bash
# MongoDB 通常会作为服务自动运行
# 检查服务状态：
net start MongoDB
```

#### 本地 MongoDB（macOS/Linux）
```bash
# 使用 Homebrew (macOS)
brew services start mongodb-community

# 或使用系统服务 (Linux)
sudo systemctl start mongodb
```

### 4. 启动服务器

```bash
# 生产模式
npm start

# 开发模式（支持热重载）
npm run dev
```

服务器将在 http://localhost:3000 启动

### 5. 验证安装

访问 http://localhost:3000 应该看到：

```json
{
  "success": true,
  "message": "记账管理系统 API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

## API 端点

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 分类管理
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 获取单个分类
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 记账记录
- `GET /api/records` - 获取所有记录
- `GET /api/records/:id` - 获取单个记录
- `POST /api/records` - 创建记录
- `PUT /api/records/:id` - 更新记录
- `DELETE /api/records/:id` - 删除记录
- `GET /api/records/statistics` - 获取统计信息

### 麻将记录
- `GET /api/mahjong` - 获取麻将记录
- `POST /api/mahjong` - 创建麻将记录
- `GET /api/mahjong/statistics` - 获取麻将统计

### 礼金记录
- `GET /api/gifts` - 获取礼金记录
- `POST /api/gifts` - 创建礼金记录
- `GET /api/gifts/statistics` - 获取礼金统计

## 前端应用

### 安装前端依赖

```bash
cd frontend
npm install
```

### 启动前端开发服务器

```bash
npm start
```

前端应用将在 http://localhost:3001 启动

### 构建前端生产版本

```bash
npm run build
```

## 常见问题

### MongoDB 连接失败

**错误**: `MongooseServerSelectionError: connect ECONNREFUSED`

**解决方案**:
1. 确保 MongoDB 服务正在运行
2. 检查 `.env` 文件中的连接字符串
3. 确认 MongoDB 端口（默认 27017）没有被占用

### 端口冲突

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
1. 修改 `.env` 文件中的 PORT 值
2. 或停止占用 3000 端口的其他进程

### JWT 认证失败

**错误**: `Error: jwt malformed`

**解决方案**:
1. 确保请求头包含有效的 Authorization token
2. 格式: `Authorization: Bearer <token>`

## 开发工具

### MongoDB Compass
可视化管理 MongoDB 数据库：
https://www.mongodb.com/products/compass

### Postman
测试 API 端点：
https://www.postman.com/

## 数据库结构

### Users（用户）
- username: 用户名
- email: 邮箱
- password: 密码（加密）

### Categories（分类）
- name: 分类名称
- type: 类型（income/expense）
- description: 描述
- user_id: 用户ID

### Records（记账记录）
- type: 类型（income/expense）
- category_id: 分类ID
- amount: 金额
- description: 描述
- record_date: 记录日期
- user_id: 用户ID

### MahjongRecords（麻将记录）
- user_id: 用户ID
- game_date: 游戏日期
- game_time: 游戏时间
- players: 玩家列表
- scores: 分数列表
- win_amount: 输赢金额
- table_fee: 台费
- taxi_fee: 出租车费
- cigarette_fee: 香烟费
- game_type: 游戏类型
- location: 地点
- notes: 备注

### GiftRecords（礼金记录）
- user_id: 用户ID
- name: 姓名
- gift_type: 类型（送礼/收礼）
- event_type: 事件类型
- amount: 金额
- event_date: 事件日期
- relationship: 关系
- location: 地点
- notes: 备注

## 更多信息

详细的迁移指南请查看 [MONGODB_MIGRATION_GUIDE.md](./MONGODB_MIGRATION_GUIDE.md)

