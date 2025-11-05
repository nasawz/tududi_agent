/**
 * 测试笔记API - 完整CRUD操作
 * 包含创建、读取、更新、删除笔记
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
  title: '测试笔记 - API功能验证',
  content: `# 测试笔记

## 目的
这是一个用于测试 Tududi 笔记API功能的测试笔记。

## 测试内容
- ✅ 获取笔记列表
- ✅ 创建新笔记
- ✅ 更新笔记
- ✅ 删除笔记

## 创建时间
${new Date().toISOString()}

## Markdown支持
- **粗体文本**
- *斜体文本*
- 列表项
  - 子项目1
  - 子项目2

\`\`\`javascript
console.log('代码块支持');
\`\`\`

[链接示例](https://github.com/chrisvel/tududi)
`,
  tags: ['测试', 'API', '验证']
};

let createdNoteUID = null;

// 1. 测试创建笔记
async function testCreateNote() {
  console.log('\n' + '='.repeat(60));
  console.log('1. 测试创建笔记');
  console.log('='.repeat(60));

  try {
    console.log('\n创建笔记数据:', JSON.stringify(testNoteData, null, 2));

    const response = await axios.post(`${BASE_URL}/api/note`, testNoteData, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE,
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    console.log('\n✓ 请求成功! 状态码:', response.status);

    // 检查是否是成功响应（201）或错误响应（400）
    if (response.status === 201) {
      const note = response.data;
      createdNoteUID = note.uid;

      console.log('\n创建的笔记:');
      console.log('- UID:', note.uid);
      console.log('- 标题:', note.title);
      console.log('- 项目ID:', note.project_id);
      console.log('- 用户ID:', note.user_id);
      console.log('- 创建时间:', note.created_at);
      console.log('- 标签:', note.tags.map(tag => tag.name).join(', '));

      return { success: true, note };
    } else {
      console.log('\n响应数据:', response.data);
      return { success: false, error: '创建失败，状态码: ' + response.status, data: response.data };
    }

  } catch (error) {
    console.error('\n❌ 创建失败:', error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return { success: false, error: error.message };
  }
}

// 2. 测试获取单个笔记
async function testGetNoteById(uid) {
  console.log('\n' + '='.repeat(60));
  console.log('2. 测试获取单个笔记');
  console.log('='.repeat(60));

  try {
    const url = `${BASE_URL}/api/note/${uid}`;
    console.log('\n请求URL:', url);

    const response = await axios.get(url, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    console.log('\n✓ 获取成功! 状态码:', response.status);

    const note = response.data;
    console.log('\n笔记详情:');
    console.log('- UID:', note.uid);
    console.log('- 标题:', note.title);
    console.log('- 内容长度:', note.content.length, '字符');
    console.log('- 标签数量:', note.tags.length);

    // 显示内容预览（前200字符）
    const preview = note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '');
    console.log('\n内容预览:');
    console.log(preview);

    return { success: true, note };

  } catch (error) {
    console.error('\n❌ 获取失败:', error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return { success: false, error: error.message };
  }
}

// 3. 测试更新笔记
async function testUpdateNote(uid) {
  console.log('\n' + '='.repeat(60));
  console.log('3. 测试更新笔记');
  console.log('='.repeat(60));

  try {
    const updateData = {
      title: '已更新的测试笔记 - ' + new Date().toLocaleString(),
      content: testNoteData.content + '\n\n## 更新信息\n\n此笔记已在 ' + new Date().toISOString() + ' 更新',
      tags: ['测试', 'API', '验证', '已更新']
    };

    console.log('\n更新数据:', JSON.stringify(updateData, null, 2));

    const response = await axios.patch(`${BASE_URL}/api/note/${uid}`, updateData, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE,
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    console.log('\n✓ 更新成功! 状态码:', response.status);

    const note = response.data;
    console.log('\n更新后的笔记:');
    console.log('- UID:', note.uid);
    console.log('- 新标题:', note.title);
    console.log('- 更新时间:', note.updated_at);
    console.log('- 新标签:', note.tags.map(tag => tag.name).join(', '));

    return { success: true, note };

  } catch (error) {
    console.error('\n❌ 更新失败:', error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return { success: false, error: error.message };
  }
}

// 4. 测试删除笔记
async function testDeleteNote(uid) {
  console.log('\n' + '='.repeat(60));
  console.log('4. 测试删除笔记');
  console.log('='.repeat(60));

  try {
    const url = `${BASE_URL}/api/note/${uid}`;
    console.log('\n请求URL:', url);

    const response = await axios.delete(url, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    console.log('\n✓ 删除成功! 状态码:', response.status);
    console.log('\n笔记已被永久删除');

    return { success: true };

  } catch (error) {
    console.error('\n❌ 删除失败:', error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return { success: false, error: error.message };
  }
}

// 5. 验证笔记已删除
async function testVerifyDelete(uid) {
  console.log('\n' + '='.repeat(60));
  console.log('5. 验证笔记已被删除');
  console.log('='.repeat(60));

  try {
    const url = `${BASE_URL}/api/note/${uid}`;
    console.log('\n请求URL:', url);

    const response = await axios.get(url, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: () => true // 允许所有状态码
    });

    console.log('\n❌ 意外: 笔记仍然存在');
    console.log('状态码:', response.status);
    console.log('笔记数据:', response.data);

    return { success: false, error: '笔记仍然存在' };

  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('\n✓ 验证成功: 笔记不存在 (404)');
      console.log('笔记已被正确删除');
      return { success: true };
    }

    console.error('\n❌ 验证失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return { success: false, error: error.message };
  }
}

// 运行完整CRUD测试
async function runAllCRUDTests() {
  console.log('========================================');
  console.log('笔记API - 完整CRUD功能测试');
  console.log('========================================\n');
  console.log('测试流程:');
  console.log('1. 创建笔记');
  console.log('2. 读取笔记');
  console.log('3. 更新笔记');
  console.log('4. 删除笔记');
  console.log('5. 验证删除');
  console.log('\n');

  const results = [];

  // 1. 创建笔记
  const createResult = await testCreateNote();
  results.push({ step: '创建笔记', ...createResult });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!createResult.success) {
    console.log('\n❌ 创建失败，无法继续后续测试');
    return;
  }

  // 2. 读取笔记
  const readResult = await testGetNoteById(createResult.note.uid);
  results.push({ step: '读取笔记', ...readResult });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!readResult.success) {
    console.log('\n❌ 读取失败，继续测试更新');
  }

  // 3. 更新笔记
  const updateResult = await testUpdateNote(createResult.note.uid);
  results.push({ step: '更新笔记', ...updateResult });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!updateResult.success) {
    console.log('\n❌ 更新失败，继续测试删除');
  }

  // 4. 删除笔记
  const deleteResult = await testDeleteNote(createResult.note.uid);
  results.push({ step: '删除笔记', ...deleteResult });
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!deleteResult.success) {
    console.log('\n❌ 删除失败，无法进行验证');
    return;
  }

  // 5. 验证删除
  const verifyResult = await testVerifyDelete(createResult.note.uid);
  results.push({ step: '验证删除', ...verifyResult });

  // 显示测试总结
  console.log('\n\n' + '='.repeat(60));
  console.log('CRUD测试总结');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.success ? '✓ 成功' : '❌ 失败';
    console.log(`${status} - ${result.step}`);
    if (!result.success) {
      console.error(`  错误: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`总计: ${results.length} 个测试步骤`);
  console.log(`成功: ${results.filter(r => r.success).length}`);
  console.log(`失败: ${results.filter(r => !r.success).length}`);

  if (results.every(r => r.success)) {
    console.log('\n🎉 所有CRUD操作测试通过！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查错误信息');
  }
  console.log('='.repeat(60) + '\n');
}

// 运行测试
if (require.main === module) {
  runAllCRUDTests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = { runAllCRUDTests };
