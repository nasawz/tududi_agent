import { mastra } from '../index';

/**
 * 密码强度检测器工作流使用示例
 * 
 * 这个示例演示了如何使用 .dowhile() 特性来创建一个循环改进的工作流，
 * 至少执行一次改进步骤，然后根据条件决定是否继续改进。
 */

export async function runPasswordStrengthExample() {
  console.log('🔐 开始密码强度检测器演示...\n');

  try {
    // 注意：这里只是演示代码结构，实际执行需要完整的 Mastra 运行时环境
    console.log("⚠️  注意：这是演示代码，实际执行需要完整的 Mastra 运行时环境");
    
    // 测试不同的基础密码
    const testPasswords = [
      'hello',      // 很弱的密码
      'Password',   // 中等密码  
      'MyPass123',  // 较强密码
    ];
    
    for (const baseWord of testPasswords) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🧪 测试基础密码: "${baseWord}"`);
      console.log(`${'='.repeat(50)}`);
      
      await simulatePasswordStrengthWorkflow(baseWord);
    }

    // 实际的工作流执行代码（注释掉，因为需要完整的运行时环境）:
    // const workflow = mastra.getWorkflow('passwordStrengthWorkflow');
    // const result = await workflow.execute({ baseWord: 'hello' });
    // console.log('📊 最终结果:', result);

  } catch (error) {
    console.error('❌ 工作流执行出错:', error);
  }
}

/**
 * 模拟密码强度工作流执行
 * 演示 .dowhile() 的执行逻辑
 */
async function simulatePasswordStrengthWorkflow(baseWord: string) {
  // 步骤1: 初始化密码
  let password = baseWord.toLowerCase();
  let iterationCount = 0;
  
  console.log(`🔐 密码强度检测器启动！`);
  console.log(`📝 基础密码: "${password}"`);
  
  // 检测初始密码强度
  let requirements = checkPasswordRequirements(password);
  let strengthScore = Object.values(requirements).filter(Boolean).length;
  
  console.log(`📊 初始强度评分: ${strengthScore}/5`);
  console.log(`📋 要求检查:`, requirements);
  
  // 🔄 .dowhile() 逻辑模拟：至少执行一次，然后检查条件
  do {
    iterationCount++;
    console.log(`\n🔄 第 ${iterationCount} 次改进...`);
    console.log(`🔍 当前密码: "${password}"`);
    
    const improvements: string[] = [];
    
    // 根据缺失的要求改进密码
    if (!requirements.minLength && password.length < 8) {
      const padding = '2024';
      password += padding;
      improvements.push(`添加数字后缀 "${padding}" 以达到最小长度`);
    }
    
    if (!requirements.hasUppercase) {
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
    requirements = checkPasswordRequirements(password);
    strengthScore = Object.values(requirements).filter(Boolean).length;
    
    console.log(`✨ 改进措施:`, improvements);
    console.log(`🔐 改进后密码: "${password}"`);
    console.log(`📊 新强度评分: ${strengthScore}/5`);
    console.log(`📋 要求检查:`, requirements);
    
    // 🤔 .dowhile() 条件检查
    const shouldContinue = strengthScore < 4 && iterationCount < 5;
    console.log(`🤔 检查是否继续改进: 强度=${strengthScore}/5, 次数=${iterationCount}, 继续=${shouldContinue}`);
    
    // 如果不需要继续，跳出循环
    if (!shouldContinue) {
      break;
    }
    
  } while (true); // 实际条件在循环内部检查
  
  // 步骤3: 完成密码生成
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
}

/**
 * 检查密码要求
 */
function checkPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

/**
 * .dowhile() 特性说明：
 * 
 * 在这个工作流中，.dowhile() 的使用方式是：
 * 
 * .dowhile(
 *   improvePasswordStep, 
 *   async ({ inputData: { strengthScore }, iterationCount }) => {
 *     return strengthScore < 4 && iterationCount < 5;
 *   }
 * )
 * 
 * 关键特点：
 * 1. 🔄 至少执行一次 improvePasswordStep（改进步骤）
 * 2. 📊 每次执行后检查条件：强度是否小于4分 且 次数是否少于5次
 * 3. ✅ 如果条件为 true，继续循环
 * 4. ❌ 如果条件为 false，停止循环，继续下一步
 * 5. 📈 iterationCount 从1开始计数
 * 
 * 与 .dountil() 的区别：
 * - .dowhile(): 条件为 true 时继续循环
 * - .dountil(): 条件为 true 时停止循环
 * 
 * 适用场景：
 * - 数据改进循环（直到达到标准）
 * - 重试机制（直到成功或达到最大次数）
 * - 渐进式处理（逐步优化结果）
 * - 用户交互循环（直到用户满意）
 */

// 如果直接运行此文件，执行示例
if (require.main === module) {
  runPasswordStrengthExample();
}
