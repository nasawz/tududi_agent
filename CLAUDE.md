# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains comprehensive API documentation for **Tududi**, a self-hosted task management application. Tududi supports project organization, task tracking, team collaboration, and Telegram Bot integration.

- **Project Name**: tududi_agent
- **Version**: 1.0.0
- **License**: MIT
- **Documentation Language**: Chinese (中文)
- **API Base URL**: `/api`
- **Source Repository**: https://github.com/chrisvel/tududi

## Documentation Structure

All API documentation is located in `/doc/api/` directory:

- **README.md** - Main API documentation index and overview
- **auth.md** - Authentication endpoints (login, logout, session management)
- **users.md** - User profile and settings management
- **admin.md** - Admin functions for user management
- **areas.md** - Project area/category management
- **projects.md** - Project CRUD, file uploads, sharing
- **tasks.md** - Task management with subtasks and recurrence
- **tags.md** - Tag management for cross-project categorization
- **notes.md** - Markdown-supported notes
- **views.md** - Custom views and filtering
- **inbox.md** - Quick collection and smart processing
- **search.md** - Full-text search and advanced filtering
- **task-events.md** - Operation history and analytics
- **shares.md** - Team collaboration and permission management
- **telegram.md** - Telegram Bot integration
- **url.md** - URL scraping and title extraction
- **quotes.md** - Random quote functionality

## API Architecture

### Authentication
- Session-based authentication using express-session
- All endpoints requiring authentication need valid session cookies
- Login: `POST /api/auth/login`
- Logout: `GET /api/auth/logout`
- Current user: `GET /api/auth/current_user`

### Data Model Hierarchy
```
User
  └── Areas (项目分类区域)
        └── Projects (项目)
              ├── Tasks (任务)
              │     └── Tags (标签) [多对多]
              └── Notes (笔记)
                    └── Tags (标签) [多对多]
```

### Permission System
- **ro (read-only)**: Can view resources
- **rw (read-write)**: Can modify and delete resources
- Own resources: User has all permissions
- Shared resources: Based on share settings
- Admin: Can access user management functions

### HTTP Conventions
- **200**: Success
- **201**: Created
- **204**: Deleted (no content)
- **400**: Bad request parameters
- **401**: Not authenticated
- **403**: No permission
- **404**: Resource not found
- **409**: Resource conflict (e.g., duplicate name)
- **500**: Internal server error

Error response format:
```json
{
  "error": "错误描述",
  "details": ["详细错误信息1", "详细错误信息2"]
}
```

### Common Query Parameters

**Pagination** (supported by list endpoints):
- `page` - Page number (starting from 1)
- `limit` - Items per page
- `offset` - Offset

**Sorting**:
- `orderBy` - e.g., `priority:asc`, `name:desc`
- Supported fields: `name`, `priority`, `due_date`, `created_at`

**Filtering**:
- `state` - Status filter
- `priority` - Priority filter
- `tag` - Tag filter
- `date` - Date range filter

## Key Features

### Task Management
- CRUD operations with priority and due dates
- Subtask hierarchy support
- Recurring tasks with interval and day-of-week options
- Task state management (active, completed, etc.)
- Task grouping by date (Today, Tomorrow, No Due Date)

### Project Management
- Project CRUD operations
- File uploads
- Project sharing with permission controls
- Hierarchical organization through Areas

### Telegram Integration
- Bot token configuration in user profile
- Start/stop polling for real-time updates
- Task summary notifications
- Quick inbox creation via Telegram
- User management for bot access

### Collaboration
- Project sharing between users
- Permission-based access control
- Team features through shared projects

### Additional Features
- Full-text search across tasks and notes
- Custom views with filtering
- Tag-based categorization (multi-project)
- URL metadata extraction
- Markdown-supported notes
- Inbox for quick capture
- Task event history and analytics
- Random quotes for motivation

## Usage Examples

### Authentication Flow
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include'
});

// Check current user
const user = await fetch('/api/auth/current_user', {
  credentials: 'include'
});
```

### Task Operations
```javascript
// Get today's tasks
const tasks = await fetch('/api/tasks?type=today', {
  credentials: 'include'
});

// Create a task
const newTask = await fetch('/api/task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Task',
    priority: 1,
    project_id: 5
  }),
  credentials: 'include'
});
```

### Project Operations
```javascript
// Get projects by area
const projects = await fetch('/api/projects?area_id=3', {
  credentials: 'include'
});
```

## Important Notes

- All API responses are in JSON format with UTF-8 encoding
- Session cookies are required for authenticated endpoints
- Documentation is currently in Chinese
- This repository contains only documentation; the actual source code is in a separate GitHub repository
- The application runs on Node.js (based on package.json)
- Rate limiting is not currently implemented

## External Resources

- **Project Homepage**: https://github.com/chrisvel/tududi
- **Issue Tracking**: https://github.com/chrisvel/tududi/issues
- **Documentation Issues**: Report via GitHub Issues

## Testing

The `/test/` directory exists but appears to be empty. The actual test implementation would be in the main source repository.

## Development Context

When working with this repository:
- Focus on API documentation accuracy and completeness
- Update documentation when API changes occur
- Ensure all endpoints are properly documented with examples
- Maintain consistency in Chinese terminology
- Include proper error handling examples
