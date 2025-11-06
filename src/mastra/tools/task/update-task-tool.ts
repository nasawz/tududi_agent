import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPatch } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const updateTaskTool = createTool({
  id: "update-task",
  description: "更新任务信息，支持部分更新",
  inputSchema: z.object({
    id: z.number().describe("任务ID，必填"),
    name: z.string().optional().describe("任务名称"),
    description: z.string().optional().describe("任务描述"),
    priority: z.number().optional().describe("优先级（数值越小优先级越高）"),
    due_date: z.string().optional().describe("到期日期（ISO 8601格式）"),
    project_id: z.number().optional().describe("所属项目ID"),
    state: z.enum(["active", "completed", "archived"]).optional().describe("任务状态"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    task: z.object({
      id: z.number(),
      uid: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      priority: z.number().optional(),
      due_date: z.string().optional().nullable(),
      state: z.string(),
      project_id: z.number().optional().nullable(),
      updated_at: z.string().optional(),
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

      // 检查是否有更新内容
      const hasUpdate =
        context.name !== undefined ||
        context.description !== undefined ||
        context.priority !== undefined ||
        context.due_date !== undefined ||
        context.project_id !== undefined ||
        context.state !== undefined;

      if (!hasUpdate) {
        return {
          success: false,
          message: "至少提供一个要更新的字段",
          task: undefined,
        };
      }

      // 构建请求数据
      const data: any = {};
      if (context.name !== undefined) data.name = context.name;
      if (context.description !== undefined) data.description = context.description;
      if (context.priority !== undefined) data.priority = context.priority;
      if (context.due_date !== undefined) data.due_date = context.due_date;
      if (context.project_id !== undefined) data.project_id = context.project_id;
      if (context.state !== undefined) data.state = context.state;

      const result = await apiPatch(`/api/task/${context.id}`, data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `更新任务失败: ${result.error}`,
          task: undefined,
        };
      }

      return {
        success: true,
        message: `任务 ID ${context.id} 更新成功`,
        task: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `更新任务时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        task: undefined,
      };
    }
  },
});

