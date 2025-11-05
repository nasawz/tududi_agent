# 身份验证API文档

## 概述
身份验证API提供用户登录、注销和会话管理功能，包括获取当前用户信息和应用程序版本。

## 基础路径
```
/api/auth
```

## 认证方式
- **版本获取**：无需认证
- **当前用户**：需要有效的登录会话
- **登录**：无需认证（提供凭据）
- **注销**：需要有效的登录会话

## 接口列表

### 1. 获取应用版本

#### 请求
```http
GET /api/auth/version
```

#### 响应
**成功 (200)**
```json
{
  "version": "v0.86-beta.1"
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| version | string | 应用程序版本号 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 2. 获取当前用户

#### 请求
```http
GET /api/auth/current_user
```

#### 响应
**已登录 (200)**
```json
{
  "user": {
    "uid": "abc123",
    "email": "user@example.com",
    "name": "张三",
    "surname": "李四",
    "language": "zh-CN",
    "appearance": "light",
    "timezone": "Asia/Shanghai",
    "is_admin": true
  }
}
```

**未登录 (200)**
```json
{
  "user": null
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| user.uid | string | 用户唯一标识符 |
| user.email | string | 邮箱地址 |
| user.name | string | 名字 |
| user.surname | string | 姓氏 |
| user.language | string | 用户语言设置（如：zh-CN, en-US） |
| user.appearance | string | 用户界面外观（light, dark） |
| user.timezone | string | 用户时区设置 |
| user.is_admin | boolean | 是否为管理员 |
| user | null | 用户未登录 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 3. 用户登录

#### 请求
```http
POST /api/auth/login
```

#### 请求体
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 用户邮箱地址 |
| password | string | 用户密码 | 密码 |

#### 响应
**成功 (200)**
```json
{
  "user": {
    "uid": "abc123",
    "email": "user@example.com",
    "name": "张三",
    "surname": "李四",
    "language": "zh-CN",
    "appearance": "light",
    "timezone": "Asia/Shanghai",
    "is_admin": true
  }
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 参数错误（缺少email或password） |
| 401 | 凭据无效 |
| 500 | 服务器内部错误 |

---

### 4. 用户注销

#### 请求
```http
GET /api/auth/logout
```

#### 响应
**成功 (200)**
```json
{
  "message": "Logged out successfully"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误（注销失败） |

## 认证流程

### 登录流程
1. 客户端向 `/api/auth/login` 发送POST请求，包含email和password
2. 服务器验证凭据
3. 如果验证成功，在会话中存储userId (`req.session.userId = user.id`)
4. 返回用户信息

### 保持登录状态
- 登录成功后，用户信息存储在express-session中
- 会话默认有效期为30天（可配置）
- 客户端无需手动传递认证令牌，session cookie会自动处理

### 注销流程
1. 客户端向 `/api/auth/logout` 发送GET请求
2. 服务器销毁当前会话
3. 返回成功消息

## 注意事项
1. **会话管理**：使用express-session进行会话管理
2. **密码验证**：密码通过User模型的checkPassword方法进行验证（bcrypt）
3. **Cookie安全**：
   - httpOnly: true（防止XSS攻击）
   - sameSite: 'lax'（CSRF保护）
   - secure: false（生产环境应设为true并启用HTTPS）
4. **管理员权限**：登录后会检查用户是否为管理员，并包含在响应中
5. **自动保存**：登录时会自动保存会话

## 相关端点
- **管理员API**：`/api/admin/*` - 需要管理员权限
- **用户管理**：`/api/users/*` - 需要登录权限
