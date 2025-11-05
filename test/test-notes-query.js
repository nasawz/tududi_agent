/**
 * 测试笔记API - 带查询参数
 * 测试不同的查询场景
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

// 测试场景配置
const testScenarios = [
  {
    name: '基本查询（默认排序）',
    url: '/api/notes',
    params: {},
    description: '按标题升序排列的笔记列表'
  },
  {
    name: '按标题降序排序',
    url: '/api/notes',
    params: { order_by: 'title:desc' },
    description: '按标题降序排列'
  },
  {
    name: '按创建时间排序',
    url: '/api/notes',
    params: { order_by: 'created_at:desc' },
    description: '按创建时间降序排列'
  },
  {
    name: '按更新时间排序',
    url: '/api/notes',
    params: { order_by: 'updated_at:asc' },
    description: '按更新时间升序排列'
  },
  {
    name: '按标签筛选',
    url: '/api/notes',
    params: { tag: '重要' },
    description: '筛选包含"重要"标签的笔记'
  }
];

async function testNoteQuery(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试场景: ${scenario.name}`);
  console.log(`描述: ${scenario.description}`);
  console.log('='.repeat(60));

  try {
    // 构建URL和查询参数
    const url = new URL(`${BASE_URL}${scenario.url}`);
    Object.entries(scenario.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log(`请求URL: ${url.toString()}`);

    const response = await axios.get(url.toString(), {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE,
        'Accept': 'application/json'
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    console.log(`\n✓ 请求成功 - 状态码: ${response.status}`);

    const notes = response.data;
    console.log(`笔记数量: ${Array.isArray(notes) ? notes.length : 'N/A'}`);

    if (Array.isArray(notes) && notes.length > 0) {
      console.log('\n笔记详情:');
      notes.forEach((note, index) => {
        console.log(`  ${index + 1}. ${note.title} (${note.uid})`);
        if (note.tags && note.tags.length > 0) {
          console.log(`     标签: ${note.tags.map(tag => tag.name).join(', ')}`);
        }
      });
    } else {
      console.log('\n笔记列表为空或无匹配数据');
    }

    return { success: true, data: notes };

  } catch (error) {
    console.error(`\n❌ 请求失败:`, error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('========================================');
  console.log('测试：笔记API - 多种查询场景');
  console.log('========================================\n');

  const results = [];

  for (const scenario of testScenarios) {
    const result = await testNoteQuery(scenario);
    results.push({ scenario: scenario.name, ...result });
    // 添加延迟以避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 显示测试总结
  console.log('\n\n' + '='.repeat(60));
  console.log('测试总结');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.success ? '✓ 成功' : '❌ 失败';
    console.log(`${status} - ${result.scenario}`);
    if (!result.success) {
      console.error(`  错误: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`总计: ${results.length} 个测试场景`);
  console.log(`成功: ${results.filter(r => r.success).length}`);
  console.log(`失败: ${results.filter(r => !r.success).length}`);
  console.log('='.repeat(60) + '\n');
}

// 运行测试
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = { runAllTests, testNoteQuery };
