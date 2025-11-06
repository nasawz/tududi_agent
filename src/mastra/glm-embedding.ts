import { EmbeddingModel } from "ai";

interface ZhipuEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

interface ZhipuErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface GLMEmbeddingOptions {
  modelName?: string;
  dimensions?: number; // Embedding-3 支持自定义维度 (256-2048)
}

/**
 * 创建智谱AI嵌入模型实例
 * @param options 配置选项
 * @param options.modelName 模型名称，如 "embedding-2" 或 "embedding-3"
 * @param options.dimensions 向量维度，仅 embedding-3 支持 (256-2048)
 * @returns EmbeddingModel 实例
 */
export function glmEmbedding(options: GLMEmbeddingOptions | string = {}): EmbeddingModel<string> {
  // 兼容旧的字符串参数格式
  const config: GLMEmbeddingOptions = typeof options === 'string' 
    ? { modelName: options } 
    : options;
  
  const modelName = config.modelName || "embedding-3"; // 默认使用 embedding-3
  const dimensions = config.dimensions;
  return {
    provider: "zhipuai",
    modelId: modelName,
    specificationVersion: "v1",
    maxEmbeddingsPerCall: 64, // Embedding-3 单次最多64条文本
    supportsParallelCalls: true,

    async doEmbed({ values }) {
      // 验证 Embedding-3 的维度参数
      if (modelName === "embedding-3" && dimensions) {
        if (dimensions < 256 || dimensions > 2048) {
          throw new Error("Embedding-3 的维度必须在 256-2048 之间");
        }
      }
      // 检查 API Key
      const apiKey = process.env.ZHIPU_API_KEY;
      if (!apiKey) {
        throw new Error("ZHIPU_API_KEY 环境变量未设置");
      }

      // 检查输入
      if (!values || values.length === 0) {
        throw new Error("输入文本不能为空");
      }

      try {
        const res = await fetch(
          "https://open.bigmodel.cn/api/paas/v4/embeddings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: modelName,
              input: values,
              ...(dimensions && { dimensions }), // 仅在指定维度时添加此参数
            }),
          }
        );

        if (!res.ok) {
          const errorData: ZhipuErrorResponse = await res.json();
          throw new Error(
            `智谱AI API 错误 (${res.status}): ${errorData.error?.message || "未知错误"}`
          );
        }

        const data: ZhipuEmbeddingResponse = await res.json();

        if (!data?.data || !Array.isArray(data.data)) {
          throw new Error("智谱AI 返回的数据格式无效");
        }

        // 验证返回的嵌入向量数量是否与输入匹配
        if (data.data.length !== values.length) {
          throw new Error(
            `返回的嵌入向量数量 (${data.data.length}) 与输入文本数量 (${values.length}) 不匹配`
          );
        }

        return {
          embeddings: data.data
            .sort((a, b) => a.index - b.index) // 按索引排序确保顺序正确
            .map((item) => item.embedding),
        };
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`嵌入向量生成失败: ${String(error)}`);
      }
    },
  };
}

/**
 * 创建 Embedding-2 模型实例（1024维）
 */
export function glmEmbedding2(): EmbeddingModel<string> {
  return glmEmbedding({ modelName: "embedding-2" });
}

/**
 * 创建 Embedding-3 模型实例（默认2048维）
 */
export function glmEmbedding3(dimensions?: number): EmbeddingModel<string> {
  return glmEmbedding({ modelName: "embedding-3", dimensions });
}

/**
 * 创建高精度 Embedding-3 模型实例（2048维）
 */
export function glmEmbedding3HighPrecision(): EmbeddingModel<string> {
  return glmEmbedding({ modelName: "embedding-3", dimensions: 2048 });
}

/**
 * 创建平衡性能 Embedding-3 模型实例（1024维）
 */
export function glmEmbedding3Balanced(): EmbeddingModel<string> {
  return glmEmbedding({ modelName: "embedding-3", dimensions: 1024 });
}

/**
 * 创建高效率 Embedding-3 模型实例（512维）
 */
export function glmEmbedding3Efficient(): EmbeddingModel<string> {
  return glmEmbedding({ modelName: "embedding-3", dimensions: 512 });
}

/**
 * 创建实时应用 Embedding-3 模型实例（256维）
 */
export function glmEmbedding3Realtime(): EmbeddingModel<string> {
  return glmEmbedding({ modelName: "embedding-3", dimensions: 256 });
}
