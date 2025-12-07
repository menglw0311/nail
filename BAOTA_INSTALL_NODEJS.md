# 宝塔面板安装 Node.js 详细教程

## 📋 目录
1. [方法一：使用 Node 版本管理器（推荐）](#方法一使用-node-版本管理器推荐)
2. [方法二：使用 PM2 管理器（包含 Node.js）](#方法二使用-pm2-管理器包含-nodejs)
3. [方法三：命令行手动安装](#方法三命令行手动安装)
4. [验证安装](#验证安装)
5. [常见问题](#常见问题)

---

## 方法一：使用 Node 版本管理器（推荐）

### 步骤 1：登录宝塔面板
1. 打开浏览器，访问：`http://你的服务器IP:8888`
2. 输入用户名和密码登录

### 步骤 2：进入软件商店
1. 在左侧菜单栏，点击 **"软件商店"**
2. 或者点击顶部的 **"软件商店"** 标签

### 步骤 3：搜索并安装 Node 版本管理器
1. 在软件商店的搜索框中输入：**"Node"** 或 **"node版本"**
2. 找到 **"Node 版本管理器"** 或 **"Node.js 版本管理"**
3. 点击右侧的 **"安装"** 按钮

```
┌─────────────────────────────────────────────┐
│  软件商店                                    │
├─────────────────────────────────────────────┤
│  搜索: [Node______________]  🔍             │
├─────────────────────────────────────────────┤
│                                              │
│  📦 Node 版本管理器              [安装]     │
│     管理多个 Node.js 版本                   │
│                                              │
│  📦 PM2 管理器                   [安装]     │
│     Node.js 进程管理器                      │
│                                              │
└─────────────────────────────────────────────┘
```

4. 等待安装完成（通常需要 1-3 分钟）

### 步骤 4：安装具体的 Node.js 版本
1. 安装完成后，点击 **"设置"** 按钮
2. 进入 Node 版本管理器设置页面
3. 点击 **"版本管理"** 标签
4. 选择要安装的版本：
   - ✅ **Node.js v20.x**（推荐 - LTS 长期支持版）
   - Node.js v18.x（也是 LTS）
   - Node.js v22.x（最新版）

```
┌─────────────────────────────────────────────┐
│  Node 版本管理器 - 版本管理                 │
├─────────────────────────────────────────────┤
│                                              │
│  可安装版本：                                │
│                                              │
│  ○ Node.js v16.20.2                [安装]   │
│  ○ Node.js v18.19.0  (LTS)         [安装]   │
│  ● Node.js v20.11.0  (LTS) ✅      [安装]   │ ← 推荐
│  ○ Node.js v22.0.0                 [安装]   │
│                                              │
│  已安装版本：                                │
│  （暂无）                                    │
│                                              │
└─────────────────────────────────────────────┘
```

5. 点击要安装版本旁边的 **"安装"** 按钮
6. 等待安装完成（通常需要 2-5 分钟）

### 步骤 5：设置默认版本
1. 安装完成后，该版本会出现在 **"已安装版本"** 列表中
2. 点击版本后面的 **"设为默认"** 或 **"启用"**
3. 确认该版本显示为活动状态

---

## 方法二：使用 PM2 管理器（包含 Node.js）

PM2 管理器会自动安装 Node.js。

### 步骤 1：安装 PM2 管理器
1. 在宝塔面板，进入 **"软件商店"**
2. 搜索 **"PM2"**
3. 找到 **"PM2 管理器"**
4. 点击 **"安装"**

### 步骤 2：配置 PM2
1. 安装完成后，PM2 会自动安装一个 Node.js 版本
2. 点击 PM2 的 **"设置"**
3. 可以查看和管理 Node.js 版本

---

## 方法三：命令行手动安装

如果软件商店安装失败，可以使用命令行安装。

### 步骤 1：打开 SSH 终端
1. 在宝塔面板，点击左侧 **"终端"**
2. 或使用 SSH 工具（如 PuTTY、Xshell）连接服务器

### 步骤 2：安装 Node.js（CentOS/RHEL）

```bash
# 安装 Node.js 20.x（推荐）
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 步骤 3：安装 Node.js（Ubuntu/Debian）

```bash
# 安装 Node.js 20.x（推荐）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 步骤 4：使用 NVM 安装（最灵活）

```bash
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载配置
source ~/.bashrc

# 安装 Node.js
nvm install 20        # 安装 Node.js 20.x
nvm use 20            # 使用 Node.js 20.x
nvm alias default 20  # 设为默认版本

# 验证安装
node -v
npm -v
```

---

## 验证安装

### 在宝塔终端中验证：

```bash
# 检查 Node.js 版本
node -v
# 应该显示类似：v20.11.0

# 检查 npm 版本
npm -v
# 应该显示类似：10.2.4

# 测试 Node.js
node -e "console.log('Node.js 安装成功！')"
# 应该输出：Node.js 安装成功！
```

### 测试是否可以运行项目：

```bash
# 创建测试目录
mkdir -p /www/test
cd /www/test

# 创建测试文件
echo "console.log('Hello from Node.js ' + process.version);" > test.js

# 运行测试
node test.js
# 应该输出：Hello from Node.js v20.11.0
```

---

## 常见问题

### ❓ Q1: 软件商店找不到 Node 版本管理器？

**A:** 可能是宝塔版本较旧，解决方案：
1. 更新宝塔面板到最新版本
2. 或使用 PM2 管理器（包含 Node.js）
3. 或使用命令行手动安装

### ❓ Q2: 安装失败，提示网络错误？

**A:** 网络问题，解决方案：
```bash
# 使用国内镜像源
npm config set registry https://registry.npmmirror.com

# 或者使用淘宝镜像
npm config set registry https://registry.npm.taobao.org
```

### ❓ Q3: 安装了但命令不生效？

**A:** 需要重新加载环境变量：
```bash
# 重新加载 bash 配置
source ~/.bashrc

# 或重新登录 SSH
exit
# 然后重新登录

# 检查 Node.js 路径
which node
# 应该显示：/usr/bin/node 或类似路径
```

### ❓ Q4: 如何切换 Node.js 版本？

**A:** 
- **使用 Node 版本管理器**：在宝塔面板的 Node 版本管理器中切换
- **使用 NVM**：
  ```bash
  nvm list           # 查看已安装版本
  nvm use 20         # 切换到 v20
  nvm alias default 20  # 设为默认
  ```

### ❓ Q5: 安装后项目还是报错？

**A:** 检查权限和路径：
```bash
# 检查 Node.js 是否可执行
node -v

# 检查项目目录权限
ls -la /www/wwwroot/accounting-system

# 修复权限
chown -R www:www /www/wwwroot/accounting-system
chmod -R 755 /www/wwwroot/accounting-system
```

---

## 推荐配置

### 安装完成后的优化配置：

```bash
# 1. 配置 npm 国内镜像（提升安装速度）
npm config set registry https://registry.npmmirror.com

# 2. 全局安装常用工具
npm install -g pm2        # 进程管理器
npm install -g nodemon    # 开发时自动重启

# 3. 验证配置
npm config get registry
pm2 -v
```

---

## 快速参考

### 版本选择建议：
| 版本 | 说明 | 推荐场景 |
|------|------|----------|
| v18.x | LTS 长期支持 | 稳定生产环境 |
| v20.x | LTS 长期支持 ✅ | **最推荐** |
| v22.x | 最新版 | 尝鲜、新特性 |

### 常用命令：
```bash
# 查看版本
node -v
npm -v

# 更新 npm
npm install -g npm@latest

# 查看全局安装的包
npm list -g --depth=0

# 清除缓存
npm cache clean --force
```

---

## 下一步

安装完 Node.js 后，继续部署项目：

1. 📁 上传项目文件到服务器
2. 🚀 运行部署脚本：`./deploy.sh`
3. 🌐 配置 Nginx 反向代理
4. ✅ 测试访问

详细步骤请参考：
- `BAOTA_DEPLOYMENT_GUIDE.md` - 完整部署指南
- `DEPLOY_CHECKLIST.md` - 部署检查清单

---

**安装愉快！** 🎉

如有问题，请检查宝塔面板的日志或使用终端查看详细错误信息。

