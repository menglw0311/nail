# MongoDB 迁移指南

## 已完成的修改

本项目已从 SQLite 迁移到 MongoDB。以下是主要的修改内容：

### 1. 依赖更新
- ✅ 移除 `better-sqlite3`
- ✅ 添加 `mongoose` (MongoDB ODM)

### 2. 数据库配置
- ✅ 修改 `config/database.js` 使用 MongoDB 连接
- ✅ 支持环境变量 `MONGODB_URI` 配置连接字符串

### 3. 模型转换
所有模型已转换为 Mongoose Schema：
- ✅ `models/User.js` - 用户模型
- ✅ `models/Category.js` - 分类模型
- ✅ `models/Record.js` - 记账记录模型
- ✅ `models/MahjongRecord.js` - 麻将记录模型
- ✅ `models/GiftRecord.js` - 礼金记录模型

### 4. 服务器配置
- ✅ 修改 `server.js` 以使用异步数据库连接

## 安装步骤

### 1. 安装 MongoDB

#### Windows
下载并安装 MongoDB Community Server：
https://www.mongodb.com/try/download/community

#### macOS (使用 Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. 安装项目依赖
```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件（可以复制 `.env.example`）：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置你的 MongoDB 连接字符串：
```
MONGODB_URI=mongodb://localhost:27017/accounting
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 4. 启动服务器
```bash
npm start
# 或开发模式
npm run dev
```

## MongoDB 连接配置选项

### 本地 MongoDB
```
MONGODB_URI=mongodb://localhost:27017/accounting
```

### 带认证的本地 MongoDB
```
MONGODB_URI=mongodb://username:password@localhost:27017/accounting
```

### MongoDB Atlas (云服务)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accounting?retryWrites=true&w=majority
```

## 数据迁移

如果你有现有的 SQLite 数据需要迁移到 MongoDB，请按以下步骤操作：

### 1. 导出 SQLite 数据
可以使用 SQLite 命令行工具导出数据为 JSON 格式

### 2. 创建迁移脚本
创建一个脚本将 JSON 数据导入到 MongoDB

示例脚本（需要根据实际数据调整）：
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
// ... 其他模型

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/accounting');
  
  // 导入用户数据
  // const users = require('./exported-data/users.json');
  // await User.insertMany(users);
  
  // 导入其他数据...
  
  console.log('迁移完成！');
  process.exit(0);
}

migrate().catch(console.error);
```

## 主要差异

### ID 字段
- SQLite: 使用自增整数 `id`
- MongoDB: 使用 ObjectId `_id`，在 JSON 响应中自动转换为 `id`

### 时间戳
- SQLite: 使用 `created_at`、`updated_at`
- MongoDB: 使用 Mongoose 的 `timestamps` 选项自动管理 `createdAt`、`updatedAt`

### 查询方法
所有查询方法已更新为异步（返回 Promise），控制器中需要使用 `await` 或 `.then()`

## 验证安装

启动服务器后，检查控制台输出：
```
MongoDB 连接成功！
数据库地址: mongodb://localhost:27017/accounting
Mongoose 已连接到数据库
服务器运行在 http://localhost:3000
```

访问 http://localhost:3000 应该看到 API 文档页面。

## 常见问题

### MongoDB 连接失败
- 确保 MongoDB 服务正在运行
- 检查连接字符串是否正确
- 检查防火墙设置

### 端口冲突
- MongoDB 默认端口：27017
- 应用服务器默认端口：3000
- 可以在 `.env` 文件中修改

### 性能优化
- MongoDB 已经为常用查询字段创建了索引
- 可以在 MongoDB Compass 中查看和管理索引
- 考虑使用 MongoDB Atlas 的自动优化建议

## 工具推荐

### MongoDB Compass
MongoDB 官方 GUI 工具，用于可视化管理数据库：
https://www.mongodb.com/products/compass

### VS Code 扩展
- MongoDB for VS Code - 官方 MongoDB 扩展

## 需要进一步配置的内容

1. **环境变量**：确保设置合适的 JWT_SECRET
2. **生产环境**：考虑使用 MongoDB Atlas 或其他托管服务
3. **备份策略**：设置定期备份
4. **监控**：配置 MongoDB 监控和告警

## 技术支持

如有问题，请参考：
- MongoDB 官方文档：https://docs.mongodb.com/
- Mongoose 官方文档：https://mongoosejs.com/docs/

