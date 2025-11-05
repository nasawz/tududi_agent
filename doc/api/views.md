# 视图管理API文档

## 概述
视图管理API提供自定义视图的CRUD操作，用于保存特定的搜索条件和过滤器，方便用户快速访问常用任务组合。

## 基础路径
```
/api/views
```

## 认证方式
- 需要有效的登录会话
- 所有操作仅限当前用户自己的数据

## 数据模型

### View（视图）
| 字段 | 类型 | 说明 |
|------|------|------|
| uid | string | 视图唯一标识符 |
| name | string | 视图名称 |
| search_query | string | 搜索查询字符串 |
| filters | array | 过滤器数组 |
| priority | number | 优先级筛选 |
| due | string | 到期日期筛选 |
| tags | array | 标签筛选 |
| is_pinned | boolean | 是否固定 |
| user_id | number | 所属用户ID |
| created_at | string | 创建时间 |

## 接口列表

### 1. 获取所有视图

#### 请求
```http
GET /api/views
```

#### 响应
**成功 (200)**
```json
[
  {
    "uid": "view_today123",
    "name": "今日任务",
    "search_query": "",
    "filters": ["active"],
    "priority": null,
    "due": "today",
    "tags": [],
    "is_pinned": true,
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "uid": "view_important456",
    "name": "重要任务",
    "search_query": "",
    "filters": [],
    "priority": 1,
    "due": null,
    "tags": ["重要"],
    "is_pinned": false,
    "user_id": 1,
    "created_at": "2024-01-02T00:00:00.000Z"
  }
]
```

#### 排序规则
- 首先按`is_pinned`降序（固定的在前）
- 然后按`created_at`降序（最新的在前）

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 2. 获取固定视图

#### 请求
```http
GET /api/views/pinned
```

#### 响应
**成功 (200)**
```json
[
  {
    "uid": "view_today123",
    "name": "今日任务",
    "is_pinned": true,
    "due": "today",
    "filters": ["active"]
  }
]
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 3. 获取单个视图

#### 请求
```http
GET /api/views/view_today123
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| identifier | string | 是 | 视图UID |

#### 响应
**成功 (200)**
```json
{
  "uid": "view_today123",
  "name": "今日任务",
  "search_query": "",
  "filters": ["active"],
  "priority": null,
  "due": "today",
  "tags": [],
  "is_pinned": true,
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 视图不存在 |
| 500 | 服务器内部错误 |

---

### 4. 创建视图

#### 请求
```http
POST /api/views
```

#### 请求体
```json
{
  "name": "本周任务",
  "search_query": "",
  "filters": ["active"],
  "priority": null,
  "due": "week",
  "tags": ["工作"]
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 视图名称 |
| search_query | string | 否 | 搜索查询字符串 |
| filters | array | 否 | 过滤器数组 |
| priority | number | 否 | 优先级筛选 |
| due | string | 否 | 到期日期筛选 |
| tags | array | 否 | 标签筛选 |
| priority | number | 否 | 优先级数值 |

#### 参数示例
```json
{
  "name": "高优先级任务",
  "filters": ["active"],
  "priority": 1,
  "tags": ["重要"]
}
```

#### 响应
**成功 (201)**
```json
{
  "uid": "view_new123",
  "name": "本周任务",
  "search_query": "",
  "filters": ["active"],
  "priority": null,
  "due": "week",
  "tags": ["工作"],
  "is_pinned": false,
  "user_id": 1,
  "created_at": "2024-01-15T00:00:00.000Z",
  "updated_at": "2024-01-15T00:00:00.000Z"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 视图名称为空或缺失必填参数 |
| 400 | 创建失败，包含详细错误信息 |
| 500 | 服务器内部错误 |

---

### 5. 更新视图

#### 请求
```http
PATCH /api/views/view_today123
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| identifier | string | 是 | 视图UID |

#### 请求体
```json
{
  "name": "今日任务（已更新）",
  "filters": ["active", "in_progress"],
  "is_pinned": true
}
```

#### 参数说明
所有参数均为可选，只更新提供的字段。

#### 响应
**成功 (200)**
```json
{
  "uid": "view_today123",
  "name": "今日任务（已更新）",
  "search_query": "",
  "filters": ["active", "in_progress"],
  "priority": null,
  "due": "today",
  "tags": [],
  "is_pinned": true,
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 视图不存在 |
| 400 | 更新失败，包含详细错误信息 |
| 500 | 服务器内部错误 |

---

### 6. 删除视图

#### 请求
```http
DELETE /api/views/view_today123
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| identifier | string | 是 | 视图UID |

#### 响应
**成功 (200)**
```json
{
  "message": "View successfully deleted"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 视图不存在 |
| 400 | 删除失败，包含详细错误信息 |
| 500 | 服务器内部错误 |

## 过滤器说明

### 常用过滤器
- **filters**：
  - `active`：活跃任务
  - `completed`：已完成任务
  - `archived`：已归档任务

- **due**：
  - `today`：今日到期
  - `week`：本周到期
  - `month`：本月到期

- **priority**：数值越小优先级越高
  - `1`：最高优先级
  - `2`：高优先级
  - `3`：中等优先级

- **tags**：标签名称数组

## 使用场景

### 预设视图
1. **今日任务**：`due=today`, `filters=["active"]`
2. **本周任务**：`due=week`, `filters=["active"]`
3. **高优先级**：`priority=1`, `filters=["active"]`
4. **重要任务**：`tags=["重要"]`
5. **已完成**：`filters=["completed"]`

### 自定义视图
- 组合多个筛选条件
- 快速访问常用任务集合
- 保存复杂的搜索条件

## 注意事项
1. **视图持久化**：视图保存用户的筛选偏好
2. **固定视图**：固定视图显示在列表顶部
3. **搜索条件**：可以保存复杂的搜索查询
4. **跨项目**：视图可以应用于所有项目
5. **数据隔离**：用户只能操作自己的视图
6. **实时更新**：修改视图后立即生效

## 相关端点
- **任务**：`/api/tasks/*` - 任务管理（视图筛选的基础）
- **搜索**：`/api/search/*` - 搜索功能（视图的底层实现）
- **标签**：`/api/tags/*` - 标签管理（视图筛选条件）
