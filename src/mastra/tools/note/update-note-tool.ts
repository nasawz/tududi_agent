import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPatch } from "../../lib/api-client";
import { getTududiCookie } from "../../types";
export const updateNoteTool = createTool({
  id: "update-note",
  description: "更新笔记信息，支持部分更新",
  inputSchema: z.object({
    uid: z.string().describe("笔记的唯一标识符，必填"),
    title: z.string().optional().describe("笔记标题"),
    content: z.string().optional().describe("笔记内容（支持Markdown）"),
    tags: z.array(z.string()).optional().describe("标签数组（将完全替换现有标签）"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    note: z.object({
      uid: z.string(),
      title: z.string(),
      content: z.string(),
      project_id: z.number().nullable(),
      user_id: z.number().optional(),
      created_at: z.string().optional(),
      updated_at: z.string(),
      tags: z.array(
        z.object({
          name: z.string(),
          uid: z.string(),
        })
      ).optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.uid) {
        return {
          success: false,
          message: "笔记UID为必填字段",
          note: undefined,
        };
      }

      // 检查是否有更新内容
      if (!context.title && !context.content && !context.tags) {
        return {
          success: false,
          message: "至少提供一个要更新的字段（title、content或tags）",
          note: undefined,
        };
      }

      // 构建请求数据
      const data: any = {};

      if (context.title !== undefined) data.title = context.title;
      if (context.content !== undefined) data.content = context.content;
      if (context.tags !== undefined) data.tags = context.tags;

      const result = await apiPatch(`/api/note/${context.uid}`, data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `更新笔记失败: ${result.error}`,
          note: undefined,
        };
      }

      return {
        success: true,
        message: `笔记 "${context.uid}" 更新成功`,
        note: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `更新笔记时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        note: undefined,
      };
    }
  },
});
