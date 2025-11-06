import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const getInboxItemTool = createTool({
  id: "get-inbox-item",
  description: "获取单个收件箱项目的详细信息",
  inputSchema: z.object({
    uid: z.string().describe("收件箱项目UID，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    item: z.object({
      uid: z.string(),
      content: z.string(),
      status: z.string(),
      source: z.string(),
      user_id: z.number().optional(),
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.uid || context.uid.trim() === "") {
        return {
          success: false,
          message: "收件箱项目UID为必填字段",
          item: undefined,
        };
      }

      const result = await apiGet(`/api/inbox/${context.uid}`, undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取收件箱项目失败: ${result.error}`,
          item: undefined,
        };
      }

      return {
        success: true,
        message: "收件箱项目详情获取成功",
        item: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取收件箱项目时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        item: undefined,
      };
    }
  },
});


