import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from '@mastra/loggers';
import { storage } from "./storage";
import { notesManagerAgent } from "./agents/notes-manager-agent";
import { tagsManagerAgent } from "./agents/tags-manager-agent";
import { areasManagerAgent } from "./agents/areas-manager-agent";
import { projectsManagerAgent } from "./agents/projects-manager-agent";
import { tasksManagerAgent } from "./agents/tasks-manager-agent";
import { inboxManagerAgent } from "./agents/inbox-manager-agent";
import { searchManagerAgent } from "./agents/search-manager-agent";
import { superAgent } from "./agents/super-agent";
import { vectorWriterAgent } from "./agents/vector-writer-agent";
import { vectorSearcherAgent } from "./agents/vector-searcher-agent";
import { processInboxItemWorkflow } from "./workflows/process-inbox-item-workflow";

export const mastra = new Mastra({
  agents: {
    vectorWriterAgent,
    vectorSearcherAgent,
    notesManagerAgent,
    tagsManagerAgent,
    areasManagerAgent,
    projectsManagerAgent,
    tasksManagerAgent,
    inboxManagerAgent,
    searchManagerAgent,
    superAgent
  },
  workflows: {
    processInboxItemWorkflow,
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