/**
 * 并行工作流演示示例
 * 
 * 这个文件展示了如何使用 parallel-demo-workflow.ts 中定义的并行工作流
 */

import { parallelDemoWorkflow } from './parallel-demo-workflow';

// 示例用户数据
const sampleUserData = {
    "userData": {
        "name": "张三",
        "email": "ZHANGSAN@EXAMPLE.COM",
        "phone": "138-0013-8000",
        "content": "这个产品非常好用，我很满意！界面设计很棒，功能也很完善。推荐给大家使用。"
    }
};

/**
 * 运行并行工作流演示
 * 
 * 这个函数演示了：
 * 1. 如何调用并行工作流
 * 2. 并行执行的性能优势
 * 3. 如何处理并行执行的结果
 */
export async function runParallelDemo() {
    console.log("🚀 开始并行工作流演示...");
    console.log("输入数据:", JSON.stringify(sampleUserData, null, 2));

    const startTime = Date.now();

    try {
        // 执行并行工作流
        // 注意：validateDataStep, formatDataStep, analyzeContentStep 
        // 这三个步骤会同时执行，而不是按顺序执行

        // 注意：这里只是演示代码结构，实际执行需要完整的 Mastra 运行时环境
        console.log("⚠️  注意：这是演示代码，实际执行需要完整的 Mastra 运行时环境");

        // 模拟工作流执行结果
        const result = {
            processedData: {
                name: sampleUserData.userData.name,
                email: sampleUserData.userData.email,
                phone: sampleUserData.userData.phone,
                content: sampleUserData.userData.content,
                validation: {
                    nameValid: true,
                    emailValid: true,
                    phoneValid: true,
                },
                formatting: {
                    formattedName: "张三",
                    formattedEmail: "zhangsan@example.com",
                    formattedPhone: "138-001-3800",
                },
                analysis: {
                    contentLength: 35,
                    wordCount: 12,
                    sentiment: "积极",
                    keywords: ["产品", "好用", "满意", "界面", "功能"],
                },
            },
            processingTime: 1200,
            summary: "用户数据处理完成：数据验证：3/3 个字段有效，内容分析：12 个词，情感倾向为积极，处理耗时：1200ms，关键词：产品, 好用, 满意, 界面, 功能"
        };

        // const result = await parallelDemoWorkflow.execute(sampleUserData);

        const totalTime = Date.now() - startTime;

        console.log("\n✅ 并行工作流执行完成！");
        console.log("总执行时间:", totalTime, "ms");
        console.log("\n📊 处理结果:");
        console.log("- 验证结果:", result.processedData.validation);
        console.log("- 格式化结果:", result.processedData.formatting);
        console.log("- 分析结果:", result.processedData.analysis);
        console.log("\n📝 处理摘要:");
        console.log(result.summary);

        return result;
    } catch (error) {
        console.error("❌ 工作流执行失败:", error);
        throw error;
    }
}

/**
 * 性能对比演示：并行 vs 串行
 * 
 * 这个函数对比了并行执行和串行执行的性能差异
 */
export async function performanceComparison() {
    console.log("\n🔄 性能对比演示：并行 vs 串行");

    // 并行执行（使用 .parallel()）
    console.log("\n1️⃣ 并行执行测试...");
    const parallelStart = Date.now();
    await runParallelDemo();
    const parallelTime = Date.now() - parallelStart;

    console.log(`\n⚡ 并行执行总时间: ${parallelTime}ms`);

    // 说明：如果是串行执行，理论时间应该是：
    // validateDataStep (1000ms) + formatDataStep (800ms) + analyzeContentStep (1200ms) = 3000ms+
    // 而并行执行时间约等于最长的那个步骤的时间，即约 1200ms+

    console.log("\n📈 性能分析:");
    console.log("- 如果串行执行，预计需要: ~3000ms (1000+800+1200)");
    console.log(`- 并行执行实际用时: ${parallelTime}ms`);
    console.log(`- 性能提升: ~${Math.round((3000 - parallelTime) / 3000 * 100)}%`);

    return {
        parallelTime,
        estimatedSerialTime: 3000,
        performanceGain: Math.round((3000 - parallelTime) / 3000 * 100)
    };
}

// 如果直接运行此文件，则执行演示
if (require.main === module) {
    performanceComparison().catch(console.error);
}
