import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { listProjectsTool } from "../project/list-projects-tool";

export const analyzeInboxTextTool = createTool({
  id: "analyze-inbox-text",
  description: "智能分析收件箱文本内容，先获取项目列表，然后使用AI分析提取任务名称、截止日期、优先级、标签和项目信息",
  inputSchema: z.object({
    content: z.string().describe("要分析的文本内容，必填"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    analysis: z.object({
      extracted_info: z.object({
        task_name: z.string().optional(),
        due_date: z.string().optional(),
        priority: z.number().optional(),
        tags: z.array(z.string()).optional(),
        project: z.string().nullable().optional(),
      }).optional(),
      confidence: z.number().optional(),
      suggestions: z.array(z.string()).optional(),
    }).optional(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // 验证必需字段
      if (!context.content || context.content.trim() === "") {
        return {
          success: false,
          message: "文本内容为必填字段",
          analysis: undefined,
        };
      }

      // 第一步：获取项目列表
      const projectsResult = await listProjectsTool.execute({
        context: {},
        runtimeContext,
      });

      if (!projectsResult.success || !projectsResult.projects) {
        return {
          success: false,
          message: "获取项目列表失败，无法进行分析",
          analysis: undefined,
        };
      }

      const projects = projectsResult.projects;
      const projectList = projects.map((p: any) => ({
        id: p.id,
        name: p.name,
        uid: p.uid,
        state: p.state,
      }));

      // 第二步：调用AI分析文本
      const apiKey = process.env.ZHIPU_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          message: "ZHIPU_API_KEY 环境变量未设置",
          analysis: undefined,
        };
      }

      // 构建AI提示词
      const prompt = `你是一个智能任务分析助手。请分析以下文本内容，提取任务相关信息。

可用项目列表：
${JSON.stringify(projectList, null, 2)}

待分析文本：
${context.content.trim()}

请分析文本并提取以下信息（如果存在）：
1. task_name: 任务名称（如果有明确的行动项或待办事项）
2. due_date: 截止日期（ISO 8601格式，如：2024-01-20T10:00:00.000Z）
3. priority: 优先级（数值，越小优先级越高，0为最高优先级）
4. tags: 标签数组（从文本中提取的关键词或标签）
5. project: 项目名称或UID（从可用项目列表中选择最匹配的项目，如果没有匹配则返回null）

请以JSON格式返回，格式如下：
{
  "extracted_info": {
    "task_name": "任务名称或null",
    "due_date": "日期字符串或null",
    "priority": 数字或null,
    "tags": ["标签1", "标签2"] 或 [],
    "project": "项目名称或UID或null"
  },
  "confidence": 0.0-1.0之间的数字，表示分析的可信度
}

只返回JSON，不要其他文字说明。`;

      // 调用智谱AI API
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: `AI分析失败: ${errorData.error?.message || response.statusText}`,
          analysis: undefined,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          message: "AI返回内容为空",
          analysis: undefined,
        };
      }

      // 解析AI返回的JSON
      let analysisResult;
      try {
        // 尝试提取JSON（可能包含markdown代码块）
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        analysisResult = JSON.parse(jsonStr);
      } catch (parseError) {
        return {
          success: false,
          message: `解析AI返回结果失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          analysis: undefined,
        };
      }

      // 验证并规范化返回结果
      const extractedInfo = analysisResult.extracted_info || {};
      const normalizedResult = {
        extracted_info: {
          task_name: extractedInfo.task_name || null,
          due_date: extractedInfo.due_date || null,
          priority: typeof extractedInfo.priority === 'number' ? extractedInfo.priority : null,
          tags: Array.isArray(extractedInfo.tags) ? extractedInfo.tags : [],
          project: extractedInfo.project || null,
        },
        confidence: typeof analysisResult.confidence === 'number' 
          ? Math.max(0, Math.min(1, analysisResult.confidence)) 
          : 0.5,
        suggestions: Array.isArray(analysisResult.suggestions) ? analysisResult.suggestions : [],
      };

      return {
        success: true,
        message: "文本分析完成",
        analysis: normalizedResult,
      };
    } catch (error) {
      return {
        success: false,
        message: `文本分析时发生错误: ${error instanceof Error ? error.message : String(error)}`,
        analysis: undefined,
      };
    }
  },
});

