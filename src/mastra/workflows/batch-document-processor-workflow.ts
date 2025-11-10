import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';


// {
//     "documents": [
//       {
//         "id": "doc-1",
//         "title": "人工智能技术发展报告",
//         "content": "人工智能技术在近年来取得了突破性进展。机器学习算法不断优化，深度学习模型在图像识别、自然语言处理等领域表现出色。大语言模型如GPT、BERT等的出现，极大地推动了自然语言理解和生成技术的发展。计算机视觉技术也在自动驾驶、医疗诊断等场景中得到广泛应用。未来，人工智能将在更多领域发挥重要作用，包括智能制造、智慧城市、个性化教育等。同时，我们也需要关注AI伦理和安全问题。",
//         "category": "技术报告"
//       },
//       {
//         "id": "doc-2",
//         "title": "区块链应用案例分析",
//         "content": "区块链技术作为分布式账本技术，在金融、供应链、数字身份等领域展现出巨大潜力。比特币和以太坊等加密货币的成功，证明了区块链技术的可行性。智能合约的引入，使得去中心化应用成为可能。NFT市场的兴起，为数字资产交易提供了新的模式。然而，区块链技术仍面临扩展性、能耗等挑战。未来需要在技术优化和实际应用之间找到平衡点。",
//         "category": "技术分析"
//       },
//       {
//         "id": "doc-3",
//         "title": "云计算服务发展趋势",
//         "content": "云计算已成为现代企业IT基础设施的核心。AWS、Azure、Google Cloud等主要云服务提供商不断推出新的服务和功能。容器化技术和微服务架构的普及，使得应用部署更加灵活高效。无服务器计算模式正在改变传统的应用开发方式。边缘计算的兴起，为低延迟应用提供了新的解决方案。多云和混合云策略成为企业的主流选择。",
//         "category": "行业趋势"
//       },
//       {
//         "id": "doc-4",
//         "title": "数据科学实践指南",
//         "content": "数据科学结合了统计学、计算机科学和领域专业知识。数据收集、清洗、分析和可视化是数据科学的核心流程。Python和R是数据科学领域最受欢迎的编程语言。Pandas、NumPy、Scikit-learn等库为数据处理提供了强大工具。机器学习模型的选择和调优需要深入理解业务问题。数据可视化有助于发现数据中的模式和洞察。",
//         "category": "实践指南"
//       },
//       {
//         "id": "doc-5",
//         "title": "网络安全防护策略",
//         "content": "网络安全威胁日益复杂，企业需要建立多层次的安全防护体系。防火墙、入侵检测系统、反病毒软件是基础防护措施。零信任安全模型正在成为新的安全架构标准。身份认证和访问控制是保护敏感数据的关键。安全意识培训对于防范社会工程攻击至关重要。定期的安全审计和漏洞扫描有助于及时发现安全隐患。",
//         "category": "安全策略"
//       }
//     ]
// }
  
// 定义文档类型
const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
});

// 定义处理结果类型
const ProcessedDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  originalLength: z.number(),
  chunkCount: z.number(),
  wordCount: z.number(),
  keywordCount: z.number(),
  category: z.string(),
  summary: z.string(),
  keywords: z.array(z.string()),
  processingTime: z.number(),
});

const initBatchStep = createStep({
  id: 'init-batch-step',
  description: '初始化批量文档处理器，准备处理多个文档',
  inputSchema: z.object({
    documents: z.array(DocumentSchema),
  }),
  outputSchema: z.object({
    documents: z.array(DocumentSchema),
    totalDocuments: z.number(),
    batchStartTime: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { documents } = inputData;
    const batchStartTime = Date.now();
    
    console.log(`📚 批量文档处理器启动！`);
    console.log(`📄 待处理文档数量: ${documents.length}`);
    console.log(`🕐 开始时间: ${new Date(batchStartTime).toLocaleString()}`);
    
    // 显示文档列表
    documents.forEach((doc, index) => {
      console.log(`  ${index + 1}. "${doc.title}" (${doc.content.length} 字符)`);
    });
    
    return {
      documents,
      totalDocuments: documents.length,
      batchStartTime,
    };
  },
});

const processDocumentStep = createStep({
  id: 'process-document-step',
  description: '处理单个文档：分析内容、提取关键词、生成摘要',
  inputSchema: DocumentSchema.extend({
    processingStartTime: z.number(),
    totalDocuments: z.number().optional(),
    batchStartTime: z.number().optional(),
  }),
  outputSchema: ProcessedDocumentSchema,
  execute: async ({ inputData }) => {
    const { id, title, content, category = '未分类', processingStartTime } = inputData;
    
    console.log(`\n🔄 处理文档: "${title}"`);
    console.log(`📝 内容长度: ${content.length} 字符`);
    
    // 模拟文档分块处理
    const chunkSize = 200;
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    
    console.log(`📦 分块数量: ${chunks.length}`);
    
    // 模拟词汇分析
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    console.log(`🔤 词汇数量: ${wordCount}`);
    
    // 模拟关键词提取（简单的词频统计）
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3) { // 只统计长度大于3的词
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });
    
    // 获取前5个高频词作为关键词
    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
    
    console.log(`🏷️ 关键词: ${keywords.join(', ')}`);
    
    // 模拟生成摘要（取前100个字符）
    const summary = content.length > 100 
      ? content.slice(0, 100) + '...' 
      : content;
    
    console.log(`📋 摘要: ${summary}`);
    
    const processingTime = Date.now() - processingStartTime;
    console.log(`⏱️ 处理耗时: ${processingTime}ms`);
    
    return {
      id,
      title,
      originalLength: content.length,
      chunkCount: chunks.length,
      wordCount,
      keywordCount: keywords.length,
      category,
      summary,
      keywords,
      processingTime,
    };
  },
});

