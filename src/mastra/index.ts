import { Mastra } from "@mastra/core/mastra";
import { PostgresStore } from "@mastra/pg";
import { PinoLogger } from '@mastra/loggers';
import { getDatabaseConfig } from "./config";
import { notesManagerAgent } from "./agents/notes-manager-agent";
import { tagsManagerAgent } from "./agents/tags-manager-agent";
import { areasManagerAgent } from "./agents/areas-manager-agent";

const storage = new PostgresStore(getDatabaseConfig());

export const mastra = new Mastra({
  agents: { notesManagerAgent, tagsManagerAgent, areasManagerAgent },
  workflows: {

  },
  storage: storage,
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false,
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
});