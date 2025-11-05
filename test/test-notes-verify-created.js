/**
 * 验证新创建的笔记是否出现在列表中
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

// 刚创建的笔记UID
const newNoteUID = 'hr93759wccbtdpg';

async function verifyNoteInList() {
  console.log('========================================');
  console.log('验证：检查新笔记是否在列表中');
  console.log('========================================\n');

  try {
    const response = await axios.get(`${BASE_URL}/api/notes`, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE,
        'Accept': 'application/json'
      },
      withCredentials: true,
      timeout: 15000
    });

    console.log('✓ 成功获取笔记列表');
    console.log('状态码:', response.status);

    const notes = response.data;
    console.log(`\n笔记总数: ${notes.length} 条\n`);

    // 查找新创建的笔记
    const newNote = notes.find(note => note.uid === newNoteUID);

    if (newNote) {
      console.log('✅ 找到新创建的笔记!');
      console.log('\n笔记信息:');
      console.log('- UID:', newNote.uid);
      console.log('- 标题:', newNote.title);
      console.log('- 创建时间:', newNote.created_at);
      console.log('- 更新时间:', newNote.updated_at);

      if (newNote.tags && newNote.tags.length > 0) {
        console.log('- 标签:', newNote.tags.map(tag => tag.name).join(', '));
      } else {
        console.log('- 标签: 无');
      }

      console.log('\n所有笔记列表:');
      notes.forEach((note, index) => {
        const isNew = note.uid === newNoteUID ? ' [🆕 新创建]' : '';
        console.log(`${index + 1}. ${note.title} (${note.uid})${isNew}`);
      });

      return true;
    } else {
      console.log('❌ 未找到新创建的笔记');
      console.log('\n所有笔记列表:');
      notes.forEach((note, index) => {
        console.log(`${index + 1}. ${note.title} (${note.uid})`);
      });
      return false;
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return false;
  }
}

async function runTest() {
  const found = await verifyNoteInList();

  console.log('\n' + '='.repeat(60));

  if (found) {
    console.log('✅ 验证成功！新笔记已出现在列表中');
  } else {
    console.log('❌ 验证失败！新笔记未出现在列表中');
    console.log('可能的原因:');
    console.log('1. 笔记未正确保存到数据库');
    console.log('2. API缓存问题');
    console.log('3. 数据库同步延迟');
  }

  console.log('='.repeat(60) + '\n');
}

// 运行测试
if (require.main === module) {
  runTest()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = runTest;
