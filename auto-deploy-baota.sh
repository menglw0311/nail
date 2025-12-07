#!/bin/bash

###############################################################################
# 记账管理系统 - 阿里云宝塔Linux面板自动化部署脚本
# 适用于全新服务器，自动安装所有环境并部署项目
# 使用方法: chmod +x auto-deploy-baota.sh && ./auto-deploy-baota.sh
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量（可根据实际情况修改）
PROJECT_NAME="accounting-system"
PROJECT_DIR="/www/wwwroot/${PROJECT_NAME}"
NODE_VERSION="20"  # Node.js版本
API_PORT="3000"
DOMAIN=""  # 域名（可选，如果有域名请填写）

# 服务器IP配置
PUBLIC_IP="8.163.15.68"      # 公网IP
PRIVATE_IP="172.18.56.184"   # 私有IP

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "请使用root用户运行此脚本"
        exit 1
    fi
    log_success "用户权限检查通过"
}

# 检测系统类型
detect_system() {
    if [ -f /etc/redhat-release ]; then
        OS="centos"
        log_info "检测到系统: CentOS/RHEL"
    elif [ -f /etc/debian_version ]; then
        OS="debian"
        log_info "检测到系统: Debian/Ubuntu"
    else
        log_error "不支持的系统类型"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统软件包..."
    if [ "$OS" = "centos" ]; then
        yum update -y
        yum install -y wget curl git
    else
        apt-get update -y
        apt-get install -y wget curl git
    fi
    log_success "系统更新完成"
}

