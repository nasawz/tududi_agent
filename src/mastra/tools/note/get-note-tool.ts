import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { apiGet } from "../../lib/api-client";
import { getTududiCookie } from "../../types";

export const getNoteTool = createTool({
  id: "get-note",
  description: "根据UID获取笔记详情",
  inputSchema: z.object({
    uid: z.string().describe("笔记的唯一标识符"),
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
          uid: z.string(),
        })
      ),
      Project: z.object({
        name: z.string(),
        uid: z.string(),
      }).nullable(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const result = await apiGet(`/api/note/${context.uid}`, undefined, getTududiCookie(runtimeContext));

      if (!result.success) {
        return {
          success: false,
          message: `获取笔记详情失败: ${result.error}`,
          note: undefined,
        };
      }

      return {
        success: true,
        message: "笔记详情获取成功",
        note: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取笔记详情时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        note: undefined,
      };
    }
  },
});
