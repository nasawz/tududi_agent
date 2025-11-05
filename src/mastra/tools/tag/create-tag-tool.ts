import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPost } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const createTagTool = createTool({
  id: "create-tag",
  description: "创建新标签",
  inputSchema: z.object({
    name: z.string().describe("标签名称，必填"),
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
      // 验证必需字段
      if (!context.name) {
        return {
          success: false,
          message: "标签名称为必填字段",
          tag: undefined,
        };
      }

      // 构建请求数据
      const data = {
        name: context.name,
      };

      const result = await apiPost("/api/tag", data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `创建标签失败: ${result.error}`,
          tag: undefined,
        };
      }

      return {
        success: true,
        message: `标签 "${context.name}" 创建成功`,
        tag: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `创建标签时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        tag: undefined,
      };
    }
  },
});

