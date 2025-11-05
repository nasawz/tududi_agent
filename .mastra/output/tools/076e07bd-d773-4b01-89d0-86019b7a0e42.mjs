import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { g as getTududiCookie, c as apiGet } from '../types.mjs';
import 'axios';
import 'https';

const listNotesTool = createTool({
  id: "list-notes",
  description: "\u83B7\u53D6\u7B14\u8BB0\u5217\u8868\uFF0C\u652F\u6301\u6392\u5E8F\u3001\u7B5B\u9009\u548C\u5206\u9875",
  inputSchema: z.object({
    orderBy: z.string().optional().describe("\u6392\u5E8F\u65B9\u5F0F\uFF0C\u5982 'title:asc', 'created_at:desc'"),
    tag: z.string().optional().describe("\u6309\u6807\u7B7E\u7B5B\u9009\u7B14\u8BB0"),
    limit: z.number().optional().describe("\u8FD4\u56DE\u6570\u91CF\u9650\u5236\uFF0C\u9ED8\u8BA420"),
    offset: z.number().optional().describe("\u504F\u79FB\u91CF\uFF0C\u9ED8\u8BA40")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    notes: z.array(
      z.object({
        uid: z.string(),
        title: z.string(),
        content: z.string().optional(),
        project_id: z.number().nullable().optional(),
        user_id: z.number().optional(),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
        tags: z.array(
          z.object({
            name: z.string(),
            uid: z.string()
          })
        ).optional(),
        Project: z.object({
          name: z.string(),
          uid: z.string()
        }).nullable().optional()
      })
    ).optional(),
    count: z.number().optional()
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const params = {};
      if (context.orderBy) params.order_by = context.orderBy;
      if (context.tag) params.tag = context.tag;
      if (context.limit) params.limit = context.limit.toString();
      if (context.offset) params.offset = context.offset.toString();
      console.log("cookie", getTududiCookie(runtimeContext));
      const result = await apiGet("/api/notes", params, getTududiCookie(runtimeContext));
      if (!result.success) {
        return {
          success: false,
          message: `\u83B7\u53D6\u7B14\u8BB0\u5217\u8868\u5931\u8D25: ${result.error}`,
          notes: []
        };
      }
      return {
        success: true,
        message: `\u6210\u529F\u83B7\u53D6 ${Array.isArray(result.data) ? result.data.length : 0} \u6761\u7B14\u8BB0`,
        notes: result.data,
        count: Array.isArray(result.data) ? result.data.length : 0
      };
    } catch (error) {
      return {
        success: false,
        message: `\u83B7\u53D6\u7B14\u8BB0\u5217\u8868\u65F6\u53D1\u751F\u9519\u8BEF: ${error instanceof Error ? error.message : String(error)}`,
        notes: []
      };
    }
  }
});

export { listNotesTool };
