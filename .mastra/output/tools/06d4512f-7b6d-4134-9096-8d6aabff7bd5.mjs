import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { c as apiGet, g as getTududiCookie } from '../types.mjs';
import 'axios';
import 'https';

const getNoteTool = createTool({
  id: "get-note",
  description: "\u6839\u636EUID\u83B7\u53D6\u7B14\u8BB0\u8BE6\u60C5",
  inputSchema: z.object({
    uid: z.string().describe("\u7B14\u8BB0\u7684\u552F\u4E00\u6807\u8BC6\u7B26")
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
      ),
      Project: z.object({
        name: z.string(),
        uid: z.string()
      }).nullable()
    }).optional()
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const result = await apiGet(`/api/note/${context.uid}`, void 0, getTududiCookie(runtimeContext));
      if (!result.success) {
        return {
          success: false,
          message: `\u83B7\u53D6\u7B14\u8BB0\u8BE6\u60C5\u5931\u8D25: ${result.error}`,
          note: void 0
        };
      }
      return {
        success: true,
        message: "\u7B14\u8BB0\u8BE6\u60C5\u83B7\u53D6\u6210\u529F",
        note: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: `\u83B7\u53D6\u7B14\u8BB0\u8BE6\u60C5\u65F6\u53D1\u751F\u9519\u8BEF: ${error instanceof Error ? error.message : String(error)}`,
        note: void 0
      };
    }
  }
});

export { getNoteTool };
