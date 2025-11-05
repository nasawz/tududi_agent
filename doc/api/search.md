# 搜索API文档

## 概述
搜索API提供跨实体的全文搜索功能，支持搜索任务、项目、区域、笔记和标签，并提供多种筛选条件。

## 基础路径
```
/api/search
```

## 认证方式
- 需要有效的登录会话
- 只返回当前用户有权限访问的资源

## 接口列表

### 1. 通用搜索

#### 请求
```http
GET /api/search?q=关键词&filters=Task,Project,Note&priority=high&due=today&tags=重要,紧急
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 否 | 搜索关键词 |
| filters | string | 否 | 实体类型过滤器（逗号分隔） |
| priority | string | 否 | 优先级过滤（low/medium/high） |
| due | string | 否 | 到期日期过滤 |
| tags | string | 否 | 标签过滤（逗号分隔） |

#### 过滤参数说明

**filters 支持的类型**：
- `Task` - 任务
- `Project` - 项目
- `Area` - 区域
- `Note` - 笔记
- `Tag` - 标签

**priority 值**：
- `low` - 低优先级
- `medium` - 中优先级
- `high` - 高优先级

**due 值**：
- `today` - 今日到期
- `tomorrow` - 明日到期
- `next_week` - 下周到期
- `next_month` - 下月到期

#### 响应
**成功 (200)**
```json
{
  "results": [
    {
      "type": "Task",
      "id": 123,
      "uid": "task_abc123",
      "name": "完成项目报告",
      "description": "编写Q4项目总结报告",
      "due_date": "2024-01-15T00:00:00.000Z",
      "priority": 2,
      "project": {
        "id": 5,
        "uid": "proj_xyz789",
        "name": "项目A"
      },
      "tags": [
        {
          "name": "重要",
          "uid": "tag_important"
        }
      ]
    },
    {
      "type": "Note",
      "id": 456,
      "uid": "note_def456",
      "title": "项目需求文档",
      "content": "详细的项目需求说明",
      "tags": [
        {
          "name": "文档",
          "uid": "tag_doc"
        }
      ]
    },
    {
      "type": "Project",
      "id": 5,
      "uid": "proj_xyz789",
      "name": "项目A",
      "description": "项目A的描述"
    }
  ]
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| results | array | 搜索结果列表 |
| results[].type | string | 实体类型 |
| results[].id | number | 资源ID |
| results[].uid | string | 资源UID |
| results[].name/title | string | 资源名称或标题 |
| results[].description/content | string | 描述或内容（搜索匹配内容） |
| results[].due_date | string | 到期日期（仅任务） |
| results[].priority | number | 优先级（仅任务） |
| results[].project | object | 关联项目（仅任务和笔记） |
| results[].tags | array | 标签列表 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 401 | 未认证 |
| 500 | 服务器内部错误 |

## 搜索功能详解

### 全文搜索

#### 搜索范围
- **任务**：搜索名称和描述
- **项目**：搜索名称和描述
- **区域**：搜索名称和描述
- **笔记**：搜索标题和内容
- **标签**：搜索标签名称

#### 搜索方式
- **模糊匹配**：使用`LIKE`操作符进行模糊搜索
- **大小写不敏感**：搜索不区分大小写
- **部分匹配**：支持关键词部分匹配

### 过滤器

#### 1. 实体类型过滤
```http
GET /api/search?q=项目&filters=Task,Project
```
只搜索任务和项目

#### 2. 优先级过滤
```http
GET /api/search?q=任务&priority=high
```
只搜索高优先级任务

#### 3. 到期日期过滤
```http
GET /api/search?q=任务&due=today
```
只搜索今日到期的任务

**日期范围计算**：
- `today`：当前日期00:00:00 - 23:59:59
- `tomorrow`：明天00:00:00 - 23:59:59
- `next_week`：今天 + 7天
- `next_month`：今天 + 1个月

#### 4. 标签过滤
```http
GET /api/search?q=任务&tags=重要,紧急
```
只搜索包含指定标签的任务

**工作原理**：
1. 首先查找匹配的标签ID
2. 如果没有匹配的标签，返回空结果
3. 使用标签ID进行联表查询

### 组合过滤
可以组合使用多个过滤器：
```http
GET /api/search?q=项目&filters=Task&priority=high&due=today&tags=重要
```
搜索：
- 包含"项目"关键词
- 任务实体类型
- 高优先级
- 今日到期
- 包含"重要"标签

## 搜索结果排序

### 默认排序
- **任务**：按相关性和创建时间排序
- **项目**：按相关性排序
- **笔记**：按相关性排序
- **其他**：按相关性排序

### 搜索算法
- 关键词精确匹配优先
- 标题匹配优先于内容匹配
- 多个关键词同时匹配优先

## 性能优化

### 查询优化
1. **索引使用**：在常用搜索字段上建立索引
2. **分页支持**：大量结果支持分页（未来可能添加）
3. **联表优化**：最小化联表查询次数

### 标签查询优化
1. **预查询标签**：先查询标签ID，减少后续查询
2. **批量查询**：一次性查询多个标签
3. **空结果处理**：如果标签不存在，直接返回空结果

## 使用场景

### 1. 快速查找
```http
GET /api/search?q=客户反馈
```
快速找到与"客户反馈"相关的所有资源

### 2. 项目协作
```http
GET /api/search?q=API&filters=Note&tags=技术
```
团队成员查找技术相关的API文档

### 3. 日常任务管理
```http
GET /api/search?filters=Task&due=today
```
查看今天需要完成的所有任务

### 4. 高优先级任务
```http
GET /api/search?filters=Task&priority=high
```
查看所有高优先级任务

### 5. 跨项目搜索
```http
GET /api/search?q=数据库&filters=Task,Project,Note
```
在所有项目中搜索"数据库"相关内容

## 搜索技巧

### 关键词优化
1. **使用具体词汇**：避免过于宽泛的词汇
2. **组合关键词**：使用多个关键词提高精确度
3. **使用项目术语**：使用项目相关的专业词汇

### 过滤器组合
1. **精确过滤**：结合多个过滤器缩小范围
2. **逐层细化**：先大范围搜索，再逐步细化条件
3. **标签辅助**：使用标签快速分类和查找

## 高级搜索示例

### 示例1：查找本周到期的重要任务
```http
GET /api/search?q=&filters=Task&priority=high&due=next_week&tags=重要
```

### 示例2：查找项目相关文档
```http
GET /api/search?q=项目A&filters=Note&tags=文档
```

### 示例3：查找客户相关任务
```http
GET /api/search?q=客户&filters=Task&due=tomorrow
```

### 示例4：全库搜索
```http
GET /api/search?q=API&filters=Task,Project,Area,Note,Tag
```

## 注意事项
1. **权限过滤**：搜索结果自动过滤无权限访问的资源
2. **模糊匹配**：搜索使用模糊匹配，可能返回不完全匹配的结果
3. **标签依赖**：标签过滤器依赖预存标签，没有匹配的标签会返回空结果
4. **性能考虑**：复杂的多过滤器组合可能影响查询性能
5. **最大结果数**：默认返回所有匹配结果，未来可能添加分页支持

## 相关端点
- **任务**：`/api/tasks/*` - 任务管理
- **项目**：`/api/projects/*` - 项目管理
- **笔记**：`/api/notes/*` - 笔记管理
- **标签**：`/api/tags/*` - 标签管理
- **区域**：`/api/areas/*` - 区域管理

## 未来改进
- 添加分页支持
- 支持排序参数
- 支持搜索历史
- 添加搜索建议
- 支持高级搜索语法（如AND、OR、NOT）
