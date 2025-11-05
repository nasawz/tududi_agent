/**
 * 使用 axios 测试获取当前用户资料 API
 */

const axios = require('axios');
const https = require('https');

// 创建 HTTPS 代理，忽略自签名证书
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 从 mark.txt 提取的配置信息
const BASE_URL = 'https://competent_shaw.orb.local';
const COOKIE = 'connect.sid=s%3AAJjxUb1uYvkSoT21Alu5EhBGjLzrWBIu.fB5I8%2FQeUb25Dw9lXFf7I54aRA1Ck6H37FegOIPcPj8; i18next=en';

console.log('========================================');
console.log('测试：获取当前用户资料 API');
console.log('========================================\n');

console.log('发送请求到:', `${BASE_URL}/api/profile`);
console.log('使用Cookie:', COOKIE.substring(0, 50) + '...\n');

(async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/profile`, {
      httpsAgent,
      headers: {
        'Cookie': COOKIE,
        'Accept': 'application/json'
      },
      timeout: 15000,
      validateStatus: (status) => status < 500
    });

    console.log(`状态码: ${response.status}`);
    console.log(`状态文本: ${response.statusText}`);
    console.log('响应头:', JSON.stringify(response.headers, null, 2));
    console.log('\n');

    console.log('=== 响应数据 ===');
    if (response.status === 200) {
      console.log(JSON.stringify(response.data, null, 2));
      console.log('\n✓ 测试成功!');
    } else {
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      console.log('\n❌ 测试失败 - 非200状态码');
    }
    console.log('\n========================================');

  } catch (err) {
    console.error('\n❌ 请求错误:', err.message);
    if (err.response) {
      console.error('状态码:', err.response.status);
      console.error('响应数据:', err.response.data);
    }
    console.log('\n========================================');
  }
})();
