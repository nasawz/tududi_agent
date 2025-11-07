import { createWorkflow, createStep, mapVariable } from "@mastra/core/workflows";
import { z } from "zod";
import { getInboxItemTool } from "../tools/inbox/get-inbox-item-tool";
import { analyzeInboxTextTool } from "../tools/inbox/analyze-inbox-text-tool";
import { createTaskTool } from "../tools/task/create-task-tool";
import { createNoteTool } from "../tools/note/create-note-tool";
import { processInboxItemTool } from "../tools/inbox/process-inbox-item-tool";

// 定义工作流输入 schema
const inputSchema = z.object({
  uid: z.string().describe("收件箱项目UID，必填"),
});

// 定义工作流输出 schema
const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  inboxItem: z.object({
    uid: z.string(),
    content: z.string(),
    status: z.string(),
  }).optional(),
  createdItem: z.object({
    type: z.enum(["task", "note"]),
    data: z.any(),
  }).optional(),
});

// 创建步骤：获取收件箱项目并增强内容
const getInboxItemStep = createStep({
  id: "get-inbox-item",
  description: "获取收件箱项目详情并使用AI增强内容",
  inputSchema: inputSchema,
  outputSchema: z.object({
    inboxItem: z.object({
      uid: z.string(),
      content: z.string(),
      status: z.string(),
      source: z.string(),
    }),
    content: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const result = await getInboxItemTool.execute({
      context: { uid: inputData.uid },
      runtimeContext,
    });

    if (!result.success || !result.item) {
      throw new Error(result.message || "获取收件箱项目失败");
    }

    const originalContent = result.item.content;
    let enhancedContent = originalContent;

    // 使用AI增强内容
    try {
      const apiKey = process.env.ZHIPU_API_KEY;
      if (apiKey && originalContent && originalContent.trim()) {
        const prompt = `你是一个文本内容增强助手。请对以下收件箱文本内容进行智能增强处理。

原始文本：
${originalContent.trim()}

请对文本进行以下增强处理：
1. 清理和格式化：去除多余的空格、换行，统一格式
2. 补充上下文：如果文本不完整或缺少关键信息，尝试补充合理的上下文
3. 改善可读性：优化文本结构，使其更清晰易读
4. 提取关键信息：识别并突出重要信息
5. 保持原意：确保增强后的文本保持原始意图和核心信息

请直接返回增强后的文本内容，不要添加任何说明或标记。如果原始文本已经很完善，可以只做轻微优化。`;

        const response = await fetch(
          "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "glm-4",
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.3,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const aiContent = data.choices?.[0]?.message?.content;
          if (aiContent && aiContent.trim()) {
            enhancedContent = aiContent.trim();
          }
        }
      }
    } catch (error) {
      // AI增强失败时，使用原始内容，不影响主流程
      console.warn("AI内容增强失败，使用原始内容:", error);
    }

    return {
      inboxItem: {
        ...result.item,
        content: enhancedContent,
      },
      content: enhancedContent,
    };
  },
});

export const processInboxItemWorkflow = createWorkflow({
  id: "process-inbox-item",
  description: "处理收件箱项目：分析文本内容，根据分析结果创建任务或笔记，然后标记为已处理",
  inputSchema,
  outputSchema,
})
  .then(getInboxItemStep)
  .map({
    content: mapVariable({ step: getInboxItemStep, path: "content" }),
  })
  .then(
    createStep({
      id: "analyze-text",
      description: "分析收件箱项目文本内容",
      inputSchema: z.object({
        content: z.string(),
      }),
      outputSchema: z.object({
        analysis: z.any(),
        extractedInfo: z.object({
          task_name: z.string().optional(),
          due_date: z.string().optional(),
          priority: z.number().optional(),
          tags: z.array(z.string()).optional(),
          project: z.string().nullable().optional(),
        }).optional(),
      }),
      execute: async ({ inputData, runtimeContext }) => {
        const result = await analyzeInboxTextTool.execute({
          context: { content: inputData.content },
          runtimeContext,
        });

        if (!result.success || !result.analysis) {
          throw new Error(result.message || "文本分析失败");
        }

        return {
          analysis: result.analysis,
          extractedInfo: result.analysis.extracted_info,
        };
      },
    })
  )
  .branch([
    [
      async ({ getStepResult }) => {
        const extractedInfo = getStepResult("analyze-text").extractedInfo;
        return !!extractedInfo?.task_name;
      },
      createStep({
        id: "create-task",
        description: "根据分析结果创建任务",
        inputSchema: z.object({
          analysis: z.any(),
          extractedInfo: z.object({
            task_name: z.string().optional(),
            due_date: z.string().optional(),
            priority: z.number().optional(),
            tags: z.array(z.string()).optional(),
            project: z.string().nullable().optional(),
          }).optional(),
        }),
        outputSchema: z.object({
          createdItem: z.object({
            type: z.literal("task"),
            data: z.any(),
          }),
        }),
        execute: async ({ runtimeContext, getStepResult }) => {
          const extractedInfo = getStepResult("analyze-text").extractedInfo;
          const inboxItem = getStepResult("get-inbox-item").inboxItem;

          if (!extractedInfo?.task_name) {
            throw new Error("未找到任务名称，无法创建任务");
          }

          const taskData: any = {
            name: extractedInfo.task_name,
          };

          if (inboxItem.content) {
            taskData.description = inboxItem.content;
          }

          if (extractedInfo.priority !== undefined && extractedInfo.priority !== null && typeof extractedInfo.priority === 'number') {
            taskData.priority = extractedInfo.priority;
          }

          if (extractedInfo.due_date && typeof extractedInfo.due_date === 'string') {
            taskData.due_date = extractedInfo.due_date;
          }

          const result = await createTaskTool.execute({
            context: taskData,
            runtimeContext,
          });

          if (!result.success) {
            throw new Error(result.message || "创建任务失败");
          }

          return {
            createdItem: {
              type: "task" as const,
              data: result.task,
            },
          };
        },
      }),
    ],
    [
      async () => true,
      createStep({
        id: "create-note",
        description: "根据分析结果创建笔记",
        inputSchema: z.object({
          analysis: z.any(),
          extractedInfo: z.object({
            task_name: z.string().optional(),
            due_date: z.string().optional(),
            priority: z.number().optional(),
            tags: z.array(z.string()).optional(),
            project: z.string().nullable().optional(),
          }).optional(),
        }),
        outputSchema: z.object({
          createdItem: z.object({
            type: z.literal("note"),
            data: z.any(),
          }),
        }),
        execute: async ({ runtimeContext, getStepResult }) => {
          const extractedInfo = getStepResult("analyze-text").extractedInfo;
          const inboxItem = getStepResult("get-inbox-item").inboxItem;

          const noteTitle = extractedInfo?.task_name || inboxItem.content.substring(0, 50) || "新笔记";
          const noteContent = inboxItem.content;

          const noteData: any = {
            title: noteTitle,
            content: noteContent,
          };

          if (extractedInfo?.tags && extractedInfo.tags.length > 0) {
            noteData.tags = extractedInfo.tags;
          }

          const result = await createNoteTool.execute({
            context: noteData,
            runtimeContext,
          });

          if (!result.success || !result.note) {
            throw new Error(result.message || "创建笔记失败");
          }

          return {
            createdItem: {
              type: "note" as const,
              data: result.note,
            },
          };
        },
      }),
    ],
  ])
  .map({
    inboxItemUid: mapVariable({ step: getInboxItemStep, path: "inboxItem.uid" }),
  })
  .then(
    createStep({
      id: "process-inbox-item",
      description: "标记收件箱项目为已处理",
      inputSchema: z.object({
        inboxItemUid: z.string(),
      }),
      outputSchema: z.object({
        processed: z.boolean(),
        processedItem: z.any().optional(),
      }),
      execute: async ({ inputData, runtimeContext }) => {
        const result = await processInboxItemTool.execute({
          context: { uid: inputData.inboxItemUid },
          runtimeContext,
        });

        return {
          processed: result.success,
          processedItem: result.item,
        };
      },
    })
  )
  .then(
    createStep({
      id: "finalize",
      description: "汇总工作流执行结果",
      inputSchema: z.object({
        processed: z.boolean(),
        processedItem: z.any().optional(),
      }),
      outputSchema: outputSchema,
      execute: async ({ getStepResult }) => {
        const inboxItem = getStepResult("get-inbox-item").inboxItem;
        const branchResult = getStepResult("create-task") || getStepResult("create-note");
        const processed = getStepResult("process-inbox-item").processed;

        const createdItem = branchResult?.createdItem || {
          type: "note" as const,
          data: null,
        };

        return {
          success: true,
          message: `收件箱项目处理完成：已创建${createdItem.type === "task" ? "任务" : "笔记"}，${processed ? "已标记为已处理" : "标记处理状态时出现问题"}`,
          inboxItem: {
            uid: inboxItem.uid,
            content: inboxItem.content,
            status: processed ? "processed" : inboxItem.status,
          },
          createdItem,
        };
      },
    })
  )
  .commit();
