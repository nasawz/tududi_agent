import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const getProjectTool = createTool({
  id: "get-project",
  description: "根据UID或UID-名称格式获取项目详情",
  inputSchema: z.object({
    uidSlug: z.string().describe("项目UID或UID-名称格式的slug，必填"),
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
      user_uid: z.string().optional(),
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
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
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.uidSlug) {
        return {
          success: false,
          message: "项目UID或slug为必填字段",
          project: undefined,
        };
      }

      const result = await apiGet(`/api/project/${context.uidSlug}`, undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取项目详情失败: ${result.error}`,
          project: undefined,
        };
      }

      return {
        success: true,
        message: "项目详情获取成功",
        project: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取项目详情时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        project: undefined,
      };
    }
  },
});

