#!/bin/bash

# 记账管理系统 - 一键部署脚本
# 使用方法：chmod +x deploy.sh && ./deploy.sh

set -e  # 遇到错误立即退出

echo "======================================"
echo "   记账管理系统 - 开始部署"
echo "======================================"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. 检查 Node.js
echo ""
echo "1️⃣  检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 2. 检查 npm
echo ""
echo "2️⃣  检查 npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi
echo "✅ npm 版本: $(npm -v)"

# 3. 安装后端依赖
echo ""
echo "3️⃣  安装后端依赖..."
npm install --production
echo "✅ 后端依赖安装完成"

# 4. 创建必要的目录
echo ""
echo "4️⃣  创建必要的目录..."
mkdir -p database
mkdir -p logs
chmod 755 database
chmod 755 logs
echo "✅ 目录创建完成"

# 5. 检查 .env 文件
echo ""
echo "5️⃣  检查环境变量配置..."
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，从示例创建..."
    if [ -f .env.production ]; then
        cp .env.production .env
        echo "✅ 已从 .env.production 创建 .env 文件"
        echo "⚠️  请编辑 .env 文件，修改 JWT_SECRET 为复杂的随机字符串！"
    else
        echo "❌ 错误: 未找到 .env.production 示例文件"
        exit 1
    fi
else
    echo "✅ .env 文件已存在"
fi

# 6. 初始化数据库
echo ""
echo "6️⃣  初始化数据库..."
if [ ! -f database/accounting.db ]; then
    echo "数据库不存在，开始初始化..."
    npm run init-db
    echo "✅ 数据库初始化完成"
else
    echo "✅ 数据库已存在，跳过初始化"
fi

# 7. 构建前端
echo ""
echo "7️⃣  构建前端应用..."
cd frontend
if [ ! -d node_modules ]; then
    echo "安装前端依赖..."
    npm install
fi
echo "开始构建前端..."
npm run build
echo "✅ 前端构建完成"
cd ..

# 8. 检查 PM2
echo ""
echo "8️⃣  检查 PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  未找到 PM2，正在全局安装..."
    npm install -g pm2
    echo "✅ PM2 安装完成"
else
    echo "✅ PM2 已安装: $(pm2 -v)"
fi

# 9. 启动应用
echo ""
echo "9️⃣  启动应用..."
if pm2 list | grep -q accounting-system; then
    echo "应用已在运行，正在重启..."
    pm2 restart ecosystem.config.js
    echo "✅ 应用重启完成"
else
    echo "首次启动应用..."
    pm2 start ecosystem.config.js
    pm2 save
    echo "✅ 应用启动完成"
fi

# 10. 设置开机自启
echo ""
echo "🔟  设置开机自启..."
pm2 startup | grep "sudo" | bash || true
pm2 save

# 完成
echo ""
echo "======================================"
echo "   🎉 部署完成！"
echo "======================================"
echo ""
echo "📊 应用状态:"
pm2 status
echo ""
echo "🌐 访问地址:"
echo "   - API: http://你的服务器IP:3000"
echo "   - 前端: 需要配置 Nginx 反向代理"
echo ""
echo "📝 常用命令:"
echo "   - 查看状态: pm2 status"
echo "   - 查看日志: pm2 logs accounting-system"
echo "   - 重启应用: pm2 restart accounting-system"
echo "   - 停止应用: pm2 stop accounting-system"
echo ""
echo "⚠️  重要提醒:"
echo "   1. 请立即修改 .env 文件中的 JWT_SECRET"
echo "   2. 配置 Nginx 反向代理（参考 BAOTA_DEPLOYMENT_GUIDE.md）"
echo "   3. 配置防火墙和安全组规则"
echo "   4. 建议启用 HTTPS"
echo ""
