import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiDelete } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const deleteInboxItemTool = createTool({
  id: "delete-inbox-item",
  description: "删除收件箱项目（软删除，状态会设置为deleted）",
  inputSchema: z.object({
    uid: z.string().describe("收件箱项目UID，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    deleted: z.boolean().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.uid || context.uid.trim() === "") {
        return {
          success: false,
          message: "收件箱项目UID为必填字段",
          deleted: false,
        };
      }

      const result = await apiDelete(`/api/inbox/${context.uid}`, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `删除收件箱项目失败: ${result.error}`,
          deleted: false,
        };
      }

      // 根据API文档，删除成功返回200状态码
      return {
        success: true,
        message: `收件箱项目 ${context.uid} 已成功删除（软删除）`,
        deleted: true,
      };
    } catch (error) {
      return {
        success: false,
        message: `删除收件箱项目时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        deleted: false,
      };
    }
  },
});


