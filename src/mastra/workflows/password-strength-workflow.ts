import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const initPasswordStep = createStep({
  id: 'init-password-step',
  description: '初始化密码生成器，创建一个基础密码',
  inputSchema: z.object({
    baseWord: z.string(),
  }),
  outputSchema: z.object({
    password: z.string(),
    iterationCount: z.number(),
    strengthScore: z.number(),
    requirements: z.object({
      minLength: z.boolean(),
      hasUppercase: z.boolean(),
      hasLowercase: z.boolean(),
      hasNumbers: z.boolean(),
      hasSpecialChars: z.boolean(),
    }),
  }),
  execute: async ({ inputData }) => {
    const { baseWord } = inputData;
    const initialPassword = baseWord.toLowerCase();
    
    console.log(`🔐 密码强度检测器启动！`);
    console.log(`📝 基础密码: "${initialPassword}"`);
    
    // 检测初始密码强度
    const requirements = {
      minLength: initialPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(initialPassword),
      hasLowercase: /[a-z]/.test(initialPassword),
      hasNumbers: /\d/.test(initialPassword),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(initialPassword),
    };
    
    const strengthScore = Object.values(requirements).filter(Boolean).length;
    
    console.log(`📊 初始强度评分: ${strengthScore}/5`);
    console.log(`📋 要求检查:`, requirements);
    
    return {
      password: initialPassword,
      iterationCount: 0,
      strengthScore,
      requirements,
    };
  },
});

const improvePasswordStep = createStep({
  id: 'improve-password-step',
  description: '改进密码强度，添加缺失的元素',
  inputSchema: z.object({
    password: z.string(),
    iterationCount: z.number(),
    strengthScore: z.number(),
    requirements: z.object({
      minLength: z.boolean(),
      hasUppercase: z.boolean(),
      hasLowercase: z.boolean(),
      hasNumbers: z.boolean(),
      hasSpecialChars: z.boolean(),
    }),
  }),
  outputSchema: z.object({
    password: z.string(),
    iterationCount: z.number(),
    strengthScore: z.number(),
    requirements: z.object({
      minLength: z.boolean(),
      hasUppercase: z.boolean(),
      hasLowercase: z.boolean(),
      hasNumbers: z.boolean(),
      hasSpecialChars: z.boolean(),
    }),
    improvements: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    let { password, iterationCount, requirements } = inputData;
    const improvements: string[] = [];
    
    iterationCount++;
    console.log(`\n🔄 第 ${iterationCount} 次改进...`);
    console.log(`🔍 当前密码: "${password}"`);
    
    // 根据缺失的要求改进密码
    if (!requirements.minLength && password.length < 8) {
      const padding = '2024';
      password += padding;
      improvements.push(`添加数字后缀 "${padding}" 以达到最小长度`);
    }
    
    if (!requirements.hasUppercase) {
      // 将第一个字母大写
      password = password.charAt(0).toUpperCase() + password.slice(1);
      improvements.push('将首字母大写');
    }
    
    if (!requirements.hasNumbers && !/\d/.test(password)) {
      const randomNum = Math.floor(Math.random() * 100);
      password += randomNum.toString();
      improvements.push(`添加随机数字 "${randomNum}"`);
    }
    
    if (!requirements.hasSpecialChars) {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];
      const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
      password += randomSpecial;
      improvements.push(`添加特殊字符 "${randomSpecial}"`);
    }
    
    // 重新检测密码强度
    const newRequirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const newStrengthScore = Object.values(newRequirements).filter(Boolean).length;
    
    console.log(`✨ 改进措施:`, improvements);
    console.log(`🔐 改进后密码: "${password}"`);
    console.log(`📊 新强度评分: ${newStrengthScore}/5`);
    console.log(`📋 要求检查:`, newRequirements);
    
    return {
      password,
      iterationCount,
      strengthScore: newStrengthScore,
      requirements: newRequirements,
      improvements,
    };
  },
});

