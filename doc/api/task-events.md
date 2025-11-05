# 任务事件API文档

## 概述
任务事件API提供任务操作历史、统计分析、完成时间分析、生产力指标等功能，用于跟踪任务的生命周期和用户的工作效率。

## 基础路径
```
/api
```

## 认证方式
- 需要有效的登录会话
- 需要任务访问权限（基于任务所有权或共享权限）

## 接口列表

### 1. 获取任务时间线

#### 请求
```http
GET /api/task/task_abc123/timeline
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | string | 是 | 任务UID |

#### 响应
**成功 (200)**
```json
[
  {
    "id": 1,
    "task_id": 123,
    "user_id": 1,
    "event_type": "created",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "metadata": {
      "name": "新任务",
      "priority": 1
    }
  },
  {
    "id": 2,
    "task_id": 123,
    "user_id": 1,
    "event_type": "status_changed",
    "timestamp": "2024-01-02T10:00:00.000Z",
    "metadata": {
      "old_status": "active",
      "new_status": "in_progress"
    }
  },
  {
    "id": 3,
    "task_id": 123,
    "user_id": 1,
    "event_type": "completed",
    "timestamp": "2024-01-03T10:00:00.000Z",
    "metadata": {}
  }
]
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 事件ID |
| task_id | number | 任务ID |
| user_id | number | 执行操作的用户ID |
| event_type | string | 事件类型（created, status_changed, priority_changed, completed等） |
| timestamp | string | 事件发生时间 |
| metadata | object | 事件元数据（根据事件类型不同而变化） |

#### 事件类型
- **created**：任务创建
- **status_changed**：状态变更
- **priority_changed**：优先级变更
- **completed**：任务完成
- **due_date_changed**：到期日期变更
- **project_changed**：项目变更
- **name_changed**：名称变更
- **description_changed**：描述变更

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 无效的UID格式 |
| 404 | 任务不存在或无访问权限 |
| 500 | 服务器内部错误 |

---

### 2. 获取任务完成时间分析

