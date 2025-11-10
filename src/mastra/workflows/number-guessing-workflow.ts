import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const initStep = createStep({
  id: 'init-step',
  description: '初始化数字猜测游戏，生成一个1-100之间的随机数',
  inputSchema: z.object({
    start: z.boolean(),
  }),
  outputSchema: z.object({
    targetNumber: z.number(),
    attemptCount: z.number(),
    gameStarted: z.boolean(),
  }),
  execute: async () => {
    // 生成1-100之间的随机数
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    console.log(`🎯 游戏开始！我想了一个1-100之间的数字: ${targetNumber}`);
    
    return { 
      targetNumber, 
      attemptCount: 0,
      gameStarted: true 
    };
  },
});

const guessStep = createStep({
  id: 'guess-step',
  description: '处理用户的猜测，提供提示直到猜对为止',
  inputSchema: z.object({
    targetNumber: z.number(),
    attemptCount: z.number(),
    gameStarted: z.boolean(),
  }),
  resumeSchema: z.object({
    userGuess: z.number(),
  }),
  suspendSchema: z.object({
    hint: z.string(),
    attemptCount: z.number(),
  }),
  outputSchema: z.object({
    targetNumber: z.number(),
    attemptCount: z.number(),
    isCorrect: z.boolean(),
    lastGuess: z.number(),
    hint: z.string(),
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    const { targetNumber, attemptCount } = inputData;
    const { userGuess } = resumeData ?? {};

    // 如果没有用户猜测，暂停并要求输入
    if (userGuess === undefined) {
      return await suspend({
        hint: `🤔 请猜一个1-100之间的数字！这是第 ${attemptCount + 1} 次尝试。`,
        attemptCount: attemptCount + 1,
      });
    }

    const newAttemptCount = attemptCount + 1;
    let hint = '';
    let isCorrect = false;

    if (userGuess === targetNumber) {
      isCorrect = true;
      hint = `🎉 恭喜！你猜对了！数字就是 ${targetNumber}！`;
    } else if (userGuess < targetNumber) {
      hint = `📈 太小了！数字比 ${userGuess} 大。`;
    } else {
      hint = `📉 太大了！数字比 ${userGuess} 小。`;
    }

    console.log(`第 ${newAttemptCount} 次尝试: 用户猜测 ${userGuess}, ${hint}`);

    return {
      targetNumber,
      attemptCount: newAttemptCount,
      isCorrect,
      lastGuess: userGuess,
      hint,
    };
  },
});

const resultStep = createStep({
  id: 'result-step',
  description: '显示游戏结果和统计信息',
  inputSchema: z.object({
    targetNumber: z.number(),
    attemptCount: z.number(),
    isCorrect: z.boolean(),
    lastGuess: z.number(),
    hint: z.string(),
  }),
  outputSchema: z.object({
    targetNumber: z.number(),
    totalAttempts: z.number(),
    gameCompleted: z.boolean(),
    performance: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { targetNumber, attemptCount, lastGuess } = inputData;
    
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

    console.log(`🎮 游戏结束！`);
    console.log(`🎯 目标数字: ${targetNumber}`);
    console.log(`🎲 最后猜测: ${lastGuess}`);
    console.log(`🔢 总尝试次数: ${attemptCount}`);
    console.log(`⭐ 评价: ${performance}`);

    return {
      targetNumber,
      totalAttempts: attemptCount,
      gameCompleted: true,
      performance,
    };
  },
});

export const numberGuessingWorkflow = createWorkflow({
  id: 'number-guessing-workflow',
  inputSchema: z.object({
    start: z.boolean(),
  }),
  outputSchema: z.object({
    targetNumber: z.number(),
    totalAttempts: z.number(),
    gameCompleted: z.boolean(),
    performance: z.string(),
  }),
})
  .then(initStep)
  // 🔄 关键特性：使用 .dountil() 重复执行 guessStep，直到 isCorrect 为 true
  .dountil(guessStep, async ({ inputData: { isCorrect } }) => isCorrect)
  .then(resultStep)
  .commit();