const summarizeBatchStep = createStep({
  id: 'summarize-batch-step',
  description: '汇总批量处理结果，生成统计报告',
  inputSchema: z.object({
    processedDocuments: z.array(ProcessedDocumentSchema),
    totalDocuments: z.number(),
    batchStartTime: z.number(),
  }),
  outputSchema: z.object({
    processedDocuments: z.array(ProcessedDocumentSchema),
    batchSummary: z.object({
      totalDocuments: z.number(),
      totalProcessingTime: z.number(),
      averageProcessingTime: z.number(),
      totalWords: z.number(),
      totalChunks: z.number(),
      categoriesCount: z.number(),
      topKeywords: z.array(z.string()),
    }),
    report: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { processedDocuments, totalDocuments, batchStartTime } = inputData;
    const totalProcessingTime = Date.now() - batchStartTime;
    
    console.log(`\n📊 批量处理完成！生成统计报告...`);
    
    // 计算统计数据
    const totalWords = processedDocuments.reduce((sum, doc) => sum + doc.wordCount, 0);
    const totalChunks = processedDocuments.reduce((sum, doc) => sum + doc.chunkCount, 0);
    const averageProcessingTime = totalProcessingTime / totalDocuments;
    
    // 统计分类
    const categories = new Set(processedDocuments.map(doc => doc.category));
    const categoriesCount = categories.size;
    
    // 统计所有关键词频率
    const allKeywords: { [key: string]: number } = {};
    processedDocuments.forEach(doc => {
      doc.keywords.forEach(keyword => {
        allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
      });
    });
    
    // 获取前10个最常见的关键词
    const topKeywords = Object.entries(allKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);
    
    const batchSummary = {
      totalDocuments,
      totalProcessingTime,
      averageProcessingTime: Math.round(averageProcessingTime),
      totalWords,
      totalChunks,
      categoriesCount,
      topKeywords,
    };
    
    // 生成报告
    const report = `
批量文档处理报告
==================
📄 处理文档数量: ${totalDocuments}
⏱️ 总处理时间: ${totalProcessingTime}ms
📈 平均处理时间: ${Math.round(averageProcessingTime)}ms/文档
🔤 总词汇数量: ${totalWords}
📦 总分块数量: ${totalChunks}
🏷️ 分类数量: ${categoriesCount}
🔥 热门关键词: ${topKeywords.slice(0, 5).join(', ')}

详细处理结果:
${processedDocuments.map((doc, index) => 
  `${index + 1}. "${doc.title}" - ${doc.wordCount}词, ${doc.chunkCount}块, ${doc.processingTime}ms`
).join('\n')}
    `.trim();
    
    console.log(`\n${report}`);
    
    return {
      processedDocuments,
      batchSummary,
      report,
    };
  },
});

export const batchDocumentProcessorWorkflow = createWorkflow({
  id: 'batch-document-processor-workflow',
  inputSchema: z.object({
    documents: z.array(DocumentSchema),
  }),
  outputSchema: z.object({
    processedDocuments: z.array(ProcessedDocumentSchema),
    batchSummary: z.object({
      totalDocuments: z.number(),
      totalProcessingTime: z.number(),
      averageProcessingTime: z.number(),
      totalWords: z.number(),
      totalChunks: z.number(),
      categoriesCount: z.number(),
      topKeywords: z.array(z.string()),
    }),
    report: z.string(),
  }),
})
  .then(initBatchStep)
  // 将文档数组映射为带有处理开始时间的格式
  .map(async ({ inputData }: { inputData: any }) => {
    const { documents, totalDocuments, batchStartTime } = inputData;
    
    console.log(`\n🔄 准备使用 .foreach() 处理 ${documents.length} 个文档...`);
    
    // 为每个文档添加处理开始时间，返回数组供 .foreach() 使用
    return documents.map((doc: any) => ({
      ...doc,
      processingStartTime: Date.now(),
      totalDocuments,
      batchStartTime,
    }));
  })
  // 🔄 关键特性：使用 .foreach() 对每个文档执行相同的处理步骤
  // 前一步返回了文档数组，.foreach() 会对每个元素执行 processDocumentStep
  .foreach(processDocumentStep, { concurrency: 2 })
  // 收集 foreach 的结果并准备汇总
  .map(async ({ inputData, getStepResult }: { inputData: any; getStepResult: any }) => {
    // inputData 现在是单个文档的处理结果数组
    const processedDocuments = Array.isArray(inputData) ? inputData : [inputData];
    
    // 从第一个文档获取批量处理的元数据
    const firstDoc = processedDocuments[0];
    const totalDocuments = firstDoc?.totalDocuments || processedDocuments.length;
    const batchStartTime = firstDoc?.batchStartTime || Date.now();
    
    console.log(`\n✅ .foreach() 处理完成，共处理 ${processedDocuments.length} 个文档`);
    
    return {
      processedDocuments,
      totalDocuments,
      batchStartTime,
    };
  })
  .then(summarizeBatchStep)
  .commit();
