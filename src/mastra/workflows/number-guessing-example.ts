/**
 * 数字猜测游戏工作流使用示例
 * 
 * 这个示例演示了如何使用 .dountil() 特性来创建一个循环执行的工作流，
 * 直到满足特定条件（猜对数字）为止。
 */

export async function runNumberGuessingExample() {
  console.log('🎮 开始数字猜测游戏演示...\n');

  try {
    // 注意：这里只是演示代码结构，实际执行需要完整的 Mastra 运行时环境
    console.log("⚠️  注意：这是演示代码，实际执行需要完整的 Mastra 运行时环境");
    
    // 模拟工作流执行过程
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    console.log(`🎯 游戏开始！我想了一个1-100之间的数字: ${targetNumber}`);
    
    // 模拟用户猜测过程
    const guesses = [50, 75, 62, 68, 65, 67]; // 假设目标数字是67
    let attemptCount = 0;
    let isCorrect = false;
    
    for (const guess of guesses) {
      attemptCount++;
      console.log(`\n👤 用户猜测 (第${attemptCount}次): ${guess}`);
      
      if (guess === targetNumber) {
        isCorrect = true;
        console.log(`🎉 恭喜！你猜对了！数字就是 ${targetNumber}！`);
        break;
      } else if (guess < targetNumber) {
        console.log(`📈 太小了！数字比 ${guess} 大。`);
      } else {
        console.log(`📉 太大了！数字比 ${guess} 小。`);
      }
    }

    // 显示最终结果
    let performance = '';
    if (attemptCount <= 3) {
      performance = '🏆 太棒了！你是猜数字高手！';
    } else if (attemptCount <= 6) {
      performance = '👍 不错的表现！';
    } else if (attemptCount <= 10) {
      performance = '😊 还不错，继续努力！';
    } else {
      performance = '🤔 下次可以试试二分法哦！';
    }

    console.log('\n🎉 游戏完成！');
    console.log(`🎯 目标数字: ${targetNumber}`);
    console.log(`🔢 总尝试次数: ${attemptCount}`);
    console.log(`⭐ 评价: ${performance}`);
    console.log(`🏁 游戏结果: ${isCorrect ? '成功' : '未完成'}`);

    // 实际的工作流执行代码（注释掉，因为需要完整的运行时环境）:
    // const workflow = mastra.getWorkflow('numberGuessingWorkflow');
    // const execution = await workflow.execute({ start: true });
    // 
    // // 处理暂停和恢复逻辑
    // while (execution.status === 'suspended') {
    //   const userGuess = getUserInput(); // 获取用户输入
    //   await execution.resume({ userGuess });
    // }
    // 
    // console.log('📊 最终结果:', execution.result);

  } catch (error) {
    console.error('❌ 工作流执行出错:', error);
  }
}

/**
 * .dountil() 特性说明：
 * 
 * 在这个工作流中，.dountil() 的使用方式是：
 * 
 * .dountil(guessStep, async ({ inputData: { isCorrect } }) => isCorrect)
 * 
 * 这意味着：
 * 1. 重复执行 guessStep（猜测步骤）
 * 2. 每次执行后检查条件：isCorrect 是否为 true
 * 3. 如果 isCorrect 为 false，继续循环
 * 4. 如果 isCorrect 为 true，停止循环，继续下一步
 * 
 * 这种模式非常适合：
 * - 游戏循环（直到游戏结束）
 * - 数据处理循环（直到处理完成）
 * - 用户交互循环（直到用户满意）
 * - 重试机制（直到成功）
 */

// 如果直接运行此文件，执行示例
if (require.main === module) {
  runNumberGuessingExample();
}
