import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPatch } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const updateAreaTool = createTool({
  id: "update-area",
  description: "更新区域信息，支持部分更新",
  inputSchema: z.object({
    uid: z.string().describe("区域UID，必填"),
    name: z.string().optional().describe("区域名称"),
    description: z.string().optional().describe("区域描述"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    area: z.object({
      uid: z.string(),
      name: z.string(),
      description: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.uid) {
        return {
          success: false,
          message: "区域UID为必填字段",
          area: undefined,
        };
      }

      // 检查是否有更新内容
      if (!context.name && !context.description) {
        return {
          success: false,
          message: "至少提供一个要更新的字段（name或description）",
          area: undefined,
        };
      }

      // 构建请求数据
      const data: any = {};

      if (context.name !== undefined) data.name = context.name;
      if (context.description !== undefined) data.description = context.description;

      const result = await apiPatch(`/api/areas/${context.uid}`, data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `更新区域失败: ${result.error}`,
          area: undefined,
        };
      }

      return {
        success: true,
        message: `区域 "${context.uid}" 更新成功`,
        area: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `更新区域时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        area: undefined,
      };
    }
  },
});

