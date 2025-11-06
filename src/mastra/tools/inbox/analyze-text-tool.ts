import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiPost } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const analyzeTextTool = createTool({
  id: "analyze-text",
  description: "对文本内容进行智能分析，自动提取任务名称、截止日期、优先级、标签和项目信息",
  inputSchema: z.object({
    content: z.string().describe("要分析的文本内容，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    analysis: z.object({
      extracted_info: z.object({
        task_name: z.string().optional(),
        due_date: z.string().optional(),
        priority: z.number().optional(),
        tags: z.array(z.string()).optional(),
        project: z.string().nullable().optional(),
      }).optional(),
      confidence: z.number().optional(),
      suggestions: z.array(z.string()).optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.content || context.content.trim() === "") {
        return {
          success: false,
          message: "文本内容为必填字段",
          analysis: undefined,
        };
      }

      // 构建请求数据
      const data = {
        content: context.content.trim(),
      };

      const result = await apiPost("/api/inbox/analyze-text", data, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `文本分析失败: ${result.error}`,
          analysis: undefined,
        };
      }

      return {
        success: true,
        message: "文本分析完成",
        analysis: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `文本分析时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        analysis: undefined,
      };
    }
  },
});


