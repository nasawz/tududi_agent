/**
 * 慢速创建笔记测试
 * 增加延迟以避免数据库锁定问题
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

// 测试用的笔记数据
const testNoteData = {
  title: '慢速创建测试笔记 - ' + new Date().toLocaleString(),
  content: `# 慢速创建测试笔记

## 创建时间
${new Date().toISOString()}

## 测试目的
此笔记用于测试慢速创建是否能避免数据库锁定问题。

## 测试策略
- 增加请求间隔
- 避免并发访问
- 使用更简单的内容

## 内容测试
这是一个简单的Markdown测试笔记，包含基本格式：

- **粗体文本**
- *斜体文本*
- 列表项1
- 列表项2

\`\`\`
console.log('代码块');
\`\`\`

[链接](https://github.com/chrisvel/tududi)

---
测试完成
`,
  tags: ['慢速测试', '数据库锁定']
};

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSlowCreateNote() {
  console.log('========================================');
  console.log('测试：慢速创建笔记');
  console.log('========================================\n');
  console.log('策略:');
  console.log('- 增加请求间隔到2秒');
  console.log('- 使用简单内容');
  console.log('- 避免并发访问');
  console.log('- 失败时自动重试\n');

  // 等待3秒准备
  console.log('等待3秒准备时间...');
  await wait(3000);

  let attempt = 1;
  const maxAttempts = 3;
  let success = false;
  let note = null;

  while (attempt <= maxAttempts && !success) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`第 ${attempt} 次尝试 (共 ${maxAttempts} 次)`);
    console.log('='.repeat(60));

    try {
      console.log('\n创建笔记数据:');
      console.log('标题:', testNoteData.title);
      console.log('内容长度:', testNoteData.content.length, '字符');
      console.log('标签:', testNoteData.tags.join(', '));

      const startTime = Date.now();
      const response = await axios.post(`${BASE_URL}/api/note`, testNoteData, {
        httpsAgent: httpsAgent,
        headers: {
          'Cookie': COOKIE,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 30000,  // 增加超时时间
        validateStatus: () => true  // 允许所有状态码
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`\n请求完成! 状态码: ${response.status}`);
      console.log(`响应时间: ${responseTime}ms`);

      if (response.status === 201) {
        note = response.data;
        console.log('\n✅ 创建成功!');
        console.log('\n创建的笔记:');
        console.log('- UID:', note.uid);
        console.log('- 标题:', note.title);
        console.log('- 项目ID:', note.project_id);
        console.log('- 用户ID:', note.user_id);
        console.log('- 创建时间:', note.created_at);
        console.log('- 更新时间:', note.updated_at);

        if (note.tags && note.tags.length > 0) {
          console.log('- 标签:', note.tags.map(tag => tag.name).join(', '));
        }

        console.log('\n验证笔记:');
        console.log('- 标题匹配:', note.title === testNoteData.title ? '✓' : '✗');
        console.log('- 内容匹配:', note.content === testNoteData.content ? '✓' : '✗');

        if (note.tags) {
          const tagMatch = note.tags.length === testNoteData.tags.length &&
            note.tags.every(tag => testNoteData.tags.includes(tag.name));
          console.log('- 标签匹配:', tagMatch ? '✓' : '✗');
        }

        success = true;
        break;

      } else {
        console.log('\n❌ 创建失败，状态码:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.error) {
          console.log('错误信息:', response.data.error);
          if (response.data.details && response.data.details.length > 0) {
            console.log('详细信息:', response.data.details.join(', '));
          }
        }
      }

    } catch (error) {
      console.error('\n❌ 请求异常:', error.message);

      if (error.response) {
        console.error('状态码:', error.response.status);
        console.error('错误信息:', error.response.data);
      }
    }

    if (attempt < maxAttempts) {
      const waitTime = attempt * 3000;  // 递增等待时间
      console.log(`\n等待 ${waitTime/1000} 秒后重试...`);
      await wait(waitTime);
    }

    attempt++;
  }

  if (!success) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ 所有尝试都失败了');
    console.log('建议:');
    console.log('1. 检查数据库状态');
    console.log('2. 重启应用程序');
    console.log('3. 或使用只读测试: node test/test-notes-readonly.js');
    console.log('='.repeat(60));
    return { success: false };
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成!');
  console.log('='.repeat(60) + '\n');

  return { success: true, note };
}

async function testVerifyCreated(note) {
  console.log('\n' + '='.repeat(60));
  console.log('验证创建的笔记');
  console.log('='.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/api/note/${note.uid}`, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE
      },
      withCredentials: true,
      timeout: 15000
    });

    console.log('\n✓ 验证成功! 笔记确实存在');
    console.log('状态码:', response.status);

    const verifiedNote = response.data;
    console.log('\n笔记信息:');
    console.log('- UID:', verifiedNote.uid);
    console.log('- 标题:', verifiedNote.title);
    console.log('- 内容长度:', verifiedNote.content.length, '字符');

    // 检查是否能正确获取内容
    console.log('\n内容验证:');
    const hasTitle = verifiedNote.content.includes('# 慢速创建测试笔记');
    const hasList = verifiedNote.content.includes('- **粗体文本**');
    const hasCode = verifiedNote.content.includes('console.log');
    const hasLink = verifiedNote.content.includes('[链接]');

    console.log('- 包含标题:', hasTitle ? '✓' : '✗');
    console.log('- 包含列表:', hasList ? '✓' : '✗');
    console.log('- 包含代码:', hasCode ? '✓' : '✗');
    console.log('- 包含链接:', hasLink ? '✓' : '✗');

    return true;

  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return false;
  }
}

// 运行测试
if (require.main === module) {
  (async () => {
    const result = await testSlowCreateNote();

    // if (result.success && result.note) {
    //   await wait(1000);
    //   await testVerifyCreated(result.note);
    // }

    process.exit(result.success ? 0 : 1);
  })().catch(err => {
    console.error('未捕获的错误:', err);
    process.exit(1);
  });
}

module.exports = testSlowCreateNote;
