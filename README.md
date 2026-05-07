# 安全网页聊天室系统

一个基于 Vue 3 + Node.js + MySQL 的安全实时聊天室系统，专为毕业设计设计。

## 📋 项目特点

### 安全特性
- ✅ **SQL 注入防护**：使用参数化查询
- ✅ **XSS 防护**：输入过滤 + 输出转义
- ✅ **密码加密**：bcrypt 加密存储
- ✅ **JWT 认证**：安全的 Token 机制
- ✅ **速率限制**：防止暴力破解
- ✅ **文件上传安全**：类型验证 + 大小限制
- ✅ **敏感词过滤**：自动过滤不当内容

### 功能特性
- ✅ 用户注册/登录
- ✅ 实时聊天（WebSocket）
- ✅ 多聊天室
- ✅ 消息历史记录
- ✅ 好友系统
- ✅ 文件/图片上传
- ✅ 在线状态显示

## 🛠 环境要求

- **Node.js**: 16.x 或更高版本
- **MySQL**: 8.0 或更高版本
- **npm**: 8.x 或更高版本

## 📦 安装步骤

### 1. 安装 MySQL 数据库

Windows 用户可下载 MySQL Installer:
https://dev.mysql.com/downloads/mysql/

安装后记住 root 密码。

### 2. 配置数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本
source backend/database/init.sql
```

**重要**：编辑 `backend/database/init.sql`，将密码修改为你的强密码：
```sql
-- 取消注释并修改密码
CREATE USER 'chatroom'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON chatroom_db.* TO 'chatroom'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 安装后端依赖

```bash
cd backend
npm install
```

### 4. 配置后端环境变量

复制环境变量配置文件：
```bash
cd backend
copy .env.example .env
```

编辑 `.env` 文件，修改数据库密码：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=chatroom
DB_PASSWORD=你的强密码
DB_NAME=chatroom_db

JWT_SECRET=随机生成的超长密钥_不要用默认值
PORT=3000
NODE_ENV=development
```

### 5. 安装前端依赖

```bash
cd ../frontend
npm install
```

## 🚀 启动项目

### 启动后端服务器

```bash
cd backend
npm run dev
```

看到以下信息表示成功：
```
✅ 数据库连接成功！
╔═══════════════════════════════════════════════╗
║     🚀 聊天室服务器已启动                      ║
╠═══════════════════════════════════════════════╣
║  端口：3000                                   ║
║  环境：development                            ║
╚═══════════════════════════════════════════════╝
```

### 启动前端（新终端）

```bash
cd frontend
npm run dev
```

看到以下信息表示成功：
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🌐 访问应用

打开浏览器访问：**http://localhost:5173**

### 默认测试账号

首次使用需要注册新账号。

## 📁 项目结构

```
chatroom/
├── backend/                    # 后端
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   │   └── database.js    # 数据库配置
│   │   ├── routes/            # API 路由
│   │   │   ├── auth.js        # 认证路由
│   │   │   ├── users.js       # 用户路由
│   │   │   ├── rooms.js       # 聊天室路由
│   │   │   ├── messages.js    # 消息路由
│   │   │   └── friends.js     # 好友路由
│   │   ├── services/          # 业务服务
│   │   │   └── messageService.js
│   │   └── server.js          # 主服务器
│   ├── database/
│   │   └── init.sql           # 数据库初始化脚本
│   ├── uploads/               # 上传文件目录
│   ├── .env                   # 环境变量
│   └── package.json
│
└── frontend/                   # 前端
    ├── src/
    │   ├── api/               # API 接口
    │   │   └── index.js
    │   ├── router/            # 路由配置
    │   │   └── index.js
    │   ├── stores/            # 状态管理
    │   │   └── auth.js
    │   ├── views/             # 页面组件
    │   │   ├── LoginView.vue
    │   │   ├── RegisterView.vue
    │   │   ├── ChatView.vue
    │   │   └── RoomView.vue
    │   ├── App.vue
    │   ├── main.js
    │   └── style.css
    ├── index.html
    └── package.json
```

## 🔒 安全说明

### 密码要求
- 长度：6-32 个字符
- 必须包含：大写字母 + 小写字母 + 数字

### 文件上传限制
- 图片：JPEG, PNG, GIF, WebP（最大 2MB）
- 文件：PDF, DOC, DOCX（最大 5MB）

### 敏感词过滤
系统会自动过滤数据库中的敏感词，替换为 `***`

## 📝 API 接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/verify` - 验证 Token

### 用户接口
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户信息
- `POST /api/users/avatar` - 上传头像
- `GET /api/users/search?q=xxx` - 搜索用户

### 聊天室接口
- `GET /api/rooms` - 获取聊天室列表
- `GET /api/rooms/:id` - 获取聊天室详情
- `POST /api/rooms` - 创建聊天室
- `POST /api/rooms/:id/join` - 加入聊天室
- `POST /api/rooms/:id/leave` - 离开聊天室
- `GET /api/rooms/:id/messages` - 获取消息历史

### 消息接口
- `POST /api/messages/upload` - 上传文件
- `PUT /api/messages/:id` - 编辑消息
- `DELETE /api/messages/:id` - 删除消息
- `POST /api/messages/:id/read` - 标记已读

### 好友接口
- `GET /api/friends` - 获取好友列表
- `POST /api/friends/request` - 发送好友申请
- `GET /api/friends/requests` - 获取好友申请
- `POST /api/friends/requests/:id/respond` - 响应申请
- `DELETE /api/friends/:id` - 删除好友

## 🔧 常见问题

### 1. 数据库连接失败
检查 `.env` 文件中的数据库配置是否正确，确保 MySQL 服务已启动。

### 2. 端口被占用
修改 `.env` 中的 `PORT` 值，或关闭占用端口的程序。

### 3. npm install 失败
尝试使用淘宝镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 4. WebSocket 连接失败
确保后端服务器已启动，检查防火墙设置。

## 📚 技术栈

### 后端
- **Node.js** - 运行环境
- **Express** - Web 框架
- **Socket.io** - WebSocket 实时通信
- **MySQL** - 数据库
- **bcrypt** - 密码加密
- **jsonwebtoken** - JWT 认证
- **express-validator** - 输入验证
- **helmet** - 安全 HTTP 头
- **express-rate-limit** - 速率限制
- **multer** - 文件上传

### 前端
- **Vue 3** - 渐进式框架
- **Vite** - 构建工具
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端
- **Socket.io-client** - WebSocket 客户端

## 🎓 毕设相关

### 可用于文档的亮点
1. **多层安全防护体系**
2. **WebSocket 实时通信优化**
3. **数据库连接池性能优化**
4. **前后端分离架构**
5. **响应式设计**
6. **敏感词过滤算法**

### 测试建议
1. 功能测试：所有 CRUD 操作
2. 性能测试：并发连接测试
3. 安全测试：SQL 注入、XSS 尝试
4. 兼容性测试：不同浏览器

## 📄 许可证

MIT License

## 👨‍💻 作者

毕业设计项目

---

**祝毕设顺利！🎓**
