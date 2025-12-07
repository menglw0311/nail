# 部署指南 - 记账管理系统

本指南将帮助您在其他电脑上部署记账管理系统到本地环境。

## 📋 系统要求

- **Node.js**: 版本 14.0.0 或更高（推荐 16.x 或 18.x）
- **npm**: 版本 6.0.0 或更高（通常随 Node.js 一起安装）
- **操作系统**: Windows、macOS 或 Linux

## 📦 第一步：传输项目文件

### 方式一：使用 U盘/移动硬盘
1. 将整个项目文件夹复制到 U盘
2. 在目标电脑上，将项目文件夹复制到本地目录（如 `C:\Users\用户名\Desktop\nail` 或 `~/Desktop/nail`）

### 方式二：使用 Git（推荐）
如果项目已上传到 Git 仓库：
```bash
git clone <仓库地址>
cd nail
```

### 方式三：压缩包传输
1. 在当前电脑上压缩项目文件夹（注意排除 `node_modules` 和 `database/*.db`）
2. 将压缩包传输到目标电脑
3. 解压到目标目录

## ⚡ 快速部署（推荐）

如果您想快速部署，可以使用我们提供的自动化脚本：

**Windows:**
```bash
deploy.bat
```

**macOS/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

脚本会自动完成：
1. 检查 Node.js 环境
2. 安装后端依赖
3. 初始化数据库
4. 安装前端依赖

完成后按照提示启动服务即可。

---

## 🔧 第二步：环境准备（手动部署）

### 1. 安装 Node.js

**Windows:**
- 访问 [Node.js 官网](https://nodejs.org/)
- 下载 LTS 版本（推荐）
- 运行安装程序，按提示完成安装
- 打开命令提示符（CMD）或 PowerShell，验证安装：
  ```bash
  node --version
  npm --version
  ```

**macOS:**
```bash
# 使用 Homebrew
brew install node

# 或访问官网下载安装包
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🚀 第三步：后端部署

### 1. 进入项目目录
```bash
cd nail
```

### 2. 安装后端依赖
```bash
npm install
```

如果安装速度慢，可以使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### 3. 配置环境变量（可选）

创建 `.env` 文件（在项目根目录）：
```env
# 数据库路径（默认：./database/accounting.db）
DB_PATH=./database/accounting.db

# 服务器端口（默认：3000）
PORT=3000

# JWT 密钥（生产环境请修改为复杂字符串）
JWT_SECRET=your-secret-key-change-in-production
```

**注意**: 如果不创建 `.env` 文件，系统会使用默认配置。

### 4. 初始化数据库
```bash
npm run init-db
```

如果看到 "数据库初始化成功！" 表示数据库已创建。

### 5. 启动后端服务器

**开发模式（自动重启）：**
```bash
npm run dev
```

**生产模式：**
```bash
npm start
```

看到以下信息表示启动成功：
```
数据库连接成功！
服务器运行在 http://localhost:3000
API 文档: http://localhost:3000/
```

**保持后端运行**，打开新的终端窗口进行前端部署。

## 🎨 第四步：前端部署

### 1. 进入前端目录
```bash
cd frontend
```

### 2. 安装前端依赖
```bash
npm install
```

或使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### 3. 配置 API 地址（如果需要）

如果后端运行在不同的端口或地址，需要修改 `frontend/src/utils/api.js`：

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // 修改为实际的后端地址
  // ...
});
```

### 4. 启动前端开发服务器
```bash
npm start
```

前端会自动在浏览器中打开 `http://localhost:3000`（如果端口被占用，会自动使用其他端口，如 3001）。

## ✅ 第五步：验证部署

1. **检查后端**: 在浏览器访问 `http://localhost:3000`，应该看到 API 信息
2. **检查前端**: 前端页面应该自动打开，显示登录界面
3. **注册账户**: 点击"立即注册"，创建新账户
4. **登录系统**: 使用注册的用户名和密码登录
5. **测试功能**: 
   - 添加分类
   - 添加记账记录
   - 查看统计分析

## 🏗️ 生产环境部署（可选）

### 前端生产构建

1. 构建前端：
```bash
cd frontend
npm run build
```

2. 构建文件在 `frontend/build` 目录

3. 可以使用以下方式部署：
   - **使用 Express 静态文件服务**（推荐）
   - 使用 Nginx
   - 使用其他静态文件服务器

### 使用 Express 服务前端（推荐）

修改 `server.js`，添加静态文件服务：

```javascript
// 在 server.js 中添加（在路由之前）
const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend/build')));

// 在所有 API 路由之后添加
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});
```

然后只需运行后端：
```bash
npm start
```

访问 `http://localhost:3000` 即可使用完整系统。

## 🔍 常见问题

### 1. 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
- 修改 `.env` 文件中的 `PORT=3001`（或其他端口）
- 或关闭占用端口的程序

### 2. 数据库初始化失败

**错误**: `数据库初始化失败`

**解决**:
- 确保 `database` 目录存在
- 检查是否有写入权限
- 手动创建 `database` 目录：
  ```bash
  mkdir database
  npm run init-db
  ```

### 3. 前端无法连接后端

**错误**: `Network Error` 或 `接口不存在`

**解决**:
- 确保后端服务器正在运行
- 检查 `frontend/src/utils/api.js` 中的 `baseURL` 是否正确
- 检查防火墙设置
- 如果后端在不同端口，修改前端 API 配置

### 4. 依赖安装失败

**错误**: `npm ERR!` 相关错误

**解决**:
- 清除 npm 缓存：`npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json`，重新安装
- 使用国内镜像：
  ```bash
  npm config set registry https://registry.npmmirror.com
  ```

### 5. Windows 上 better-sqlite3 安装失败

**错误**: `node-gyp` 相关错误

**解决**:
- 安装 Visual Studio Build Tools
- 或使用预编译版本：
  ```bash
  npm install better-sqlite3 --build-from-source=false
  ```

### 6. 权限问题（Linux/macOS）

**错误**: `EACCES` 权限错误

**解决**:
```bash
# 不要使用 sudo 安装 npm 包
# 修复 npm 权限
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# 将以下内容添加到 ~/.bashrc 或 ~/.zshrc
export PATH=~/.npm-global/bin:$PATH
```

## 📝 快速部署检查清单

- [ ] Node.js 已安装（`node --version`）
- [ ] npm 已安装（`npm --version`）
- [ ] 项目文件已复制到目标电脑
- [ ] 后端依赖已安装（`npm install`）
- [ ] 数据库已初始化（`npm run init-db`）
- [ ] 后端服务器已启动（`npm start`）
- [ ] 前端依赖已安装（`cd frontend && npm install`）
- [ ] 前端服务器已启动（`npm start`）
- [ ] 浏览器可以访问前端页面
- [ ] 可以成功注册和登录

## 🆘 获取帮助

如果遇到问题：
1. 检查终端错误信息
2. 查看本文档的"常见问题"部分
3. 检查 `README.md` 文件
4. 确认所有步骤都已正确执行

## 📌 注意事项

1. **数据库文件**: `database/accounting.db` 包含所有数据，请定期备份
2. **JWT 密钥**: 生产环境请修改 `.env` 中的 `JWT_SECRET` 为复杂字符串
3. **端口配置**: 确保防火墙允许后端端口（默认 3000）的访问
4. **数据备份**: 定期备份 `database` 目录
5. **更新依赖**: 定期运行 `npm update` 更新依赖包

---

**部署完成后，您就可以在其他电脑上使用记账管理系统了！** 🎉

