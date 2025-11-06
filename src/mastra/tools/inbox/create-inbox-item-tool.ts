import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPost } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const createInboxItemTool = createTool({
  id: "create-inbox-item",
  description: "添加收件箱项目，快速收集任务想法",
  inputSchema: z.object({
    content: z.string().describe("项目内容，必填"),
    source: z.enum(["manual", "telegram", "api", "import"]).optional().describe("来源（默认manual）"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    item: z.object({
      uid: z.string(),
      content: z.string(),
      status: z.string(),
      source: z.string(),
      user_id: z.number().optional(),
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.content || context.content.trim() === "") {
        return {
          success: false,
          message: "内容为必填字段",
          item: undefined,
        };
      }

      // 构建请求数据
      const data: any = {
        content: context.content.trim(),
      };

      if (context.source) {
        data.source = context.source;
      }

      const result = await apiPost("/api/inbox", data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `创建收件箱项目失败: ${result.error}`,
          item: undefined,
        };
      }

      return {
        success: true,
        message: `收件箱项目创建成功`,
        item: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `创建收件箱项目时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        item: undefined,
      };
    }
  },
});


