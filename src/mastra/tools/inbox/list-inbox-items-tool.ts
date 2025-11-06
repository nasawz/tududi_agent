import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const listInboxItemsTool = createTool({
  id: "list-inbox-items",
  description: "获取收件箱列表，支持分页查询",
  inputSchema: z.object({
    limit: z.number().optional().describe("返回数量限制（默认20）"),
    offset: z.number().optional().describe("偏移量（默认0）"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    items: z.array(
      z.object({
        uid: z.string(),
        content: z.string(),
        status: z.string(),
        source: z.string(),
        user_id: z.number().optional(),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
      })
    ).optional(),
    pagination: z.object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      hasMore: z.boolean(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const params: Record<string, string> = {};

      if (context.limit !== undefined) params.limit = context.limit.toString();
      if (context.offset !== undefined) params.offset = context.offset.toString();

      const result = await apiGet("/api/inbox", params, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取收件箱列表失败: ${result.error}`,
          items: [],
        };
      }

      // 处理分页模式和简单列表模式
      const data = result.data as any;
      let items: any[] = [];
      let pagination: any = undefined;

      if (data.items && Array.isArray(data.items)) {
        // 分页模式
        items = data.items;
        pagination = data.pagination;
      } else if (Array.isArray(data)) {
        // 简单列表模式
        items = data;
      } else {
        items = [];
      }

      return {
        success: true,
        message: `成功获取 ${items.length} 个收件箱项目${pagination ? `（共 ${pagination.total} 个）` : ""}`,
        items,
        pagination,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取收件箱列表时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        items: [],
      };
    }
  },
});


