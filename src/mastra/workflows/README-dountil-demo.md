# .dountil() 特性演示 - 数字猜测游戏

这个演示展示了 Mastra 工作流中 `.dountil()` 特性的使用方法，通过一个有趣的数字猜测游戏来说明循环执行的概念。

## 📁 文件结构

- `number-guessing-workflow.ts` - 主要的工作流定义
- `number-guessing-example.ts` - 使用示例和详细说明
- `README-dountil-demo.md` - 本文档

## 🎮 游戏流程

1. **初始化步骤** (`initStep`)
   - 生成1-100之间的随机数字
   - 初始化游戏状态

2. **猜测步骤** (`guessStep`) - **关键的循环步骤**
   - 暂停工作流，等待用户输入猜测
   - 比较用户猜测与目标数字
   - 提供提示（太大/太小/正确）
   - 返回是否猜对的状态

3. **结果步骤** (`resultStep`)
   - 显示游戏统计信息
   - 根据尝试次数给出评价

## 🔄 .dountil() 特性详解

### 语法结构

```typescript
.dountil(stepToRepeat, conditionFunction)
```

### 在本演示中的使用

```typescript
.dountil(guessStep, async ({ inputData: { isCorrect } }) => isCorrect)
```

### 执行逻辑

1. **执行步骤**: 执行 `guessStep`
2. **检查条件**: 检查 `isCorrect` 是否为 `true`
3. **决策**:
   - 如果 `isCorrect === false`: 继续循环，再次执行 `guessStep`
   - 如果 `isCorrect === true`: 停止循环，继续下一步 (`resultStep`)

### 关键特点

- **条件检查**: 在每次步骤执行**后**检查条件
- **循环控制**: 条件为 `false` 时继续循环，为 `true` 时停止
- **状态传递**: 每次循环都会传递更新后的状态数据
- **暂停恢复**: 支持在循环中暂停和恢复工作流

## 🚀 运行示例

### 方法1: 直接运行示例文件

```bash
npx ts-node src/mastra/workflows/number-guessing-example.ts
```

### 方法2: 在代码中使用

```typescript
import { mastra } from '../index';

// 通过 mastra 实例获取工作流
const workflow = mastra.getWorkflow('numberGuessingWorkflow');

// 启动工作流
const execution = await workflow.execute({ start: true });

// 处理用户猜测
while (execution.status === 'suspended') {
  const userGuess = getUserInput(); // 获取用户输入
  await execution.resume({ userGuess });
}

// 获取结果
console.log('游戏结果:', execution.result);
```

**注意**: 当前的示例文件使用模拟执行来演示工作流逻辑，因为完整的 Mastra 运行时环境设置较为复杂。实际使用时需要按照上述方式通过 `mastra` 实例来执行工作流。

## 📊 示例输出

```
🎮 开始数字猜测游戏演示...

⚠️  注意：这是演示代码，实际执行需要完整的 Mastra 运行时环境
🎯 游戏开始！我想了一个1-100之间的数字: 67

👤 用户猜测 (第1次): 50
📈 太小了！数字比 50 大。

👤 用户猜测 (第2次): 75
📉 太大了！数字比 75 小。

👤 用户猜测 (第3次): 62
📈 太小了！数字比 62 大。

👤 用户猜测 (第4次): 68
📉 太大了！数字比 68 小。

👤 用户猜测 (第5次): 65
📈 太小了！数字比 65 大。

👤 用户猜测 (第6次): 67
🎉 恭喜！你猜对了！数字就是 67！

🎉 游戏完成！
🎯 目标数字: 67
🔢 总尝试次数: 6
⭐ 评价: 👍 不错的表现！
🏁 游戏结果: 成功
```

## 🔍 与 heads-up-game 的对比

| 特性 | heads-up-game | number-guessing |
|------|---------------|-----------------|
| **循环条件** | `gameWon` | `isCorrect` |
| **循环步骤** | 问答互动 | 数字猜测 |
| **暂停机制** | 等待用户问题 | 等待用户猜测 |
| **结束条件** | 猜对名人 | 猜对数字 |
| **状态追踪** | 猜测次数 | 尝试次数 |

## 💡 适用场景

`.dountil()` 特性适合以下场景：

1. **游戏循环**: 直到游戏结束
2. **用户交互**: 直到用户满意
3. **数据处理**: 直到处理完成
4. **重试机制**: 直到操作成功
5. **审批流程**: 直到审批通过
6. **学习循环**: 直到掌握技能

## 🎯 核心优势

- **简洁语法**: 用一行代码实现复杂的循环逻辑
- **状态管理**: 自动处理循环中的状态传递
- **暂停恢复**: 支持异步用户交互
- **条件灵活**: 支持复杂的停止条件
- **调试友好**: 清晰的执行状态和步骤追踪

## 🔧 扩展建议

你可以基于这个演示创建更复杂的循环工作流：

1. **多条件循环**: 组合多个停止条件
2. **嵌套循环**: 在循环中包含其他循环
3. **动态条件**: 根据外部状态调整停止条件
4. **错误处理**: 在循环中处理异常情况
5. **性能优化**: 添加最大循环次数限制
