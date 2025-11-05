# Tududi API 文档

## 概述

本文档提供了 Tududi 任务管理系统的完整 REST API 参考。Tududi 是一个自托管的任务管理应用，支持项目组织、任务跟踪、团队协作和 Telegram 集成。

## 基础信息

- **基础URL**: `/api`
- **认证方式**: 基于会话的认证（express-session）
- **数据格式**: JSON
- **字符编码**: UTF-8

## 快速开始

### 认证流程

1. **登录**
   ```http
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **检查当前用户**
   ```http
   GET /api/auth/current_user
   ```

3. **注销**
   ```http
   GET /api/auth/logout
   ```

### 基本用法

- 所有需要认证的API都需要有效的会话Cookie
- 大部分API基于资源类型进行权限控制
- 成功响应返回200系列状态码
- 错误响应返回相应的错误信息

## API 端点索引

### 核心功能

| 分类 | 文档 | 说明 |
|------|------|------|
| 身份验证 | [auth.md](auth.md) | 登录、注销、会话管理 |
| 用户管理 | [users.md](users.md) | 用户资料、个人设置 |
| 管理员 | [admin.md](admin.md) | 用户管理、角色分配 |
| 区域管理 | [areas.md](areas.md) | 项目分类区域 |

### 任务和项目

| 分类 | 文档 | 说明 |
|------|------|------|
| 任务管理 | [tasks.md](tasks.md) | 任务CRUD、状态管理、重复任务 |
| 项目管理 | [projects.md](projects.md) | 项目CRUD、文件上传、项目共享 |
| 标签管理 | [tags.md](tags.md) | 标签CRUD、跨项目分类 |
| 笔记管理 | [notes.md](notes.md) | 笔记CRUD、Markdown支持 |
| 视图管理 | [views.md](views.md) | 自定义视图、筛选条件 |

### 功能扩展

| 分类 | 文档 | 说明 |
|------|------|------|
| 收件箱 | [inbox.md](inbox.md) | 快速收集、智能处理 |
| 项目共享 | [shares.md](shares.md) | 团队协作、权限管理 |
| 搜索功能 | [search.md](search.md) | 全文搜索、高级筛选 |
| 任务事件 | [task-events.md](task-events.md) | 操作历史、统计分析 |

### 集成功能

| 分类 | 文档 | 说明 |
|------|------|------|
| Telegram | [telegram.md](telegram.md) | Bot集成、消息推送 |
| URL管理 | [url.md](url.md) | URL抓取、标题提取 |
| 名言功能 | [quotes.md](quotes.md) | 随机名言、励志内容 |

## 数据模型

### 核心实体

```
User (用户)
  └── Areas (区域)
        └── Projects (项目)
              ├── Tasks (任务)
              │     └── Tags (标签)
              └── Notes (笔记)
                    └── Tags (标签)
```

### 关系说明

- **区域 ↔ 项目**: 一对多关系
- **项目 ↔ 任务**: 一对多关系
- **项目 ↔ 笔记**: 一对多关系
- **标签 ↔ 任务/笔记**: 多对多关系
- **任务 ↔ 子任务**: 自关联（层级结构）

## 通用规范

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无内容） |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复名称） |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "error": "错误描述",
  "details": ["详细错误信息1", "详细错误信息2"]
}
```

### 分页（部分端点）

部分列表端点支持分页参数：

```http
GET /api/tasks?page=1&limit=20&offset=0
```

| 参数 | 说明 |
|------|------|
| page | 页码（从1开始） |
| limit | 每页数量 |
| offset | 偏移量 |

### 排序

大部分列表端点支持排序参数：

```http
GET /api/tasks?orderBy=priority:asc
```

| 排序字段 | 说明 |
|----------|------|
| name | 按名称 |
| priority | 按优先级 |
| due_date | 按到期日期 |
| created_at | 按创建时间 |

### 过滤

许多端点支持过滤参数：

```http
GET /api/tasks?state=active&priority=1&tag=重要
```

| 过滤字段 | 说明 |
|----------|------|
| state | 状态筛选 |
| priority | 优先级筛选 |
| tag | 标签筛选 |
| date | 日期范围筛选 |

## 权限系统

### 访问级别

- **ro（只读）**: 可以查看资源
- **rw（读写）**: 可以修改和删除资源

### 权限检查

- **自有资源**: 用户拥有所有权限
- **共享资源**: 基于共享设置的权限
- **管理员**: 管理员可以访问用户管理功能

## 速率限制

目前API没有实现速率限制，但建议合理使用以避免对服务器造成过大压力。

## SDK 和工具

### 官方工具

目前暂无官方SDK，但可以使用任何HTTP客户端调用API。

### 第三方工具

- **Postman Collection**: 可在项目中找到Postman集合文件
- **OpenAPI规范**: 暂无官方OpenAPI规范文档

## 变更日志

### v0.86-beta.1

- 添加视图管理功能
- 优化重复任务系统
- 增强项目共享功能
- 添加Telegram Bot集成

## 错误处理最佳实践

1. **检查状态码**: 始终检查HTTP响应状态码
2. **处理错误**: 根据错误信息采取相应行动
3. **重试机制**: 对500错误可以实施指数退避重试
4. **日志记录**: 记录错误信息以便调试

## 示例代码

### JavaScript (Fetch API)

```javascript
// 登录
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  return response.json();
};

// 获取任务列表
const getTasks = async () => {
  const response = await fetch('/api/tasks?type=today', {
    credentials: 'include'
  });
  return response.json();
};

// 创建任务
const createTask = async (taskData) => {
  const response = await fetch('/api/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
    credentials: 'include'
  });
  return response.json();
};
```

### Python (requests)

```python
import requests

# 设置会话
session = requests.Session()

# 登录
login_data = {
  'email': 'user@example.com',
  'password': 'password123'
}
response = session.post('http://localhost:3002/api/auth/login', json=login_data)

# 获取任务列表
tasks = session.get('http://localhost:3002/api/tasks?type=today').json()

# 创建任务
task_data = {
  'name': '新任务',
  'priority': 1,
  'project_id': 5
}
new_task = session.post('http://localhost:3002/api/task', json=task_data).json()
```

### cURL

```bash
# 登录
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# 获取任务列表
curl http://localhost:3002/api/tasks?type=today \
  -b cookies.txt

# 创建任务
curl -X POST http://localhost:3002/api/task \
  -H "Content-Type: application/json" \
  -d '{"name":"新任务","priority":1}' \
  -b cookies.txt
```

## 支持和反馈

- **项目主页**: https://github.com/chrisvel/tududi
- **问题反馈**: https://github.com/chrisvel/tududi/issues
- **文档问题**: 请通过GitHub Issues反馈

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](../../LICENSE) 文件。

---

**注意**: 这是一个社区维护的文档。如发现错误或需要更新，请提交 Pull Request 或 Issue。
