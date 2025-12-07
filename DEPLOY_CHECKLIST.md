# 🚀 宝塔面板部署检查清单

## 部署前准备

- [ ] 阿里云服务器已购买并配置好宝塔面板
- [ ] 已登录宝塔面板（http://服务器IP:8888）
- [ ] 已在宝塔面板安装 Node.js（推荐 v18 或 v20）
- [ ] 已在宝塔面板安装 Nginx
- [ ] 已在宝塔面板安装 PM2（可选，但推荐）

## 部署步骤

### 1️⃣ 上传项目文件

**选择 A：使用宝塔文件管理器（推荐新手）**
- [ ] 在宝塔面板创建目录：`/www/wwwroot/accounting-system`
- [ ] 压缩本地项目文件（排除 `node_modules` 文件夹）
- [ ] 上传并解压到服务器

**选择 B：使用 Git（推荐）**
```bash
cd /www/wwwroot
git clone 你的仓库地址 accounting-system
cd accounting-system
```

**选择 C：使用 SCP 上传（从本地）**
```powershell
# 在本地 PowerShell 运行
cd C:\Users\user\Desktop\nail
scp -r . root@服务器IP:/www/wwwroot/accounting-system/
```

### 2️⃣ 一键部署（推荐）

在宝塔面板终端中运行：
```bash
cd /www/wwwroot/accounting-system
chmod +x deploy.sh
./deploy.sh
```

### 3️⃣ 手动部署步骤

如果一键部署脚本失败，按以下步骤手动部署：

```bash
cd /www/wwwroot/accounting-system

# 1. 安装后端依赖
npm install --production

# 2. 创建必要目录
mkdir -p database logs
chmod 755 database logs

# 3. 配置环境变量
cp .env.production .env
nano .env  # 或 vi .env，修改 JWT_SECRET

# 4. 初始化数据库
npm run init-db

# 5. 安装前端依赖并构建
cd frontend
npm install
npm run build
cd ..

# 6. 使用 PM2 启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4️⃣ 配置 Nginx

1. **在宝塔面板添加网站**
   - [ ] 点击"网站" → "添加站点"
   - [ ] 域名：你的域名或服务器 IP
   - [ ] 根目录：`/www/wwwroot/accounting-system/frontend/build`
   - [ ] PHP 版本：纯静态

2. **配置反向代理**
   - [ ] 点击网站设置 → 配置文件
   - [ ] 添加以下配置：

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
   - [ ] 保存配置
   - [ ] 重启 Nginx

### 5️⃣ 配置防火墙

**宝塔面板安全设置**
- [ ] 安全 → 放行端口：80、443

**阿里云安全组**
- [ ] 登录阿里云控制台
- [ ] ECS 实例 → 安全组 → 配置规则
- [ ] 添加入方向规则：80/80 和 443/443
- [ ] 授权对象：0.0.0.0/0

### 6️⃣ 配置 HTTPS（可选但推荐）

- [ ] 在宝塔面板：网站设置 → SSL
- [ ] 选择 "Let's Encrypt" 免费证书
- [ ] 点击申请
- [ ] 勾选"强制 HTTPS"

## 验证部署

### 测试后端 API
```bash
curl http://你的服务器IP:3000/api
# 或
curl http://你的域名/api
```

应该返回：
```json
{
  "success": true,
  "message": "记账管理系统 API",
  "version": "1.0.0"
}
```

### 测试前端
浏览器访问：`http://你的服务器IP` 或 `http://你的域名`
- [ ] 能看到登录页面
- [ ] 能成功注册用户
- [ ] 能成功登录
- [ ] 能创建记账记录

### 检查应用状态
```bash
pm2 status
pm2 logs accounting-system
```

## 常用管理命令

```bash
# 查看应用状态
pm2 status

# 查看日志（实时）
pm2 logs accounting-system

# 查看日志（最后 100 行）
pm2 logs accounting-system --lines 100

# 重启应用
pm2 restart accounting-system

# 停止应用
pm2 stop accounting-system

# 删除应用
pm2 delete accounting-system

# 监控应用
pm2 monit
```

## 数据备份

### 手动备份
```bash
cp /www/wwwroot/accounting-system/database/accounting.db \
   /www/backup/accounting_$(date +%Y%m%d).db
```

### 自动备份（宝塔面板计划任务）
- [ ] 计划任务 → Shell 脚本
- [ ] 执行周期：每天凌晨 3 点
- [ ] 脚本内容：

```bash
#!/bin/bash
cd /www/wwwroot/accounting-system
cp database/accounting.db /www/backup/accounting_$(date +%Y%m%d).db
# 删除 7 天前的备份
find /www/backup -name "accounting_*.db" -mtime +7 -delete
```

## 故障排查

### 应用无法启动
```bash
# 查看详细日志
pm2 logs accounting-system --lines 100

# 手动启动查看错误
cd /www/wwwroot/accounting-system
node server.js
```

### 端口被占用
```bash
# 查看端口占用
netstat -tulnp | grep 3000

# 或
lsof -i :3000
```

### 数据库权限错误
```bash
cd /www/wwwroot/accounting-system
chmod 755 database
chmod 644 database/accounting.db
```

### Nginx 配置错误
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /www/wwwlogs/你的域名-error.log
```

## 安全建议

- [ ] 修改 .env 文件中的 JWT_SECRET 为复杂随机字符串
- [ ] 启用 HTTPS（Let's Encrypt 免费证书）
- [ ] 定期更新系统和软件包
- [ ] 设置定期数据库备份
- [ ] 限制 SSH 登录（修改端口、使用密钥）
- [ ] 配置防火墙只开放必要端口
- [ ] 定期查看应用日志

## 性能优化（可选）

- [ ] 启用 Nginx Gzip 压缩
- [ ] 配置静态资源缓存
- [ ] 使用 CDN 加速静态资源
- [ ] 增加 PM2 实例数（如果服务器配置较高）

## 监控和维护

- [ ] 在宝塔面板配置监控和告警
- [ ] 设置邮件或钉钉通知
- [ ] 每周检查日志
- [ ] 每月检查备份
- [ ] 定期更新依赖包

## 更新应用

```bash
cd /www/wwwroot/accounting-system

# 拉取最新代码（如果使用 Git）
git pull

# 重新部署
./deploy.sh
```

---

## 快速参考

### 重要路径
- 项目目录：`/www/wwwroot/accounting-system`
- 数据库文件：`/www/wwwroot/accounting-system/database/accounting.db`
- 日志文件：`/www/wwwroot/accounting-system/logs/`
- 前端构建：`/www/wwwroot/accounting-system/frontend/build/`

### 重要命令
```bash
# 进入项目目录
cd /www/wwwroot/accounting-system

# 查看状态
pm2 status

# 查看日志
pm2 logs accounting-system

# 重启
pm2 restart accounting-system
```

---

✅ **部署完成后，记得测试所有功能！**

📖 **详细说明请参考：** `BAOTA_DEPLOYMENT_GUIDE.md`

