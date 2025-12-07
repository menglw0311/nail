# 修复"获取记录失败"错误

## 问题原因

点击"麻将记录"显示"获取记录失败"通常是因为：
1. 麻将记录表还未创建
2. 后端服务器没有重启（未加载新的路由）
3. 前端缓存问题

## 解决步骤

### 步骤 1: 初始化麻将记录表

在项目根目录运行：

```bash
npm run init-mahjong
```

预期输出：
```
正在初始化麻将记录表...

✅ 麻将记录表创建成功！

表结构:
  - mahjong_records: 麻将记录表
    * id: 记录ID
    * user_id: 用户ID
    * game_date: 游戏日期
    * game_time: 游戏时间
    * players: 玩家列表（JSON）
    * scores: 分数列表（JSON）
    * win_amount: 盈利金额
    * game_type: 游戏类型
    * location: 地点
    * notes: 备注
```

### 步骤 2: 重启后端服务器

**重要：必须重启后端服务器才能加载新的麻将路由！**

1. **停止当前运行的后端服务器**
   - 在运行后端的终端窗口按 `Ctrl + C`
   - 或关闭运行后端的终端窗口

2. **重新启动后端服务器**

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

预期输出应包含：
```
已注册路由:
  - /api/auth/register (POST)
  - /api/auth/login (POST)
  - /api/auth/me (GET)
  - /api/categories/*
  - /api/records/*
  - /api/mahjong/statistics (GET)           ← 新增
  - /api/mahjong/statistics/daily (GET)     ← 新增
  - /api/mahjong/statistics/game-types (GET) ← 新增
  - /api/mahjong/statistics/monthly (GET)   ← 新增
  - /api/mahjong/*                          ← 新增

服务器运行在 http://localhost:3000
```

### 步骤 3: 刷新前端页面

1. 在浏览器中按 `F5` 或 `Ctrl + R` 刷新页面
2. 重新登录（如果需要）
3. 点击侧边栏的 "🀄 麻将记录"

## 验证安装

### 1. 检查后端路由

在浏览器访问：`http://localhost:3000/`

应该能看到 API 端点列表，包含：
```json
{
  "success": true,
  "message": "记账管理系统 API",
  "version": "1.0.0",
  "endpoints": {
    "auth": {...},
    "categories": "/api/categories",
    "records": "/api/records",
    "statistics": "/api/records/statistics",
    "mahjong": "/api/mahjong",              ← 应该有这个
    "mahjongStatistics": "/api/mahjong/statistics" ← 应该有这个
  }
}
```

### 2. 测试麻将 API

在浏览器开发者工具的 Console 中运行（需要先登录）：

```javascript
// 获取 token
const token = localStorage.getItem('token');

// 测试获取麻将记录
fetch('http://localhost:3000/api/mahjong', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('麻将记录:', data));
```

应该返回：
```json
{
  "success": true,
  "data": []  // 初始为空数组
}
```

## 常见问题

### Q1: npm run init-mahjong 没有任何输出

**原因**: 可能是 console.log 被重定向了

**解决**: 直接运行脚本
```bash
node scripts/initMahjongTables.js
```

### Q2: 提示 "数据库连接失败"

**原因**: 数据库文件路径问题

**解决**: 
1. 确保 `database` 文件夹存在
2. 确保 `database/accounting.db` 文件存在
3. 如果不存在，运行 `npm run init-db` 先创建主数据库

### Q3: 仍然显示"获取记录失败"

**检查步骤**:

1. **打开浏览器开发者工具** (F12)
   
2. **查看 Console 标签页的错误信息**
   - 如果显示 `404 Not Found`：后端路由未加载，重启后端
   - 如果显示 `401 Unauthorized`：重新登录
   - 如果显示 `500 Internal Server Error`：查看后端终端的错误日志

3. **查看 Network 标签页**
   - 找到 `/api/mahjong` 请求
   - 查看 Response 返回的错误信息

4. **检查后端终端输出**
   - 是否有错误信息
   - 是否显示了麻将路由注册信息

### Q4: 后端显示 "Cannot find module './routes/mahjongRoutes'"

**原因**: 文件未正确创建

**解决**: 确认以下文件存在：
- `models/MahjongRecord.js`
- `controllers/mahjongController.js`
- `routes/mahjongRoutes.js`
- `database/mahjong_schema.sql`

如果缺少文件，请重新下载或创建。

## 完整重置步骤

如果以上步骤都无效，尝试完全重置：

```bash
# 1. 停止所有服务
# Ctrl + C 停止后端和前端

# 2. 重新初始化数据库
npm run init-db
npm run init-mahjong

# 3. 重新安装依赖（可选）
npm install
cd frontend
npm install
cd ..

# 4. 启动后端
npm start

# 5. 在新终端启动前端
cd frontend
npm start
```

## 需要帮助？

如果问题仍未解决，请提供：
1. 浏览器 Console 的错误信息截图
2. 后端终端的输出信息
3. Network 标签页的请求详情

---

**按照以上步骤操作后，麻将记录功能应该可以正常使用！** 🎲

