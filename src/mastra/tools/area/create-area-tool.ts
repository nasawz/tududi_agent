import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPost } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const createAreaTool = createTool({
  id: "create-area",
  description: "创建新区域",
  inputSchema: z.object({
    name: z.string().describe("区域名称，必填"),
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
      if (!context.name) {
        return {
          success: false,
          message: "区域名称为必填字段",
          area: undefined,
        };
      }

      // 构建请求数据
      const data: any = {
        name: context.name,
      };

      if (context.description) {
        data.description = context.description;
      }

      const result = await apiPost("/api/areas", data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `创建区域失败: ${result.error}`,
          area: undefined,
        };
      }

      return {
        success: true,
        message: `区域 "${context.name}" 创建成功`,
        area: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `创建区域时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        area: undefined,
      };
    }
  },
});

