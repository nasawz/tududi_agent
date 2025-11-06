import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPost } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const generateRecurringTasksTool = createTool({
  id: "generate-recurring-tasks",
  description: "为当前用户的重复任务模板生成实际的待办任务实例，基于到期日期和重复设置自动计算下一次发生",
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    generated_tasks: z.array(
      z.object({
        id: z.number(),
        uid: z.string(),
        name: z.string(),
        due_date: z.string().optional(),
      })
    ).optional(),
    count: z.number().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const result = await apiPost("/api/tasks/generate-recurring", undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `生成重复任务失败: ${result.error}`,
          generated_tasks: undefined,
          count: 0,
        };
      }

      const responseData = result.data as any;
      const tasks = responseData.tasks || [];
      const count = tasks.length;

      return {
        success: true,
        message: `成功生成 ${count} 个重复任务实例`,
        generated_tasks: tasks,
        count,
      };
    } catch (error) {
      return {
        success: false,
        message: `生成重复任务时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        generated_tasks: undefined,
        count: 0,
      };
    }
  },
});

