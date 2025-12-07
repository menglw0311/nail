#!/bin/bash

###############################################################################
# 服务器配置信息
# 用于快速配置部署脚本
###############################################################################

# 服务器IP配置
export PUBLIC_IP="8.163.15.68"      # 公网IP
export PRIVATE_IP="172.18.56.184"   # 私有IP

# 项目配置
export PROJECT_NAME="accounting-system"
export PROJECT_DIR="/www/wwwroot/${PROJECT_NAME}"
export NODE_VERSION="20"
export API_PORT="3000"
export DOMAIN=""  # 如果有域名，填写在这里，例如: "account.example.com"

# 显示配置信息
echo "======================================"
echo "   服务器配置信息"
echo "======================================"
echo "公网IP: ${PUBLIC_IP}"
echo "私有IP: ${PRIVATE_IP}"
echo "项目目录: ${PROJECT_DIR}"
echo "API端口: ${API_PORT}"
if [ -n "$DOMAIN" ]; then
    echo "域名: ${DOMAIN}"
fi
echo "======================================"

