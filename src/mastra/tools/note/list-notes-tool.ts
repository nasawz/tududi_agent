import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const listNotesTool = createTool({
  id: "list-notes",
  description: "获取笔记列表，支持排序、筛选和分页",
  inputSchema: z.object({
    orderBy: z.string().optional().describe("排序方式，如 'title:asc', 'created_at:desc'"),
    tag: z.string().optional().describe("按标签筛选笔记"),
    limit: z.number().optional().describe("返回数量限制，默认20"),
    offset: z.number().optional().describe("偏移量，默认0"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    notes: z.array(
      z.object({
        uid: z.string(),
        title: z.string(),
        content: z.string().optional(),
        project_id: z.number().nullable().optional(),
        user_id: z.number().optional(),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
        tags: z.array(
          z.object({
            name: z.string(),
            uid: z.string(),
          })
        ).optional(),
        Project: z.object({
          name: z.string(),
          uid: z.string(),
        }).nullable().optional(),
      })
    ).optional(),
    count: z.number().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const params: Record<string, string> = {};

      if (context.orderBy) params.order_by = context.orderBy;
      if (context.tag) params.tag = context.tag;
      if (context.limit) params.limit = context.limit.toString();
      if (context.offset) params.offset = context.offset.toString();

      const result = await apiGet("/api/notes", params, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取笔记列表失败: ${result.error}`,
          notes: [],
        };
      }

      return {
        success: true,
        message: `成功获取 ${Array.isArray(result.data) ? result.data.length : 0} 条笔记`,
        notes: result.data as any[],
        count: Array.isArray(result.data) ? result.data.length : 0,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取笔记列表时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        notes: [],
      };
    }
  },
});
