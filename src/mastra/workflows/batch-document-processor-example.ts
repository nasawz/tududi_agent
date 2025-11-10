import { mastra } from '../index';

/**
 * 批量文档处理器工作流使用示例
 * 
 * 这个示例演示了如何使用 .foreach() 特性来创建一个批量处理工作流，
 * 对集合中的每个元素执行相同的处理步骤，支持并发控制。
 */

export async function runBatchDocumentProcessorExample() {
  console.log('📚 开始批量文档处理器演示...\n');

  try {
    // 注意：这里只是演示代码结构，实际执行需要完整的 Mastra 运行时环境
    console.log("⚠️  注意：这是演示代码，实际执行需要完整的 Mastra 运行时环境");
    
    // 准备测试文档数据
    const sampleDocuments = [
      {
        id: 'doc-1',
        title: '人工智能技术发展报告',
        content: `
          人工智能技术在近年来取得了突破性进展。机器学习算法不断优化，深度学习模型在图像识别、自然语言处理等领域表现出色。
          大语言模型如GPT、BERT等的出现，极大地推动了自然语言理解和生成技术的发展。计算机视觉技术也在自动驾驶、医疗诊断等场景中得到广泛应用。
          未来，人工智能将在更多领域发挥重要作用，包括智能制造、智慧城市、个性化教育等。同时，我们也需要关注AI伦理和安全问题。
        `,
        category: '技术报告',
      },
      {
        id: 'doc-2',
        title: '区块链应用案例分析',
        content: `
          区块链技术作为分布式账本技术，在金融、供应链、数字身份等领域展现出巨大潜力。比特币和以太坊等加密货币的成功，
          证明了区块链技术的可行性。智能合约的引入，使得去中心化应用成为可能。NFT市场的兴起，为数字资产交易提供了新的模式。
          然而，区块链技术仍面临扩展性、能耗等挑战。未来需要在技术优化和实际应用之间找到平衡点。
        `,
        category: '技术分析',
      },
      {
        id: 'doc-3',
        title: '云计算服务发展趋势',
        content: `
          云计算已成为现代企业IT基础设施的核心。AWS、Azure、Google Cloud等主要云服务提供商不断推出新的服务和功能。
          容器化技术和微服务架构的普及，使得应用部署更加灵活高效。无服务器计算模式正在改变传统的应用开发方式。
          边缘计算的兴起，为低延迟应用提供了新的解决方案。多云和混合云策略成为企业的主流选择。
        `,
        category: '行业趋势',
      },
      {
        id: 'doc-4',
        title: '数据科学实践指南',
        content: `
          数据科学结合了统计学、计算机科学和领域专业知识。数据收集、清洗、分析和可视化是数据科学的核心流程。
          Python和R是数据科学领域最受欢迎的编程语言。Pandas、NumPy、Scikit-learn等库为数据处理提供了强大工具。
          机器学习模型的选择和调优需要深入理解业务问题。数据可视化有助于发现数据中的模式和洞察。
        `,
        category: '实践指南',
      },
      {
        id: 'doc-5',
        title: '网络安全防护策略',
        content: `
          网络安全威胁日益复杂，企业需要建立多层次的安全防护体系。防火墙、入侵检测系统、反病毒软件是基础防护措施。
          零信任安全模型正在成为新的安全架构标准。身份认证和访问控制是保护敏感数据的关键。
          安全意识培训对于防范社会工程攻击至关重要。定期的安全审计和漏洞扫描有助于及时发现安全隐患。
        `,
        category: '安全策略',
      },
    ];
    
    console.log(`\n📄 准备处理 ${sampleDocuments.length} 个文档:`);
    sampleDocuments.forEach((doc, index) => {
      console.log(`  ${index + 1}. "${doc.title}" (${doc.content.length} 字符, 分类: ${doc.category})`);
    });
    
    // 模拟批量文档处理工作流执行
    await simulateBatchDocumentProcessorWorkflow(sampleDocuments);

    // 实际的工作流执行代码（注释掉，因为需要完整的运行时环境）:
    // const workflow = mastra.getWorkflow('batchDocumentProcessorWorkflow');
    // const result = await workflow.execute({ documents: sampleDocuments });
    // console.log('📊 处理结果:', result);

  } catch (error) {
    console.error('❌ 工作流执行出错:', error);
  }
}

/**
 * 模拟批量文档处理工作流执行
 * 演示 .forEach() 的执行逻辑
 */
