import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPatch } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const updateTagTool = createTool({
  id: "update-tag",
  description: "更新标签名称",
  inputSchema: z.object({
    identifier: z.string().describe("标签UID或名称，必填"),
    name: z.string().describe("新的标签名称，必填"),
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
      if (!context.identifier) {
        return {
          success: false,
          message: "标签标识符（identifier）为必填字段",
          tag: undefined,
        };
      }

      if (!context.name) {
        return {
          success: false,
          message: "新的标签名称（name）为必填字段",
          tag: undefined,
        };
      }

      // 构建请求数据
      const data = {
        name: context.name,
      };

      const result = await apiPatch(`/api/tag/${context.identifier}`, data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `更新标签失败: ${result.error}`,
          tag: undefined,
        };
      }

      return {
        success: true,
        message: `标签 "${context.identifier}" 更新成功`,
        tag: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `更新标签时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        tag: undefined,
      };
    }
  },
});

