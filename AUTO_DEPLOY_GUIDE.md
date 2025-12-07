# 阿里云宝塔Linux面板自动化部署指南

## 📋 前置条件

1. ✅ 阿里云服务器（已安装宝塔面板）
2. ✅ 已登录宝塔面板并获取root密码
3. ✅ 项目文件已准备好

## 🚀 快速部署（3步）

### 方法一：使用脚本自动部署（推荐）

#### 1. 上传脚本到服务器

```bash
# 在本地执行
scp auto-deploy-baota.sh root@你的服务器IP:/root/
```

#### 2. SSH登录服务器

```bash
ssh root@你的服务器IP
```

#### 3. 运行部署脚本

```bash
cd /root
chmod +x auto-deploy-baota.sh
./auto-deploy-baota.sh
```

脚本会自动完成：
- ✅ 检测系统环境
- ✅ 安装Node.js 20.x
- ✅ 安装PM2进程管理器
- ✅ 安装Nginx（可选）
- ✅ 创建项目目录
- ✅ 部署项目文件
- ✅ 安装依赖
- ✅ 初始化数据库
- ✅ 构建前端
- ✅ 配置PM2
- ✅ 配置Nginx反向代理
- ✅ 配置防火墙
- ✅ 启动服务

### 方法二：手动上传项目文件

如果脚本检测不到项目文件，可以手动上传：

```bash
# 在本地项目目录执行
cd /path/to/your/project
scp -r . root@服务器IP:/www/wwwroot/accounting-system/

# 然后SSH到服务器运行脚本
ssh root@服务器IP
cd /www/wwwroot/accounting-system
chmod +x auto-deploy-baota.sh
./auto-deploy-baota.sh
```

### 方法三：在服务器上直接下载脚本

```bash
# SSH到服务器
ssh root@你的服务器IP

# 下载脚本（如果项目在GitHub上）
wget https://raw.githubusercontent.com/你的仓库/auto-deploy-baota.sh
# 或者
curl -O https://raw.githubusercontent.com/你的仓库/auto-deploy-baota.sh

# 运行脚本
chmod +x auto-deploy-baota.sh
./auto-deploy-baota.sh
```

## 📝 脚本配置

编辑脚本开头的配置变量：

```bash
PROJECT_NAME="accounting-system"      # 项目名称
PROJECT_DIR="/www/wwwroot/${PROJECT_NAME}"  # 项目目录
NODE_VERSION="20"                     # Node.js版本
API_PORT="3000"                       # API端口
DOMAIN=""                             # 域名（可选）
```

### 配置域名

如果有域名，修改脚本中的 `DOMAIN` 变量：

```bash
DOMAIN="yourdomain.com"  # 你的域名
```

## 🔧 部署后配置

### 1. 修改环境变量

```bash
nano /www/wwwroot/accounting-system/.env
```

重要配置：
- `JWT_SECRET`: 修改为复杂的随机字符串（脚本已自动生成）
- `PORT`: API端口（默认3000）
- `DB_PATH`: 数据库路径

### 2. 配置域名（如果有）

编辑Nginx配置：
```bash
nano /etc/nginx/conf.d/accounting-system.conf
```

修改 `server_name` 为你的域名：
```nginx
server_name yourdomain.com www.yourdomain.com;
```

然后重载Nginx：
```bash
nginx -t
systemctl reload nginx
```

### 3. 申请SSL证书（推荐）

在宝塔面板中：
1. 网站 → 选择网站 → SSL
2. 选择"Let's Encrypt"免费证书
3. 申请并启用HTTPS
4. 勾选"强制HTTPS"

或使用命令行：
```bash
# 安装certbot
yum install -y certbot python3-certbot-nginx
# 或
apt-get install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 验证部署

### 检查服务状态

```bash
# PM2状态
pm2 status

# Nginx状态
systemctl status nginx

# 查看应用日志
pm2 logs accounting-system

# 查看最近100行日志
pm2 logs accounting-system --lines 100
```

### 访问测试

```bash
# 测试API
curl http://localhost:3000/api

# 测试前端（如果有Nginx）
curl http://你的服务器IP

# 测试API端点
curl http://你的服务器IP/api
```

### 检查端口

```bash
# 检查端口是否监听
netstat -tulnp | grep 3000
netstat -tulnp | grep 80

# 或使用ss命令
ss -tulnp | grep 3000
```

## 🛠️ 常用操作

### 重启应用

```bash
pm2 restart accounting-system
```

### 查看日志

```bash
# 实时日志
pm2 logs accounting-system

# 只查看错误日志
pm2 logs accounting-system --err

# 只查看输出日志
pm2 logs accounting-system --out

# 应用日志文件
tail -f /www/wwwroot/accounting-system/logs/err.log
tail -f /www/wwwroot/accounting-system/logs/out.log

# Nginx日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### 更新代码

```bash
cd /www/wwwroot/accounting-system

# 方法1: 如果使用Git
git pull
npm install --production
cd frontend && npm install && npm run build
pm2 restart accounting-system

# 方法2: 重新上传文件
# 在本地执行
scp -r . root@服务器IP:/www/wwwroot/accounting-system/
# 然后在服务器执行
cd /www/wwwroot/accounting-system
npm install --production
cd frontend && npm install && npm run build
pm2 restart accounting-system
```

### 备份数据库