#### 请求
```http
GET /api/task/task_abc123/completion-time
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | string | 是 | 任务UID |

#### 响应
**成功 (200)**
```json
{
  "task_id": 123,
  "task_name": "完成项目报告",
  "duration_hours": 48.5,
  "duration_days": 2.02,
  "started_at": "2024-01-01T10:00:00.000Z",
  "completed_at": "2024-01-03T10:30:00.000Z",
  "created_at": "2024-01-01T10:00:00.000Z"
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| task_id | number | 任务ID |
| task_name | string | 任务名称 |
| duration_hours | number | 完成耗时（小时） |
| duration_days | number | 完成耗时（天） |
| started_at | string | 开始执行时间 |
| completed_at | string | 完成时间 |
| created_at | string | 创建时间 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 无效的UID格式 |
| 404 | 任务不存在、完成数据不存在或无访问权限 |
| 500 | 服务器内部错误 |

---

### 3. 获取用户生产力指标

#### 请求
```http
GET /api/user/productivity-metrics
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 否 | 开始日期（ISO 8601格式） |
| endDate | string | 否 | 结束日期（ISO 8601格式） |

#### 响应
**成功 (200)**
```json
{
  "total_tasks": 45,
  "completed_tasks": 38,
  "completion_rate": 84.4,
  "average_completion_hours": 24.5,
  "tasks_per_day": 3.8,
  "most_productive_day": "Tuesday",
  "peak_productivity_hour": 10
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| total_tasks | number | 期间内任务总数 |
| completed_tasks | number | 已完成任务数 |
| completion_rate | number | 完成率（百分比） |
| average_completion_hours | number | 平均完成时间（小时） |
| tasks_per_day | number | 每日平均任务数 |
| most_productive_day | string | 最高效的星期 |
| peak_productivity_hour | number | 最高效的时间段（小时） |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 4. 获取用户活动摘要

#### 请求
```http
GET /api/user/activity-summary?startDate=2024-01-01&endDate=2024-01-31
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 是 | 开始日期（ISO 8601格式） |
| endDate | string | 是 | 结束日期（ISO 8601格式） |

#### 响应
**成功 (200)**
```json
{
  "period": {
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-31T23:59:59.999Z"
  },
  "activity": {
    "tasks_created": 25,
    "tasks_completed": 20,
    "tasks_modified": 45,
    "status_changes": 30,
    "priority_changes": 15
  },
  "daily_breakdown": [
    {
      "date": "2024-01-01",
      "tasks_created": 2,
      "tasks_completed": 1,
      "tasks_modified": 3
    }
  ]
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| period.start_date | string | 期间开始日期 |
| period.end_date | string | 期间结束日期 |
| activity.tasks_created | number | 创建的任务数 |
| activity.tasks_completed | number | 完成的任务数 |
| activity.tasks_modified | number | 修改的任务数 |
| activity.status_changes | number | 状态变更次数 |
| activity.priority_changes | number | 优先级变更次数 |
| daily_breakdown | array | 每日活动明细 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 缺少必需参数（startDate或endDate） |
| 500 | 服务器内部错误 |

---

### 5. 获取任务完成分析

#### 请求
```http
GET /api/tasks/completion-analytics
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回数量限制（默认50） |
| offset | number | 否 | 偏移量（默认0） |
| projectUid | string | 否 | 项目UID（筛选特定项目） |

#### 响应
**成功 (200)**
```json
{
  "tasks": [
    {
      "task_id": 123,
      "task_name": "任务A",
      "project_name": "项目X",
      "duration_hours": 24.5,
      "duration_days": 1.02,
      "started_at": "2024-01-01T10:00:00.000Z",
      "completed_at": "2024-01-02T10:30:00.000Z"
    },
    {
      "task_id": 124,
      "task_name": "任务B",
      "project_name": "项目Y",
      "duration_hours": 48.0,
      "duration_days": 2.0,
      "started_at": "2024-01-02T10:00:00.000Z",
      "completed_at": "2024-01-04T10:00:00.000Z"
    }
  ],
  "summary": {
    "total_tasks": 2,
    "average_completion_hours": 36.25,
    "median_completion_hours": 36.25,
    "fastest_completion": 24.5,
    "slowest_completion": 48.0
  }
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| tasks | array | 任务完成分析列表 |
| tasks.task_id | number | 任务ID |
| tasks.task_name | string | 任务名称 |
| tasks.project_name | string | 项目名称 |
| tasks.duration_hours | number | 完成耗时（小时） |
| tasks.duration_days | number | 完成耗时（天） |
| tasks.started_at | string | 开始时间 |
| tasks.completed_at | string | 完成时间 |
| summary.total_tasks | number | 分析的任务总数 |
| summary.average_completion_hours | number | 平均完成时间（小时） |
| summary.median_completion_hours | number | 中位数完成时间（小时） |
| summary.fastest_completion | number | 最快完成时间（小时） |
| summary.slowest_completion | number | 最慢完成时间（小时） |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 无效的projectUid |
| 404 | 项目不存在或无访问权限 |
| 500 | 服务器内部错误 |

## 使用场景

### 任务追踪
- 查看任务完整生命周期
- 了解任务修改历史
- 跟踪任务状态变更

### 效率分析
- 分析任务完成时间
- 识别效率瓶颈
- 优化工作流程

### 生产力监控
- 跟踪每日/每周生产力
- 生成工作报告
- 识别高效时间段

### 项目管理
- 分析项目任务完成情况
- 评估项目进度
- 预测项目完成时间

## 数据来源

任务事件数据来自`taskEventService`，该服务会自动记录任务的：
- 创建事件
- 状态变更
- 优先级变更
- 截止日期变更
- 项目变更
- 完成事件

## 注意事项
1. **权限检查**：所有端点都会进行权限验证
2. **数据完整性**：只返回有完成数据的任务分析
3. **时间范围**：activity-summary需要明确的开始和结束日期
4. **性能考虑**：completion-analytics支持分页以处理大量数据
5. **统计分析**：summary字段提供有用的统计数据

## 相关端点
- **任务**：`/api/tasks/*` - 任务管理（事件来源）
- **项目**：`/api/projects/*` - 项目管理（项目筛选）
- **用户**：`/api/users/*` - 用户管理
