import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiDelete } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const deleteTaskTool = createTool({
  id: "delete-task",
  description: "删除任务（永久删除）",
  inputSchema: z.object({
    id: z.number().describe("任务ID，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    deleted: z.boolean().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (context.id === undefined) {
        return {
          success: false,
          message: "任务ID为必填字段",
          deleted: false,
        };
      }

      const result = await apiDelete(`/api/task/${context.id}`, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `删除任务失败: ${result.error}`,
          deleted: false,
        };
      }

      // 根据API文档，删除成功返回204状态码（No Content）
      return {
        success: true,
        message: `任务 ID ${context.id} 已成功删除`,
        deleted: true,
      };
    } catch (error) {
      return {
        success: false,
        message: `删除任务时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        deleted: false,
      };
    }
  },
});

