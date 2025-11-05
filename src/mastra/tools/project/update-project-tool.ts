import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPatch } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const updateProjectTool = createTool({
  id: "update-project",
  description: "更新项目信息，支持部分更新",
  inputSchema: z.object({
    uid: z.string().describe("项目UID，必填"),
    name: z.string().optional().describe("项目名称"),
    description: z.string().optional().describe("项目描述"),
    state: z.enum(["planned", "in_progress", "blocked", "idea", "completed"]).optional().describe("项目状态"),
    area_id: z.number().optional().describe("所属区域ID"),
    pin_to_sidebar: z.boolean().optional().describe("是否固定到侧边栏"),
    due_date_at: z.string().optional().describe("项目到期日期（ISO格式）"),
    image_url: z.string().optional().describe("项目图片URL"),
    tags: z.array(
      z.object({
        name: z.string(),
      })
    ).optional().describe("项目标签数组，格式: [{ name: \"标签名\" }]。提供新标签数组将完全替换现有标签"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    project: z.object({
      id: z.number(),
      uid: z.string(),
      name: z.string(),
      description: z.string().optional(),
      state: z.string(),
      area_id: z.number().optional(),
      pin_to_sidebar: z.boolean().optional(),
      due_date_at: z.string().optional(),
      image_url: z.string().optional(),
      updated_at: z.string().optional(),
      tags: z.array(
        z.object({
          id: z.number().optional(),
          name: z.string(),
          uid: z.string(),
        })
      ).optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.uid) {
        return {
          success: false,
          message: "项目UID为必填字段",
          project: undefined,
        };
      }

      // 检查是否有更新内容
      const hasUpdateFields = 
        context.name !== undefined ||
        context.description !== undefined ||
        context.state !== undefined ||
        context.area_id !== undefined ||
        context.pin_to_sidebar !== undefined ||
        context.due_date_at !== undefined ||
        context.image_url !== undefined ||
        context.tags !== undefined;

      if (!hasUpdateFields) {
        return {
          success: false,
          message: "至少提供一个要更新的字段",
          project: undefined,
        };
      }

      // 构建请求数据
      const data: any = {};

      if (context.name !== undefined) data.name = context.name;
      if (context.description !== undefined) data.description = context.description;
      if (context.state !== undefined) data.state = context.state;
      if (context.area_id !== undefined) data.area_id = context.area_id;
      if (context.pin_to_sidebar !== undefined) data.pin_to_sidebar = context.pin_to_sidebar;
      if (context.due_date_at !== undefined) data.due_date_at = context.due_date_at;
      if (context.image_url !== undefined) data.image_url = context.image_url;
      if (context.tags !== undefined) data.tags = context.tags;

      const result = await apiPatch(`/api/project/${context.uid}`, data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `更新项目失败: ${result.error}`,
          project: undefined,
        };
      }

      return {
        success: true,
        message: `项目 "${context.uid}" 更新成功`,
        project: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `更新项目时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        project: undefined,
      };
    }
  },
});

