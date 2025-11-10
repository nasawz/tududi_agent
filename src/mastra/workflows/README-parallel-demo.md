# 并行工作流演示 (Parallel Workflow Demo)

这个演示展示了 Mastra 工作流中 `.parallel()` 方法的强大并行处理能力。

## 📁 文件说明

- `parallel-demo-workflow.ts` - 主要的并行工作流定义
- `parallel-demo-example.ts` - 使用示例和性能对比演示
- `README-parallel-demo.md` - 本说明文档

## 🚀 并行处理特性

### 什么是 `.parallel()`？

`.parallel()` 方法允许多个工作流步骤同时执行，而不是按顺序一个接一个地执行。这可以显著提高处理效率，特别是当步骤之间相互独立时。

### 核心优势

1. **性能提升** - 多个任务同时执行，总时间约等于最慢任务的时间
2. **资源利用** - 充分利用系统资源，提高吞吐量  
3. **模块化设计** - 每个并行步骤都是独立的，便于维护和测试

## 🔧 工作流结构

### 输入数据
```typescript
{
  userData: {
    name: string,      // 用户姓名
    email: string,     // 用户邮箱
    phone: string,     // 用户电话
    content: string    // 用户提交的文本内容
  }
}
```

### 并行执行的步骤

1. **数据验证步骤** (`validateDataStep`)
   - 验证姓名、邮箱、电话格式
   - 执行时间：~1000ms

2. **数据格式化步骤** (`formatDataStep`)  
   - 格式化姓名、邮箱、电话
   - 执行时间：~800ms

3. **内容分析步骤** (`analyzeContentStep`)
   - 分析文本长度、词数、情感、关键词
   - 执行时间：~1200ms

### 关键代码

```typescript
// 🚀 并行执行三个独立的处理步骤
.parallel([
  validateDataStep,    // 数据验证
  formatDataStep,      // 数据格式化  
  analyzeContentStep,  // 内容分析
])

// 将并行执行的结果映射到统一的数据结构
.map(async ({ inputData }) => {
  const { 
    'validate-data': validation, 
    'format-data': formatting, 
    'analyze-content': analysis 
  } = inputData;
  
  return {
    userData: inputData.userData,
    validation: validation.validation,
    formatting: formatting.formatting,
    analysis: analysis.analysis,
    processingStartTime: inputData.processingStartTime,
  };
})
```

## 📊 性能对比

### 串行执行 vs 并行执行

- **串行执行时间**: 1000ms + 800ms + 1200ms = **3000ms**
- **并行执行时间**: max(1000ms, 800ms, 1200ms) ≈ **1200ms**
- **性能提升**: 约 **60%**

### 实际测试结果

运行 `parallel-demo-example.ts` 可以看到实际的性能对比：

```bash
# 如果在项目中运行
npx ts-node src/mastra/workflows/parallel-demo-example.ts
```

## 🎯 使用场景

并行工作流特别适合以下场景：

1. **数据处理管道** - 同时进行验证、格式化、分析
2. **多源数据获取** - 并行调用多个API或数据库
3. **文件处理** - 同时处理多个文件或执行多种操作
4. **通知发送** - 同时发送邮件、短信、推送通知
5. **报告生成** - 并行生成不同类型的报告或统计

## 💡 最佳实践

### 1. 确保步骤独立性
```typescript
// ✅ 好的做法 - 步骤之间相互独立
.parallel([
  validateUserData,
  formatUserData,
  analyzeUserContent
])

// ❌ 避免 - 步骤之间有依赖关系
.parallel([
  getUserData,        // 其他步骤依赖这个结果
  processUserData,    // 依赖 getUserData 的结果
  saveUserData        // 依赖 processUserData 的结果
])
```

### 2. 合理处理并行结果
```typescript
// 使用 .map() 来整合并行步骤的结果
.map(async ({ inputData }) => {
  const { 
    'step-1': result1, 
    'step-2': result2, 
    'step-3': result3 
  } = inputData;
  
  // 整合结果到统一结构
  return {
    combinedResult: {
      ...result1,
      ...result2,
      ...result3
    }
  };
})
```

### 3. 错误处理
```typescript
// 在每个并行步骤中添加适当的错误处理
const robustStep = createStep({
  id: 'robust-step',
  execute: async ({ inputData }) => {
    try {
      // 主要逻辑
      return await processData(inputData);
    } catch (error) {
      // 错误处理 - 返回默认值或重试
      console.error('Step failed:', error);
      return { success: false, error: error.message };
    }
  }
});
```

## 🔍 调试技巧

1. **添加时间戳** - 在每个步骤中记录开始和结束时间
2. **日志记录** - 使用 console.log 跟踪并行执行状态
3. **结果验证** - 确保所有并行步骤都成功完成
4. **性能监控** - 比较并行和串行执行的性能差异

## 📚 扩展阅读

- [Mastra 工作流文档](https://docs.mastra.ai/workflows)
- [并行处理最佳实践](https://docs.mastra.ai/workflows/parallel)
- [工作流性能优化](https://docs.mastra.ai/workflows/performance)
