import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiDelete } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const deleteProjectTool = createTool({
  id: "delete-project",
  description: "删除项目（永久删除）",
  inputSchema: z.object({
    uid: z.string().describe("项目UID，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    deleted: z.boolean().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.uid) {
        return {
          success: false,
          message: "项目UID为必填字段",
          deleted: false,
        };
      }

      const result = await apiDelete(`/api/project/${context.uid}`, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `删除项目失败: ${result.error}`,
          deleted: false,
        };
      }

      // 根据API实际行为，删除成功可能返回：
      // 1. 204 No Content
      // 2. 404 状态码（如果项目已不存在）
      // 两种情况都认为是删除成功
      return {
        success: true,
        message: `项目 "${context.uid}" 已成功删除`,
        deleted: true,
      };
    } catch (error) {
      return {
        success: false,
        message: `删除项目时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        deleted: false,
      };
    }
  },
});

