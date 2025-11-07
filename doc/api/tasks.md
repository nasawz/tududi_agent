# 任务管理API文档

## 概述
任务管理API提供任务的完整CRUD操作，包括任务创建、更新、删除、状态管理、子任务和重复任务功能。

## 基础路径
```
/api
```

## 认证方式
- 需要有效的登录会话
- 大部分操作需要任务访问权限（通过hasAccess中间件）
- 权限包括：ro（只读）和rw（读写）

## 数据模型

### Task（任务）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 任务ID |
| uid | string | 任务唯一标识符 |
| name | string | 任务名称 |
| note | string | 任务备注 |
| priority | number | 优先级（数值越小优先级越高） |
| due_date | date | 到期日期 |
| state | string | 任务状态 |
| parent_task_id | number | 父任务ID（用于子任务） |
| project_id | number | 所属项目ID |
| recurrence_type | string | 重复类型 |
| recurrence_interval | number | 重复间隔 |
| recurrence_days | array | 重复的星期几 |
| recurrence_end_date | date | 重复结束日期 |

## 接口列表

### 1. 获取任务列表

#### 请求
```http
GET /api/tasks
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 视图类型：today, upcoming, someday, all, project |
| project_id | number | 否 | 项目ID（当type=project时使用） |
| orderBy | string | 否 | 排序方式：priority, name, due_date, created_at（默认created_at:desc） |
| user_timezone | string | 否 | 用户时区（如：Asia/Shanghai） |
| uid | string | 否 | 任务UID（与task端点配合使用） |

#### 响应
**按天分组的任务列表 (200)**
```json
{
  "Today": [
    {
      "id": 1,
      "uid": "task_abc123",
      "name": "完成项目报告",
      "note": "编写Q4项目总结报告",
      "priority": 1,
      "due_date": "2024-01-15T10:00:00.000Z",
      "state": "active",
      "project_id": 5,
      "parent_task_id": null,
      "today_move_count": 0,
      "tags": [],
      "Subtasks": []
    }
  ],
  "Tomorrow": [
    {
      "id": 2,
      "uid": "task_def456",
      "name": "团队会议",
      "priority": 2,
      "due_date": "2024-01-16T14:00:00.000Z",
      "state": "active"
    }
  ],
  "No Due Date": [
    {
      "id": 3,
      "uid": "task_ghi789",
      "name": "阅读技术文档",
      "priority": 3,
      "state": "active"
    }
  ]
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 2. 通过UID获取单个任务

#### 请求
```http
GET /api/task?uid=task_abc123
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | string | 是 | 任务UID |

#### 响应
**成功 (200)**
```json
{
  "id": 1,
  "uid": "task_abc123",
  "name": "完成项目报告",
  "note": "编写Q4项目总结报告",
  "priority": 1,
  "due_date": "2024-01-15T10:00:00.000Z",
  "state": "active",
  "project_id": 5,
  "parent_task_id": null
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 500 | 服务器内部错误 |

---

### 3. 获取任务详情

#### 请求
```http
GET /api/task/123
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID |

#### 响应
**成功 (200)**
```json
{
  "id": 123,
  "uid": "task_abc123",
  "name": "完成项目报告",
  "note": "编写Q4项目总结报告",
  "priority": 1,
  "due_date": "2024-01-15T10:00:00.000Z",
  "state": "active",
  "project_id": 5,
  "parent_task_id": null,
  "recurrence_type": null,
  "recurrence_interval": null,
  "recurrence_days": null,
  "recurrence_end_date": null,
  "today_move_count": 0,
  "tags": [
    {
      "id": 1,
      "name": "重要",
      "color": "#FF0000"
    }
  ],
  "Subtasks": [
    {
      "id": 124,
      "name": "收集数据",
      "state": "completed",
      "priority": 1
    }
  ]
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 403 | 无访问权限 |
| 500 | 服务器内部错误 |

---

### 4. 获取子任务列表

#### 请求
```http
GET /api/task/123/subtasks
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 父任务ID |

#### 响应
**成功 (200)**
```json
[
  {
    "id": 124,
    "uid": "subtask_abc123",
    "name": "收集数据",
    "state": "completed",
    "priority": 1,
    "due_date": "2024-01-10T00:00:00.000Z",
    "parent_task_id": 123
  },
  {
    "id": 125,
    "uid": "subtask_def456",
    "name": "编写报告",
    "state": "active",
    "priority": 2,
    "due_date": "2024-01-12T00:00:00.000Z",
    "parent_task_id": 123
  }
]
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 5. 创建任务

#### 请求
```http
POST /api/task
```

#### 请求体
```json
{
  "name": "新任务",
  "note": "任务备注",
  "priority": 1,
  "due_date": "2024-01-20T10:00:00.000Z",
  "project_id": 5,
  "parent_task_id": null,
  "recurrence_type": null,
  "recurrence_interval": 1,
  "recurrence_days": ["Monday", "Wednesday"],
  "recurrence_end_date": "2024-12-31T00:00:00.000Z",
  "state": "active"
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 任务名称 |
| note | string | 否 | 任务备注 |
| priority | number | 否 | 优先级（默认0） |
| due_date | date | 否 | 到期日期 |
| project_id | number | 否 | 项目ID |
| parent_task_id | number | 否 | 父任务ID（创建子任务） |
| recurrence_type | string | 否 | 重复类型：daily, weekly, monthly |
| recurrence_interval | number | 否 | 重复间隔 |
| recurrence_days | array | 否 | 重复的星期几 |
| recurrence_end_date | date | 否 | 重复结束日期 |
| state | string | 否 | 任务状态（默认active） |

#### 重复任务参数说明
- **recurrence_type**：重复类型
  - `daily`：每日重复
  - `weekly`：每周重复（配合recurrence_days）
  - `monthly`：每月重复
- **recurrence_interval**：间隔（如：每2天，每3周）
- **recurrence_days**：每周几重复（数组，如：["Monday", "Wednesday"]）

#### 响应
**成功 (201)**
```json
{
  "id": 126,
  "uid": "task_new123",
  "name": "新任务",
  "note": "任务备注",
  "priority": 1,
  "due_date": "2024-01-20T10:00:00.000Z",
  "state": "active",
  "project_id": 5,
  "parent_task_id": null,
  "recurrence_type": null,
  "created_at": "2024-01-15T00:00:00.000Z"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 参数错误或验证失败 |
| 500 | 服务器内部错误 |

---

### 6. 更新任务

#### 请求
```http
PATCH /api/task/123
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID |

#### 请求体
```json
{
  "name": "更新后的任务名称",
  "note": "更新后的备注",
  "priority": 2,
  "due_date": "2024-01-25T10:00:00.000Z",
  "project_id": 6,
  "state": "active"
}
```

#### 参数说明
所有参数均为可选，只更新提供的字段。

#### 响应
**成功 (200)**
```json
{
  "id": 123,
  "uid": "task_abc123",
  "name": "更新后的任务名称",
  "note": "更新后的备注",
  "priority": 2,
  "due_date": "2024-01-25T10:00:00.000Z",
  "state": "active",
  "project_id": 6,
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 403 | 无修改权限 |
| 400 | 参数错误或验证失败 |
| 500 | 服务器内部错误 |

---

### 7. 切换任务完成状态

#### 请求
```http
PATCH /api/task/123/toggle_completion
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID |

#### 响应
**成功 (200)**
```json
{
  "id": 123,
  "state": "completed",
  "completed_at": "2024-01-15T12:00:00.000Z"
}
```

#### 状态切换逻辑
- **active** → **completed**：标记为已完成，设置completed_at时间戳
- **completed** → **active**：重新激活任务，清除completed_at时间戳
- 重复任务：完成后会自动生成下一次迭代的任务

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 403 | 无修改权限 |
| 500 | 服务器内部错误 |

---

### 8. 删除任务

#### 请求
```http
DELETE /api/task/123
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID |

#### 响应
**成功 (204)**
```
No Content
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 403 | 无删除权限 |
| 500 | 服务器内部错误 |

---

### 9. 生成重复任务

#### 请求
```http
POST /api/tasks/generate-recurring
```

#### 响应
**成功 (200)**
```json
{
  "message": "Generated 5 recurring tasks",
  "tasks": [
    {
      "id": 127,
      "uid": "recurring_task1",
      "name": "每日任务",
      "due_date": "2024-01-16T09:00:00.000Z"
    }
  ]
}
```

#### 功能说明
- 为当前用户的重复任务模板生成实际的待办任务实例
- 基于到期日期和重复设置自动计算下一次发生
- 避免重复生成：检查是否已存在即将到期的实例

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 10. 切换今日标记

#### 请求
```http
PATCH /api/task/123/toggle-today
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID |

#### 响应
**成功 (200)**
```json
{
  "id": 123,
  "today_move_count": 1,
  "message": "Task marked for today"
}
```

#### 功能说明
- 将任务移动到"今日"视图
- 记录移动次数（today_move_count）
- 用于快速将任务标记为今天要完成

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 403 | 无修改权限 |
| 500 | 服务器内部错误 |

---

### 11. 获取下一次迭代

#### 请求
```http
GET /api/task/123/next-iterations
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务ID |

#### 响应
**成功 (200)**
```json
[
  {
    "id": 128,
    "name": "每周会议",
    "due_date": "2024-01-22T14:00:00.000Z",
    "recurrence_iteration": 1
  },
  {
    "id": 129,
    "name": "每周会议",
    "due_date": "2024-01-29T14:00:00.000Z",
    "recurrence_iteration": 2
  }
]
```

#### 功能说明
- 获取重复任务未来的迭代实例
- 显示即将到来的重复任务发生
- 用于预览重复任务的计划安排

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 400 | 任务不是重复任务 |
| 500 | 服务器内部错误 |

## 任务状态说明

- **active**：活跃状态
- **completed**：已完成
- **archived**：已归档

## 权限系统

### 访问级别
- **ro（只读）**：可以查看任务详情和子任务
- **rw（读写）**：可以修改和删除任务

### 权限检查
- 通过`hasAccess`中间件自动检查
- 基于项目共享权限和用户角色

## 时区处理

- API支持用户时区参数（`user_timezone`）
- 所有日期时间均以UTC格式存储和返回
- 前端应根据用户时区进行显示转换

## 注意事项
1. **重复任务**：创建重复任务模板后，需要调用生成接口创建实际任务实例
2. **子任务**：通过`parent_task_id`字段建立层级关系
3. **项目关联**：任务必须关联到项目才能被正确管理
4. **权限验证**：所有任务操作都会进行权限检查
5. **事件日志**：任务的关键操作会记录到TaskEvent表中
6. **并发控制**：对于即将到期的重复任务，使用锁机制避免并发生成

## 相关端点
- **项目**：`/api/projects/*` - 项目管理
- **标签**：`/api/tags/*` - 标签管理
- **任务事件**：`/api/task-events/*` - 任务操作历史
- **管理员API**：`/api/admin/*` - 管理员用户管理
