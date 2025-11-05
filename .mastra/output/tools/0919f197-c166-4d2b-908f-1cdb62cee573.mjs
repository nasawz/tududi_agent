import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { a as apiPost, g as getTududiCookie } from '../types.mjs';
import 'axios';
import 'https';

const createNoteTool = createTool({
  id: "create-note",
  description: "\u521B\u5EFA\u65B0\u7B14\u8BB0\uFF0C\u652F\u6301Markdown\u683C\u5F0F\u548C\u6807\u7B7E",
  inputSchema: z.object({
    title: z.string().describe("\u7B14\u8BB0\u6807\u9898\uFF0C\u5FC5\u586B"),
    content: z.string().describe("\u7B14\u8BB0\u5185\u5BB9\uFF08\u652F\u6301Markdown\uFF09\uFF0C\u5FC5\u586B"),
    tags: z.array(z.string()).optional().describe("\u6807\u7B7E\u6570\u7EC4"),
    project_uid: z.string().optional().describe("\u9879\u76EEUID"),
    project_id: z.number().optional().describe("\u9879\u76EEID\uFF08\u4E0Eproject_uid\u4E8C\u9009\u4E00\uFF09")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    note: z.object({
      uid: z.string(),
      title: z.string(),
      content: z.string(),
      project_id: z.number().nullable(),
      user_id: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
      tags: z.array(
        z.object({
          name: z.string(),
          uid: z.string()
        })
      )
    }).optional()
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      if (!context.title || !context.content) {
        return {
          success: false,
          message: "\u6807\u9898\u548C\u5185\u5BB9\u4E3A\u5FC5\u586B\u5B57\u6BB5",
          note: void 0
        };
      }
      const data = {
        title: context.title,
        content: context.content
      };
      if (context.tags && context.tags.length > 0) {
        data.tags = context.tags;
      }
      if (context.project_uid) {
        data.project_uid = context.project_uid;
      } else if (context.project_id) {
        data.project_id = context.project_id;
      }
      const result = await apiPost("/api/note", data, getTududiCookie(runtimeContext));
      if (!result.success) {
        return {
          success: false,
          message: `\u521B\u5EFA\u7B14\u8BB0\u5931\u8D25: ${result.error}`,
          note: void 0
        };
      }
      return {
        success: true,
        message: `\u7B14\u8BB0 "${context.title}" \u521B\u5EFA\u6210\u529F`,
        note: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: `\u521B\u5EFA\u7B14\u8BB0\u65F6\u53D1\u751F\u9519\u8BEF: ${error instanceof Error ? error.message : String(error)}`,
        note: void 0
      };
    }
  }
});

export { createNoteTool };
