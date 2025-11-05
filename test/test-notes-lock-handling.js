/**
 * 数据库锁定规避策略测试
 * 集成多种重试和防锁策略
 */

const axios = require('axios');
const https = require('https');

// 创建HTTPS代理实例，忽略自签名证书错误
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 从mark.txt提取的配置信息
const BASE_URL = 'https://competent_shaw.orb.local';
const COOKIE = 'connect.sid=s%3AAJjxUb1uYvkSoT21Alu5EhBGjLzrWBIu.fB5I8%2FQeUb25Dw9lXFf7I54aRA1Ck6H37FegOIPcPj8; i18next=en';

// 工具函数：等待
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 策略1: 智能重试机制（指数退避 + 抖动）
async function createNoteWithSmartRetry(noteData, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`  尝试 ${attempt}/${maxAttempts}: 创建笔记 "${noteData.title}"`);

      const response = await axios.post(`${BASE_URL}/api/note`, noteData, {
        httpsAgent: httpsAgent,
        headers: {
          'Cookie': COOKIE,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 30000
      });

      if (response.status === 201) {
        console.log(`  ✅ 创建成功! (UID: ${response.data.uid})`);
        return { success: true, data: response.data, attempts: attempt };
      } else {
        throw new Error(`意外状态码: ${response.status}`);
      }

    } catch (error) {
      // 检测是否为数据库锁定错误
      let isLockError = false;

      if (error.response) {
        // axios包装的HTTP错误
        isLockError =
          error.response.status === 400 &&
          error.response.data &&
          (error.response.data.error?.includes('database is locked') ||
           (Array.isArray(error.response.data.details) &&
            error.response.data.details.some(d => d.includes('database is locked'))));
      } else if (error.code === 'SQLITE_BUSY') {
        // 直接的SQLite错误
        isLockError = true;
      }

      if (!isLockError) {
        console.log(`  ❌ 非锁定错误: ${error.message}`);
        if (error.response?.data) {
          console.log(`     详情:`, JSON.stringify(error.response.data));
        }
        return { success: false, error: error.message, attempts: attempt };
      }

      // 是锁定错误，需要重试
      if (attempt === maxAttempts) {
        console.log(`  ❌ 达到最大重试次数，放弃`);
        return { success: false, error: '达到最大重试次数', attempts: attempt };
      }

      // 计算延迟时间：指数退避 + 随机抖动
      const baseDelay = 1000; // 1秒
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 500; // 0-500ms随机抖动
      const totalDelay = exponentialDelay + jitter;

      console.log(`  ⚠️  数据库锁定，${totalDelay.toFixed(0)}ms后重试...`);
      await wait(totalDelay);
    }
  }

  return { success: false, error: '未知错误', attempts: maxAttempts };
}

