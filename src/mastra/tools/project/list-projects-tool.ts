import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const listProjectsTool = createTool({
  id: "list-projects",
  description: "获取项目列表，支持多种过滤条件",
  inputSchema: z.object({
    state: z.union([z.string(), z.array(z.string())]).optional().describe("项目状态过滤（planned/in_progress/blocked/idea/completed），可传递单个或多个状态"),
    active: z.boolean().optional().describe("活跃状态过滤（true=计划中/进行中/被阻塞，false=构思/已完成）"),
    pin_to_sidebar: z.boolean().optional().describe("是否固定到侧边栏"),
    area_id: z.number().optional().describe("区域ID（数字格式）"),
    area: z.string().optional().describe("区域标识符（uid-slug格式）"),
    grouped: z.boolean().optional().describe("是否按区域分组返回"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    projects: z.array(
      z.object({
        id: z.number(),
        uid: z.string(),
        name: z.string(),
        description: z.string().optional(),
        state: z.string(),
        area_id: z.number().optional(),
        pin_to_sidebar: z.boolean().optional(),
        due_date_at: z.string().optional(),
        image_url: z.string().optional(),
        user_uid: z.string().optional(),
        tags: z.array(
          z.object({
            id: z.number().optional(),
            name: z.string(),
            uid: z.string(),
          })
        ).optional(),
        Area: z.object({
          id: z.number(),
          uid: z.string(),
          name: z.string(),
        }).optional(),
        task_status: z.object({
          total: z.number(),
          done: z.number(),
          in_progress: z.number(),
          not_started: z.number(),
        }).optional(),
        completion_percentage: z.number().optional(),
        share_count: z.number().optional(),
        is_shared: z.boolean().optional(),
      })
    ).optional(),
    count: z.number().optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 构建查询参数
      const params: Record<string, string> = {};

      if (context.state !== undefined) {
        if (Array.isArray(context.state)) {
          params.state = context.state.join(",");
        } else {
          params.state = context.state;
        }
      }

      if (context.active !== undefined) {
        params.active = String(context.active);
      }

      if (context.pin_to_sidebar !== undefined) {
        params.pin_to_sidebar = String(context.pin_to_sidebar);
      }

      if (context.area_id !== undefined) {
        params.area_id = String(context.area_id);
      }

      if (context.area !== undefined) {
        params.area = context.area;
      }

      if (context.grouped !== undefined) {
        params.grouped = String(context.grouped);
      }

      const result = await apiGet("/api/projects", params, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取项目列表失败: ${result.error}`,
          projects: [],
        };
      }
      // API 返回的数据结构是 { projects: [...] }，需要从 result.data.projects 获取
      const projects = result.data?.projects && Array.isArray(result.data.projects) 
        ? result.data.projects 
        : Array.isArray(result.data) 
          ? result.data 
          : [];

      return {
        success: true,
        message: `成功获取 ${projects.length} 个项目`,
        projects: projects as any[],
        count: projects.length,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取项目列表时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        projects: [],
      };
    }
  },
});

