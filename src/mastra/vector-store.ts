import { glmEmbedding, glmEmbedding3Balanced, GLMEmbeddingOptions } from './glm-embedding';
import { PgVector } from "@mastra/pg";
import { getDatabaseConfig } from "./config";
import pg from "pg";

// 创建向量存储实例
const vectorStore = new PgVector(getDatabaseConfig());


// 创建嵌入模型实例 - 默认使用 Embedding-3 平衡版本（1024维）
const embeddingModel = glmEmbedding3Balanced();

/**
 * 获取 PostgreSQL 版本号
 */
async function getPostgresVersion(client: pg.Client): Promise<string | null> {
  try {
    const result = await client.query('SELECT version()');
    const versionMatch = result.rows[0].version.match(/PostgreSQL (\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * 确保 pgvector 扩展已安装
 */
async function ensurePgVectorExtension() {
  const config = getDatabaseConfig();
  const client = new pg.Client(config.connectionString);
  
  try {
    await client.connect();
    
    // 首先检查扩展是否已经存在
    const checkResult = await client.query(
      "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')"
    );
    const exists = checkResult.rows[0].exists;
    
    if (exists) {
      console.log('✅ pgvector 扩展已安装');
      return;
    }
    
    // 尝试创建扩展（如果不存在则创建，如果已存在则忽略）
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('✅ pgvector 扩展已就绪');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ 安装 pgvector 扩展失败:', errorMessage);
    
    // 检测常见错误并提供友好的错误信息
    if (errorMessage.includes('is not available') || errorMessage.includes('could not open extension control file')) {
      // 尝试获取 PostgreSQL 版本以提供更精确的安装命令
      // 如果连接已建立，尝试获取版本号
      let pgVersion: string | null = null;
      try {
        pgVersion = await getPostgresVersion(client);
      } catch {
        // 忽略版本获取错误（可能连接已断开）
      }
      
      const versionSuffix = pgVersion ? ` (检测到 PostgreSQL ${pgVersion})` : '';
      const dockerVersion = pgVersion ? `:pg${pgVersion.split('.')[0]}` : ':pg14';
      const aptVersion = pgVersion ? pgVersion.split('.')[0] : '14';
      
      const helpMessage = `
╔══════════════════════════════════════════════════════════════╗
║  pgvector 扩展未在 PostgreSQL 服务器上安装${versionSuffix}     ║
╚══════════════════════════════════════════════════════════════╝

请先在 PostgreSQL 服务器上安装 pgvector 扩展：

📦 安装方式：

1. Ubuntu/Debian:
   sudo apt-get install postgresql-${aptVersion}-pgvector
   或访问: https://github.com/pgvector/pgvector#installation

2. macOS (使用 Homebrew):
   brew install pgvector

3. Docker (推荐):
   docker pull pgvector/pgvector${dockerVersion}
   或使用官方镜像: docker pull pgvector/pgvector:pg14

4. 从源码编译:
   git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
   cd pgvector
   make
   sudo make install

⚠️  重要提示：
   - 安装后需要重启 PostgreSQL 服务
   - 确保数据库用户有创建扩展的权限：
     GRANT CREATE ON DATABASE your_database TO your_user;
   - 如果使用 Docker，请使用包含 pgvector 的镜像或重新构建镜像

📚 更多信息：https://github.com/pgvector/pgvector
`;
      throw new Error(`安装 pgvector 扩展失败: ${errorMessage}\n${helpMessage}`);
    } else if (errorMessage.includes('permission denied') || errorMessage.includes('must be superuser')) {
      throw new Error(`安装 pgvector 扩展失败: ${errorMessage}\n` +
        `当前数据库用户没有创建扩展的权限。请使用超级用户执行：\n` +
        `GRANT CREATE ON DATABASE your_database TO your_user;`);
    } else {
      throw new Error(`安装 pgvector 扩展失败: ${errorMessage}`);
    }
  } finally {
    await client.end();
  }
}

/**
 * 初始化向量存储索引
 * @param indexName 索引名称
 * @param dimension 向量维度（Embedding-3 默认 1024 维，支持 256-2048）
 */
export async function createVectorIndex(indexName: string, dimension: number = 1024) {
  // 确保 pgvector 扩展已安装
  await ensurePgVectorExtension();
  
  await vectorStore.createIndex({
    indexName,
    dimension,
  });
  console.log(`✅ 创建向量索引: ${indexName}, 维度: ${dimension}`);
}

/**
 * 向向量存储中添加文档
 * @param indexName 索引名称
 * @param texts 文本数组
 * @param metadata 元数据数组
 */
export async function addDocuments(
  indexName: string,
  texts: string[],
  metadata?: Array<Record<string, any>>
) {
  // 生成嵌入向量
  const result = await embeddingModel.doEmbed({ values: texts });

  // 确保每个元数据都包含原始文本
  const finalMetadata = texts.map((text, index) => {
    const baseMetadata = metadata?.[index] || {};
    return {
      ...baseMetadata,
      text, // 始终保存原始文本
    };
  });

  // 存储向量
  await vectorStore.upsert({
    indexName,
    vectors: result.embeddings,
    metadata: finalMetadata,
  });

  console.log(`✅ 添加 ${texts.length} 个文档到索引: ${indexName}`);
}

/**
 * 搜索相似文档
 * @param indexName 索引名称
 * @param query 查询文本
 * @param topK 返回结果数量
 */
export async function searchSimilar(
  indexName: string,
  query: string,
  topK: number = 5
) {
  // 生成查询向量
  const result = await embeddingModel.doEmbed({ values: [query] });
  const queryVector = result.embeddings[0];

  // 搜索相似向量
  const searchResults = await vectorStore.query({
    indexName,
    queryVector,
    topK,
  });

  return searchResults;
}

/**
 * 删除向量存储中的文档
 * @param indexName 索引名称
 * @param ids 要删除的文档ID数组（可选）
 * @param metadataFilter 元数据过滤条件（可选），用于根据元数据字段删除文档
 */
export async function deleteDocuments(
  indexName: string,
  ids?: string[],
  metadataFilter?: Record<string, any>
) {
  const config = getDatabaseConfig();
  const client = new pg.Client(config.connectionString);

  try {
    await client.connect();

    // 检查索引是否存在
    const tableExistsResult = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [indexName]
    );

    if (!tableExistsResult.rows[0].exists) {
      throw new Error(`索引 ${indexName} 不存在`);
    }

    // 转义表名，防止 SQL 注入（使用双引号转义）
    const quotedTableName = `"${indexName.replace(/"/g, '""')}"`;
    let deleteQuery = `DELETE FROM ${quotedTableName}`;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // 如果提供了ID数组，添加ID条件
    if (ids && ids.length > 0) {
      conditions.push(`id = ANY($${paramIndex}::text[])`);
      values.push(ids);
      paramIndex++;
    }

    // 如果提供了元数据过滤条件，添加元数据条件
    if (metadataFilter) {
      for (const [key, value] of Object.entries(metadataFilter)) {
        if (value !== undefined && value !== null) {
          // 使用 JSONB 操作符查询元数据字段，key 也需要参数化
          conditions.push(`metadata->>$${paramIndex} = $${paramIndex + 1}`);
          values.push(key, String(value));
          paramIndex += 2;
        }
      }
    }

    // 如果没有提供任何删除条件，抛出错误
    if (conditions.length === 0) {
      throw new Error("必须提供 ids 或 metadataFilter 参数来指定要删除的文档");
    }

    deleteQuery += ` WHERE ${conditions.join(' AND ')}`;

    const result = await client.query(deleteQuery, values);
    const deletedCount = result.rowCount || 0;

    console.log(`✅ 从索引 ${indexName} 删除 ${deletedCount} 个文档`);
    return deletedCount;
  } catch (error) {
    console.error(`❌ 删除文档失败:`, error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * 创建自定义嵌入模型的向量存储工具
 * @param embeddingOptions 嵌入模型配置
 */
export function createCustomVectorStore(embeddingOptions: GLMEmbeddingOptions) {
  const customEmbeddingModel = glmEmbedding(embeddingOptions);

  return {
    vectorStore,
    embeddingModel: customEmbeddingModel,

    async createIndex(indexName: string, dimension?: number) {
      const defaultDimension = embeddingOptions.dimensions || 1024;
      await createVectorIndex(indexName, dimension || defaultDimension);
    },

    async addDocuments(indexName: string, texts: string[], metadata?: Array<Record<string, any>>) {
      const result = await customEmbeddingModel.doEmbed({ values: texts });

      // 确保每个元数据都包含原始文本
      const finalMetadata = texts.map((text, index) => {
        const baseMetadata = metadata?.[index] || {};
        return {
          ...baseMetadata,
          text, // 始终保存原始文本
        };
      });

      await vectorStore.upsert({
        indexName,
        vectors: result.embeddings,
        metadata: finalMetadata,
      });
      console.log(`✅ 添加 ${texts.length} 个文档到索引: ${indexName}`);
    },

    async searchSimilar(indexName: string, query: string, topK: number = 5) {
      const result = await customEmbeddingModel.doEmbed({ values: [query] });
      const queryVector = result.embeddings[0];
      return await vectorStore.query({
        indexName,
        queryVector,
        topK,
      });
    }
  };
}

/**
 * 高精度向量存储（2048维）
 */
export const highPrecisionVectorStore = createCustomVectorStore({
  modelName: "embedding-3",
  dimensions: 2048
});

/**
 * 高效率向量存储（512维）
 */
export const efficientVectorStore = createCustomVectorStore({
  modelName: "embedding-3",
  dimensions: 512
});

/**
 * 实时应用向量存储（256维）
 */
export const realtimeVectorStore = createCustomVectorStore({
  modelName: "embedding-3",
  dimensions: 256
});

// 导出存储实例和嵌入模型
export { vectorStore, embeddingModel };