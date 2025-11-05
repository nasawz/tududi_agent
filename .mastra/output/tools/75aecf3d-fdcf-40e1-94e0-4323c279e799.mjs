import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { c as apiGet, g as getTududiCookie } from '../types.mjs';
import 'axios';
import 'https';

const searchNotesTool = createTool({
  id: "search-notes",
  description: "\u641C\u7D22\u7B14\u8BB0\u5185\u5BB9\uFF0C\u652F\u6301\u5173\u952E\u8BCD\u548C\u7B5B\u9009\u6761\u4EF6",
  inputSchema: z.object({
    query: z.string().describe("\u641C\u7D22\u5173\u952E\u8BCD"),
    tag: z.string().optional().describe("\u6309\u6807\u7B7E\u7B5B\u9009"),
    projectUid: z.string().optional().describe("\u6309\u9879\u76EEUID\u7B5B\u9009"),
    limit: z.number().optional().describe("\u8FD4\u56DE\u6570\u91CF\u9650\u5236\uFF0C\u9ED8\u8BA420")
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
      if (!context.query) {
        return {
          success: false,
          message: "\u641C\u7D22\u5173\u952E\u8BCD\u4E3A\u5FC5\u586B\u5B57\u6BB5",
          notes: []
        };
      }
      const params = {
        q: context.query,
        filters: "Note"
        // 只搜索笔记
      };
      if (context.tag) params.tags = context.tag;
      if (context.limit) params.limit = context.limit.toString();
      const result = await apiGet("/api/search", params, getTududiCookie(runtimeContext));
      if (!result.success) {
        return {
          success: false,
          message: `\u641C\u7D22\u7B14\u8BB0\u5931\u8D25: ${result.error}`,
          notes: []
        };
      }
      const searchResults = result.data;
      const notes = searchResults?.results?.filter((item) => item.type === "Note") || [];
      return {
        success: true,
        message: `\u627E\u5230 ${notes.length} \u6761\u5339\u914D\u7684\u7B14\u8BB0`,
        notes,
        count: notes.length
      };
    } catch (error) {
      return {
        success: false,
        message: `\u641C\u7D22\u7B14\u8BB0\u65F6\u53D1\u751F\u9519\u8BEF: ${error instanceof Error ? error.message : String(error)}`,
        notes: []
      };
    }
  }
});

export { searchNotesTool };
