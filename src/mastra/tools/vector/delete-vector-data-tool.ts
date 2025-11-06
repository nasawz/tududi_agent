import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { deleteDocuments } from "../../vector-store";

export const deleteVectorDataTool = createTool({
  id: "delete-vector-data",
  description: "从向量数据库中删除数据。支持通过文档ID或元数据过滤条件删除指定的向量数据。用于清理过期数据、删除错误索引或根据业务需求移除特定文档。",
  inputSchema: z.object({
    indexName: z.string().describe("向量索引名称，指定要删除数据的索引。常见索引：'notes_embeddings'（笔记索引）、'tasks_embeddings'（任务索引）、'projects_embeddings'（项目索引）、'knowledge_base'（知识库索引）、'inbox_embeddings'（收件箱索引）"),
    ids: z.array(z.string()).optional().describe("要删除的文档ID数组。如果提供，将删除指定ID的文档。优先使用此参数进行精确删除"),
    metadataFilter: z.record(z.string(), z.any()).optional().describe("元数据过滤条件对象，用于根据元数据字段删除文档。例如：{uid: 'xxx'} 删除指定uid的文档，{type: 'note'} 删除所有笔记类型的文档。注意：此操作会删除所有匹配条件的文档，请谨慎使用"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("是否删除成功"),
    indexName: z.string().describe("索引名称"),
    deletedCount: z.number().describe("实际删除的文档数量"),
    message: z.string().describe("操作结果消息"),
  }),
  execute: async ({ context }) => {
    const { indexName, ids, metadataFilter } = context;

    try {
      // 验证输入
      if (!indexName || !indexName.trim()) {
        throw new Error("索引名称不能为空");
      }

      // 至少需要提供 ids 或 metadataFilter 之一
      if ((!ids || ids.length === 0) && (!metadataFilter || Object.keys(metadataFilter).length === 0)) {
        throw new Error("必须提供 ids 或 metadataFilter 参数来指定要删除的文档");
      }

      // 调用向量存储的 deleteDocuments 函数
      const deletedCount = await deleteDocuments(indexName, ids, metadataFilter);

      return {
        success: true,
        indexName,
        deletedCount,
        message: deletedCount > 0 
          ? `成功从索引 ${indexName} 删除 ${deletedCount} 个文档`
          : `索引 ${indexName} 中未找到匹配的文档（可能已经删除或不存在）`,
      };
    } catch (error) {
      console.error("向量数据库删除失败:", error);
      throw new Error(`向量数据库删除失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

