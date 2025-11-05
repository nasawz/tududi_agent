import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const getAreaTool = createTool({
  id: "get-area",
  description: "根据UID获取区域详情",
  inputSchema: z.object({
    uid: z.string().describe("区域的唯一标识符，必填"),
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

      const result = await apiGet(`/api/areas/${context.uid}`, undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取区域详情失败: ${result.error}`,
          area: undefined,
        };
      }

      return {
        success: true,
        message: "区域详情获取成功",
        area: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取区域详情时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        area: undefined,
      };
    }
  },
});

