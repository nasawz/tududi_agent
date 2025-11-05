# 项目管理API文档

## 概述
项目管理API提供项目的完整CRUD操作，包括项目创建、更新、删除、状态管理、文件上传和项目共享功能。

## 基础路径
```
/api
```

## 认证方式
- 需要有效的登录会话
- 大部分操作需要项目访问权限（通过hasAccess中间件）
- 权限包括：ro（只读）和rw（读写）

## 数据模型

### Project（项目）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 项目ID |
| uid | string | 项目唯一标识符 |
| name | string | 项目名称 |
| description | string | 项目描述 |
| state | string | 项目状态 |
| area_id | number | 所属区域ID |
| pin_to_sidebar | boolean | 是否固定到侧边栏 |
| due_date_at | date | 项目到期日期 |
| image_url | string | 项目图片URL |
| user_uid | string | 项目所有者UID |

## 项目状态
- **planned**：计划中
- **in_progress**：进行中
- **blocked**：被阻塞
- **idea**：构思阶段
- **completed**：已完成

## 接口列表

### 1. 上传项目图片

#### 请求
```http
POST /api/upload/project-image
Content-Type: multipart/form-data
```

#### 请求体（form-data）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | file | 是 | 图片文件 |

#### 文件限制
- **格式**：支持 jpeg, jpg, png, gif, webp
- **大小**：最大 5MB

#### 响应
**成功 (200)**
```json
{
  "imageUrl": "/api/uploads/projects/project-1642245000000-1234567890.png"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 未提供图片文件或文件格式不正确 |
| 500 | 上传失败或服务器错误 |

---

### 2. 获取项目列表

#### 请求
```http
GET /api/projects
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| state | string/array | 否 | 项目状态（可传递单个或多个） |
| active | boolean | 否 | 活跃状态（true=计划中/进行中/被阻塞，false=构思/已完成） |
| pin_to_sidebar | boolean | 否 | 是否固定到侧边栏 |
| area_id | number | 否 | 区域ID（数字格式） |
| area | string | 否 | 区域标识符（uid-slug格式） |
| grouped | boolean | 否 | 是否按区域分组返回 |

#### 状态过滤器
- **state 参数示例**：
  - 单个状态：`?state=in_progress`
  - 多个状态：`?state=planned,in_progress`
  - 全部：`?state=all`（或省略）

- **active 参数示例**：
  - `?active=true`：显示 planned, in_progress, blocked
  - `?active=false`：显示 idea, completed

#### 响应
**未分组 (200)**
```json
[
  {
    "id": 1,
    "uid": "proj_abc123",
    "name": "项目A",
    "description": "项目描述",
    "state": "in_progress",
    "area_id": 5,
    "pin_to_sidebar": true,
    "due_date_at": "2024-06-30T00:00:00.000Z",
    "image_url": "/api/uploads/projects/image.png",
    "user_uid": "user_xyz789",
    "tags": [
      {
        "id": 1,
        "name": "重要",
        "uid": "tag_123"
      }
    ],
    "Area": {
      "id": 5,
      "uid": "area_456",
      "name": "工作"
    },
    "task_status": {
      "total": 10,
      "done": 3,
      "in_progress": 5,
      "not_started": 2
    },
    "completion_percentage": 30,
    "share_count": 2,
    "is_shared": true
  }
]
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 项目ID |
| uid | string | 项目UID |
| name | string | 项目名称 |
| description | string | 项目描述 |
| state | string | 项目状态 |
| area_id | number | 区域ID |
| pin_to_sidebar | boolean | 是否固定到侧边栏 |
| due_date_at | date | 到期日期 |
| image_url | string | 项目图片URL |
| user_uid | string | 所有者UID |
| tags | array | 项目标签列表 |
| Area | object | 所属区域信息 |
| task_status.total | number | 任务总数 |
| task_status.done | number | 已完成任务数 |
| task_status.in_progress | number | 进行中任务数 |
| task_status.not_started | number | 未开始任务数 |
| completion_percentage | number | 完成百分比 |
| share_count | number | 共享用户数 |
| is_shared | boolean | 是否已共享 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 3. 获取项目详情

#### 请求
```http
GET /api/project/proj_abc123-my-project-name
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uidSlug | string | 是 | 项目UID或UID-名称格式的slug |

