import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPatch } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const toggleTaskTodayTool = createTool({
  id: "toggle-task-today",
  description: "切换任务的今日标记，将任务移动到'今日'视图，记录移动次数",
  inputSchema: z.object({
    id: z.number().describe("任务ID，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    task: z.object({
      id: z.number(),
      today_move_count: z.number(),
      message: z.string().optional(),
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

      const result = await apiPatch(`/api/task/${context.id}/toggle-today`, undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `切换今日标记失败: ${result.error}`,
          task: undefined,
        };
      }

      const taskData = result.data as any;

      return {
        success: true,
        message: `任务 ID ${context.id} 已标记为今日（移动次数：${taskData.today_move_count || 0}）`,
        task: taskData,
      };
    } catch (error) {
      return {
        success: false,
        message: `切换今日标记时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        task: undefined,
      };
    }
  },
});

