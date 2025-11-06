import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const searchTool = createTool({
  id: "search",
  description: "跨实体全文搜索，支持搜索任务、项目、区域、笔记和标签，并提供多种筛选条件",
  inputSchema: z.object({
    q: z.string().optional().describe("搜索关键词，支持模糊匹配"),
    filters: z.string().optional().describe("实体类型过滤器（逗号分隔），支持：Task（任务）、Project（项目）、Area（区域）、Note（笔记）、Tag（标签）"),
    priority: z.enum(["low", "medium", "high"]).optional().describe("优先级过滤（仅对任务有效）：low（低优先级）、medium（中优先级）、high（高优先级）"),
    due: z.enum(["today", "tomorrow", "next_week", "next_month"]).optional().describe("到期日期过滤（仅对任务有效）：today（今日到期）、tomorrow（明日到期）、next_week（下周到期）、next_month（下月到期）"),
    tags: z.string().optional().describe("标签过滤（逗号分隔），只搜索包含指定标签的资源"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    results: z.array(
      z.object({
        type: z.string().describe("实体类型：Task、Project、Area、Note、Tag"),
        id: z.number(),
        uid: z.string(),
        name: z.string().optional().describe("资源名称（用于Task、Project、Area、Tag）"),
        title: z.string().optional().describe("资源标题（用于Note）"),
        description: z.string().optional().describe("描述（用于Task、Project、Area）"),
        content: z.string().optional().describe("内容（用于Note）"),
        due_date: z.string().optional().describe("到期日期（仅Task）"),
        priority: z.number().optional().describe("优先级（仅Task，1=low, 2=medium, 3=high）"),
        project: z.object({
          id: z.number(),
          uid: z.string(),
          name: z.string(),
        }).optional().describe("关联项目（用于Task和Note）"),
        tags: z.array(
          z.object({
            name: z.string(),
            uid: z.string(),
          })
        ).optional().describe("标签列表"),
      })
    ).optional(),
    count: z.number().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const params: Record<string, string> = {};

      if (context.q) params.q = context.q;
      if (context.filters) params.filters = context.filters;
      if (context.priority) params.priority = context.priority;
      if (context.due) params.due = context.due;
      if (context.tags) params.tags = context.tags;

      const result = await apiGet("/api/search", params, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `搜索失败: ${result.error}`,
          results: [],
        };
      }

      const searchResults = (result.data as any)?.results || [];
      const entityTypes = searchResults.map((r: any) => r.type).filter((v: any, i: number, arr: any[]) => arr.indexOf(v) === i);
      const typeSummary = entityTypes.map((type: string) => {
        const count = searchResults.filter((r: any) => r.type === type).length;
        return `${type}(${count})`;
      }).join(", ");

      return {
        success: true,
        message: `搜索完成，找到 ${searchResults.length} 个结果${typeSummary ? ` (${typeSummary})` : ""}`,
        results: searchResults,
        count: searchResults.length,
      };
    } catch (error) {
      return {
        success: false,
        message: `搜索时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        results: [],
      };
    }
  },
});

