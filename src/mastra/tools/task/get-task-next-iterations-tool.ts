import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const getTaskNextIterationsTool = createTool({
  id: "get-task-next-iterations",
  description: "获取重复任务未来的迭代实例，显示即将到来的重复任务发生，用于预览重复任务的计划安排",
  inputSchema: z.object({
    id: z.number().describe("任务ID（必须是重复任务），必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    iterations: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        due_date: z.string(),
        recurrence_iteration: z.number(),
      })
    ).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (context.id === undefined) {
        return {
          success: false,
          message: "任务ID为必填字段",
          iterations: undefined,
        };
      }

      const result = await apiGet(`/api/task/${context.id}/next-iterations`, undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取下一次迭代失败: ${result.error}`,
          iterations: undefined,
        };
      }

      const iterations = Array.isArray(result.data) ? result.data : [];
      return {
        success: true,
        message: `成功获取 ${iterations.length} 个未来迭代`,
        iterations: iterations as any[],
      };
    } catch (error) {
      return {
        success: false,
        message: `获取下一次迭代时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        iterations: undefined,
      };
    }
  },
});

