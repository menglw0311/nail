# 宝塔面板部署指南

本指南详细说明如何在阿里云宝塔面板上部署记账管理系统（Node.js + SQLite 版本）。

## 前提条件

- ✅ 阿里云服务器（已安装宝塔面板）
- ✅ 服务器操作系统：Linux（推荐 CentOS/Ubuntu）
- ✅ 已登录宝塔面板

## 部署步骤

### 第一步：安装必要软件

1. **登录宝塔面板**
   - 访问：`http://你的服务器IP:8888`
   - 输入用户名和密码

2. **安装 Node.js**
   - 进入：软件商店 → 运行环境
   - 找到 "Node版本管理器"
   - 点击安装（选择最新的稳定版本，建议 v18 或 v20）

3. **安装 PM2（可选，推荐）**
   - 在软件商店搜索 "PM2"
   - 点击安装（用于进程守护）

4. **安装 Nginx（如果未安装）**
   - 在软件商店找到 "Nginx"
   - 点击安装

### 第二步：上传项目文件

#### 方法 A：使用宝塔面板文件管理器（推荐新手）

1. **创建项目目录**
   - 在宝塔面板点击 "文件"
   - 进入 `/www/wwwroot/`
   - 新建文件夹：`accounting-system`

2. **上传项目文件**
   - 在本地压缩项目文件夹为 `project.zip`
   - 排除 `node_modules` 文件夹（太大）
   - 在宝塔面板中上传到 `/www/wwwroot/accounting-system/`
   - 解压文件

#### 方法 B：使用 Git（推荐）

1. **在宝塔终端中执行**
   ```bash
   cd /www/wwwroot
   git clone https://github.com/你的用户名/你的仓库.git accounting-system
   cd accounting-system
   ```

2. **或者从本地上传**
   ```bash
   # 在本地终端（PowerShell）中
   cd C:\Users\user\Desktop\nail
   
   # 使用 SCP 上传
   scp -r . root@你的服务器IP:/www/wwwroot/accounting-system/
   ```

### 第三步：配置项目

1. **安装依赖**
   
   在宝塔面板终端中：
   ```bash
   cd /www/wwwroot/accounting-system
   npm install --production
   ```

2. **创建 .env 文件**
   
   在宝塔面板文件管理器中，创建 `.env` 文件：
   ```env
   # SQLite 数据库路径（默认即可）
   DB_PATH=./database/accounting.db
   
   # 服务器端口
   PORT=3000
   
   # JWT密钥（请修改为复杂的随机字符串）
   JWT_SECRET=你的超级复杂的密钥_请修改这个
   
   # 环境
   NODE_ENV=production
   ```

3. **创建数据库目录**
   ```bash
   mkdir -p /www/wwwroot/accounting-system/database
   chmod 755 /www/wwwroot/accounting-system/database
   ```

4. **初始化数据库**
   ```bash
   cd /www/wwwroot/accounting-system
   npm run init-db
   ```

### 第四步：配置 PM2（进程守护）

1. **创建 PM2 配置文件**
   
   在项目根目录创建 `ecosystem.config.js`：
   ```javascript
   module.exports = {
     apps: [{
       name: 'accounting-system',
       script: './server.js',
       instances: 1,
       exec_mode: 'fork',
       watch: false,
       max_memory_restart: '500M',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss'
     }]
   };
   ```

2. **创建日志目录**
   ```bash
   mkdir -p /www/wwwroot/accounting-system/logs
   ```

3. **启动应用**
   ```bash
   cd /www/wwwroot/accounting-system
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **查看运行状态**
   ```bash
   pm2 status
   pm2 logs accounting-system
   ```

### 第五步：配置 Nginx 反向代理

1. **在宝塔面板中添加网站**
   - 点击 "网站" → "添加站点"
   - 域名：你的域名（如 `account.yourdomain.com`）或 IP 地址
   - 根目录：`/www/wwwroot/accounting-system/frontend/build`
   - PHP版本：选择 "纯静态"

2. **配置反向代理**
   
   点击网站设置 → 反向代理 → 添加反向代理：
   
   - 代理名称：`accounting-api`
   - 目标URL：`http://127.0.0.1:3000`
   - 发送域名：`$host`
   - 内容替换：留空
   
   或者直接编辑配置文件（网站设置 → 配置文件）：
   
   ```nginx
   server {
       listen 80;
       server_name 你的域名或IP;
       
       # 前端静态文件
       location / {
           root /www/wwwroot/accounting-system/frontend/build;
           try_files $uri $uri/ /index.html;
           index index.html;
       }
       
       # API 反向代理
       location /api {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

3. **保存并重启 Nginx**
   ```bash
   nginx -t
   nginx -s reload
   ```

### 第六步：构建前端

1. **安装前端依赖**
   ```bash
   cd /www/wwwroot/accounting-system/frontend
   npm install
   ```

2. **构建生产版本**
   ```bash
   npm run build
   ```

3. **验证构建结果**
   ```bash
   ls -la build/
   ```

### 第七步：配置防火墙

1. **在宝塔面板中**
   - 安全 → 防火墙
   - 放行端口：`80`（HTTP）和 `443`（HTTPS）

2. **在阿里云控制台**
   - 进入 ECS 实例
   - 安全组 → 配置规则
   - 添加入方向规则：
     - 端口：`80/80`
     - 授权对象：`0.0.0.0/0`
   - 如需 HTTPS，同样添加 `443/443`

### 第八步：配置 HTTPS（可选，推荐）

1. **申请 SSL 证书**
   - 在宝塔面板：网站设置 → SSL
   - 选择 "Let's Encrypt" 免费证书
   - 点击申请

2. **或上传已有证书**
   - 粘贴证书内容（.pem 或 .crt）
   - 粘贴私钥内容（.key）
   - 保存

3. **强制 HTTPS**
   - 勾选 "强制HTTPS"

## 验证部署

1. **访问 API**
   ```
   http://你的域名或IP/api
   ```
   应该看到 API 欢迎信息

2. **访问前端**
   ```
   http://你的域名或IP
   ```
   应该看到登录页面

3. **查看日志**
   ```bash
   pm2 logs accounting-system
   ```

## 常用命令

### PM2 进程管理
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs accounting-system

# 重启应用
pm2 restart accounting-system

# 停止应用
pm2 stop accounting-system

# 删除应用
pm2 delete accounting-system
```

