# 用户管理API文档

## 概述
用户管理API提供用户资料管理、密码修改、个人设置和任务摘要配置等功能。

## 基础路径
```
/api
```

## 认证方式
- 需要有效的登录会话
- 部分端点用于获取共享用户列表（仅返回基本信息）

## 接口列表

### 1. 获取所有用户列表

#### 请求
```http
GET /api/users
```

#### 响应
**成功 (200)**
```json
[
  {
    "id": 1,
    "email": "user1@example.com",
    "name": "张三",
    "surname": "李四",
    "role": "admin"
  },
  {
    "id": 2,
    "email": "user2@example.com",
    "name": "王五",
    "surname": null,
    "role": "user"
  }
]
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 用户ID |
| email | string | 邮箱地址 |
| name | string | 名字 |
| surname | string | 姓氏（可能为null） |
| role | string | 角色：admin 或 user |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 2. 获取当前用户资料

#### 请求
```http
GET /api/profile
```

#### 响应
**成功 (200)**
```json
{
  "uid": "abc123",
  "email": "user@example.com",
  "name": "张三",
  "surname": "李四",
  "appearance": "light",
  "language": "zh-CN",
  "timezone": "Asia/Shanghai",
  "first_day_of_week": 1,
  "avatar_image": null,
  "telegram_bot_token": null,
  "telegram_chat_id": null,
  "telegram_allowed_users": null,
  "task_summary_enabled": true,
  "task_summary_frequency": "daily",
  "task_intelligence_enabled": true,
  "auto_suggest_next_actions_enabled": true,
  "pomodoro_enabled": false,
  "today_settings": {
    "showMetrics": true,
    "showProductivity": true,
    "showNextTaskSuggestion": true,
    "showSuggestions": false,
    "showDueToday": true,
    "showCompleted": true,
    "showProgressBar": true,
    "showDailyQuote": true
  },
  "sidebar_settings": {
    "pinnedViewsOrder": ["today", "upcoming"]
  },
  "productivity_assistant_enabled": true,
  "next_task_suggestion_enabled": true
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| uid | string | 用户唯一标识符 |
| email | string | 邮箱地址 |
| name | string | 名字 |
| surname | string | 姓氏 |
| appearance | string | 界面外观（light, dark） |
| language | string | 语言设置（如：zh-CN, en-US） |
| timezone | string | 时区设置 |
| first_day_of_week | number | 一周第一天（0=周日, 1=周一, ..., 6=周六） |
| avatar_image | string | 头像图片URL |
| telegram_bot_token | string | Telegram机器人令牌 |
| telegram_chat_id | string | Telegram聊天ID |
| telegram_allowed_users | string | 允许使用Telegram的用户 |
| task_summary_enabled | boolean | 任务摘要是否启用 |
| task_summary_frequency | string | 任务摘要频率 |
| task_intelligence_enabled | boolean | 任务智能功能是否启用 |
| auto_suggest_next_actions_enabled | boolean | 自动建议后续行动是否启用 |
| pomodoro_enabled | boolean | 番茄钟是否启用 |
| today_settings | object | 今日页面显示设置 |
| sidebar_settings | object | 侧边栏设置 |
| productivity_assistant_enabled | boolean | 生产力助手是否启用 |
| next_task_suggestion_enabled | boolean | 下一任务建议是否启用 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 用户资料不存在 |
| 500 | 服务器内部错误 |

---

### 3. 更新用户资料

#### 请求
```http
PATCH /api/profile
```

#### 请求体
```json
{
  "name": "新名字",
  "surname": "新姓氏",
  "appearance": "dark",
  "language": "en-US",
  "timezone": "America/New_York",
  "first_day_of_week": 0,
  "task_intelligence_enabled": false,
  "pomodoro_enabled": true,
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 名字 |
| surname | string | 否 | 姓氏（设置为null可清除） |
| appearance | string | 否 | 界面外观（light, dark） |
| language | string | 否 | 语言设置 |
| timezone | string | 否 | 时区设置 |
| first_day_of_week | number | 否 | 一周第一天（0-6） |
| avatar_image | string | 否 | 头像图片URL |
| telegram_bot_token | string | 否 | Telegram机器人令牌 |
| telegram_allowed_users | string | 否 | 允许使用Telegram的用户 |
| task_intelligence_enabled | boolean | 否 | 任务智能功能开关 |
| task_summary_enabled | boolean | 否 | 任务摘要开关 |
| task_summary_frequency | string | 否 | 任务摘要频率 |
| auto_suggest_next_actions_enabled | boolean | 否 | 自动建议开关 |
| productivity_assistant_enabled | boolean | 否 | 生产力助手开关 |
| next_task_suggestion_enabled | boolean | 否 | 下一任务建议开关 |
| pomodoro_enabled | boolean | 否 | 番茄钟开关 |
| currentPassword | string | 否 | 当前密码（修改密码时必填） |
| newPassword | string | 否 | 新密码（修改密码时必填） |

#### 响应
**成功 (200)**
```json
{
  "uid": "abc123",
  "email": "user@example.com",
  "name": "新名字",
  "surname": "新姓氏",
  "appearance": "dark",
  "language": "en-US",
  "timezone": "America/New_York",
  "avatar_image": null,
  "telegram_bot_token": null,
  "telegram_chat_id": null,
  "telegram_allowed_users": null,
  "task_intelligence_enabled": false,
  "task_summary_enabled": true,
  "task_summary_frequency": "daily",
  "auto_suggest_next_actions_enabled": true,
  "productivity_assistant_enabled": true,
  "next_task_suggestion_enabled": true,
  "pomodoro_enabled": true
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 参数错误（first_day_of_week超出范围、密码长度不足、当前密码错误） |
| 400 | 验证失败，响应包含字段级错误 |
| 404 | 用户资料不存在 |
| 400 | 更新失败，包含详细错误信息 |

#### 错误示例
```json
{
  "field": "first_day_of_week",
  "error": "First day of week must be a number between 0 (Sunday) and 6 (Saturday)"
}
```

---

### 4. 修改密码

#### 请求
```http
POST /api/profile/change-password
```

#### 请求体
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| currentPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码（至少6个字符） |

#### 响应
**成功 (200)**
```json
{
  "message": "Password changed successfully"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 缺少参数或密码长度不足或当前密码错误 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

---

### 5. 切换任务摘要开关

#### 请求
```http
POST /api/profile/task-summary/toggle
```

#### 响应
**成功 (200)**
```json
{
  "success": true,
  "enabled": false,
  "message": "Task summary notifications have been disabled."
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 操作是否成功 |
| enabled | boolean | 切换后的状态 |
| message | string | 状态消息 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 用户不存在 |
| 400 | 更新失败，包含详细错误信息 |

---

### 6. 设置任务摘要频率

#### 请求
```http
POST /api/profile/task-summary/frequency
```

#### 请求体
```json
{
  "frequency": "daily"
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| frequency | string | 是 | 频率值 |

#### 支持的频率值
- `daily` - 每日
- `weekdays` - 工作日
- `weekly` - 每周
- `1h` - 每小时
- `2h` - 每2小时
- `4h` - 每4小时
- `8h` - 每8小时
- `12h` - 每12小时

#### 响应
**成功 (200)**
```json
{
  "success": true,
  "frequency": "daily",
  "message": "Task summary frequency has been set to daily."
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 缺少frequency或无效的frequency值 |
| 404 | 用户不存在 |
| 400 | 更新失败，包含详细错误信息 |

---

### 7. 立即发送任务摘要

#### 请求
```http
POST /api/profile/task-summary/send-now
```

#### 响应
**成功 (200)**
```json
{
  "success": true,
  "message": "Task summary was sent to your Telegram."
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 用户不存在 |
| 400 | Telegram未配置或发送失败 |
| 400 | 发送错误，包含详细信息 |

---

### 8. 获取任务摘要状态

#### 请求
```http
GET /api/profile/task-summary/status
```

#### 响应
**成功 (200)**
```json
{
  "success": true,
  "enabled": true,
  "frequency": "daily",
  "last_run": "2024-01-01T00:00:00.000Z",
  "next_run": "2024-01-02T00:00:00.000Z"
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 操作是否成功 |
| enabled | boolean | 是否启用 |
| frequency | string | 频率 |
| last_run | string | 上次运行时间 |
| next_run | string | 下次运行时间 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

---

### 9. 更新今日页面设置

#### 请求
```http
PUT /api/profile/today-settings
```

#### 请求体
```json
{
  "showMetrics": true,
  "showProductivity": false,
  "showNextTaskSuggestion": true,
  "showSuggestions": true,
  "showDueToday": true,
  "showCompleted": false,
  "showDailyQuote": true
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| showMetrics | boolean | 否 | 显示统计信息 |
| showProductivity | boolean | 否 | 显示生产力助手 |
| showNextTaskSuggestion | boolean | 否 | 显示下一任务建议 |
| showSuggestions | boolean | 否 | 显示建议 |
| showDueToday | boolean | 否 | 显示今日到期任务 |
| showCompleted | boolean | 否 | 显示已完成任务 |
| showProgressBar | boolean | 否 | **始终启用，忽略此参数** |
| showDailyQuote | boolean | 否 | 显示每日名言 |

#### 响应
**成功 (200)**
```json
{
  "success": true,
  "today_settings": {
    "showMetrics": true,
    "showProductivity": false,
    "showNextTaskSuggestion": true,
    "showSuggestions": true,
    "showDueToday": true,
    "showCompleted": false,
    "showProgressBar": true,
    "showDailyQuote": true
  }
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

---

### 10. 更新侧边栏设置

#### 请求
```http
PUT /api/profile/sidebar-settings
```

#### 请求体
```json
{
  "pinnedViewsOrder": ["today", "upcoming", "someday"]
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pinnedViewsOrder | array | 是 | 固定视图的显示顺序 |

#### 响应
**成功 (200)**
```json
{
  "success": true,
  "sidebar_settings": {
    "pinnedViewsOrder": ["today", "upcoming", "someday"]
  }
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 参数错误（pinnedViewsOrder必须是数组） |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

## 注意事项
1. **密码安全**：修改密码需要同时提供当前密码和新密码
2. **密码长度**：新密码至少需要6个字符
3. **任务摘要功能**：需要配置Telegram才能正常工作
4. **今日设置**：showProgressBar始终启用，无法禁用
5. **first_day_of_week**：范围为0-6（0=周日，1=周一，...，6=周六）
6. **会话认证**：所有端点都需要有效的登录会话
7. **Telegram集成**：部分功能依赖Telegram配置

## 相关端点
- **身份验证**：`/api/auth/*` - 登录、注销、会话管理
- **管理员API**：`/api/admin/*` - 用户管理（管理员专用）
