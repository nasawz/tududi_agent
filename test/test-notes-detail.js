/**
 * 测试获取笔记详细信息
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

// 已发现的笔记UID列表
const noteUIDs = [
  'ujacu59hm7ugkhe',
  'd89m1ztq5gyrd9j'
];

async function getNoteDetail(uid) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`获取笔记详情: ${uid}`);
  console.log('='.repeat(60));

  try {
    // 获取笔记详情
    const response = await axios.get(`${BASE_URL}/api/note/${uid}`, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: () => true
    });

    console.log(`\n状态码: ${response.status}`);

    if (response.status === 200) {
      const note = response.data;

      console.log('\n=== 笔记详细信息 ===');
      console.log('UID:', note.uid);
      console.log('标题:', note.title);
      console.log('项目ID:', note.project_id);
      console.log('用户ID:', note.user_id);
      console.log('创建时间:', note.created_at);
      console.log('更新时间:', note.updated_at);

      // 标签信息
      if (note.tags && note.tags.length > 0) {
        console.log('\n标签:');
        note.tags.forEach(tag => {
          console.log(`  - ${tag.name} (${tag.uid})`);
        });
      } else {
        console.log('\n标签: 无');
      }

      // 关联项目
      if (note.Project) {
        console.log('\n关联项目:');
        console.log(`  名称: ${note.Project.name}`);
        console.log(`  UID: ${note.Project.uid}`);
      } else {
        console.log('\n关联项目: 无');
      }

      // 内容信息
      console.log('\n内容:');
      console.log(`  长度: ${note.content.length} 字符`);
      console.log(`  行数: ${note.content.split('\n').length} 行`);

      // 显示内容预览（前300字符）
      console.log('\n内容预览:');
      console.log('─'.repeat(60));
      const preview = note.content.substring(0, 300) + (note.content.length > 300 ? '\n\n...(内容截断)' : '');
      console.log(preview);
      console.log('─'.repeat(60));

      // 检查Markdown语法
      const hasMarkdown = /[#*`_[\]]/.test(note.content);
      console.log(`\nMarkdown支持: ${hasMarkdown ? '✓ 支持' : '✗ 不支持'}`);

      return { success: true, note };

    } else {
      console.log(`\n❌ 获取失败，状态码: ${response.status}`);
      console.log('响应:', response.data);
      return { success: false, error: `状态码: ${response.status}` };
    }

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
  console.log('笔记详情测试');
  console.log('========================================\n');

  const results = [];

  for (const uid of noteUIDs) {
    const result = await getNoteDetail(uid);
    results.push({ uid, ...result });
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 显示总结
  console.log('\n\n' + '='.repeat(60));
  console.log('测试总结');
  console.log('='.repeat(60));
  console.log(`总计: ${results.length} 个笔记`);

  const successCount = results.filter(r => r.success).length;
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${results.length - successCount}`);

  if (results.every(r => r.success)) {
    console.log('\n🎉 所有笔记详情获取成功！');
  }

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

module.exports = runAllTests;
