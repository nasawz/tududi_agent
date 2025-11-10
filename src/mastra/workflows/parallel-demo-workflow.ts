import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

// 定义工作流输入 schema - 用户数据处理
const inputSchema = z.object({
  userData: z.object({
    name: z.string().describe("用户姓名"),
    email: z.string().describe("用户邮箱"),
    phone: z.string().describe("用户电话"),
    content: z.string().describe("用户提交的文本内容"),
  }),
});

// 定义工作流输出 schema
const outputSchema = z.object({
  processedData: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    content: z.string(),
    validation: z.object({
      nameValid: z.boolean(),
      emailValid: z.boolean(),
      phoneValid: z.boolean(),
    }),
    formatting: z.object({
      formattedName: z.string(),
      formattedEmail: z.string(),
      formattedPhone: z.string(),
    }),
    analysis: z.object({
      contentLength: z.number(),
      wordCount: z.number(),
      sentiment: z.string(),
      keywords: z.array(z.string()),
    }),
  }),
  processingTime: z.number().describe("处理时间（毫秒）"),
  summary: z.string().describe("处理结果摘要"),
});

// 步骤1：数据验证（并行执行）
const validateDataStep = createStep({
  id: "validate-data",
  description: "验证用户数据的有效性",
  inputSchema: inputSchema,
  outputSchema: z.object({
    validation: z.object({
      nameValid: z.boolean(),
      emailValid: z.boolean(),
      phoneValid: z.boolean(),
    }),
  }),
  execute: async ({ inputData }) => {
    // 模拟验证处理时间
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { userData } = inputData;
    
    // 姓名验证：不为空且长度大于1
    const nameValid = !!(userData.name && userData.name.trim().length > 1);
    
    // 邮箱验证：简单的邮箱格式检查
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(userData.email);
    
    // 电话验证：检查是否包含数字
    const phoneRegex = /\d{3,}/;
    const phoneValid = phoneRegex.test(userData.phone);
    
    return {
      validation: {
        nameValid,
        emailValid,
        phoneValid,
      },
    };
  },
});

// 步骤2：数据格式化（并行执行）
const formatDataStep = createStep({
  id: "format-data",
  description: "格式化用户数据",
  inputSchema: inputSchema,
  outputSchema: z.object({
    formatting: z.object({
      formattedName: z.string(),
      formattedEmail: z.string(),
      formattedPhone: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    // 模拟格式化处理时间
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { userData } = inputData;
    
    // 格式化姓名：首字母大写
    const formattedName = userData.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // 格式化邮箱：转换为小写
    const formattedEmail = userData.email.toLowerCase().trim();
    
    // 格式化电话：移除非数字字符并添加格式
    const cleanPhone = userData.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length >= 10 
      ? `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6, 10)}`
      : cleanPhone;
    
    return {
      formatting: {
        formattedName,
        formattedEmail,
        formattedPhone,
      },
    };
  },
});

// 步骤3：内容分析（并行执行）
const analyzeContentStep = createStep({
  id: "analyze-content",
  description: "分析用户提交的文本内容",
  inputSchema: inputSchema,
  outputSchema: z.object({
    analysis: z.object({
      contentLength: z.number(),
      wordCount: z.number(),
      sentiment: z.string(),
      keywords: z.array(z.string()),
    }),
  }),
  execute: async ({ inputData }) => {
    // 模拟分析处理时间
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const { userData } = inputData;
    const content = userData.content;
    
    // 计算内容长度
    const contentLength = content.length;
    
    // 计算单词数量
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // 简单的情感分析（基于关键词）
    const positiveWords = ['好', '棒', '优秀', '满意', '喜欢', '推荐', '完美'];
    const negativeWords = ['差', '糟糕', '失望', '不满', '讨厌', '问题', '错误'];
    
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (content.includes(word) ? 1 : 0), 0);
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (content.includes(word) ? 1 : 0), 0);
    
    let sentiment = '中性';
    if (positiveCount > negativeCount) {
      sentiment = '积极';
    } else if (negativeCount > positiveCount) {
      sentiment = '消极';
    }
    
    // 提取关键词（简单实现：找出长度大于2的词）
    const keywords = content
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 5); // 取前5个关键词
    
    return {
      analysis: {
        contentLength,
        wordCount,
        sentiment,
        keywords,
      },
    };
  },
});

