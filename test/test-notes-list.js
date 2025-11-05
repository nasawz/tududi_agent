/**
 * 测试获取笔记列表 API
 * API路径: GET /api/notes
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

async function testGetNotesList() {
  console.log('========================================');
  console.log('测试：获取笔记列表 API');
  console.log('========================================\n');

  try {
    // 发送GET请求
    console.log('发送请求到:', `${BASE_URL}/api/notes`);
    console.log('使用Cookie:', COOKIE.substring(0, 50) + '...\n');

    const config = {
      method: 'get',
      url: `${BASE_URL}/api/notes`,
      headers: {
        'Cookie': COOKIE,
        'Accept': 'application/json'
      },
      httpsAgent: httpsAgent,
      withCredentials: true,
      timeout: 15000,
      validateStatus: function (status) {
        return status < 500; // 只在5xx错误时抛出异常
      }
    };

    console.log('请求配置:', JSON.stringify({
      method: config.method,
      url: config.url,
      headers: config.headers
    }, null, 2));
    console.log('\n发送请求...\n');

    const response = await axios(config);

    // 显示响应状态
    console.log('✓ 请求成功!');
    console.log('状态码:', response.status);
    console.log('状态文本:', response.statusText);
    console.log('\n');

    // 解析响应数据
    const notes = response.data;

    // 显示响应数据
    console.log('=== 笔记列表 ===');
    if (Array.isArray(notes)) {
      console.log(`总计 ${notes.length} 条笔记\n`);

      if (notes.length > 0) {
        notes.forEach((note, index) => {
          console.log(`--- 笔记 ${index + 1} ---`);
          console.log('UID:', note.uid);
          console.log('标题:', note.title);
          console.log('项目ID:', note.project_id);

          // 显示内容预览（如果存在）
          if (note.content) {
            const preview = note.content.length > 100
              ? note.content.substring(0, 100) + '...'
              : note.content;
            console.log('内容预览:', preview);
          }

          // 显示标签
          if (note.tags && note.tags.length > 0) {
            console.log('标签:', note.tags.map(tag => tag.name).join(', '));
          }

          // 显示关联项目
          if (note.Project) {
            console.log('关联项目:', note.Project.name);
          }

          // 显示创建和更新时间
          console.log('创建时间:', note.created_at);
          console.log('更新时间:', note.updated_at);
          console.log('');
        });
      } else {
        console.log('暂无笔记数据');
        console.log('提示: 用户尚未创建任何笔记');
      }
    } else {
      console.log('响应格式异常:', notes);
    }

    console.log('\n=== 响应验证 ===');
    if (Array.isArray(notes)) {
      if (notes.length > 0) {
        const firstNote = notes[0];
        const requiredFields = ['uid', 'title', 'created_at', 'updated_at'];
        let hasAllRequired = true;

        requiredFields.forEach(field => {
          const exists = firstNote.hasOwnProperty(field);
          console.log(`✓ ${field}: ${exists ? '存在' : '缺失'} ${exists ? '' : '(❌ 错误!)'}`);
          if (!exists) hasAllRequired = false;
        });

        console.log('\n========================================');
        if (hasAllRequired) {
          console.log('✓ 测试通过 - 所有必要字段都存在');
        } else {
          console.log('❌ 测试失败 - 部分必要字段缺失');
        }
      } else {
        console.log('笔记列表为空（无数据）');
        console.log('\n========================================');
        console.log('✓ 测试通过 - API正常工作，但暂无数据');
      }
    } else {
      console.log('❌ 响应格式异常 - 不是数组');
      console.log('\n========================================');
      console.log('❌ 测试失败');
    }
    console.log('========================================\n');

    return true;

  } catch (error) {
    console.error('\n❌ 测试失败!\n');

    if (error.response) {
      // 服务器响应了错误状态码
      console.error('状态码:', error.response.status);
      console.error('状态文本:', error.response.statusText);
      console.error('响应数据:');

      if (error.response.data) {
        console.error(JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('错误: 没有收到服务器响应');
      console.error('请检查:');
      console.error('  1. 服务器是否运行');
      console.error('  2. 网络连接是否正常');
      console.error('  3. BASE_URL是否正确:', BASE_URL);
    } else {
      // 其他错误
      console.error('错误信息:', error.message);
    }

    console.log('\n========================================');
    console.log('❌ 测试失败');
    console.log('========================================\n');

    return false;
  }
}

// 运行测试
if (require.main === module) {
  testGetNotesList()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = testGetNotesList;