# 安装Node.js
install_nodejs() {
    log_info "检查Node.js..."
    if command -v node &> /dev/null; then
        NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VER" -ge 18 ]; then
            log_success "Node.js已安装: $(node -v)"
            return
        else
            log_warning "Node.js版本过低，需要重新安装"
        fi
    fi

    log_info "安装Node.js ${NODE_VERSION}.x..."
    if [ "$OS" = "centos" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
        yum install -y nodejs
    else
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
    fi
    
    # 验证安装
    if command -v node &> /dev/null; then
        log_success "Node.js安装成功: $(node -v)"
        log_success "npm版本: $(npm -v)"
    else
        log_error "Node.js安装失败"
        exit 1
    fi

    # 配置npm镜像（可选，提升下载速度）
    log_info "配置npm镜像源..."
    npm config set registry https://registry.npmmirror.com
    log_success "npm镜像配置完成"
}

# 安装PM2
install_pm2() {
    log_info "检查PM2..."
    if command -v pm2 &> /dev/null; then
        log_success "PM2已安装: $(pm2 -v)"
        return
    fi

    log_info "安装PM2..."
    npm install -g pm2
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 7
    log_success "PM2安装完成"
}

# 安装Nginx（可选）
install_nginx() {
    log_info "检查Nginx..."
    if command -v nginx &> /dev/null; then
        log_success "Nginx已安装: $(nginx -v 2>&1)"
        return
    fi

    log_warning "Nginx未安装，是否安装？(y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "安装Nginx..."
        if [ "$OS" = "centos" ]; then
            # 检查是否有dnf（CentOS 8+）
            if command -v dnf &> /dev/null; then
                log_info "使用dnf安装Nginx..."
                # 安装EPEL仓库（如果还没有）
                dnf install -y epel-release || true
                dnf install -y nginx
            else
                log_info "使用yum安装Nginx..."
                # 安装EPEL仓库（如果还没有）
                yum install -y epel-release || true
                yum install -y nginx
            fi
            systemctl enable nginx
            systemctl start nginx
        else
            apt-get install -y nginx
            systemctl enable nginx
            systemctl start nginx
        fi
        
        # 验证安装
        if command -v nginx &> /dev/null; then
            log_success "Nginx安装成功: $(nginx -v 2>&1)"
        else
            log_error "Nginx安装失败，请手动安装"
            log_info "可以尝试: yum install -y epel-release && yum install -y nginx"
            log_warning "继续部署，稍后请手动安装Nginx"
        fi
    else
        log_warning "跳过Nginx安装，请手动配置反向代理"
    fi
}

# 创建项目目录
create_project_dir() {
    log_info "创建项目目录..."
    mkdir -p "$PROJECT_DIR"
    mkdir -p "$PROJECT_DIR/database"
    mkdir -p "$PROJECT_DIR/logs"
    chmod 755 "$PROJECT_DIR"
    chmod 755 "$PROJECT_DIR/database"
    chmod 755 "$PROJECT_DIR/logs"
    log_success "项目目录创建完成: $PROJECT_DIR"
}

# 部署项目文件（假设文件已上传到服务器）
deploy_files() {
    log_info "检查项目文件..."
    
    # 检查当前目录是否有项目文件
    if [ -f "package.json" ] && [ -d "frontend" ]; then
        log_info "检测到项目文件，开始部署..."
        cp -r . "$PROJECT_DIR/" 2>/dev/null || {
            log_info "使用rsync部署文件..."
            rsync -av --exclude 'node_modules' --exclude '.git' --exclude 'database/*.db' . "$PROJECT_DIR/"
        }
        log_success "项目文件部署完成"
    else
        log_warning "未在当前目录检测到项目文件"
        log_info "请确保项目文件已上传到服务器"
        log_info "或者使用以下命令上传:"
        log_info "  scp -r . root@服务器IP:$PROJECT_DIR/"
        log_warning "按Enter继续（假设文件已在目标目录）..."
        read -r
    fi
}

# 安装项目依赖
install_dependencies() {
    log_info "安装后端依赖..."
    cd "$PROJECT_DIR"
    npm install --production
    log_success "后端依赖安装完成"

    log_info "安装前端依赖..."
    cd "$PROJECT_DIR/frontend"
    npm install
    log_success "前端依赖安装完成"
}

# 配置环境变量
setup_env() {
    log_info "配置环境变量..."
    cd "$PROJECT_DIR"
    
    if [ ! -f .env ]; then
        if [ -f .env.production ]; then
            cp .env.production .env
        else
            # 生成随机JWT密钥
            JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
            cat > .env << EOF
# 数据库配置
DB_PATH=./database/accounting.db

# 服务器端口
PORT=${API_PORT}

# JWT密钥（请修改为复杂的随机字符串）
JWT_SECRET=${JWT_SECRET}

# 环境
NODE_ENV=production
EOF
        fi
        log_success ".env文件已创建"
        log_warning "请检查并修改 .env 文件中的配置"
    else
        log_success ".env文件已存在"
    fi
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    cd "$PROJECT_DIR"
    
    if [ ! -f database/accounting.db ]; then
        log_info "创建数据库表..."
        npm run init-db
        npm run init-mahjong
        npm run init-gifts
        npm run init-shopping
        log_success "数据库初始化完成"
    else
        log_warning "数据库已存在，跳过初始化"
        log_info "如需重新初始化，请删除 database/accounting.db 后重新运行"
    fi
}

# 构建前端
build_frontend() {
    log_info "构建前端应用..."
    cd "$PROJECT_DIR/frontend"
    
    # 检查是否有.env文件配置API地址
    if [ ! -f .env ]; then
        # 优先使用配置的公网IP，如果没有则自动获取
        if [ -n "$PUBLIC_IP" ]; then
            API_URL="http://${PUBLIC_IP}:${API_PORT}/api"
        else
            API_URL=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "localhost")
            API_URL="http://${API_URL}:${API_PORT}/api"
        fi
        cat > .env << EOF
REACT_APP_API_URL=${API_URL}
EOF
        log_info "前端API地址配置为: ${API_URL}"
    fi
    
    npm run build
    
    if [ -d "build" ]; then
        log_success "前端构建完成"
    else
        log_error "前端构建失败"
        exit 1
    fi
}

# 配置PM2
setup_pm2() {
    log_info "配置PM2..."
    cd "$PROJECT_DIR"
    
    # 检查ecosystem.config.js是否存在
    if [ ! -f ecosystem.config.js ]; then
        log_warning "未找到ecosystem.config.js，创建默认配置..."
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: ${API_PORT}
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
    fi
    
    # 启动或重启应用
    if pm2 list | grep -q "${PROJECT_NAME}"; then
        log_info "应用已在运行，重启中..."
        pm2 restart "${PROJECT_NAME}"
    else
        log_info "启动应用..."
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    # 设置开机自启
    log_info "设置开机自启..."
    pm2 startup systemd -u root --hp /root | grep "sudo" | bash || true
    pm2 save
    
    log_success "PM2配置完成"
}

