/**
 * 慢速删除笔记测试
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

// 要删除的笔记UID列表
const notesToDelete = [
  'hr93759wccbtdpg',
  'vcbfw5wkcp9fpz7'
];

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDeleteNote(uid) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试删除笔记: ${uid}`);
  console.log('='.repeat(60));

  try {
    const response = await axios.delete(`${BASE_URL}/api/note/${uid}`, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: () => true
    });

    console.log(`\n✓ 请求完成! 状态码: ${response.status}`);

    // 检查是否删除成功
    // API实际返回: 200 + {"message": "Note deleted successfully."}
    // 或: 404 + {"error": "Note not found."} (如果已经删除)
    if (response.status === 200 && response.data && response.data.message) {
      console.log('\n✅ 删除成功! (200 + success message)');
      console.log('响应消息:', response.data.message);
      return { success: true, status: response.status, alreadyDeleted: false };
    } else if (response.status === 404 && response.data && response.data.error) {
      console.log('\n✅ 删除成功! (笔记已不存在 - ' + response.data.error + ')');
      return { success: true, status: response.status, alreadyDeleted: true };
    } else {
      console.log('\n⚠️  意外响应:');
      console.log('状态码:', response.status);
      console.log('响应:', response.data);
      return { success: false, status: response.status, data: response.data };
    }

  } catch (error) {
    console.error('\n❌ 删除失败:', error.message);

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    }

    return { success: false, error: error.message };
  }
}

async function verifyDeleted(uid) {
  console.log(`\n验证笔记 ${uid} 是否已被删除:`);

  try {
    const response = await axios.get(`${BASE_URL}/api/note/${uid}`, {
      httpsAgent: httpsAgent,
      headers: {
        'Cookie': COOKIE
      },
      withCredentials: true,
      timeout: 15000,
      validateStatus: () => true
    });

    console.log('❌ 笔记仍然存在，状态码:', response.status);
    return false;

  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ 验证成功: 笔记不存在 (404)');
      return true;
    }

    console.error('❌ 验证失败:', error.message);
    return false;
  }
}

async function runDeleteTests() {
  console.log('========================================');
  console.log('测试：慢速删除笔记');
  console.log('========================================\n');
  console.log('策略:');
  console.log('- 删除刚创建的笔记');
  console.log('- 增加延迟避免数据库锁定');
  console.log('- 验证删除结果');
  console.log('- 包含重试机制\n');

  console.log('等待3秒准备时间...');
  await wait(3000);

  const results = [];

  for (let i = 0; i < notesToDelete.length; i++) {
    const uid = notesToDelete[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`第 ${i + 1} 个笔记: ${uid}`);
    console.log('='.repeat(60));

    let attempt = 1;
    const maxAttempts = 3;
    let deleted = false;

    while (attempt <= maxAttempts && !deleted) {
      if (attempt > 1) {
        const waitTime = attempt * 2000;
        console.log(`\n等待 ${waitTime/1000} 秒后重试...`);
        await wait(waitTime);
      }

      const result = await testDeleteNote(uid);

      if (result.success) {
        // 如果已经标记为已删除（404响应），不需要再次验证
        if (result.alreadyDeleted) {
          deleted = true;
          results.push({ uid, success: true, verified: true, alreadyDeleted: true });
          console.log('\n✅ 删除成功! (笔记已不存在)');
          break;
        } else {
          // 等待1秒后验证
          await wait(1000);
          const verified = await verifyDeleted(uid);

          if (verified) {
            deleted = true;
            results.push({ uid, success: true, verified: true, alreadyDeleted: false });
            console.log('\n✅ 删除和验证都成功!');
          } else {
            results.push({ uid, success: true, verified: false, error: '验证失败' });
            console.log('\n⚠️  删除成功但验证失败');
          }
          break;
        }
      } else {
        attempt++;
      }
    }

    if (!deleted) {
      results.push({ uid, success: false, error: '删除失败' });
    }

    // 每次删除之间等待2秒
    if (i < notesToDelete.length - 1) {
      console.log('\n等待2秒...');
      await wait(2000);
    }
  }

  // 显示总结
  console.log('\n\n' + '='.repeat(60));
  console.log('删除测试总结');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success && r.verified).length;
  const partialSuccess = results.filter(r => r.success && !r.verified).length;
  const failCount = results.filter(r => !r.success).length;

  results.forEach(result => {
    const status = result.success && result.verified ? '✅ 完全成功' :
                   result.success && !result.verified ? '⚠️  部分成功' :
                   '❌ 失败';
    console.log(`${status} - ${result.uid}`);
    if (result.error) {
      console.error(`  错误: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`总计: ${results.length} 个笔记`);
  console.log(`完全成功: ${successCount} ✅`);
  console.log(`部分成功: ${partialSuccess} ⚠️`);
  console.log(`失败: ${failCount} ❌`);
  console.log('='.repeat(60) + '\n');

  if (successCount === results.length) {
    console.log('🎉 所有笔记删除成功！\n');
  } else if (successCount + partialSuccess > 0) {
    console.log('⚠️  部分删除成功，请检查失败的笔记\n');
  } else {
    console.log('❌ 所有删除操作都失败\n');
  }
}

// 运行测试
if (require.main === module) {
  runDeleteTests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = runDeleteTests;
