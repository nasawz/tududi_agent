import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPatch } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const updateInboxItemTool = createTool({
  id: "update-inbox-item",
  description: "更新收件箱项目信息，支持部分更新",
  inputSchema: z.object({
    uid: z.string().describe("收件箱项目UID，必填"),
    content: z.string().optional().describe("项目内容"),
    status: z.enum(["added", "processed", "deleted"]).optional().describe("项目状态"),
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
      if (!context.uid || context.uid.trim() === "") {
        return {
          success: false,
          message: "收件箱项目UID为必填字段",
          item: undefined,
        };
      }

      // 检查是否有更新内容
      const hasUpdate = context.content !== undefined || context.status !== undefined;

      if (!hasUpdate) {
        return {
          success: false,
          message: "至少提供一个要更新的字段",
          item: undefined,
        };
      }

      // 构建请求数据
      const data: any = {};
      if (context.content !== undefined) data.content = context.content;
      if (context.status !== undefined) data.status = context.status;

      const result = await apiPatch(`/api/inbox/${context.uid}`, data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `更新收件箱项目失败: ${result.error}`,
          item: undefined,
        };
      }

      return {
        success: true,
        message: `收件箱项目 ${context.uid} 更新成功`,
        item: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `更新收件箱项目时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        item: undefined,
      };
    }
  },
});