# 配置Nginx
setup_nginx() {
    if ! command -v nginx &> /dev/null; then
        log_warning "Nginx未安装，跳过配置"
        return
    fi

    log_info "配置Nginx反向代理..."
    
    # 优先使用配置的IP或域名
    if [ -n "$DOMAIN" ]; then
        SERVER_NAME="$DOMAIN"
    elif [ -n "$PUBLIC_IP" ]; then
        SERVER_NAME="$PUBLIC_IP"
    else
        SERVER_NAME=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "your-server-ip")
    fi
    
    # 创建Nginx配置
    NGINX_CONF="/etc/nginx/conf.d/${PROJECT_NAME}.conf"
    
    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name ${SERVER_NAME};
    
    # 前端静态文件
    location / {
        root ${PROJECT_DIR}/frontend/build;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }
    
    # API反向代理
    location /api {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        root ${PROJECT_DIR}/frontend/build;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 测试Nginx配置
    if nginx -t; then
        systemctl reload nginx
        log_success "Nginx配置完成并已重载"
    else
        log_error "Nginx配置有误，请检查: $NGINX_CONF"
    fi
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    # 检查firewalld
    if systemctl is-active --quiet firewalld; then
        log_info "配置firewalld..."
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=${API_PORT}/tcp
        firewall-cmd --reload
        log_success "firewalld配置完成"
    # 检查ufw
    elif command -v ufw &> /dev/null; then
        log_info "配置ufw..."
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow ${API_PORT}/tcp
        log_success "ufw配置完成"
    else
        log_warning "未检测到防火墙，请手动配置安全组规则"
        log_info "需要在阿里云控制台开放端口: 80, 443, ${API_PORT}"
    fi
}

# 显示部署信息
show_deployment_info() {
    # 确定访问地址
    if [ -n "$DOMAIN" ]; then
        ACCESS_URL="$DOMAIN"
    elif [ -n "$PUBLIC_IP" ]; then
        ACCESS_URL="$PUBLIC_IP"
    else
        ACCESS_URL=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "your-server-ip")
    fi
    
    echo ""
    echo "======================================"
    echo -e "${GREEN}   🎉 部署完成！${NC}"
    echo "======================================"
    echo ""
    echo "📊 应用状态:"
    pm2 status
    echo ""
    echo "🌐 服务器信息:"
    echo "   - 公网IP: ${PUBLIC_IP}"
    echo "   - 私有IP: ${PRIVATE_IP}"
    if [ -n "$DOMAIN" ]; then
        echo "   - 域名: ${DOMAIN}"
    fi
    echo ""
    echo "🌐 访问地址:"
    if [ -n "$DOMAIN" ]; then
        echo "   - 前端: http://${DOMAIN}"
        echo "   - API: http://${DOMAIN}/api"
    else
        echo "   - 前端: http://${PUBLIC_IP}"
        echo "   - API: http://${PUBLIC_IP}/api"
        echo "   - 直接API: http://${PUBLIC_IP}:${API_PORT}/api"
    fi
    echo ""
    echo "📝 内网访问（仅服务器内网）:"
    echo "   - 前端: http://${PRIVATE_IP}"
    echo "   - API: http://${PRIVATE_IP}/api"
    echo ""
    echo "📁 项目目录: ${PROJECT_DIR}"
    echo "📝 配置文件: ${PROJECT_DIR}/.env"
    echo "📝 Nginx配置: /etc/nginx/conf.d/${PROJECT_NAME}.conf"
    echo ""
    echo "📝 常用命令:"
    echo "   - 查看状态: pm2 status"
    echo "   - 查看日志: pm2 logs ${PROJECT_NAME}"
    echo "   - 重启应用: pm2 restart ${PROJECT_NAME}"
    echo "   - 停止应用: pm2 stop ${PROJECT_NAME}"
    echo "   - 查看Nginx日志: tail -f /var/log/nginx/error.log"
    echo ""
    echo "⚠️  重要提醒:"
    echo "   1. 请检查并修改 ${PROJECT_DIR}/.env 文件中的 JWT_SECRET"
    echo "   2. 如有域名，请修改Nginx配置中的 server_name"
    echo "   3. 建议申请SSL证书并启用HTTPS"
    echo "   4. 定期备份数据库: ${PROJECT_DIR}/database/accounting.db"
    echo ""
}

# 主函数
main() {
    clear
    echo "======================================"
    echo "  记账管理系统 - 自动化部署脚本"
    echo "  适用于阿里云宝塔Linux面板"
    echo "======================================"
    echo ""
    
    check_root
    detect_system
    update_system
    install_nodejs
    install_pm2
    install_nginx
    create_project_dir
    deploy_files
    install_dependencies
    setup_env
    init_database
    build_frontend
    setup_pm2
    setup_nginx
    setup_firewall
    show_deployment_info
    
    log_success "所有部署步骤已完成！"
}

# 运行主函数
main "$@"

