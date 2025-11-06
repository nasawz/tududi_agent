import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPatch } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const toggleTaskCompletionTool = createTool({
  id: "toggle-task-completion",
  description: "切换任务完成状态，active ↔ completed，重复任务完成后会自动生成下一次迭代",
  inputSchema: z.object({
    id: z.number().describe("任务ID，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    task: z.object({
      id: z.number(),
      state: z.string(),
      completed_at: z.string().optional().nullable(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (context.id === undefined) {
        return {
          success: false,
          message: "任务ID为必填字段",
          task: undefined,
        };
      }

      const result = await apiPatch(`/api/task/${context.id}/toggle_completion`, undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `切换任务完成状态失败: ${result.error}`,
          task: undefined,
        };
      }

      const taskData = result.data as any;
      const stateText = taskData.state === "completed" ? "已完成" : "已激活";

      return {
        success: true,
        message: `任务 ID ${context.id} 状态已切换为 ${stateText}`,
        task: taskData,
      };
    } catch (error) {
      return {
        success: false,
        message: `切换任务完成状态时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        task: undefined,
      };
    }
  },
});

