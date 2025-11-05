import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPost } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const createNoteTool = createTool({
  id: "create-note",
  description: "创建新笔记，支持Markdown格式和标签",
  inputSchema: z.object({
    title: z.string().describe("笔记标题，必填"),
    content: z.string().describe("笔记内容（支持Markdown），必填"),
    tags: z.array(z.string()).optional().describe("标签数组"),
    project_uid: z.string().optional().describe("项目UID"),
    project_id: z.number().optional().describe("项目ID（与project_uid二选一）"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    note: z.object({
      uid: z.string(),
      title: z.string(),
      content: z.string(),
      project_id: z.number().nullable(),
      user_id: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
      tags: z.array(
        z.object({
          name: z.string(),
          uid: z.string(),
        })
      ),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.title || !context.content) {
        return {
          success: false,
          message: "标题和内容为必填字段",
          note: undefined,
        };
      }

      // 构建请求数据
      const data: any = {
        title: context.title,
        content: context.content,
      };

      if (context.tags && context.tags.length > 0) {
        data.tags = context.tags;
      }

      if (context.project_uid) {
        data.project_uid = context.project_uid;
      } else if (context.project_id) {
        data.project_id = context.project_id;
      }

      const result = await apiPost("/api/note", data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `创建笔记失败: ${result.error}`,
          note: undefined,
        };
      }

      return {
        success: true,
        message: `笔记 "${context.title}" 创建成功`,
        note: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `创建笔记时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        note: undefined,
      };
    }
  },
});
