/**
 * 清理测试创建的笔记
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

// 要删除的测试笔记UID列表
const testNoteUIDs = [
  'g7ns2k1wawqi1uf', // 锁定测试笔记 1
  'uubun585ppmccbj', // 锁定测试笔记 2
  '4xgj28w94um5fdg', // 锁定测试笔记 3
  'q2yuyye4nttdxg7', // 锁定测试笔记 4
  'ry8dw8usffqiqr6', // 锁定测试笔记 5
  'bjq1yw8aaaitr0x', // 直接创建测试
  'hr93759wccbtdpg', // 慢速创建测试
  'vcbfw5wkcp9fpz7'  // 慢速创建测试
];

async function deleteNote(uid) {
  try {
    const response = await axios.delete(`${BASE_URL}/api/note/${uid}`, {
      httpsAgent,
      headers: { 'Cookie': COOKIE },
      withCredentials: true,
      timeout: 15000,
      validateStatus: () => true
    });

    if (response.status === 200 || response.status === 404) {
      return { success: true, uid };
    } else {
      return { success: false, uid, status: response.status };
    }
  } catch (error) {
    return { success: false, uid, error: error.message };
  }
}

async function runCleanup() {
  console.log('========================================');
  console.log('清理测试笔记');
  console.log('========================================\n');

  console.log(`准备删除 ${testNoteUIDs.length} 个测试笔记...\n`);

  const results = [];

  for (let i = 0; i < testNoteUIDs.length; i++) {
    const uid = testNoteUIDs[i];
    console.log(`(${i + 1}/${testNoteUIDs.length}) 删除 ${uid}...`);

    const result = await deleteNote(uid);
    results.push(result);

    if (result.success) {
      console.log(`  ✅ 删除成功`);
    } else {
      console.log(`  ❌ 删除失败: ${result.error || result.status}`);
    }

    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(60));
  console.log('清理结果');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`\n成功: ${successCount}/${results.length}`);
  console.log(`失败: ${failCount}/${results.length}`);

  if (failCount > 0) {
    console.log('\n失败的笔记:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.uid}: ${r.error || r.status}`);
    });
  }

  // 验证清理结果
  console.log('\n验证清理结果...');
  try {
    const response = await axios.get(`${BASE_URL}/api/notes`, {
      httpsAgent,
      headers: { 'Cookie': COOKIE },
      withCredentials: true,
      timeout: 15000
    });

    const notes = response.data;
    console.log(`当前笔记总数: ${notes.length}`);

    const remainingTestNotes = notes.filter(note =>
      testNoteUIDs.includes(note.uid)
    );

    if (remainingTestNotes.length > 0) {
      console.log(`\n⚠️  仍有 ${remainingTestNotes.length} 个测试笔记未删除:`);
      remainingTestNotes.forEach(note => {
        console.log(`  - ${note.title} (${note.uid})`);
      });
    } else {
      console.log('\n✅ 所有测试笔记已清理完成');
    }

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  }

  console.log('='.repeat(60) + '\n');
}

// 运行清理
if (require.main === module) {
  runCleanup()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = runCleanup;
