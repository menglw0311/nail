#!/bin/bash

###############################################################################
# 手动安装Nginx脚本
# 用于解决自动部署脚本中Nginx安装失败的问题
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检测系统
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

log_info "开始安装Nginx..."

if [ "$OS" = "centos" ]; then
    # CentOS系统
    log_info "安装EPEL仓库..."
    
    # 检查是否有dnf（CentOS 8+）
    if command -v dnf &> /dev/null; then
        log_info "使用dnf安装EPEL..."
        dnf install -y epel-release || {
            log_info "EPEL可能已安装，继续..."
        }
        
        log_info "使用dnf安装Nginx..."
        dnf install -y nginx || {
            log_error "dnf安装失败，尝试其他方法..."
            # 尝试从Nginx官方仓库安装
            log_info "添加Nginx官方仓库..."
            cat > /etc/yum.repos.d/nginx.repo << 'EOF'
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
EOF
            dnf install -y nginx
        }
    else
        log_info "使用yum安装EPEL..."
        yum install -y epel-release || {
            log_info "EPEL可能已安装，继续..."
        }
        
        log_info "使用yum安装Nginx..."
        yum install -y nginx || {
            log_error "yum安装失败，尝试从Nginx官方仓库安装..."
            # 尝试从Nginx官方仓库安装
            log_info "添加Nginx官方仓库..."
            cat > /etc/yum.repos.d/nginx.repo << 'EOF'
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
EOF
            yum install -y nginx
        }
    fi
else
    # Debian/Ubuntu系统
    log_info "更新软件包列表..."
    apt-get update -y
    
    log_info "安装Nginx..."
    apt-get install -y nginx
fi

# 启动并启用Nginx
log_info "启动Nginx服务..."
systemctl enable nginx
systemctl start nginx

# 验证安装
if command -v nginx &> /dev/null; then
    log_success "Nginx安装成功！"
    log_success "版本信息: $(nginx -v 2>&1)"
    log_success "服务状态: $(systemctl is-active nginx)"
    
    echo ""
    echo "======================================"
    echo "   Nginx安装完成"
    echo "======================================"
    echo ""
    echo "📝 常用命令:"
    echo "   - 启动: systemctl start nginx"
    echo "   - 停止: systemctl stop nginx"
    echo "   - 重启: systemctl restart nginx"
    echo "   - 状态: systemctl status nginx"
    echo "   - 测试配置: nginx -t"
    echo "   - 重载配置: systemctl reload nginx"
    echo ""
    echo "📁 配置文件位置:"
    echo "   - 主配置: /etc/nginx/nginx.conf"
    echo "   - 站点配置: /etc/nginx/conf.d/"
    echo ""
else
    log_error "Nginx安装失败"
    exit 1
fi