### 更新应用
```bash
cd /www/wwwroot/accounting-system

# 拉取最新代码（如果使用 Git）
git pull

# 更新依赖
npm install --production

# 重新构建前端
cd frontend
npm install
npm run build
cd ..

# 重启应用
pm2 restart accounting-system
```

### 数据库备份
```bash
# 备份数据库
cp /www/wwwroot/accounting-system/database/accounting.db \
   /www/backup/accounting_$(date +%Y%m%d_%H%M%S).db

# 创建定时备份（在宝塔面板中）
# 计划任务 → Shell脚本
#!/bin/bash
cd /www/wwwroot/accounting-system
cp database/accounting.db /www/backup/accounting_$(date +%Y%m%d).db
# 删除7天前的备份
find /www/backup -name "accounting_*.db" -mtime +7 -delete
```

## 性能优化

1. **启用 Nginx 缓存**
   在网站配置中添加：
   ```nginx
   location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
       expires 30d;
       add_header Cache-Control "public, immutable";
   }
   ```

2. **启用 Gzip 压缩**
   在宝塔面板：网站设置 → 性能调优 → 开启 Gzip

3. **配置进程数**
   如果服务器配置较高，可以在 `ecosystem.config.js` 中增加实例数：
   ```javascript
   instances: 2, // 或 'max' 使用所有 CPU 核心
   exec_mode: 'cluster'
   ```

## 故障排查

### 应用无法启动
```bash
# 查看日志
pm2 logs accounting-system --lines 100

# 检查端口占用
netstat -tulnp | grep 3000

# 手动启动查看错误
cd /www/wwwroot/accounting-system
node server.js
```

### 数据库错误
```bash
# 检查数据库文件权限
ls -la /www/wwwroot/accounting-system/database/

# 修复权限
chmod 755 /www/wwwroot/accounting-system/database
chmod 644 /www/wwwroot/accounting-system/database/accounting.db
```

### Nginx 配置错误
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /www/wwwlogs/你的域名-error.log
```

## 监控和维护

1. **在宝塔面板中设置监控**
   - 监控 → 添加监控
   - 监控项目：CPU、内存、磁盘

2. **设置告警**
   - 配置邮箱或钉钉通知
   - 设置告警阈值

3. **定期维护**
   - 每周检查日志
   - 每月备份数据库
   - 及时更新依赖包

## 快速部署脚本

创建 `deploy.sh` 脚本一键部署：

```bash
#!/bin/bash

echo "开始部署..."

# 进入项目目录
cd /www/wwwroot/accounting-system

# 拉取最新代码（如果使用 Git）
echo "拉取最新代码..."
git pull

# 安装后端依赖
echo "安装后端依赖..."
npm install --production

# 构建前端
echo "构建前端..."
cd frontend
npm install
npm run build
cd ..

# 重启应用
echo "重启应用..."
pm2 restart accounting-system

echo "部署完成！"
pm2 status
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

## 安全建议

1. ✅ 修改默认端口和密码
2. ✅ 启用 HTTPS
3. ✅ 定期更新系统和软件
4. ✅ 配置防火墙规则
5. ✅ 定期备份数据库
6. ✅ 使用强密码和 JWT_SECRET
7. ✅ 限制文件上传大小
8. ✅ 配置请求频率限制

## 支持

如有问题，请检查：
- PM2 日志：`pm2 logs accounting-system`
- Nginx 日志：`/www/wwwlogs/`
- 应用日志：`/www/wwwroot/accounting-system/logs/`

---

部署愉快！🚀

