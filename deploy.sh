#!/bin/bash

# 本地部署推送脚本
# 使用方法: ./deploy.sh "提交信息"

set -e

MSG="${1:-自动部署更新}"

echo "🚀 开始部署..."

# 1. 提交代码
echo "📝 提交代码到 Git..."
git add .
git commit -m "$MSG" --allow-empty
git push origin main

echo "✅ 代码已推送到 GitHub"
echo ""
echo "📋 接下来请在腾讯云服务器上执行更新："
echo "=========================================="
echo "ssh 连接到服务器后执行："
echo ""
echo "cd /root/chatroom"
echo "git pull origin main"
echo "cd backend && npm install"
echo "cd ../frontend && npm install && npm run build"
echo "sudo cp -r dist/* /var/www/html/"
echo "cd ../backend && pm2 restart chatroom-backend"
echo "sudo nginx -s reload"
echo "=========================================="
echo ""
echo "💡 或者直接在服务器上运行: ./server-deploy.sh"
echo "🎉 部署完成！"
