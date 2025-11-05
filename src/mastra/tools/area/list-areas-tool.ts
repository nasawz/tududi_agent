import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const listAreasTool = createTool({
  id: "list-areas",
  description: "获取所有区域列表",
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    areas: z.array(
      z.object({
        id: z.number().optional(),
        uid: z.string(),
        name: z.string(),
        description: z.string().optional(),
      })
    ).optional(),
    count: z.number().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const result = await apiGet("/api/areas", undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取区域列表失败: ${result.error}`,
          areas: [],
        };
      }

      return {
        success: true,
        message: `成功获取 ${Array.isArray(result.data) ? result.data.length : 0} 个区域`,
        areas: result.data as any[],
        count: Array.isArray(result.data) ? result.data.length : 0,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取区域列表时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        areas: [],
      };
    }
  },
});

