# 🚀 快速部署指南 - 你的服务器

## 📋 服务器信息

- **公网IP**: `8.163.15.68`
- **私有IP**: `172.18.56.184`
- **项目目录**: `/www/wwwroot/accounting-system`

## ⚡ 一键部署（3步）

### 1. 上传脚本到服务器

在本地项目目录执行：

```powershell
# Windows PowerShell
scp auto-deploy-baota.sh root@8.163.15.68:/root/
```

### 2. SSH登录服务器

```bash
ssh root@8.163.15.68
```

### 3. 运行部署脚本

```bash
cd /root
chmod +x auto-deploy-baota.sh
./auto-deploy-baota.sh
```

## 🎯 部署后访问地址

部署完成后，你可以通过以下地址访问：

### 公网访问
- **前端**: http://8.163.15.68
- **API**: http://8.163.15.68/api
- **直接API**: http://8.163.15.68:3000/api

### 内网访问（仅服务器内网）
- **前端**: http://172.18.56.184
- **API**: http://172.18.56.184/api

## ⚙️ 配置域名（可选）

如果你有域名，可以：

1. **修改脚本中的域名**：
   ```bash
   nano auto-deploy-baota.sh
   # 找到 DOMAIN="" 这一行
   # 修改为: DOMAIN="yourdomain.com"
   ```

2. **或在部署后修改Nginx配置**：
   ```bash
   nano /etc/nginx/conf.d/accounting-system.conf
   # 修改 server_name 为你的域名
   nginx -t
   systemctl reload nginx
   ```

## 🔐 阿里云安全组配置

在阿里云控制台配置安全组规则：

1. 登录阿里云控制台
2. 进入 ECS → 安全组 → 配置规则
3. 添加入方向规则：

| 端口范围 | 授权对象 | 说明 |
|---------|---------|------|
| 80/80 | 0.0.0.0/0 | HTTP访问 |
| 443/443 | 0.0.0.0/0 | HTTPS访问 |
| 3000/3000 | 127.0.0.1/32 | API端口（仅本地） |
| 22/22 | 你的IP/32 | SSH访问（建议限制） |

## 📝 部署后检查

### 1. 检查服务状态

```bash
# PM2状态
pm2 status

# Nginx状态
systemctl status nginx

# 查看日志
pm2 logs accounting-system
```

### 2. 测试访问

```bash
# 测试API
curl http://8.163.15.68:3000/api

# 测试前端
curl http://8.163.15.68
```

### 3. 浏览器访问

在浏览器中打开：
- http://8.163.15.68

应该能看到登录页面。

## 🔧 重要配置

### 修改JWT密钥

```bash
nano /www/wwwroot/accounting-system/.env
# 修改 JWT_SECRET 为复杂的随机字符串
# 可以使用以下命令生成：
openssl rand -base64 32
```

### 配置HTTPS（推荐）

```bash
# 安装certbot
yum install -y certbot python3-certbot-nginx
# 或
apt-get install -y certbot python3-certbot-nginx

# 申请证书（如果有域名）
certbot --nginx -d yourdomain.com
```

## 📊 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs accounting-system

# 重启应用
pm2 restart accounting-system

# 查看Nginx日志
tail -f /var/log/nginx/error.log

# 备份数据库
cp /www/wwwroot/accounting-system/database/accounting.db \
   /www/backup/accounting_$(date +%Y%m%d).db
```

## 🆘 故障排查

### 无法访问

1. **检查安全组**：确保80端口已开放
2. **检查防火墙**：确保防火墙规则正确
3. **检查服务**：`pm2 status` 和 `systemctl status nginx`
4. **查看日志**：`pm2 logs accounting-system`

### 端口被占用

```bash
# 查看端口占用
netstat -tulnp | grep 3000

# 修改端口（如果需要）
nano /www/wwwroot/accounting-system/.env
# 修改 PORT=3001
pm2 restart accounting-system
```

## 📚 相关文档

- `AUTO_DEPLOY_GUIDE.md` - 完整部署指南
- `BAOTA_DEPLOYMENT_GUIDE.md` - 宝塔面板详细指南

---

**开始部署吧！** 🚀

部署完成后访问: **http://8.163.15.68**

