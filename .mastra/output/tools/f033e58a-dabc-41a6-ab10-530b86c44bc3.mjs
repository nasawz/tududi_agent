import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { b as apiDelete, g as getTududiCookie } from '../types.mjs';
import 'axios';
import 'https';

const deleteNoteTool = createTool({
  id: "delete-note",
  description: "\u5220\u9664\u7B14\u8BB0\uFF08\u6C38\u4E45\u5220\u9664\uFF09",
  inputSchema: z.object({
    uid: z.string().describe("\u7B14\u8BB0\u7684\u552F\u4E00\u6807\u8BC6\u7B26\uFF0C\u5FC5\u586B")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    deleted: z.boolean().optional()
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      if (!context.uid) {
        return {
          success: false,
          message: "\u7B14\u8BB0UID\u4E3A\u5FC5\u586B\u5B57\u6BB5",
          deleted: false
        };
      }
      const result = await apiDelete(`/api/note/${context.uid}`, getTududiCookie(runtimeContext));
      if (!result.success) {
        return {
          success: false,
          message: `\u5220\u9664\u7B14\u8BB0\u5931\u8D25: ${result.error}`,
          deleted: false
        };
      }
      return {
        success: true,
        message: `\u7B14\u8BB0 "${context.uid}" \u5DF2\u6210\u529F\u5220\u9664`,
        deleted: true
      };
    } catch (error) {
      return {
        success: false,
        message: `\u5220\u9664\u7B14\u8BB0\u65F6\u53D1\u751F\u9519\u8BEF: ${error instanceof Error ? error.message : String(error)}`,
        deleted: false
      };
    }
  }
});

export { deleteNoteTool };
