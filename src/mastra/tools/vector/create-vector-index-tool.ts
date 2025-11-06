import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createVectorIndex } from "../../vector-store";

export const createVectorIndexTool = createTool({
  id: "create-vector-index",
  description: "创建新的向量索引。在向量数据库中创建一个新的索引表，用于存储和搜索向量数据。支持Tududi系统的笔记、任务、项目等内容的语义搜索。",
  inputSchema: z.object({
    indexName: z.string().describe("索引名称，用于标识向量索引。建议使用以下命名规范：'notes_embeddings'（笔记索引）、'tasks_embeddings'（任务索引）、'projects_embeddings'（项目索引）、'knowledge_base'（知识库）、'inbox_embeddings'（收件箱索引）"),
    dimension: z.number().optional().default(1024).describe("向量维度，默认1024维（适用于 Embedding-3 平衡版本）。支持范围：256-2048。1024维适合大多数场景，2048维适合高精度场景，512/256维适合高性能场景"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("是否创建成功"),
    indexName: z.string().describe("索引名称"),
    dimension: z.number().describe("向量维度"),
    message: z.string().describe("操作结果消息"),
  }),
  execute: async ({ context }) => {
    const { indexName, dimension = 1024 } = context;

    try {
      // 验证输入
      if (!indexName || !indexName.trim()) {
        throw new Error("索引名称不能为空");
      }

      // 验证维度范围
      if (dimension < 256 || dimension > 2048) {
        throw new Error("向量维度必须在 256-2048 之间");
      }

      // 调用向量存储的 createVectorIndex 函数
      await createVectorIndex(indexName, dimension);

      return {
        success: true,
        indexName,
        dimension,
        message: `成功创建向量索引 ${indexName}，维度: ${dimension}`,
      };
    } catch (error) {
      console.error("创建向量索引失败:", error);
      throw new Error(`创建向量索引失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