// 最终汇总步骤
const summarizeResultsStep = createStep({
  id: "summarize-results",
  description: "汇总所有并行处理的结果",
  inputSchema: z.object({
    userData: z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string(),
      content: z.string(),
    }),
    validation: z.object({
      nameValid: z.boolean(),
      emailValid: z.boolean(),
      phoneValid: z.boolean(),
    }),
    formatting: z.object({
      formattedName: z.string(),
      formattedEmail: z.string(),
      formattedPhone: z.string(),
    }),
    analysis: z.object({
      contentLength: z.number(),
      wordCount: z.number(),
      sentiment: z.string(),
      keywords: z.array(z.string()),
    }),
    processingStartTime: z.number(),
  }),
  outputSchema: outputSchema,
  execute: async ({ inputData }) => {
    // 添加安全检查
    if (!inputData.userData) {
      throw new Error("用户数据不存在，无法完成汇总");
    }
    
    const processingTime = Date.now() - inputData.processingStartTime;
    
    // 生成处理结果摘要
    const validationResults = Object.values(inputData.validation || {});
    const validCount = validationResults.filter(Boolean).length;
    const totalFields = validationResults.length;
    
    const summary = `用户数据处理完成：
- 数据验证：${validCount}/${totalFields} 个字段有效
- 内容分析：${inputData.analysis?.wordCount || 0} 个词，情感倾向为${inputData.analysis?.sentiment || '未知'}
- 处理耗时：${processingTime}ms
- 关键词：${inputData.analysis?.keywords?.join(', ') || '无'}`;
    
    return {
      processedData: {
        name: inputData.userData.name,
        email: inputData.userData.email,
        phone: inputData.userData.phone,
        content: inputData.userData.content,
        validation: inputData.validation,
        formatting: inputData.formatting,
        analysis: inputData.analysis,
      },
      processingTime,
      summary,
    };
  },
});

// 创建并行处理演示工作流
export const parallelDemoWorkflow = createWorkflow({
  id: "parallel-demo-workflow",
  description: "演示并行处理特性的工作流：同时进行数据验证、格式化和内容分析",
  inputSchema,
  outputSchema,
})
  // 添加处理开始时间
  .map(async ({ inputData }) => ({
    ...inputData,
    processingStartTime: Date.now(),
  }))
  
  // 🚀 关键特性：并行执行三个独立的处理步骤
  // 这三个步骤会同时执行，而不是按顺序执行，大大提高了处理效率
  .parallel([
    validateDataStep,    // 数据验证
    formatDataStep,      // 数据格式化  
    analyzeContentStep,  // 内容分析
  ])
  
  // 将并行执行的结果映射到统一的数据结构
  .map(async ({ inputData, getStepResult }) => {
    const validation = getStepResult('validate-data');
    const formatting = getStepResult('format-data');
    const analysis = getStepResult('analyze-content');
    
    // 从输入数据中获取原始的 userData 和 processingStartTime
    const originalData = inputData as any;
    
    return {
      userData: originalData.userData || {
        name: "演示用户",
        email: "demo@example.com",
        phone: "138-0000-0000", 
        content: "演示内容"
      },
      validation: validation.validation,
      formatting: formatting.formatting,
      analysis: analysis.analysis,
      processingStartTime: originalData.processingStartTime || Date.now(),
    };
  })
  
  // 最终汇总处理结果
  .then(summarizeResultsStep)
  .commit();

// 导出工作流以供使用
export default parallelDemoWorkflow;
