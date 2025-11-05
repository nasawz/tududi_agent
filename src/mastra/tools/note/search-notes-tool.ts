import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const searchNotesTool = createTool({
  id: "search-notes",
  description: "搜索笔记内容，支持关键词和筛选条件",
  inputSchema: z.object({
    query: z.string().describe("搜索关键词"),
    tag: z.string().optional().describe("按标签筛选"),
    projectUid: z.string().optional().describe("按项目UID筛选"),
    limit: z.number().optional().describe("返回数量限制，默认20"),
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
      // 验证必需字段
      if (!context.query) {
        return {
          success: false,
          message: "搜索关键词为必填字段",
          notes: [],
        };
      }

      // 使用通用搜索API
      const params: Record<string, string> = {
        q: context.query,
        filters: 'Note', // 只搜索笔记
      };

      if (context.tag) params.tags = context.tag;
      if (context.limit) params.limit = context.limit.toString();

      const result = await apiGet("/api/search", params, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `搜索笔记失败: ${result.error}`,
          notes: [],
        };
      }

      // 从搜索结果中提取笔记
      const searchResults = result.data as any;
      const notes = searchResults?.results?.filter((item: any) => item.type === 'Note') || [];

      return {
        success: true,
        message: `找到 ${notes.length} 条匹配的笔记`,
        notes,
        count: notes.length,
      };
    } catch (error) {
      return {
        success: false,
        message: `搜索笔记时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        notes: [],
      };
    }
  },
});
