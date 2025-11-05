/**
 * 测试获取当前用户资料 API
 * API路径: GET /api/profile
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

async function testGetProfile() {
  console.log('========================================');
  console.log('测试：获取当前用户资料 API');
  console.log('========================================\n');

  try {
    // 发送GET请求
    console.log('发送请求到:', `${BASE_URL}/api/profile`);
    console.log('使用Cookie:', COOKIE.substring(0, 50) + '...\n');

    const config = {
      method: 'get',
      url: `${BASE_URL}/api/profile`,
      headers: {
        'Cookie': COOKIE
      },
      httpsAgent: httpsAgent,
      withCredentials: true,
      timeout: 15000,
      validateStatus: function (status) {
        return status < 500; // 只在5xx错误时抛出异常
      }
    };

    console.log('请求配置:', JSON.stringify(config, null, 2));
    console.log('\n发送请求...\n');

    const response = await axios(config);

    // 显示响应状态
    console.log('✓ 请求成功!');
    console.log('状态码:', response.status);
    console.log('状态文本:', response.statusText);
    console.log('\n');

    // 解析响应数据
    const profile = response.data;

    // 显示用户基本信息
    console.log('=== 用户基本信息 ===');
    console.log('用户ID:', profile.uid);
    console.log('邮箱:', profile.email);
    console.log('姓名:', profile.name + (profile.surname ? ' ' + profile.surname : ''));
    console.log('界面主题:', profile.appearance);
    console.log('语言:', profile.language);
    console.log('时区:', profile.timezone);
    console.log('一周第一天:', profile.first_day_of_week, '(0=周日, 1=周一, ..., 6=周六)');
    console.log('头像:', profile.avatar_image || '未设置');
    console.log('\n');

    // 显示Telegram设置
    console.log('=== Telegram 集成设置 ===');
    console.log('Bot Token:', profile.telegram_bot_token || '未配置');
    console.log('Chat ID:', profile.telegram_chat_id || '未配置');
    console.log('允许用户:', profile.telegram_allowed_users || '未设置');
    console.log('\n');

    // 显示任务摘要设置
    console.log('=== 任务摘要设置 ===');
    console.log('任务摘要启用:', profile.task_summary_enabled);
    console.log('摘要频率:', profile.task_summary_frequency);
    console.log('\n');

    // 显示智能功能设置
    console.log('=== 智能功能设置 ===');
    console.log('任务智能:', profile.task_intelligence_enabled);
    console.log('自动建议下一步:', profile.auto_suggest_next_actions_enabled);
    console.log('生产力助手:', profile.productivity_assistant_enabled);
    console.log('下一任务建议:', profile.next_task_suggestion_enabled);
    console.log('番茄钟:', profile.pomodoro_enabled);
    console.log('\n');

    // 显示今日页面设置
    if (profile.today_settings) {
      console.log('=== 今日页面显示设置 ===');
      console.log('显示统计信息:', profile.today_settings.showMetrics);
      console.log('显示生产力助手:', profile.today_settings.showProductivity);
      console.log('显示下一任务建议:', profile.today_settings.showNextTaskSuggestion);
      console.log('显示建议:', profile.today_settings.showSuggestions);
      console.log('显示今日到期任务:', profile.today_settings.showDueToday);
      console.log('显示已完成任务:', profile.today_settings.showCompleted);
      console.log('显示进度条:', profile.today_settings.showProgressBar);
      console.log('显示每日名言:', profile.today_settings.showDailyQuote);
      console.log('\n');
    }

    // 显示侧边栏设置
    if (profile.sidebar_settings) {
      console.log('=== 侧边栏设置 ===');
      console.log('固定视图顺序:', profile.sidebar_settings.pinnedViewsOrder);
      console.log('\n');
    }

    // 验证必要字段
    console.log('=== 响应验证 ===');
    const requiredFields = ['uid', 'email', 'name', 'appearance', 'language', 'timezone'];
    let hasAllRequired = true;
    requiredFields.forEach(field => {
      const exists = profile.hasOwnProperty(field);
      console.log(`✓ ${field}: ${exists ? '存在' : '缺失'} ${exists ? '' : '(❌ 错误!)'}`);
      if (!exists) hasAllRequired = false;
    });

    console.log('\n========================================');
    if (hasAllRequired) {
      console.log('✓ 测试通过 - 所有必要字段都存在');
    } else {
      console.log('❌ 测试失败 - 部分必要字段缺失');
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
  testGetProfile()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('未捕获的错误:', err);
      process.exit(1);
    });
}

module.exports = testGetProfile;
