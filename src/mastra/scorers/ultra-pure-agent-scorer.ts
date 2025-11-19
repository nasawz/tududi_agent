import { z } from 'zod';
import { createCompletenessScorer } from '@mastra/evals/scorers/code';
import { createScorer } from '@mastra/core/scores';

// 完整性评分器 - 检查响应是否完整
export const completenessScorer = createCompletenessScorer();

// 工具选择评分器 - 评估是否选择了正确的工具类别
export const toolSelectionScorer = createScorer({
  name: 'Tool Selection Quality',
  description:
    '评估 agent 是否根据用户请求选择了正确的工具类别（笔记、任务、项目等）',
  type: 'agent',
  judge: {
    model: 'zhipuai/glm-4.6',
    instructions:
      '你是一个评估任务管理系统工具使用质量的专家。' +
      '判断 agent 是否根据用户的请求选择了正确的工具类别。' +
      '例如：用户想要创建笔记，应该使用笔记工具；用户想要创建任务，应该使用任务工具。' +
      '只返回符合提供的 schema 的结构化 JSON。',
  },
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || '';
    const assistantText = (run.output?.[0]?.content as string) || '';
    // 尝试从输出中提取工具调用信息
    const outputData = run.output?.[0] || {};
    const toolInfo = JSON.stringify(outputData);
    return { userText, assistantText, toolInfo };
  })
  .analyze({
    description: '分析用户意图和工具选择的匹配度',
    outputSchema: z.object({
      userIntent: z.string().describe('用户的主要意图'),
      toolsUsed: z.array(z.string()).describe('使用的工具名称列表'),
      appropriateSelection: z.boolean().describe('工具选择是否恰当'),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
你正在评估一个任务管理助手的工具选择质量。

用户请求：
"""
${results.preprocessStepResult.userText}
"""

助手响应：
"""
${results.preprocessStepResult.assistantText}
"""

输出信息（包含工具调用）：
"""
${results.preprocessStepResult.toolInfo}
"""

任务：
1) 分析用户的主要意图（创建笔记、创建任务、查询项目、搜索等）
2) 从输出信息中识别助手使用了哪些工具
3) 判断工具选择是否恰当匹配用户意图
4) 评估选择的置信度

