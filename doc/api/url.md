# URL管理API文档

## 概述
URL管理API提供从网页URL中提取元数据的功能，包括标题、描述、图片等信息。支持自动处理重定向和特殊URL（如YouTube）。

## 基础路径
```
/api/url
```

## 认证方式
- 需要有效的登录会话

## 接口列表

### 1. 获取URL标题

#### 请求
```http
GET /api/url/title?url=https://example.com/article
```

#### 查询参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 要获取的URL |

#### 响应
**成功 (200)**
```json
{
  "title": "网页标题",
  "url": "https://example.com/article",
  "canonical_url": "https://example.com/article"
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 网页标题 |
| url | string | 原始URL |
| canonical_url | string | 规范化URL（重定向后） |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | URL格式错误或无法访问 |
| 500 | 获取标题失败 |

---

### 2. 从文本中提取URL元数据

#### 请求
```http
POST /api/url/extract-from-text
```

#### 请求体
```json
{
  "text": "今天发现一个很有趣的文章 https://example.com/article 还有这个视频 https://youtu.be/dQw4w9WgXcQ"
}
```

#### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 是 | 包含URL的文本 |

#### 响应
**成功 (200)**
```json
{
  "urls": [
    {
      "original_url": "https://example.com/article",
      "title": "网页标题",
      "description": "网页描述",
      "image": "https://example.com/image.jpg"
    },
    {
      "original_url": "https://youtu.be/dQw4w9WgXcQ",
      "title": "YouTube Video",
      "description": "YouTube video",
      "image": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
    }
  ]
}
```

#### 响应字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| urls | array | 提取的URL元数据列表 |
| urls[].original_url | string | 原始URL |
| urls[].title | string | 提取的标题 |
| urls[].description | string | 提取的描述 |
| urls[].image | string | 提取的图片URL |

#### 错误响应
| 状态码 | 说明 |
|--------|------|
| 400 | 文本为空或包含无效URL |
| 500 | 提取失败 |

## 元数据提取规则

### 标题提取优先级
1. **Open Graph 标题**：`<meta property="og:title">`
2. **Twitter Card 标题**：`<meta name="twitter:title">`
3. **HTML 标题**：`<title>`

### 描述提取优先级
1. **Open Graph 描述**：`<meta property="og:description">`
2. **Twitter Card 描述**：`<meta name="twitter:description">`
3. **Meta 描述**：`<meta name="description">`

### 图片提取优先级
1. **Open Graph 图片**：`<meta property="og:image">`
2. **Twitter Card 图片**：`<meta name="twitter:image">`

## 特殊URL处理

### YouTube URLs
自动识别和处理YouTube链接：
- **格式**：`https://www.youtube.com/watch?v=VIDEO_ID`
- **格式**：`https://youtu.be/VIDEO_ID`

#### YouTube 特殊处理
```json
{
  "title": "YouTube Video",
  "image": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "description": "YouTube video"
}
```

### URL规范化
- 自动添加协议（http/https）
- 处理重定向获取最终URL
- 保留查询参数

## 使用场景

### 1. 链接预览
从URL生成预览信息：
```javascript
// 前端示例
const preview = await fetch('/api/url/title?url=' + encodeURIComponent(url));
const data = await preview.json();
displayPreview(data.title, data.description);
```

### 2. 批量提取
从文本中批量提取多个URL的元数据：
```javascript
// 从邮件或笔记中提取链接
const text = "邮件内容，包含多个链接...";
const response = await fetch('/api/url/extract-from-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text })
});
const { urls } = await response.json();
```

### 3. 创建带预览的任务
```http
POST /api/task
{
  "name": "阅读文章",
  "description": "https://example.com/article",
  "project_id": 5
}
```

## 技术实现

### HTML解析
使用正则表达式从HTML中提取元数据：
- 快速处理，无需额外依赖
- 支持多种meta标签格式
- 自动处理HTML实体编码

### HTTP客户端
- 使用Node.js内置http/https模块
- 自动处理重定向（最多5次）
- 支持SSL/TLS连接

### 错误处理
- 网络错误自动重试
- 超时处理
- 无效响应过滤

## 性能优化

### 缓存机制
- 相同URL的元数据会被缓存
- 减少重复请求
- 提高响应速度

### 并发控制
- 同时处理多个URL
- 合理控制并发数
- 避免过载目标服务器

### 快速解析
- 使用正则表达式而非DOM解析
- 只提取需要的元数据
- 不下载完整页面

## 限制和注意事项

### 请求限制
- 单次请求最多处理1个URL
- 支持的协议：http、https
- URL长度限制：2048字符

### 响应限制
- 标题最大长度：100字符（超出截断）
- 描述最大长度：150字符（超出截断）
- 超长内容自动添加省略号

### 反爬虫
- 部分网站可能有反爬虫机制
- 可能返回403或404错误
- 部分内容需要JavaScript渲染的网站无法提取

### 网络要求
- 需要能访问目标URL
- 某些地区可能需要代理
- 内部网络可能无法访问外网

## 错误处理

### 常见错误
1. **URL格式错误**：
   ```json
   {
     "error": "Invalid URL format"
   }
   ```

2. **网络超时**：
   ```json
   {
     "error": "Request timeout"
   }
   ```

3. **服务器错误**：
   ```json
   {
     "error": "Failed to fetch URL metadata"
   }
   ```

4. **重定向过多**：
   ```json
   {
     "error": "Too many redirects"
   }
   ```

## 安全考虑

### SSRF防护
- 限制访问内网IP
- 防止访问内部服务
- 白名单机制（未来可能添加）

### 内容验证
- 验证响应内容类型
- 过滤恶意内容
- 处理编码问题

## 相关端点
- **任务**：`/api/tasks/*` - 创建带链接的任务
- **笔记**：`/api/notes/*` - 在笔记中保存链接
- **收件箱**：`/api/inbox/*` - 从文本中提取链接

## 实际应用示例

### 创建链接预览卡片
```html
<div class="link-card">
  <img src="{{image}}" alt="预览图" />
  <h3>{{title}}</h3>
  <p>{{description}}</p>
  <a href="{{url}}" target="_blank">阅读原文</a>
</div>
```

### 批量提取邮件中的链接
```javascript
const emailText = `
  大家好，

  请查看这些资源：
  - 技术文档：https://example.com/doc
  - 视频教程：https://youtu.be/abc123
  - 项目主页：https://github.com/user/repo

  谢谢！
`;

const { urls } = await extractUrlsFromText(emailText);
urls.forEach(url => {
  console.log(`标题：${url.title}`);
  console.log(`链接：${url.original_url}`);
});
```

## 注意事项
1. **版权问题**：提取的元数据应遵守原网站版权声明
2. **频率限制**：避免频繁请求同一网站
3. **缓存使用**：合理使用缓存减少服务器负载
4. **错误重试**：对临时错误实施重试机制
5. **用户代理**：设置适当的User-Agent头