```bash
# 创建备份目录
mkdir -p /www/backup

# 备份数据库
cp /www/wwwroot/accounting-system/database/accounting.db \
   /www/backup/accounting_$(date +%Y%m%d_%H%M%S).db

# 创建自动备份脚本
cat > /www/backup/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/www/backup"
DB_FILE="/www/wwwroot/accounting-system/database/accounting.db"
DATE=$(date +%Y%m%d_%H%M%S)
cp "$DB_FILE" "$BACKUP_DIR/accounting_$DATE.db"
# 删除7天前的备份
find "$BACKUP_DIR" -name "accounting_*.db" -mtime +7 -delete
EOF

chmod +x /www/backup/backup-db.sh

# 添加到定时任务（每天凌晨3点备份）
crontab -e
# 添加以下行
0 3 * * * /www/backup/backup-db.sh
```

### 查看系统资源

```bash
# PM2监控
pm2 monit

# 系统资源
htop
# 或
top

# 磁盘使用
df -h

# 内存使用
free -h
```

## ⚠️ 故障排查

### 应用无法启动

```bash
# 查看详细错误
pm2 logs accounting-system --lines 100

# 手动启动查看错误
cd /www/wwwroot/accounting-system
node server.js

# 检查环境变量
cat .env

# 检查数据库文件
ls -la database/
```

### 端口被占用

```bash
# 查看端口占用
netstat -tulnp | grep 3000
# 或
lsof -i :3000

# 杀死占用进程
kill -9 <PID>

# 或修改端口
nano .env
# 修改 PORT=3001
pm2 restart accounting-system
```

### Nginx配置错误

```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 检查配置文件
cat /etc/nginx/conf.d/accounting-system.conf

# 重启Nginx
systemctl restart nginx
```

### 数据库权限问题

```bash
# 检查权限
ls -la /www/wwwroot/accounting-system/database/

# 修复权限
chmod 755 /www/wwwroot/accounting-system/database
chmod 644 /www/wwwroot/accounting-system/database/accounting.db
chown -R root:root /www/wwwroot/accounting-system/database
```

### 前端无法访问

```bash
# 检查前端构建文件
ls -la /www/wwwroot/accounting-system/frontend/build/

# 检查Nginx配置
cat /etc/nginx/conf.d/accounting-system.conf

# 检查Nginx错误日志
tail -f /var/log/nginx/error.log

# 重新构建前端
cd /www/wwwroot/accounting-system/frontend
npm run build
```

### PM2进程异常

```bash
# 查看所有进程
pm2 list

# 查看详细信息
pm2 describe accounting-system

# 重启所有进程
pm2 restart all

# 清除日志
pm2 flush

# 删除进程
pm2 delete accounting-system
# 然后重新启动
pm2 start ecosystem.config.js
```

## 🔐 安全建议

### 1. 修改默认配置

```bash
# 修改JWT密钥
nano /www/wwwroot/accounting-system/.env
# 生成新的密钥
openssl rand -base64 32
```

### 2. 配置防火墙

```bash
# 阿里云安全组配置
# 1. 登录阿里云控制台
# 2. ECS → 安全组 → 配置规则
# 3. 添加入方向规则：
#    - 端口: 80/80, 授权对象: 0.0.0.0/0
#    - 端口: 443/443, 授权对象: 0.0.0.0/0
#    - 端口: 3000/3000, 授权对象: 127.0.0.1/32 (仅本地访问)
```

### 3. 启用HTTPS

```bash
# 使用Let's Encrypt免费证书
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
certbot renew --dry-run
```

### 4. 限制SSH访问

```bash
# 修改SSH端口
nano /etc/ssh/sshd_config
# 修改 Port 22 为其他端口

# 使用密钥登录（更安全）
# 禁用密码登录
# PasswordAuthentication no
```

### 5. 定期更新

```bash
# 更新系统
yum update -y
# 或
apt-get update && apt-get upgrade -y

# 更新Node.js依赖
cd /www/wwwroot/accounting-system
npm update
```

### 6. 监控和日志

```bash
# 设置日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# 监控应用
pm2 install pm2-server-monit
```

## 📈 性能优化

### 1. Nginx优化

```nginx
# 在 /etc/nginx/nginx.conf 中添加
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. PM2集群模式

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'accounting-system',
    script: './server.js',
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',
    // ... 其他配置
  }]
};
```

### 3. 数据库优化

```bash
# SQLite性能优化
# 在代码中启用WAL模式
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
```

## 📚 相关文档

- `BAOTA_DEPLOYMENT_GUIDE.md` - 详细部署指南
- `DEPLOY_CHECKLIST.md` - 部署检查清单
- `BAOTA_INSTALL_NODEJS.md` - Node.js安装指南
- `SHOPPING_MODULE_GUIDE.md` - 采购模块使用指南

## 🆘 获取帮助

### 查看日志

```bash
# 应用日志
pm2 logs accounting-system

# Nginx日志
tail -f /var/log/nginx/error.log

# 系统日志
journalctl -u nginx
```

### 常见问题

1. **端口被占用**: 修改 `.env` 中的 `PORT` 或杀死占用进程
2. **权限错误**: 检查文件和目录权限
3. **数据库错误**: 检查数据库文件是否存在和可写
4. **前端404**: 检查Nginx配置和前端构建文件
5. **API无法访问**: 检查PM2状态和端口监听

## 🎉 部署完成检查清单

- [ ] Node.js已安装（v18+）
- [ ] PM2已安装并运行
- [ ] 应用已启动（`pm2 status`）
- [ ] 数据库已初始化
- [ ] 前端已构建
- [ ] Nginx已配置并运行
- [ ] 防火墙已配置
- [ ] 可以访问前端页面
- [ ] API可以正常响应
- [ ] 日志正常输出
- [ ] 环境变量已配置
- [ ] SSL证书已申请（如需要）

---

**部署愉快！** 🚀

如有问题，请查看日志文件或联系技术支持。

