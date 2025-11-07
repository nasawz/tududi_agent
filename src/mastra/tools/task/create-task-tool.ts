import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPost } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const createTaskTool = createTool({
  id: "create-task",
  description: "创建新任务，支持设置优先级、到期日期、项目关联、子任务和重复任务",
  inputSchema: z.object({
    name: z.string().describe("任务名称，必填"),
    note: z.string().optional().describe("任务备注"),
    priority: z.number().optional().describe("优先级（数值越小优先级越高，默认0）"),
    due_date: z.string().optional().describe("到期日期（ISO 8601格式，如：2024-01-20T10:00:00.000Z）"),
    project_id: z.number().optional().describe("所属项目ID"),
    parent_task_id: z.number().optional().describe("父任务ID（用于创建子任务）"),
    recurrence_type: z.enum(["daily", "weekly", "monthly"]).optional().describe("重复类型：daily（每日）、weekly（每周）、monthly（每月）"),
    recurrence_interval: z.number().optional().describe("重复间隔（如：每2天，每3周）"),
    recurrence_days: z.array(z.string()).optional().describe("重复的星期几（数组，如：['Monday', 'Wednesday']，仅用于weekly类型）"),
    recurrence_end_date: z.string().optional().describe("重复结束日期（ISO 8601格式）"),
    state: z.enum(["active", "completed", "archived"]).optional().describe("任务状态（默认active）"),
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
      created_at: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.name) {
        return {
          success: false,
          message: "任务名称为必填字段",
          task: undefined,
        };
      }

      // 构建请求数据
      const data: any = {
        name: context.name,
      };

      if (context.note !== undefined) data.note = context.note;
      if (context.priority !== undefined) data.priority = context.priority;
      if (context.due_date !== undefined) data.due_date = context.due_date;
      if (context.project_id !== undefined) data.project_id = context.project_id;
      if (context.parent_task_id !== undefined) data.parent_task_id = context.parent_task_id;
      if (context.recurrence_type !== undefined) data.recurrence_type = context.recurrence_type;
      if (context.recurrence_interval !== undefined) data.recurrence_interval = context.recurrence_interval;
      if (context.recurrence_days !== undefined) data.recurrence_days = context.recurrence_days;
      if (context.recurrence_end_date !== undefined) data.recurrence_end_date = context.recurrence_end_date;
      if (context.state !== undefined) data.state = context.state;

      const result = await apiPost("/api/task", data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `创建任务失败: ${result.error}`,
          task: undefined,
        };
      }

      return {
        success: true,
        message: `任务 "${context.name}" 创建成功`,
        task: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `创建任务时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        task: undefined,
      };
    }
  },
});