const finalizePasswordStep = createStep({
  id: 'finalize-password-step',
  description: '完成密码生成，显示最终结果和统计信息',
  inputSchema: z.object({
    password: z.string(),
    iterationCount: z.number(),
    strengthScore: z.number(),
    requirements: z.object({
      minLength: z.boolean(),
      hasUppercase: z.boolean(),
      hasLowercase: z.boolean(),
      hasNumbers: z.boolean(),
      hasSpecialChars: z.boolean(),
    }),
    improvements: z.array(z.string()),
  }),
  outputSchema: z.object({
    finalPassword: z.string(),
    totalIterations: z.number(),
    finalStrengthScore: z.number(),
    isSecure: z.boolean(),
    securityLevel: z.string(),
    summary: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { password, iterationCount, strengthScore, requirements } = inputData;
    
    let securityLevel = '';
    if (strengthScore === 5) {
      securityLevel = '🛡️ 极强 - 军用级别';
    } else if (strengthScore === 4) {
      securityLevel = '🔒 很强 - 企业级别';
    } else if (strengthScore === 3) {
      securityLevel = '🔐 中等 - 个人使用';
    } else if (strengthScore === 2) {
      securityLevel = '⚠️ 较弱 - 需要改进';
    } else {
      securityLevel = '❌ 很弱 - 不安全';
    }
    
    const isSecure = strengthScore >= 4;
    
    console.log(`\n🎉 密码生成完成！`);
    console.log(`🔐 最终密码: "${password}"`);
    console.log(`🔄 总改进次数: ${iterationCount}`);
    console.log(`📊 最终强度: ${strengthScore}/5`);
    console.log(`🛡️ 安全等级: ${securityLevel}`);
    console.log(`✅ 是否安全: ${isSecure ? '是' : '否'}`);
    
    // 详细要求检查
    console.log(`\n📋 详细检查结果:`);
    console.log(`  ✅ 长度 ≥ 8: ${requirements.minLength ? '通过' : '未通过'}`);
    console.log(`  ✅ 包含大写字母: ${requirements.hasUppercase ? '通过' : '未通过'}`);
    console.log(`  ✅ 包含小写字母: ${requirements.hasLowercase ? '通过' : '未通过'}`);
    console.log(`  ✅ 包含数字: ${requirements.hasNumbers ? '通过' : '未通过'}`);
    console.log(`  ✅ 包含特殊字符: ${requirements.hasSpecialChars ? '通过' : '未通过'}`);
    
    const summary = `密码强度检测完成：经过 ${iterationCount} 次改进，最终密码强度为 ${strengthScore}/5，安全等级：${securityLevel}`;
    
    return {
      finalPassword: password,
      totalIterations: iterationCount,
      finalStrengthScore: strengthScore,
      isSecure,
      securityLevel,
      summary,
    };
  },
});

export const passwordStrengthWorkflow = createWorkflow({
  id: 'password-strength-workflow',
  inputSchema: z.object({
    baseWord: z.string(),
  }),
  outputSchema: z.object({
    finalPassword: z.string(),
    totalIterations: z.number(),
    finalStrengthScore: z.number(),
    isSecure: z.boolean(),
    securityLevel: z.string(),
    summary: z.string(),
  }),
})
  .then(initPasswordStep)
  // 🔄 关键特性：使用 .dowhile() 持续改进密码，直到强度足够
  // 注意：至少执行一次 improvePasswordStep，然后检查条件
  .dowhile(
    improvePasswordStep, 
    async ({ inputData: { strengthScore }, iterationCount }) => {
      // 条件：强度小于4分 且 改进次数少于5次时继续循环
      const shouldContinue = strengthScore < 4 && iterationCount < 5;
      console.log(`🤔 检查是否继续改进: 强度=${strengthScore}/5, 次数=${iterationCount}, 继续=${shouldContinue}`);
      return shouldContinue;
    }
  )
  .then(finalizePasswordStep)
  .commit();
