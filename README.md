# 安全网页聊天室系统

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io)](https://socket.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql)](https://www.mysql.com/)

> **在线体验**: [1y4w1s.icu](http://1y4w1s.icu) | **源码**: [github.com/1y4w1s/chatroom](https://github.com/1y4w1s/chatroom)
>
> 前后端均由个人独立开发。

功能完整的实时聊天社交系统，支持群聊、私聊、好友系统、帖子广场、通知提醒等模块。

---

## 技术亮点

### 实时通信架构

基于 **Socket.IO** 实现消息实时推送。服务端配置了双重心跳检测机制——15 秒超时 + 10 秒心跳间隔，客户端每 10 秒发送心跳维持连接。断线后自动重连并同步在线状态。

多标签页场景下，服务端通过 `Map<userId, Set<socketId>>` 追踪同一用户的所有连接，只有当所有标签页都断开后才标记为离线，避免误判。

**数据流**：
```
客户端 A 发送消息
    → socket.emit('send_message')
    → 后端接收，MessageService 写入 MySQL
    → io.to(roomId).emit('new_message') 广播
    → 在线客户端实时渲染
    → 离线用户下次进入时通过 REST API 拉取历史
```

### 后端安全体系

从项目初期即纳入安全考虑：

| 防护层 | 实现方式 |
|--------|---------|
| HTTP 安全头 | Helmet 中间件 |
| 接口限流 | express-rate-limit（登录/注册 50 次/15 分钟） |
| XSS 防护 | xss-clean 中间件 + 敏感词过滤 |
| JWT 访问控制 | jsonwebtoken，7 天有效期，中间件鉴权 |
| SQL 注入防护 | MySQL2 参数化查询（`?` 占位符） |

### 数据库设计

12 张关系表：用户、消息、群组、成员、好友、好友请求、帖子、点赞、通知、敏感词、已读状态、公告。

未读状态采用游标模式（`room_read_status` 记录最后已读消息 ID），相比逐条标记已读大幅减少数据量。

---

## 功能概览

| 模块 | 功能 |
|------|------|
| **聊天室** | 创建/加入/退出房间、成员管理（踢人/禁言/设管理员）、@全体成员与 @提及通知、机器人回复 |
| **私聊** | 一对一实时聊天，好友在线状态显示 |
| **消息** | 文本/图片/文件发送、回复、编辑、撤回、表情包收藏 |
| **好友系统** | 添加好友、好友申请审批、在线状态跟踪 |
| **帖子广场** | 发布帖子（图文）、点赞、帖子详情 |
| **通知系统** | 好友申请、@提及、群聊事件实时通知 |
| **UI 主题** | 暗色/亮色双主题，移动端响应式适配 |

---

## 快速启动

### 前置条件

- Node.js ≥ 16
- MySQL ≥ 8.0

### 1. 数据库初始化

```bash
mysql -u root -p < backend/database/init.sql
```

### 2. 启动后端

```bash
cd backend
npm install
cp .env.example .env    # 编辑数据库连接信息
npm start               # 默认端口 3000
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev             # 默认端口 5173
```

---

## 项目结构

```
chatroom/
├── backend/                    # Express 后端
│   ├── src/
│   │   ├── config/           # 数据库配置（MySQL 连接池）
│   │   ├── middleware/        # JWT 认证中间件
│   │   ├── routes/            # 9 组 RESTful API
│   │   ├── services/          # 业务逻辑（消息/敏感词过滤）
│   │   └── server.js          # 入口（Express + Socket.IO + 安全配置）
│   └── database/
│       └── init.sql           # 数据库初始化脚本
├── frontend/                   # Vue 3 前端
│   ├── src/
│   │   ├── components/        # 组件（聊天区域/消息列表/输入框等）
│   │   ├── views/             # 页面（登录/注册/聊天/个人中心）
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── api/               # API 封装
│   │   └── router/            # 路由
│   └── package.json
└── README.md
```
