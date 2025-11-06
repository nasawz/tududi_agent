import { PostgresStore } from "@mastra/pg";
import { getDatabaseConfig } from "./config";

export const storage = new PostgresStore(getDatabaseConfig());

