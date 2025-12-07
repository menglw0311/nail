# GitHub 使用说明

## ✅ 您的项目已经在 GitHub 上！

我检查发现您的项目已经初始化了 Git 仓库并连接到 GitHub。

## 📦 当前状态

```bash
git status
```

显示：
- ✅ 已连接到远程仓库 `origin/main`
- ✅ 在 main 分支
- ✅ 可以直接推送更新

## 🚀 如何更新到 GitHub

我们刚才添加了很多新功能，现在可以提交到GitHub：

### 方法1：提交所有更改（推荐）

```bash
# 1. 添加所有修改和新文件
git add .

# 2. 查看将要提交的内容
git status

# 3. 提交更改
git commit -m "feat: 添加礼金记录和麻将统计功能

- 新增礼金记录模块（送礼/收礼管理）
- 简化麻将记录表单（只保留核心字段）
- 添加麻将费用字段（台费、打车费、烟钱）
- 新增年度统计折线图
- 优化错误处理和用户体验
- 修复认证中间件问题"

# 4. 推送到 GitHub
git push
```

### 方法2：分步提交（更清晰）

```bash
# 提交礼金记录功能
git add controllers/giftController.js models/GiftRecord.js routes/giftRoutes.js
git add frontend/src/pages/GiftRecords.js frontend/src/pages/GiftRecords.css
git add database/gift_schema.sql scripts/initGiftTables.js
git commit -m "feat: 添加礼金记录模块"

# 提交麻将改进
git add frontend/src/pages/Mahjong.js models/MahjongRecord.js
git add controllers/mahjongController.js
git commit -m "feat: 简化麻将记录表单，添加费用字段"

# 提交统计改进
git add frontend/src/pages/MahjongStatistics.js
git add frontend/src/pages/MahjongStatistics.css
git commit -m "feat: 添加年度统计折线图"

# 提交配置和文档
git add .gitignore middleware/auth.js server.js
git add *.md
git commit -m "docs: 更新文档和配置"

# 推送所有提交
git push
```

## 📋 提交前检查清单

在提交到 GitHub 前，请确认：

### 1. 检查敏感文件

```bash
# 查看将要提交的文件
git status

# 确保以下文件被忽略：
# ✅ database/*.db（数据库文件）
# ✅ .env（环境变量）
# ✅ node_modules/（依赖包）
```

### 2. 验证 .gitignore

查看 `.gitignore` 文件，确保包含：
```
database/*.db
.env
node_modules/
```

### 3. 测试功能

在推送前测试：
```bash
# 启动后端
npm start

# 启动前端（新终端）
cd frontend
npm start

# 测试功能是否正常
```

## 🌐 GitHub 仓库地址

推送后，您可以在以下位置访问：
```
https://github.com/YOUR_USERNAME/REPO_NAME
```

## 📥 在其他电脑上使用

### 克隆项目

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME

# 安装依赖
npm install
cd frontend
npm install
cd ..

# 初始化数据库
npm run init-db
npm run init-mahjong
npm run init-gifts

# 创建环境变量文件（如果需要）
# Windows PowerShell:
Copy-Item .env.example .env

# 启动项目
npm start
```

## 🔄 日常更新流程

### 开发完新功能后

```bash
# 1. 查看修改
git status

# 2. 添加文件
git add .

# 3. 提交
git commit -m "描述您的更改"

# 4. 推送到 GitHub
git push
```

### 从 GitHub 拉取更新

```bash
# 拉取最新代码
git pull

# 安装新依赖（如果有）
npm install
cd frontend
npm install
cd ..

# 重启服务器
npm start
```

## 🎯 Git 常用命令

### 查看状态
```bash
git status              # 查看文件状态
git log --oneline      # 查看提交历史
git diff               # 查看修改内容
```

### 提交更改
```bash
git add .              # 添加所有文件
git add <file>         # 添加特定文件
git commit -m "消息"   # 提交
git push               # 推送到远程
```

### 撤销操作
```bash
git restore <file>     # 撤销文件修改
git reset HEAD <file>  # 取消暂存
git log                # 查看历史提交
```

### 分支管理
```bash
git branch             # 查看分支
git branch dev         # 创建开发分支
git checkout dev       # 切换到开发分支
git merge dev          # 合并分支
```

## 🔐 安全最佳实践

### 1. 永远不要提交

- ❌ 数据库文件（.db）
- ❌ .env 文件
- ❌ 个人数据
- ❌ 密码或密钥

### 2. 使用 .gitignore

已配置的忽略规则：
```
database/*.db       ← 保护数据库
.env                ← 保护密钥
node_modules/       ← 减小仓库大小
```

### 3. 检查提交内容

```bash
# 提交前查看
git diff --cached

# 确认无敏感信息
git status
```

## 🎨 GitHub 仓库优化

### 添加仓库描述

在 GitHub 仓库页面添加：
- 📝 **Description**: "个人记账管理系统 - 支持记账、麻将、礼金记录"
- 🏷️ **Topics**: `nodejs` `react` `sqlite` `accounting` `mahjong`

### 添加 README 徽章（可选）

```markdown
# 记账管理系统

![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.x-blue)
![License](https://img.shields.io/badge/license-ISC-green)

一个功能完整的个人记账管理系统...
```

### 添加截图

在 README.md 中添加项目截图：
```markdown
## 📸 功能截图

### 麻将记录
![麻将记录](docs/images/mahjong.png)

### 礼金记录
![礼金记录](docs/images/gifts.png)
```

## 💡 实用技巧

### 1. 创建开发分支

```bash
# 创建并切换到开发分支
git checkout -b dev

# 在dev分支开发新功能
# ... 开发 ...

# 提交到dev分支
git add .
git commit -m "开发新功能"
git push -u origin dev

# 开发完成后合并到main
git checkout main
git merge dev
git push
```

### 2. 使用 Git Tags 标记版本

```bash
# 标记版本
git tag -a v1.0.0 -m "版本 1.0.0 - 添加礼金和麻将功能"
git push --tags
```

### 3. 查看提交历史

```bash
# 图形化查看
git log --graph --oneline --all

# 查看某个文件的历史
git log -- frontend/src/pages/Mahjong.js
```

## 📱 GitHub 高级功能

### 1. Issues（问题追踪）
- 记录 Bug
- 计划新功能
- 任务管理

### 2. Projects（项目面板）
- 看板管理
- 任务跟踪
- 里程碑设置

### 3. Wiki（文档）
- 详细文档
- 使用教程
- FAQ

### 4. GitHub Actions（自动化）
- 自动测试
- 自动部署
- 代码检查

## 🎉 总结

### ✅ 您的项目完全可以托管到 GitHub

**当前状态：**
- ✅ Git 仓库已初始化
- ✅ 已连接到 GitHub
- ✅ .gitignore 已配置
- ✅ 准备好推送

**下一步：**
1. 运行 `git add .` 添加所有新功能
2. 运行 `git commit -m "feat: 添加礼金和麻将统计功能"`
3. 运行 `git push` 推送到 GitHub

**优势：**
- 🔒 代码安全备份
- 🌐 可以分享给他人
- 💻 多设备同步代码
- 📝 版本历史完整

---

**您的项目可以完美托管到GitHub，需要我帮您提交这些新功能吗？** 🎊

只需运行几个命令即可将所有新功能推送到GitHub！
