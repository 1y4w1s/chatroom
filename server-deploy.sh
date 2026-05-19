#!/bin/bash

# 腾讯云服务器部署脚本
# 使用方法：在服务器上执行 ./server-deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署聊天室应用..."
echo ""

# 1. 进入项目目录（使用当前目录或传入路径）
PROJECT_DIR="${1:-$(pwd)}"
echo "📁 进入项目目录: $PROJECT_DIR"
cd "$PROJECT_DIR"

# 2. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 3. 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install

# 4. 安装前端依赖并构建
echo "🔨 构建前端..."
cd ../frontend
npm install
npm run build

# 5. 部署前端到 Nginx 目录
echo "📂 部署前端到 Nginx..."
if [ -d "/var/www/html" ]; then
    sudo cp -r dist/* /var/www/html/
    echo "✅ 前端文件已复制到 /var/www/html/"
    
    # 设置 Nginx 缓存控制
    NGINX_CONF="/etc/nginx/sites-enabled/default"
    if [ -f "$NGINX_CONF" ]; then
        if ! grep -q "Cache-Control" "$NGINX_CONF"; then
            echo "⚙️  添加缓存控制头..."
            sudo sed -i '/try_files/a\    add_header Cache-Control "no-store, no-cache, must-revalidate";' "$NGINX_CONF"
        fi
    fi
    
    echo "🔄 重新加载 Nginx..."
    sudo nginx -s reload
else
    echo "⚠️  /var/www/html 不存在，请确认 Nginx 配置路径"
fi

# 6. 重启后端服务
echo "🔄 重启后端服务..."
cd ../backend

# 检查 PM2 是否已安装
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 检查进程是否存在
if pm2 list | grep -q "chatroom-backend"; then
    echo "🔄 重启现有服务..."
    pm2 restart chatroom-backend
else
    echo "🚀 启动新服务..."
    pm2 start npm --name "chatroom-backend" -- run dev
fi

echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 服务状态："
pm2 status
echo ""
echo "📋 查看日志命令："
echo "pm2 logs chatroom-backend"
