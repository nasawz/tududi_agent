import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { addDocuments, createVectorIndex } from "../../vector-store";

export const addVectorDataTool = createTool({
  id: "add-vector-data",
  description: "向向量数据库中写入数据。可以将文本数据转换为向量并存储到指定的索引中。如果索引不存在，会自动创建索引后再写入数据。支持Tududi系统的笔记、任务、项目等内容索引。",
  inputSchema: z.object({
    indexName: z.string().describe("向量索引名称，用于标识存储位置。建议使用：'notes_embeddings'、'tasks_embeddings'、'projects_embeddings'、'knowledge_base'、'inbox_embeddings'"),
    texts: z.array(z.string()).describe("要写入的文本数组，每个文本将被转换为向量。可以是笔记内容、任务描述、项目描述等"),
    metadata: z.array(z.record(z.string(), z.any())).optional().describe("可选的元数据数组，每个对象对应一个文本的元数据信息。建议包含：uid（实体唯一标识）、type（数据类型）、project_id（项目ID）、tags（标签数组）、created_at（创建时间）等"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("是否写入成功"),
    indexName: z.string().describe("索引名称"),
    count: z.number().describe("写入的文档数量"),
    message: z.string().describe("操作结果消息"),
  }),
  execute: async ({ context }) => {
    const { indexName, texts, metadata } = context;

    try {
      // 验证输入
      if (!indexName || !indexName.trim()) {
        throw new Error("索引名称不能为空");
      }

      if (!texts || texts.length === 0) {
        throw new Error("文本数组不能为空");
      }

      // 验证元数据数组长度是否匹配（如果提供了元数据）
      if (metadata && metadata.length !== texts.length) {
        throw new Error(`元数据数组长度(${metadata.length})与文本数组长度(${texts.length})不匹配`);
      }

      let message = "";
      let indexCreated = false;

      try {
        // 首先尝试直接写入数据
        await addDocuments(indexName, texts, metadata);
        message = `成功向索引 ${indexName} 写入 ${texts.length} 个文档`;
      } catch (firstError) {
        // 如果写入失败，可能是因为索引不存在，尝试创建索引
        console.log(`首次写入失败，尝试创建索引 ${indexName}:`, firstError);
        
        try {
          // 创建索引（使用默认1024维度）
          await createVectorIndex(indexName, 1024);
          indexCreated = true;
          
          // 重新尝试写入数据
          await addDocuments(indexName, texts, metadata);
          message = `创建索引 ${indexName} 后成功写入 ${texts.length} 个文档`;
        } catch (secondError) {
          // 如果创建索引后仍然失败，抛出错误
          throw new Error(`创建索引后写入仍然失败: ${secondError instanceof Error ? secondError.message : String(secondError)}`);
        }
      }

      return {
        success: true,
        indexName,
        count: texts.length,
        message: indexCreated ? `${message}（自动创建了索引）` : message,
      };
    } catch (error) {
      console.error("向向量数据库写入数据失败:", error);
      throw new Error(`向向量数据库写入数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

