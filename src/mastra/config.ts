/**
 * Mastra 配置
 * 统一管理数据库连接等配置信息
 */

export const getDatabaseConfig = () => ({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_CONNECTION_STRING || "postgresql://postgres:password@localhost:5432/tududi",
});

