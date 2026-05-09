# 腾讯云部署指南

## 📋 部署步骤

### 1️⃣ 本地推送代码

在本地项目根目录执行：

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

### 2️⃣ 服务器端操作

登录到你的腾讯云轻量应用服务器，然后执行以下命令：

```bash
# 1. 进入项目目录
cd /path/to/your/project

# 2. 拉取最新代码
git pull origin main

# 3. 安装后端依赖
cd backend
npm install

# 4. 安装前端依赖并构建
cd ../frontend
npm install
npm run build

# 5. 重启后端服务
cd ../backend
pm2 restart chatroom-backend

# 如果 PM2 还没安装，先安装：
# npm install -g pm2
# pm2 start npm --name "chatroom-backend" -- run dev
```

---

## 🔧 配置检查

### 后端配置文件

确保 `backend/.env` 文件存在且配置正确：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=chatroom
DB_PASSWORD=你的数据库密码
DB_NAME=chatroom_db

JWT_SECRET=任意字符串（已不使用，但保留配置）
PORT=3000
NODE_ENV=production
```

### 数据库初始化

如果数据库还未初始化，执行：

```bash
mysql -u root -p < backend/database/init.sql
```

---

## 🌐 访问应用

- **后端 API**: `http://你的服务器IP:3000`
- **前端页面**: 需要配置 Nginx 反向代理，将前端静态文件托管

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/project/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 文件上传
    location /uploads/ {
        alias /path/to/project/backend/uploads/;
    }

    # WebSocket 代理
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 常用命令

### 查看 PM2 进程状态
```bash
pm2 status
pm2 logs chatroom-backend
```

### 重启服务
```bash
pm2 restart chatroom-backend
```

### 停止服务
```bash
pm2 stop chatroom-backend
```

---

## ⚠️ 注意事项

1. **防火墙设置**: 确保腾讯云安全组开放了 3000 端口（或你配置的其他端口）
2. **数据库备份**: 部署前建议备份数据库
3. **环境变量**: 确保 `.env` 文件不会被提交到 Git（已在 .gitignore 中）
4. **文件权限**: 确保 uploads 目录有写入权限

---

## 🐛 故障排查

### 后端无法启动
```bash
# 查看日志
pm2 logs chatroom-backend

# 检查端口占用
netstat -tlnp | grep 3000
```

### 数据库连接失败
- 检查 MySQL 服务是否运行
- 检查 `.env` 中的数据库配置
- 检查数据库用户权限

### WebSocket 连接失败
- 检查 Nginx 配置中的 WebSocket 代理
- 检查防火墙设置
