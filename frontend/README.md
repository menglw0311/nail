# 记账管理系统 - 前端

React 前端应用，采用扁平化设计风格。

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT 认证
- ✅ 记账记录管理
- ✅ 分类管理
- ✅ 统计分析
- ✅ 响应式设计
- ✅ 扁平化 UI 设计

## 安装和运行

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm start
```

应用将在 `http://localhost:3000` 启动。

### 3. 构建生产版本

```bash
npm run build
```

## 技术栈

- React 18
- React Router 6
- Axios
- CSS3 (扁平化设计)

## 项目结构

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/      # 组件
│   │   ├── Layout.js
│   │   └── Layout.css
│   ├── context/         # Context API
│   │   └── AuthContext.js
│   ├── pages/           # 页面
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Records.js
│   │   ├── Categories.js
│   │   ├── Statistics.js
│   │   └── *.css
│   ├── utils/           # 工具函数
│   │   └── api.js
│   ├── App.js           # 主应用组件
│   ├── index.js         # 入口文件
│   └── index.css        # 全局样式
└── package.json
```

## 页面说明

### 登录/注册
- 扁平化设计
- 表单验证
- 错误提示

### 仪表板
- 收入/支出/余额统计卡片
- 最近记录列表

### 记账记录
- 记录列表
- 添加/编辑/删除记录
- 筛选功能

### 分类管理
- 收入/支出分类管理
- 添加/编辑/删除分类

### 统计分析
- 收支统计
- 日期范围筛选
- 可视化图表

## API 配置

默认 API 地址：`http://localhost:3000/api`

可在 `src/utils/api.js` 中修改。

