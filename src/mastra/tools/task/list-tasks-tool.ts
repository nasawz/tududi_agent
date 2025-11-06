import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const listTasksTool = createTool({
  id: "list-tasks",
  description: "获取任务列表，支持按视图类型筛选、排序和项目筛选",
  inputSchema: z.object({
    type: z.enum(["today", "upcoming", "someday", "all", "project"]).optional().describe("视图类型：today（今日）、upcoming（即将到来）、someday（某天）、all（全部）、project（项目）"),
    project_id: z.number().optional().describe("项目ID（当type=project时使用）"),
    orderBy: z.string().optional().describe("排序方式，如：priority、name、due_date、created_at（默认created_at:desc）"),
    user_timezone: z.string().optional().describe("用户时区（如：Asia/Shanghai）"),
    uid: z.string().optional().describe("任务UID（与task端点配合使用）"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    tasks: z.record(z.string(), z.array(z.any())).optional().describe("按天分组的任务列表对象"),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const params: Record<string, string> = {};

      if (context.type) params.type = context.type;
      if (context.project_id !== undefined) params.project_id = context.project_id.toString();
      if (context.orderBy) params.orderBy = context.orderBy;
      if (context.user_timezone) params.user_timezone = context.user_timezone;
      if (context.uid) params.uid = context.uid;

      const result = await apiGet("/api/tasks", params, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取任务列表失败: ${result.error}`,
          tasks: undefined,
        };
      }

      // 统计任务总数
      const taskGroups = result.data as Record<string, any[]>;
      const totalCount = Object.values(taskGroups).reduce((sum, tasks) => sum + (tasks?.length || 0), 0);

      return {
        success: true,
        message: `成功获取 ${totalCount} 个任务`,
        tasks: taskGroups,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取任务列表时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        tasks: undefined,
      };
    }
  },
});

