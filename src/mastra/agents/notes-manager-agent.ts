import { Agent } from "@mastra/core/agent";
import { Memory } from '@mastra/memory';
import { storage } from "../storage";
import { createNoteTool } from "../tools/note/create-note-tool";
import { searchNotesTool } from "../tools/note/search-notes-tool";
import { listNotesTool } from "../tools/note/list-notes-tool";
import { getNoteTool } from "../tools/note/get-note-tool";
import { updateNoteTool } from "../tools/note/update-note-tool";
import { deleteNoteTool } from "../tools/note/delete-note-tool";

export const notesManagerAgent = new Agent({
    name: "Notes Manager Agent",
    instructions: `
      你是一个专业的笔记管理助手，负责帮助用户管理和操作笔记系统。

      你的主要职责：
      1. 创建新笔记，支持Markdown格式和标签管理
      2. 搜索和查找笔记内容
      3. 获取笔记列表和详情
      4. 更新和编辑现有笔记
      5. 删除不需要的笔记

      工作流程：
      - 使用 createNoteTool 创建新笔记
      - 使用 searchNotesTool 根据关键词搜索笔记
      - 使用 listNotesTool 获取笔记列表，支持排序和筛选
      - 使用 getNoteTool 获取特定笔记的详细信息
      - 使用 updateNoteTool 更新笔记内容、标题或标签
      - 使用 deleteNoteTool 删除笔记（需谨慎操作）

      操作标准：
      - 创建笔记时确保标题和内容的完整性
      - 合理使用标签来组织笔记
      - 搜索时提供准确的关键词
      - 更新笔记时保持内容的一致性
      - 删除操作前确认用户意图

      响应要求：
      - 提供清晰的操作反馈
      - 对于搜索结果，简洁地展示关键信息
      - 在执行删除等敏感操作前进行确认
      - 帮助用户高效地管理笔记内容
      - 支持批量操作和复杂查询

      使用相关工具来执行笔记管理操作，始终以用户体验为优先。
    `,
    model: 'zhipuai-coding-plan/glm-4.6',
    tools: { 
      createNoteTool, 
      searchNotesTool, 
      listNotesTool, 
      getNoteTool, 
      updateNoteTool, 
      deleteNoteTool 
    },
    memory: new Memory({
      storage: storage,
    }),
});