#### 响应
**成功 (200)**
```json
{
  "id": 1,
  "uid": "proj_abc123",
  "name": "项目A",
  "description": "详细的项目描述",
  "state": "in_progress",
  "area_id": 5,
  "pin_to_sidebar": true,
  "due_date_at": "2024-06-30T00:00:00.000Z",
  "image_url": "/api/uploads/projects/image.png",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-15T00:00:00.000Z",
  "tags": [
    {
      "id": 1,
      "name": "重要",
      "uid": "tag_123"
    }
  ],
  "Area": {
    "id": 5,
    "uid": "area_456",
    "name": "工作"
  }
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 项目不存在 |
| 403 | 无访问权限 |
| 500 | 服务器内部错误 |

---

### 4. 创建项目

#### 请求
```http
POST /api/project
```

#### 请求体
```json
{
  "name": "新项目",
  "description": "项目描述",
  "state": "planned",
  "area_id": 5,
  "pin_to_sidebar": true,
  "due_date_at": "2024-06-30T00:00:00.000Z",
  "image_url": "/api/uploads/projects/image.png",
  "tags": [
    { "name": "重要" },
    { "name": "前端" }
  ]
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 项目名称 |
| description | string | 否 | 项目描述 |
| state | string | 否 | 项目状态（默认planned） |
| area_id | number | 否 | 所属区域ID |
| pin_to_sidebar | boolean | 否 | 是否固定到侧边栏（默认false） |
| due_date_at | date | 否 | 项目到期日期 |
| image_url | string | 否 | 项目图片URL |
| tags | array | 否 | 项目标签数组 |

#### 标签格式
```json
"tags": [
  { "name": "标签名" }
]
```

#### 响应
**成功 (201)**
```json
{
  "id": 2,
  "uid": "proj_new123",
  "name": "新项目",
  "description": "项目描述",
  "state": "planned",
  "area_id": 5,
  "pin_to_sidebar": true,
  "due_date_at": "2024-06-30T00:00:00.000Z",
  "image_url": "/api/uploads/projects/image.png",
  "created_at": "2024-01-15T00:00:00.000Z",
  "tags": [
    {
      "id": 2,
      "name": "重要",
      "uid": "tag_new1"
    },
    {
      "id": 3,
      "name": "前端",
      "uid": "tag_new2"
    }
  ]
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 参数错误或验证失败（无效的标签名） |
| 500 | 服务器内部错误 |

---

### 5. 更新项目

#### 请求
```http
PATCH /api/project/proj_abc123
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | string | 是 | 项目UID |

#### 请求体
```json
{
  "name": "更新后的项目名称",
  "description": "更新后的描述",
  "state": "in_progress",
  "area_id": 6,
  "pin_to_sidebar": false,
  "due_date_at": "2024-07-31T00:00:00.000Z",
  "image_url": "/api/uploads/projects/new-image.png",
  "tags": [
    { "name": "更新标签" }
  ]
}
```

#### 参数说明
所有参数均为可选，只更新提供的字段。

#### 标签更新
- 提供新标签数组将完全替换现有标签
- 会自动创建不存在的标签
- 会验证标签名称的有效性

#### 响应
**成功 (200)**
```json
{
  "id": 1,
  "uid": "proj_abc123",
  "name": "更新后的项目名称",
  "description": "更新后的描述",
  "state": "in_progress",
  "area_id": 6,
  "pin_to_sidebar": false,
  "due_date_at": "2024-07-31T00:00:00.000Z",
  "image_url": "/api/uploads/projects/new-image.png",
  "updated_at": "2024-01-16T00:00:00.000Z",
  "tags": [
    {
      "id": 4,
      "name": "更新标签",
      "uid": "tag_updated1"
    }
  ]
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 项目不存在 |
| 403 | 无修改权限 |
| 400 | 参数错误或验证失败 |
| 500 | 服务器内部错误 |

#### 错误示例（标签验证失败）
```json
{
  "error": "Invalid tag names: \"\" (empty tag name not allowed)"
}
```

---

### 6. 删除项目

#### 请求
```http
DELETE /api/project/proj_abc123
```

#### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | string | 是 | 项目UID |

#### 响应
**成功 (204)**
```
No Content
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 404 | 项目不存在 |
| 403 | 无删除权限 |
| 500 | 服务器内部错误 |

## 权限系统

### 访问级别
- **ro（只读）**：可以查看项目详情和相关信息
- **rw（读写）**：可以修改和删除项目

### 权限检查
- 通过`hasAccess`中间件自动检查
- 基于项目所有权和共享权限
- 只有项目所有者或有读写权限的用户可以修改/删除

### 共享功能
- 项目可以共享给其他用户
- 共享用户数通过`share_count`字段显示
- 是否已共享通过`is_shared`字段标识

## 文件上传说明

### 图片上传流程
1. 使用`POST /api/upload/project-image`上传图片
2. 服务器返回图片的访问URL
3. 在创建或更新项目时使用返回的URL作为`image_url`

### 上传限制
- **文件大小**：最大 5MB
- **支持格式**：JPEG, JPG, PNG, GIF, WEBP
- **存储位置**：`/api/uploads/projects/`目录

### 图片访问
- 上传后的图片可通过以下URL访问：
  - 开发环境：`http://localhost:8080/api/uploads/projects/文件名`
  - 生产环境：`https://your-domain.com/api/uploads/projects/文件名`

## 区域和标签

### 区域关联
- 项目可以关联到特定区域（Area）
- 支持通过`area_id`（数字）或`area`（uid-slug格式）过滤
- 关联的区域信息会在响应中包含

### 标签系统
- 项目可以有多个标签
- 标签名称会进行验证（不能为空、重复等）
- 不存在的标签会自动创建
- 标签会全局存储，相同名称的标签会复用

## 任务统计

### 任务状态统计
每个项目包含其关联任务的统计信息：
- **total**：任务总数
- **done**：已完成任务数（status=2）
- **in_progress**：进行中任务数（status=1）
- **not_started**：未开始任务数（status=0）

### 完成百分比
根据任务状态自动计算：`Math.round(done / total * 100)`

## 注意事项
1. **UID格式**：项目UID通常以`proj_`开头
2. **Slug支持**：可通过`uid`或`uid-name`格式访问项目
3. **时区处理**：所有日期时间均以UTC格式存储和返回
4. **并发控制**：文件上传使用multer中间件处理
5. **权限验证**：所有修改操作都需要相应权限
6. **标签验证**：无效标签会导致请求失败
7. **区域关联**：删除区域前需要先移除或移动项目

## 相关端点
- **区域**：`/api/areas/*` - 区域管理
- **标签**：`/api/tags/*` - 标签管理
- **任务**：`/api/tasks/*` - 任务管理
- **共享**：`/api/shares/*` - 项目共享管理
- **笔记**：`/api/notes/*` - 项目笔记管理