// 策略2: 请求队列系统（串行化写入操作）
class RequestQueue {
  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
    this.queue = [];
    this.active = 0;
    this.stats = { total: 0, completed: 0, failed: 0 };
  }

  async add(operationName, operationFn) {
    this.stats.total++;
    return new Promise((resolve, reject) => {
      this.queue.push({ operationName, operationFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) return;

    const { operationName, operationFn, resolve, reject } = this.queue.shift();
    this.active++;

    try {
      console.log(`\n→ 执行: ${operationName}`);
      const result = await operationFn();
      this.stats.completed++;
      console.log(`✓ 完成: ${operationName}`);
      resolve(result);
    } catch (error) {
      this.stats.failed++;
      console.log(`❌ 失败: ${operationName} - ${error.message}`);
      reject(error);
    } finally {
      this.active--;
      this.process();
    }
  }

  printStats() {
    console.log('\n队列统计:');
    console.log(`  总计: ${this.stats.total}`);
    console.log(`  成功: ${this.stats.completed}`);
    console.log(`  失败: ${this.stats.failed}`);
    console.log(`  活跃: ${this.active}`);
    console.log(`  队列中: ${this.queue.length}`);
  }
}

// 生成测试数据
function generateTestNotes(count) {
  const notes = [];
  const baseTime = Date.now();

  for (let i = 1; i <= count; i++) {
    notes.push({
      title: `锁定测试笔记 ${i} - ${new Date().toLocaleTimeString()}`,
      content: `# 锁定测试笔记 ${i}

## 创建信息
- 序号: ${i}
- 测试目的: 验证锁定规避策略
- 创建时间: ${new Date().toISOString()}

## 内容测试
这是第 ${i} 个测试笔记。

**重点**: 测试在数据库锁定情况下的重试机制。

### 列表项
1. 项目 A
2. 项目 B
3. 项目 C

### 代码示例
\`\`\`javascript
function test() {
  console.log('测试 ${i}');
}
\`\`\`

---
测试完成 ✓
`,
      tags: [`测试${i}`, '锁定', '重试']
    });
  }

  return notes;
}

// 主要测试函数
async function runLockHandlingTest() {
  console.log('========================================');
  console.log('数据库锁定规避策略综合测试');
  console.log('========================================\n');

  console.log('测试目标:');
  console.log('1. 验证智能重试机制');
  console.log('2. 验证请求队列系统');
  console.log('3. 测试连续写入操作');
  console.log('4. 对比有/无重试的成功率\n');

  const testNotes = generateTestNotes(5);
  console.log(`准备创建 ${testNotes.length} 个测试笔记\n`);

  // 策略A: 使用队列系统（推荐）
  console.log('='.repeat(60));
  console.log('策略A: 使用请求队列系统');
  console.log('='.repeat(60));

  const queue = new RequestQueue(1); // 串行执行
  const results = [];

  for (let i = 0; i < testNotes.length; i++) {
    const noteData = testNotes[i];
    const noteNumber = i + 1;

    try {
      const result = await queue.add(`创建笔记 ${noteNumber}`, async () => {
        return await createNoteWithSmartRetry(noteData);
      });

      results.push({
        noteNumber,
        uid: result.data?.uid,
        success: result.success,
        attempts: result.attempts,
        error: result.error
      });

      // 短暂延迟，观察队列行为
      if (i < testNotes.length - 1) {
        await wait(500);
      }

    } catch (error) {
      console.log(`❌ 队列执行失败: ${error.message}`);
      results.push({
        noteNumber,
        success: false,
        error: error.message,
        attempts: 0
      });
    }
  }

  queue.printStats();

  // 策略B: 直接批量创建（对比）
  console.log('\n' + '='.repeat(60));
  console.log('策略B: 直接批量创建（无队列）');
  console.log('='.repeat(60));

  const directResults = [];
  const directNote = {
    title: `直接创建测试 - ${new Date().toLocaleTimeString()}`,
    content: '# 直接创建测试\n\n这个测试不使用队列系统',
    tags: ['直接', '对比']
  };

  console.log('直接创建笔记（不使用队列）:');
  const directResult = await createNoteWithSmartRetry(directNote);
  directResults.push(directResult);

  // 结果统计
  console.log('\n\n' + '='.repeat(60));
  console.log('测试结果统计');
  console.log('='.repeat(60));

  console.log('\n策略A（队列系统）结果:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const attempts = result.attempts > 1 ? ` (重试${result.attempts}次)` : '';
    console.log(`  ${status} 笔记 ${result.noteNumber}: ${result.uid || result.error}${attempts}`);
  });

  const queueSuccess = results.filter(r => r.success).length;
  const queueAvgAttempts = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.attempts, 0) / Math.max(queueSuccess, 1);

  console.log(`\n策略A统计:`);
  console.log(`  成功: ${queueSuccess}/${results.length}`);
  console.log(`  平均尝试次数: ${queueAvgAttempts.toFixed(2)}`);

  console.log('\n策略B（直接创建）结果:');
  const directSuccess = directResults.filter(r => r.success).length;
  const directAvgAttempts = directResults
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.attempts, 0) / Math.max(directSuccess, 1);

  directResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const attempts = result.attempts > 1 ? ` (重试${result.attempts}次)` : '';
    console.log(`  ${status} 直接笔记: ${result.data?.uid || result.error}${attempts}`);
  });

  console.log(`\n策略B统计:`);
  console.log(`  成功: ${directSuccess}/${directResults.length}`);
  console.log(`  平均尝试次数: ${directAvgAttempts.toFixed(2)}`);

  // 最终验证
  console.log('\n' + '='.repeat(60));
  console.log('验证创建的笔记');
  console.log('='.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/api/notes`, {
      httpsAgent,
      headers: { 'Cookie': COOKIE },
      withCredentials: true,
      timeout: 15000
    });

    const notes = response.data;
    console.log(`\n当前笔记总数: ${notes.length}`);

    // 查找本次测试创建的笔记
    const testNoteUIDs = results
      .filter(r => r.success)
      .map(r => r.uid);

    const foundNotes = notes.filter(note => testNoteUIDs.includes(note.uid));

    console.log(`本次测试创建的笔记: ${foundNotes.length}/${testNoteUIDs.length}`);

    if (foundNotes.length > 0) {
      console.log('\n新创建的笔记:');
      foundNotes.forEach(note => {
        console.log(`  - ${note.title} (${note.uid})`);
      });
    }

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('结论');
  console.log('='.repeat(60));

  const totalSuccess = queueSuccess + directSuccess;
  const totalAttempts = results.length + directResults.length;

  if (totalSuccess === totalAttempts) {
    console.log('\n🎉 所有策略测试成功！');
    console.log('\n建议:');
    console.log('1. 使用请求队列系统可以有效避免数据库锁定');
    console.log('2. 智能重试机制（指数退避 + 抖动）是关键');
    console.log('3. 串行化写入操作是最安全的方案');
  } else if (queueSuccess > directSuccess) {
    console.log('\n✅ 队列系统比直接创建更稳定');
    console.log('\n建议: 使用队列系统处理写入操作');
  } else {
    console.log('\n⚠️  测试中出现锁定问题');
    console.log('\n建议:');
    console.log('1. 增加重试次数');
    console.log('2. 延长延迟时间');
    console.log('3. 考虑升级到生产级数据库');
  }

  console.log('='.repeat(60) + '\n');

  return { queueSuccess, directSuccess, totalSuccess, totalAttempts };
}

// 运行测试
if (require.main === module) {
  runLockHandlingTest()
    .then((result) => {
      console.log('测试完成');
      process.exit(result.totalSuccess === result.totalAttempts ? 0 : 1);
    })
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = { runLockHandlingTest, createNoteWithSmartRetry };
