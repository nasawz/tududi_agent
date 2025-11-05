/**
 * 测试笔记API - 只读操作
 * 避免数据库写入锁问题
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

async function testNoteReadOnly() {
  console.log('========================================');
  console.log('测试：笔记API - 只读操作');
  console.log('========================================\n');
  console.log('说明: 此测试仅执行GET请求，避免数据库锁定\n');

  const tests = [
    {
      name: '获取笔记列表',
      method: 'GET',
      url: '/api/notes',
      params: {}
    },
    {
      name: '获取笔记列表（按标题降序）',
      method: 'GET',
      url: '/api/notes',
      params: { order_by: 'title:desc' }
    },
    {
      name: '获取笔记列表（按创建时间降序）',
      method: 'GET',
      url: '/api/notes',
      params: { order_by: 'created_at:desc' }
    },
    {
      name: '获取笔记列表（按更新时间升序）',
      method: 'GET',
      url: '/api/notes',
      params: { order_by: 'updated_at:asc' }
    },
    {
      name: '获取笔记列表（标签筛选）',
      method: 'GET',
      url: '/api/notes',
      params: { tag: '重要' }
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`测试: ${test.name}`);
    console.log(`URL: ${test.url}`);
    console.log('='.repeat(60));

    try {
      // 构建URL
      const url = new URL(`${BASE_URL}${test.url}`);
      Object.entries(test.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

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

      console.log(`\n✓ 成功! 状态码: ${response.status}`);
      console.log(`响应时间: ${response.headers['x-response-time'] || 'N/A'}`);

      const notes = response.data;
      console.log(`笔记数量: ${Array.isArray(notes) ? notes.length : 'N/A'}`);

      if (Array.isArray(notes) && notes.length > 0) {
        console.log('\n笔记详情:');
        notes.forEach((note, index) => {
          console.log(`  ${index + 1}. ${note.title} (${note.uid})`);
          if (note.tags && note.tags.length > 0) {
            console.log(`     标签: ${note.tags.map(tag => tag.name).join(', ')}`);
          }
          if (note.Project) {
            console.log(`     项目: ${note.Project.name}`);
          }
        });
      } else {
        console.log('\n笔记列表为空');
      }

      successCount++;

    } catch (error) {
      console.error(`\n❌ 失败:`, error.message);

      if (error.response) {
        console.error('状态码:', error.response.status);
        console.error('错误信息:', error.response.data);
      }

      failCount++;
    }

    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 测试获取不存在的笔记（应该返回404）
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试: 获取不存在的笔记（404测试）`);
  console.log(`URL: /api/note/note_non_existent_12345`);
  console.log('='.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/api/note/note_non_existent_12345`, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: () => true // 允许所有状态码
    });

    console.log(`\n状态码: ${response.status}`);

    if (response.status === 404) {
      console.log('✓ 正确: 不存在的笔记返回404');
      successCount++;
    } else {
      console.log('⚠️  意外: 期望404，但得到', response.status);
      console.log('响应:', response.data);
      failCount++;
    }

  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('\n✓ 正确: 不存在的笔记返回404');
      successCount++;
    } else {
      console.error(`\n❌ 失败:`, error.message);
      if (error.response) {
        console.error('状态码:', error.response.status);
        console.error('错误信息:', error.response.data);
      }
      failCount++;
    }
  }

  // 显示总结
  console.log('\n\n' + '='.repeat(60));
  console.log('测试总结');
  console.log('='.repeat(60));
  console.log(`总计: ${successCount + failCount} 个测试`);
  console.log(`成功: ${successCount} ✓`);
  console.log(`失败: ${failCount} ❌`);
  console.log('='.repeat(60) + '\n');

  if (failCount === 0) {
    console.log('🎉 所有只读测试通过！\n');
  }

  return { success: successCount, failed: failCount };
}

// 运行测试
if (require.main === module) {
  testNoteReadOnly()
    .then((result) => {
      console.log('测试完成');
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = testNoteReadOnly;
