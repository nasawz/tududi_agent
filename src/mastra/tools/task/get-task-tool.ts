import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const getTaskTool = createTool({
  id: "get-task",
  description: "获取任务详情，支持通过UID或ID获取",
  inputSchema: z.object({
    uid: z.string().optional().describe("任务UID（优先使用）"),
    id: z.number().optional().describe("任务ID"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    task: z.object({
      id: z.number(),
      uid: z.string(),
      name: z.string(),
      note: z.string().optional().nullable(),
      priority: z.number().optional(),
      due_date: z.string().optional().nullable(),
      state: z.string(),
      project_id: z.number().optional().nullable(),
      parent_task_id: z.number().optional().nullable(),
      recurrence_type: z.string().optional().nullable(),
      recurrence_interval: z.number().optional().nullable(),
      recurrence_days: z.array(z.string()).optional().nullable(),
      recurrence_end_date: z.string().optional().nullable(),
      today_move_count: z.number().optional(),
      tags: z.array(z.any()).optional(),
      Subtasks: z.array(z.any()).optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.uid && context.id === undefined) {
        return {
          success: false,
          message: "必须提供任务UID或ID",
          task: undefined,
        };
      }

      let result;
      if (context.uid) {
        // 通过UID获取
        result = await apiGet("/api/task", { uid: context.uid }, getTududiCookie(runtimeContext));
      } else {
        // 通过ID获取
        result = await apiGet(`/api/task/${context.id}`, undefined, getTududiCookie(runtimeContext));
      }

      if (!result.success) {
        return {
          success: false,
          message: `获取任务详情失败: ${result.error}`,
          task: undefined,
        };
      }

      return {
        success: true,
        message: "任务详情获取成功",
        task: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取任务详情时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        task: undefined,
      };
    }
  },
});

