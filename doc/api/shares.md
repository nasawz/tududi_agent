# 项目共享API文档

## 概述
项目共享API提供项目共享和权限管理功能，允许用户与团队成员共享项目、任务和笔记，并控制访问级别。

## 基础路径
```
/api/shares
```

## 认证方式
- 需要有效的登录会话
- 资源所有者或管理员可以管理共享
- 只有所有者或管理员可以查看、添加或撤销共享权限

## 支持的资源类型
- **project**：项目
- **task**：任务
- **note**：笔记

## 访问级别
- **owner**：所有者（完整权限）
- **rw**：读写权限
- **ro**：只读权限

## 接口列表

### 1. 创建共享

#### 请求
```http
POST /api/shares
```

#### 请求体
```json
{
  "resource_type": "project",
  "resource_uid": "proj_abc123",
  "target_user_email": "teammate@example.com",
  "access_level": "rw"
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| resource_type | string | 是 | 资源类型（project/task/note） |
| resource_uid | string | 是 | 资源UID |
| target_user_email | string | 是 | 目标用户邮箱 |
| access_level | string | 是 | 访问级别（rw/ro） |

#### 响应
**成功 (201)**
```
No Content
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 缺少参数或无效的访问级别 |
| 403 | 无权限（非所有者或管理员） |
| 404 | 目标用户不存在 |
| 404 | 资源不存在 |
| 400 | 不能向所有者授予权限 |
| 400 | 无法共享资源 |

---

### 2. 撤销共享

#### 请求
```http
DELETE /api/shares
```

#### 请求体
```json
{
  "resource_type": "project",
  "resource_uid": "proj_abc123",
  "target_user_id": 123
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| resource_type | string | 是 | 资源类型（project/task/note） |
| resource_uid | string | 是 | 资源UID |
| target_user_id | number | 是 | 目标用户ID |

#### 响应
**成功 (204)**
```
No Content
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 缺少参数 |
| 403 | 无权限（非所有者或管理员） |
| 400 | 不能撤销所有者的权限 |
| 400 | 无法撤销共享权限 |

---

### 3. 获取共享列表

#### 请求
```http
GET /api/shares?resource_type=project&resource_uid=proj_abc123
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| resource_type | string | 是 | 资源类型（project/task/note） |
| resource_uid | string | 是 | 资源UID |

#### 响应
**成功 (200)**
```json
{
  "shares": [
    {
      "user_id": 1,
      "email": "owner@example.com",
      "access_level": "owner",
      "created_at": null,
      "is_owner": true
    },
    {
      "user_id": 123,
      "email": "teammate@example.com",
      "access_level": "rw",
      "created_at": "2024-01-15T10:00:00.000Z",
      "is_owner": false
    },
    {
      "user_id": 124,
      "email": "viewer@example.com",
      "access_level": "ro",
      "created_at": "2024-01-16T10:00:00.000Z",
      "is_owner": false
    }
  ]
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| shares | array | 共享列表 |
| shares[].user_id | number | 用户ID |
| shares[].email | string | 用户邮箱 |
| shares[].access_level | string | 访问级别（owner/rw/ro） |
| shares[].created_at | string | 授予权限时间 |
| shares[].is_owner | boolean | 是否为所有者 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 缺少参数 |
| 403 | 无权限（非所有者或管理员） |
| 400 | 无法列出共享权限 |

## 权限继承

### 项目共享
- 共享项目时，关联的任务和笔记也会被共享
- 子任务继承父任务的权限

### 权限层级
- **所有者（owner）**：拥有全部权限，可以删除资源
- **读写（rw）**：可以查看、编辑、完成任务，但不能删除
- **只读（ro）**：只能查看资源

## 所有者权限

### 自动拥有
- 项目创建者自动成为所有者
- 所有者的访问级别为"owner"
- 无法撤销所有者的权限
- 无法向所有者授予权限

### 所有者标识
在共享列表中，所有者：
- `created_at` 为 null
- `is_owner` 为 true
- `access_level` 为 "owner"

## 使用场景

### 团队协作
1. **项目经理共享项目**：
   ```http
   POST /api/shares
   {
     "resource_type": "project",
     "resource_uid": "proj_abc123",
     "target_user_email": "teamlead@example.com",
     "access_level": "rw"
   }
   ```

2. **添加只读观察者**：
   ```http
   POST /api/shares
   {
     "resource_type": "project",
     "resource_uid": "proj_abc123",
     "target_user_email": "stakeholder@example.com",
     "access_level": "ro"
   }
   ```

3. **移除团队成员**：
   ```http
   DELETE /api/shares
   {
     "resource_type": "project",
     "resource_uid": "proj_abc123",
     "target_user_id": 123
   }
   ```

### 任务级别的共享
- 可以单独共享特定任务
- 常用于跨项目协作

### 笔记共享
- 共享笔记给特定用户
- 方便文档协作

## 权限检查

### 检查逻辑
1. **资源所有权检查**：验证用户是否为资源所有者
2. **管理员检查**：检查用户是否为管理员
3. **权限验证**：确保只有所有者或管理员可以管理共享

### 访问控制流程
```
用户请求 → 验证登录 → 检查资源所有权 → 验证权限 → 执行操作
```

## 错误处理

### 常见错误
1. **权限不足**：
   ```
   {
     "error": "Forbidden"
   }
   ```

2. **目标用户不存在**：
   ```
   {
     "error": "Target user not found"
   }
   ```

3. **资源不存在**：
   ```
   {
     "error": "Resource not found"
   }
   ```

4. **无法向所有者授予权限**：
   ```
   {
     "error": "Cannot grant permissions to the owner. Owner already has full access."
   }
   ```

## 性能考虑

### 批量操作
- 共享列表通过单次查询获取所有权限
- 邮件地址通过批量查询优化性能

### 缓存
- 权限信息可能被缓存以提高性能
- 权限变更后缓存会自动更新

## 安全注意事项

1. **权限最小化**：
   - 只授予必要的权限
   - 使用只读权限而非读写权限

2. **定期审查**：
   - 定期检查共享列表
   - 移除不需要的权限

3. **团队变化**：
   - 团队成员离开时及时撤销权限
   - 定期更新权限分配

## 相关端点

- **项目**：`/api/projects/*` - 项目管理（可共享）
- **任务**：`/api/tasks/*` - 任务管理（可共享）
- **笔记**：`/api/notes/*` - 笔记管理（可共享）
- **用户**：`/api/users/*` - 用户管理
- **权限服务**：`permissionsService` - 权限计算和验证

## 注意事项

1. **UID格式**：资源UID以资源类型前缀开头（如：proj_, task_, note_）
2. **邮箱验证**：目标用户必须已注册
3. **权限传播**：子资源会自动继承权限
4. **并发控制**：多个用户同时操作时的权限冲突
5. **删除级联**：删除共享资源时，关联的权限会自动清理
