import { Agent } from "@mastra/core/agent";
import { Memory } from '@mastra/memory';
import { storage } from "../storage";

// ========== 笔记相关工具 ==========
import { listNotesTool } from "../tools/note/list-notes-tool";
import { searchNotesTool } from "../tools/note/search-notes-tool";
import { createNoteTool } from "../tools/note/create-note-tool";
import { getNoteTool } from "../tools/note/get-note-tool";
import { updateNoteTool } from "../tools/note/update-note-tool";
import { deleteNoteTool } from "../tools/note/delete-note-tool";

// ========== 收件箱相关工具 ==========
import { listInboxItemsTool } from "../tools/inbox/list-inbox-items-tool";
import { createInboxItemTool } from "../tools/inbox/create-inbox-item-tool";
import { getInboxItemTool } from "../tools/inbox/get-inbox-item-tool";
import { updateInboxItemTool } from "../tools/inbox/update-inbox-item-tool";
import { deleteInboxItemTool } from "../tools/inbox/delete-inbox-item-tool";
import { processInboxItemTool } from "../tools/inbox/process-inbox-item-tool";
import { analyzeTextTool } from "../tools/inbox/analyze-text-tool";
import { analyzeInboxTextTool } from "../tools/inbox/analyze-inbox-text-tool";

// ========== 区域相关工具 ==========
import { listAreasTool } from "../tools/area/list-areas-tool";
import { createAreaTool } from "../tools/area/create-area-tool";
import { getAreaTool } from "../tools/area/get-area-tool";
import { updateAreaTool } from "../tools/area/update-area-tool";
import { deleteAreaTool } from "../tools/area/delete-area-tool";

// ========== 项目相关工具 ==========
import { listProjectsTool } from "../tools/project/list-projects-tool";
import { createProjectTool } from "../tools/project/create-project-tool";
import { getProjectTool } from "../tools/project/get-project-tool";
import { updateProjectTool } from "../tools/project/update-project-tool";
import { deleteProjectTool } from "../tools/project/delete-project-tool";

// ========== 任务相关工具 ==========
import { listTasksTool } from "../tools/task/list-tasks-tool";
import { createTaskTool } from "../tools/task/create-task-tool";
import { getTaskTool } from "../tools/task/get-task-tool";
import { getTaskSubtasksTool } from "../tools/task/get-task-subtasks-tool";
import { updateTaskTool } from "../tools/task/update-task-tool";
import { deleteTaskTool } from "../tools/task/delete-task-tool";
import { toggleTaskCompletionTool } from "../tools/task/toggle-task-completion-tool";
import { toggleTaskTodayTool } from "../tools/task/toggle-task-today-tool";
import { generateRecurringTasksTool } from "../tools/task/generate-recurring-tasks-tool";
import { getTaskNextIterationsTool } from "../tools/task/get-task-next-iterations-tool";

// ========== 标签相关工具 ==========
import { listTagsTool } from "../tools/tag/list-tags-tool";
import { createTagTool } from "../tools/tag/create-tag-tool";
import { getTagTool } from "../tools/tag/get-tag-tool";
import { updateTagTool } from "../tools/tag/update-tag-tool";
import { deleteTagTool } from "../tools/tag/delete-tag-tool";

// ========== 搜索相关工具 ==========
import { searchTool } from "../tools/search/search-tool";

// ========== 向量相关工具 ==========
import { addVectorDataTool } from "../tools/vector/add-vector-data-tool";
import { searchVectorDataTool } from "../tools/vector/search-vector-data-tool";
import { createVectorIndexTool } from "../tools/vector/create-vector-index-tool";
import { deleteVectorDataTool } from "../tools/vector/delete-vector-data-tool";

// ========== 工作流 ==========
import { processInboxItemWorkflow } from "../workflows/process-inbox-item-workflow";

