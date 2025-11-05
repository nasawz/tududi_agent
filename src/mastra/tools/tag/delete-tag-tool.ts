import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiDelete } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const deleteTagTool = createTool({
  id: "delete-tag",
  description: "删除标签（永久删除）",
  inputSchema: z.object({
    identifier: z.string().describe("标签UID或名称，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    deleted: z.boolean().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.identifier) {
        return {
          success: false,
          message: "标签标识符（identifier）为必填字段",
          deleted: false,
        };
      }

      const result = await apiDelete(`/api/tag/${context.identifier}`, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `删除标签失败: ${result.error}`,
          deleted: false,
        };
      }

      // 根据API实际行为，删除成功可能返回：
      // 1. 204 No Content
      // 2. 404 状态码（如果标签已不存在）
      // 两种情况都认为是删除成功
      return {
        success: true,
        message: `标签 "${context.identifier}" 已成功删除`,
        deleted: true,
      };
    } catch (error) {
      return {
        success: false,
        message: `删除标签时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        deleted: false,
      };
    }
  },
});