async function simulateBatchDocumentProcessorWorkflow(documents: any[]) {
  const batchStartTime = Date.now();
  
  // 步骤1: 初始化批量处理
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 批量文档处理器启动！`);
  console.log(`📄 待处理文档数量: ${documents.length}`);
  console.log(`🕐 开始时间: ${new Date(batchStartTime).toLocaleString()}`);
  console.log(`${'='.repeat(60)}`);
  
  // 步骤2: 🔄 .foreach() 逻辑模拟 - 对每个文档执行相同的处理步骤
  console.log(`\n🔄 开始 .foreach() 处理每个文档（并发数：2）...`);
  
  const processedDocuments = [];
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const processingStartTime = Date.now();
    
    console.log(`\n📄 [${i + 1}/${documents.length}] 处理文档: "${doc.title}"`);
    console.log(`📝 内容长度: ${doc.content.length} 字符`);
    console.log(`🏷️ 分类: ${doc.category}`);
    
    // 模拟文档分块处理
    const chunkSize = 200;
    const chunks = [];
    for (let j = 0; j < doc.content.length; j += chunkSize) {
      chunks.push(doc.content.slice(j, j + chunkSize));
    }
    console.log(`📦 分块数量: ${chunks.length}`);
    
    // 模拟词汇分析
    const words = doc.content.split(/\s+/).filter((word: string) => word.length > 0);
    const wordCount = words.length;
    console.log(`🔤 词汇数量: ${wordCount}`);
    
    // 模拟关键词提取
    const wordFreq: { [key: string]: number } = {};
    words.forEach((word: string) => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });
    
    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
    
    console.log(`🏷️ 关键词: ${keywords.join(', ')}`);
    
    // 模拟生成摘要
    const summary = doc.content.length > 100 
      ? doc.content.slice(0, 100).trim() + '...' 
      : doc.content.trim();
    
    console.log(`📋 摘要: ${summary}`);
    
    const processingTime = Date.now() - processingStartTime;
    console.log(`⏱️ 处理耗时: ${processingTime}ms`);
    console.log(`✅ 文档处理完成`);
    
    // 保存处理结果
    processedDocuments.push({
      id: doc.id,
      title: doc.title,
      originalLength: doc.content.length,
      chunkCount: chunks.length,
      wordCount,
      keywordCount: keywords.length,
      category: doc.category,
      summary,
      keywords,
      processingTime,
    });
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 步骤3: 汇总批量处理结果
  const totalProcessingTime = Date.now() - batchStartTime;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 批量处理完成！生成统计报告...`);
  console.log(`${'='.repeat(60)}`);
  
  // 计算统计数据
  const totalWords = processedDocuments.reduce((sum, doc) => sum + doc.wordCount, 0);
  const totalChunks = processedDocuments.reduce((sum, doc) => sum + doc.chunkCount, 0);
  const averageProcessingTime = totalProcessingTime / documents.length;
  
  // 统计分类
  const categories = new Set(processedDocuments.map(doc => doc.category));
  const categoriesCount = categories.size;
  
  // 统计所有关键词频率
  const allKeywords: { [key: string]: number } = {};
  processedDocuments.forEach(doc => {
    doc.keywords.forEach((keyword: string) => {
      allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
    });
  });
  
  // 获取前10个最常见的关键词
  const topKeywords = Object.entries(allKeywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword);
  
  // 生成并显示报告
  const report = `
批量文档处理报告
==================
📄 处理文档数量: ${documents.length}
⏱️ 总处理时间: ${totalProcessingTime}ms
📈 平均处理时间: ${Math.round(averageProcessingTime)}ms/文档
🔤 总词汇数量: ${totalWords}
📦 总分块数量: ${totalChunks}
🏷️ 分类数量: ${categoriesCount}
📂 分类列表: ${Array.from(categories).join(', ')}
🔥 热门关键词: ${topKeywords.slice(0, 8).join(', ')}

详细处理结果:
${processedDocuments.map((doc, index) => 
  `${index + 1}. "${doc.title}" - ${doc.wordCount}词, ${doc.chunkCount}块, ${doc.processingTime}ms`
).join('\n')}
  `.trim();
  
  console.log(`\n${report}`);
  
  console.log(`\n🎉 批量文档处理演示完成！`);
}

/**
 * .foreach() 特性说明：
 * 
 * 在这个工作流中，.foreach() 的使用方式是：
 * 
 * // 1. 前一步返回文档数组
 * .map(async ({ inputData }) => {
 *   return documents.map(doc => ({ ...doc, processingStartTime: Date.now() }));
 * })
 * 
 * // 2. .foreach() 对每个元素执行相同的步骤
 * .foreach(processDocumentStep, { concurrency: 2 })
 * 
 * // 3. 收集处理结果
 * .map(async ({ inputData }) => {
 *   return { processedDocuments: inputData };
 * })
 * 
 * 关键特点：
 * 1. 🔄 对集合中的每个元素执行相同的步骤
 * 2. 🎯 每个元素的处理是独立的
 * 3. 🚀 支持并发控制（concurrency 参数）
 * 4. 🔗 处理结果会自动收集到数组中
 * 5. 📈 前一步必须返回数组类型
 * 6. ⚡ 比串行处理更高效
 * 
 * 适用场景：
 * - 批量数据处理（文档、图片、音频等）
 * - 批量API调用
 * - 批量验证和转换
 * - 批量通知发送
 * - 批量文件操作
 * - 批量数据库操作
 * 
 * 与其他循环方法的区别：
 * - .foreach(): 对数组中每个元素执行相同步骤，支持并发
 * - .dowhile(): 重复执行直到条件为false
 * - .dountil(): 重复执行直到条件为true
 * - .map(): 数据转换，一次性处理
 */

// 如果直接运行此文件，执行示例
if (require.main === module) {
  runBatchDocumentProcessorExample();
}