export const ultraPureAgent = new Agent({
    name: "Ultra Pure Agent",
    instructions: `
你是 Ultra Pure Agent，Tududi 系统的智能助手。

## 核心能力
直接使用44个工具完成所有操作，无需委派到其他agent。独立处理任务、笔记、项目、收件箱等所有功能。

## 可用工具（44个）

### 笔记工具（6个）
- listNotesTool(): 获取笔记列表
- searchNotesTool({ query }): 搜索笔记内容
- createNoteTool({ name, content, project_id? }): 创建笔记
- getNoteTool({ id }): 获取笔记详情
- updateNoteTool({ id, data }): 更新笔记
- deleteNoteTool({ id }): 删除笔记

### 收件箱工具（8个）
- listInboxItemsTool(): 获取收件箱列表
- createInboxItemTool({ content }): 创建收件箱项目
- getInboxItemTool({ id }): 获取收件箱项目详情
- updateInboxItemTool({ id, data }): 更新收件箱项目
- deleteInboxItemTool({ id }): 删除收件箱项目
- processInboxItemTool({ id }): 处理收件箱项目（智能分析并创建任务/笔记）
- analyzeTextTool({ text }): 分析文本内容
- analyzeInboxTextTool({ text }): 分析收件箱文本

### 区域工具（5个）
- listAreasTool(): 获取区域列表
- createAreaTool({ name }): 创建区域
- getAreaTool({ id }): 获取区域详情
- updateAreaTool({ id, data }): 更新区域
- deleteAreaTool({ id }): 删除区域

### 项目工具（5个）
- listProjectsTool({ area_id?, state?, pinned? }): 获取项目列表
- createProjectTool({ name, area_id, description? }): 创建项目
- getProjectTool({ id }): 获取项目详情
- updateProjectTool({ id, data }): 更新项目
- deleteProjectTool({ id }): 删除项目

### 任务工具（10个）
- listTasksTool({ type?, project_id?, state?, tag? }): 获取任务列表
- createTaskTool({ name, project_id, priority?, due_date? }): 创建任务
- getTaskTool({ id }): 获取任务详情
- getTaskSubtasksTool({ id }): 获取子任务列表
- updateTaskTool({ id, data }): 更新任务
- deleteTaskTool({ id }): 删除任务
- toggleTaskCompletionTool({ id }): 切换完成状态
- toggleTaskTodayTool({ id }): 切换是否今日任务
- generateRecurringTasksTool({ task_id }): 生成重复任务实例
- getTaskNextIterationsTool({ task_id, count? }): 获取任务下几次迭代

### 标签工具（5个）
- listTagsTool(): 获取标签列表
- createTagTool({ name, color? }): 创建标签
- getTagTool({ id }): 获取标签详情
- updateTagTool({ id, data }): 更新标签
- deleteTagTool({ id }): 删除标签

### 搜索工具（1个）
- searchTool({ query, type? }): 全文搜索（跨所有实体）

### 向量工具（4个）
- addVectorDataTool({ data, metadata? }): 添加向量数据
- searchVectorDataTool({ query, limit? }): 语义搜索向量数据
- createVectorIndexTool({ data }): 创建向量索引
- deleteVectorDataTool({ id }): 删除向量数据

### 工作流（1个）
- processInboxItemWorkflow: 处理收件箱项目工作流

## 工作模式
- **简单任务**：直接调用单个工具（查询、创建、更新、删除）
- **复杂任务**：组合多个工具完成（批量操作、数据分析、关联查询）
- **智能处理**：使用工作流自动化（收件箱分析、智能分类）

## 操作指南
- 查询 → 使用 list/get 工具
- 创建 → 使用 create 工具
- 更新 → 使用 update 工具
- 删除 → 使用 delete 工具
- 搜索 → 使用 search/searchVector 工具
- 收件箱处理 → 使用 processInboxItemWorkflow

## 响应格式
提供状态报告时使用结构化格式：
1. 数据概览
2. 分类统计
3. 关键指标
4. 分析洞察
5. 行动建议

当前日期：${new Date().toLocaleDateString()}
    `,
    model: 'zhipuai-coding-plan/glm-4.6',
    tools: {
        // 笔记工具
        listNotesTool,
        searchNotesTool,
        createNoteTool,
        getNoteTool,
        updateNoteTool,
        deleteNoteTool,

        // 收件箱工具
        listInboxItemsTool,
        createInboxItemTool,
        getInboxItemTool,
        updateInboxItemTool,
        deleteInboxItemTool,
        processInboxItemTool,
        analyzeTextTool,
        analyzeInboxTextTool,

        // 区域工具
        listAreasTool,
        createAreaTool,
        getAreaTool,
        updateAreaTool,
        deleteAreaTool,

        // 项目工具
        listProjectsTool,
        createProjectTool,
        getProjectTool,
        updateProjectTool,
        deleteProjectTool,

        // 任务工具
        listTasksTool,
        createTaskTool,
        getTaskTool,
        getTaskSubtasksTool,
        updateTaskTool,
        deleteTaskTool,
        toggleTaskCompletionTool,
        toggleTaskTodayTool,
        generateRecurringTasksTool,
        getTaskNextIterationsTool,

        // 标签工具
        listTagsTool,
        createTagTool,
        getTagTool,
        updateTagTool,
        deleteTagTool,

        // 搜索工具
        searchTool,

        // 向量工具
        addVectorDataTool,
        searchVectorDataTool,
        createVectorIndexTool,
        deleteVectorDataTool,
    },
    workflows: {
        processInboxItemWorkflow,
    },
    memory: new Memory({
        storage: storage,
    }),
});
