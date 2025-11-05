# 名言API文档

## 概述
名言API提供获取随机名言和所有名言的功能，用于显示每日励志内容。

## 基础路径
```
/api
```

## 认证方式
- 无需认证，所有人均可访问

## 接口列表

### 1. 获取随机名言

#### 请求
```http
GET /api/quotes/random
```

#### 响应
**成功 (200)**
```json
{
  "quote": "The only way to do great work is to love what you do. - Steve Jobs"
}
```

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

---

### 2. 获取所有名言

#### 请求
```http
GET /api/quotes
```

#### 响应
**成功 (200)**
```json
{
  "quotes": [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
  ],
  "count": 3
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| quotes | array | 名言数组 |
| count | number | 名言总数 |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 500 | 服务器内部错误 |

## 用途

### 使用场景
- 在应用首页显示每日名言
- 为用户提供励志内容
- 增强用户体验和参与度

### 前端集成
- 可以定时获取新的随机名言
- 可以根据用户偏好筛选名言
- 支持多语言显示（如果配置了多语言）

## 注意事项
1. **无认证**：所有端点都可以匿名访问
2. **静态数据**：名言数据来自静态服务，可能预设在`quotesService`中
3. **国际化**：根据系统语言设置返回对应语言的名言
4. **性能**：两个端点都非常轻量，快速响应
