import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { d as apiPatch, g as getTududiCookie } from '../types.mjs';
import 'axios';
import 'https';

const updateNoteTool = createTool({
  id: "update-note",
  description: "\u66F4\u65B0\u7B14\u8BB0\u4FE1\u606F\uFF0C\u652F\u6301\u90E8\u5206\u66F4\u65B0",
  inputSchema: z.object({
    uid: z.string().describe("\u7B14\u8BB0\u7684\u552F\u4E00\u6807\u8BC6\u7B26\uFF0C\u5FC5\u586B"),
    title: z.string().optional().describe("\u7B14\u8BB0\u6807\u9898"),
    content: z.string().optional().describe("\u7B14\u8BB0\u5185\u5BB9\uFF08\u652F\u6301Markdown\uFF09"),
    tags: z.array(z.string()).optional().describe("\u6807\u7B7E\u6570\u7EC4\uFF08\u5C06\u5B8C\u5168\u66FF\u6362\u73B0\u6709\u6807\u7B7E\uFF09")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    note: z.object({
      uid: z.string(),
      title: z.string(),
      content: z.string(),
      project_id: z.number().nullable(),
      user_id: z.number().optional(),
      created_at: z.string().optional(),
      updated_at: z.string(),
      tags: z.array(
        z.object({
          name: z.string(),
          uid: z.string()
        })
      ).optional()
    }).optional()
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      if (!context.uid) {
        return {
          success: false,
          message: "\u7B14\u8BB0UID\u4E3A\u5FC5\u586B\u5B57\u6BB5",
          note: void 0
        };
      }
      if (!context.title && !context.content && !context.tags) {
        return {
          success: false,
          message: "\u81F3\u5C11\u63D0\u4F9B\u4E00\u4E2A\u8981\u66F4\u65B0\u7684\u5B57\u6BB5\uFF08title\u3001content\u6216tags\uFF09",
          note: void 0
        };
      }
      const data = {};
      if (context.title !== void 0) data.title = context.title;
      if (context.content !== void 0) data.content = context.content;
      if (context.tags !== void 0) data.tags = context.tags;
      const result = await apiPatch(`/api/note/${context.uid}`, data, getTududiCookie(runtimeContext));
      if (!result.success) {
        return {
          success: false,
          message: `\u66F4\u65B0\u7B14\u8BB0\u5931\u8D25: ${result.error}`,
          note: void 0
        };
      }
      return {
        success: true,
        message: `\u7B14\u8BB0 "${context.uid}" \u66F4\u65B0\u6210\u529F`,
        note: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: `\u66F4\u65B0\u7B14\u8BB0\u65F6\u53D1\u751F\u9519\u8BEF: ${error instanceof Error ? error.message : String(error)}`,
        note: void 0
      };
    }
  }
});

export { updateNoteTool };