返回 JSON 格式：
{
  "userIntent": "用户意图描述",
  "toolsUsed": ["工具1", "工具2"],
  "appropriateSelection": true/false,
  "confidence": 0-1,
  "explanation": "说明"
}
        `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    if (r.appropriateSelection) {
      return Math.max(0, Math.min(1, 0.8 + 0.2 * (r.confidence ?? 1)));
    }
    return Math.max(0, 0.3 * (r.confidence ?? 0)); // 选择不当但有部分相关性
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `工具选择评分: 用户意图=${r.userIntent ?? '未识别'}, 工具选择恰当=${r.appropriateSelection ?? false}, 置信度=${r.confidence ?? 0}. 得分=${score}. ${r.explanation ?? ''}`;
  });

// 操作准确性评分器 - 评估操作是否正确执行
export const operationAccuracyScorer = createScorer({
  name: 'Operation Accuracy',
  description:
    '评估操作是否准确执行，包括参数正确性、操作类型匹配等',
  type: 'agent',
  judge: {
    model: 'zhipuai/glm-4.6',
    instructions:
      '你是一个评估操作准确性的专家。' +
      '判断 agent 执行的操作是否准确，参数是否正确，操作结果是否符合预期。' +
      '只返回符合提供的 schema 的结构化 JSON。',
  },
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || '';
    const assistantText = (run.output?.[0]?.content as string) || '';
    // 尝试从输出中提取工具调用信息
    const outputData = run.output?.[0] || {};
    const toolInfo = JSON.stringify(outputData);
    return { userText, assistantText, toolInfo };
  })
  .analyze({
    description: '分析操作的准确性',
    outputSchema: z.object({
      operationType: z.string().describe('操作类型：查询、创建、更新、删除等'),
      parametersCorrect: z.boolean().describe('参数是否正确'),
      operationComplete: z.boolean().describe('操作是否完整执行'),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
你正在评估一个任务管理助手的操作准确性。

用户请求：
"""
${results.preprocessStepResult.userText}
"""

助手响应：
"""
${results.preprocessStepResult.assistantText}
"""

输出信息（包含工具调用）：
"""
${results.preprocessStepResult.toolInfo}
"""

任务：
1) 识别操作类型（查询、创建、更新、删除、搜索等）
2) 检查提供的参数是否正确和完整
3) 判断操作是否完整执行
4) 评估准确度的置信度

返回 JSON 格式：
{
  "operationType": "操作类型",
  "parametersCorrect": true/false,
  "operationComplete": true/false,
  "confidence": 0-1,
  "explanation": "说明"
}
        `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    let score = 0;
    
    if (r.parametersCorrect && r.operationComplete) {
      score = Math.max(0, Math.min(1, 0.9 + 0.1 * (r.confidence ?? 1)));
    } else if (r.parametersCorrect || r.operationComplete) {
      score = Math.max(0, Math.min(1, 0.5 + 0.3 * (r.confidence ?? 1)));
    } else {
      score = Math.max(0, 0.2 * (r.confidence ?? 0));
    }
    
    return score;
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `操作准确性评分: 操作类型=${r.operationType ?? '未识别'}, 参数正确=${r.parametersCorrect ?? false}, 操作完整=${r.operationComplete ?? false}, 置信度=${r.confidence ?? 0}. 得分=${score}. ${r.explanation ?? ''}`;
  });

// 响应质量评分器 - 评估响应的友好性和信息量
export const responseQualityScorer = createScorer({
  name: 'Response Quality',
  description:
    '评估 agent 响应的质量，包括是否友好、信息是否充分、格式是否清晰',
  type: 'agent',
  judge: {
    model: 'zhipuai/glm-4.6',
    instructions:
      '你是一个评估对话质量的专家。' +
      '判断 agent 的响应是否友好、信息是否充分、格式是否清晰易读。' +
      '只返回符合提供的 schema 的结构化 JSON。',
  },
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || '';
    const assistantText = (run.output?.[0]?.content as string) || '';
    return { userText, assistantText };
  })
  .analyze({
    description: '分析响应质量',
    outputSchema: z.object({
      friendly: z.boolean().describe('响应是否友好'),
      informative: z.boolean().describe('信息是否充分'),
      wellFormatted: z.boolean().describe('格式是否清晰'),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
你正在评估一个任务管理助手的响应质量。

用户请求：
"""
${results.preprocessStepResult.userText}
"""

助手响应：
"""
${results.preprocessStepResult.assistantText}
"""

任务：
1) 判断响应是否友好、礼貌
2) 评估信息是否充分回答了用户问题
3) 检查格式是否清晰、易读（是否使用了适当的结构化格式）
4) 评估整体质量的置信度

返回 JSON 格式：
{
  "friendly": true/false,
  "informative": true/false,
  "wellFormatted": true/false,
  "confidence": 0-1,
  "explanation": "说明"
}
        `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    let score = 0;
    const positiveCount = [r.friendly, r.informative, r.wellFormatted].filter(Boolean).length;
    
    score = (positiveCount / 3) * (0.7 + 0.3 * (r.confidence ?? 1));
    
    return Math.max(0, Math.min(1, score));
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `响应质量评分: 友好=${r.friendly ?? false}, 信息充分=${r.informative ?? false}, 格式清晰=${r.wellFormatted ?? false}, 置信度=${r.confidence ?? 0}. 得分=${score}. ${r.explanation ?? ''}`;
  });

export const scorers = {
  completenessScorer,
  toolSelectionScorer,
  operationAccuracyScorer,
  responseQualityScorer,
};

