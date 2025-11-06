import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const getTaskSubtasksTool = createTool({
  id: "get-task-subtasks",
  description: "获取任务的子任务列表",
  inputSchema: z.object({
    id: z.number().describe("父任务ID，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    subtasks: z.array(
      z.object({
        id: z.number(),
        uid: z.string(),
        name: z.string(),
        state: z.string(),
        priority: z.number().optional(),
        due_date: z.string().optional().nullable(),
        parent_task_id: z.number(),
      })
    ).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (context.id === undefined) {
        return {
          success: false,
          message: "父任务ID为必填字段",
          subtasks: undefined,
        };
      }

      const result = await apiGet(`/api/task/${context.id}/subtasks`, undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取子任务列表失败: ${result.error}`,
          subtasks: undefined,
        };
      }

      const subtasks = Array.isArray(result.data) ? result.data : [];
      return {
        success: true,
        message: `成功获取 ${subtasks.length} 个子任务`,
        subtasks: subtasks as any[],
      };
    } catch (error) {
      return {
        success: false,
        message: `获取子任务列表时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        subtasks: undefined,
      };
    }
  },
});

