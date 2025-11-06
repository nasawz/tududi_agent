import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { searchSimilar } from "../../vector-store";

export const searchVectorDataTool = createTool({
  id: "search-vector-data",
  description: "在向量数据库中搜索相似的文档。根据查询文本找到最相似的向量数据。支持Tududi系统的笔记、任务、项目等内容的语义搜索和相似度匹配。",
  inputSchema: z.object({
    indexName: z.string().describe("向量索引名称，指定要搜索的索引。常见索引：'notes_embeddings'（笔记搜索）、'tasks_embeddings'（任务搜索）、'projects_embeddings'（项目搜索）、'knowledge_base'（知识库搜索）、'inbox_embeddings'（收件箱搜索）"),
    query: z.string().describe("查询文本，将被转换为向量进行相似性搜索。使用自然语言描述搜索意图，包含关键概念和上下文"),
    topK: z.number().optional().default(5).describe("返回的结果数量，默认为5。精确搜索建议3-5个，广泛探索建议10-20个，去重检测可以设置更多"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("是否搜索成功"),
    indexName: z.string().describe("索引名称"),
    query: z.string().describe("查询文本"),
    results: z.array(z.object({
      id: z.string().describe("文档ID"),
      score: z.number().describe("相似度分数，越高越相似"),
      metadata: z.record(z.string(), z.any()).describe("文档的元数据信息"),
    })).describe("搜索结果数组，按相似度从高到低排序"),
    total: z.number().describe("返回的结果数量"),
    message: z.string().describe("操作结果消息"),
  }),
  execute: async ({ context }) => {
    const { indexName, query, topK = 5 } = context;

    try {
      // 验证输入
      if (!indexName || !indexName.trim()) {
        throw new Error("索引名称不能为空");
      }

      if (!query || !query.trim()) {
        throw new Error("查询文本不能为空");
      }

      if (topK <= 0) {
        throw new Error("返回结果数量必须大于0");
      }

      // 调用向量存储的 searchSimilar 函数
      const searchResults = await searchSimilar(indexName, query, topK);

      // 转换结果格式
      const results = searchResults.map((result: any) => ({
        id: result.id || result._id || "",
        score: result.score || result.similarity || 0,
        metadata: result.metadata || {},
      }));

      return {
        success: true,
        indexName,
        query,
        results,
        total: results.length,
        message: `在索引 ${indexName} 中找到 ${results.length} 个相似结果`,
      };
    } catch (error) {
      console.error("向量数据库搜索失败:", error);
      throw new Error(`向量数据库搜索失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
