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
import { ultraPureAgent } from "./agents/ultra-pure-agent";
import { vectorWriterAgent } from "./agents/vector-writer-agent";
import { vectorSearcherAgent } from "./agents/vector-searcher-agent";
import { processInboxItemWorkflow } from "./workflows/process-inbox-item-workflow";
import parallelDemoWorkflow from "./workflows/parallel-demo-workflow";
import { numberGuessingWorkflow } from "./workflows/number-guessing-workflow";
import { passwordStrengthWorkflow } from "./workflows/password-strength-workflow";
import { batchDocumentProcessorWorkflow } from "./workflows/batch-document-processor-workflow";
import { completenessScorer, operationAccuracyScorer, responseQualityScorer, toolSelectionScorer } from "./scorers/ultra-pure-agent-scorer";

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
    superAgent,
    ultraPureAgent
  },
  workflows: {
    processInboxItemWorkflow,
    parallelDemoWorkflow,
    numberGuessingWorkflow,
    passwordStrengthWorkflow,
    batchDocumentProcessorWorkflow
  },
  storage: storage,
  scorers: {
    completenessScorer,
    toolSelectionScorer,
    operationAccuracyScorer,
    responseQualityScorer,
  },
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