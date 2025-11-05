import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const getTagTool = createTool({
  id: "get-tag",
  description: "根据UID或名称获取标签详情",
  inputSchema: z.object({
    uid: z.string().optional().describe("标签的唯一标识符"),
    name: z.string().optional().describe("标签名称"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    tag: z.object({
      name: z.string(),
      uid: z.string(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段：uid 和 name 至少提供一个
      if (!context.uid && !context.name) {
        return {
          success: false,
          message: "必须提供 uid 或 name 其中之一",
          tag: undefined,
        };
      }

      // 构建查询参数
      const params: Record<string, string> = {};
      if (context.uid) {
        params.uid = context.uid;
      } else if (context.name) {
        params.name = context.name;
      }

      const result = await apiGet("/api/tag", params, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取标签详情失败: ${result.error}`,
          tag: undefined,
        };
      }

      return {
        success: true,
        message: "标签详情获取成功",
        tag: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取标签详情时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        tag: undefined,
      };
    }
  },
});

