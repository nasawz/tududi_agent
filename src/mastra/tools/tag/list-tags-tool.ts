import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const listTagsTool = createTool({
  id: "list-tags",
  description: "获取所有标签列表",
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    tags: z.array(
      z.object({
        name: z.string(),
        uid: z.string(),
      })
    ).optional(),
    count: z.number().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const result = await apiGet("/api/tags", undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取标签列表失败: ${result.error}`,
          tags: [],
        };
      }

      return {
        success: true,
        message: `成功获取 ${Array.isArray(result.data) ? result.data.length : 0} 个标签`,
        tags: result.data as any[],
        count: Array.isArray(result.data) ? result.data.length : 0,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取标签列表时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        tags: [],
      };
    }
  },
});

