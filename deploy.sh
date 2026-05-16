#!/bin/bash

# 腾讯云部署脚本
# 使用方法: ./deploy.sh

echo "🚀 开始部署到腾讯云..."

# 1. 提交代码
echo "📝 提交代码到 Git..."
git add .
git commit -m "删除 token 机制，简化认证流程"
git push origin main

echo "✅ 代码已推送到 Git 仓库"
echo ""
echo "📋 接下来请在腾讯云服务器上执行以下命令："
echo ""
echo "cd /root/chatroom  # 或者你的项目路径"
echo "git pull origin main"
echo "cd backend"
echo "npm install"
echo "cd ../frontend"
echo "npm install"
echo "npm run build"
echo ""
echo "# 复制前端到 Nginx 目录"
echo "sudo cp -r dist/* /var/www/html/"
echo ""
echo "# 重启后端"
echo "cd ../backend"
echo "pm2 restart chatroom-backend"
echo ""
echo "# 重载 Nginx"
echo "sudo nginx -s reload"
echo ""
echo "🎉 部署完成！"
