#!/usr/bin/env node

/**
 * 部署验证脚本
 * 在 Railway 部署后运行，验证所有功能正常
 * 
 * 使用方法: node scripts/deploy-check.js <BASE_URL>
 * 示例: node scripts/deploy-check.js https://aimatch.up.railway.app
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const checks = [];

async function check(name, url, expectedStatus = 200) {
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    const ok = response.status === expectedStatus;
    checks.push({
      name,
      status: ok ? '✅ PASS' : '❌ FAIL',
      url,
      expected: expectedStatus,
      actual: response.status,
    });
    return ok;
  } catch (error) {
    checks.push({
      name,
      status: '❌ ERROR',
      url,
      error: error.message,
    });
    return false;
  }
}

async function runChecks() {
  console.log(`🔍 开始验证部署: ${BASE_URL}\n`);

  // 基础检查
  await check('首页访问', '/');
  await check('登录页面', '/login');
  await check('健康检查', '/api/health', 200);
  await check('配置检查', '/api/debug/config', 200);
  await check('数据库检查', '/api/debug/session', 401); // 未登录应返回 401

  // 显示结果
  console.log('\n📊 检查结果:\n');
  checks.forEach((check) => {
    console.log(`${check.status} ${check.name}`);
    console.log(`   URL: ${check.url}`);
    if (check.error) {
      console.log(`   Error: ${check.error}`);
    } else {
      console.log(`   Status: ${check.actual} (expected: ${check.expected})`);
    }
    console.log('');
  });

  // 汇总
  const passed = checks.filter((c) => c.status.includes('PASS')).length;
  const failed = checks.filter((c) => c.status.includes('FAIL') || c.status.includes('ERROR')).length;

  console.log(`\n📈 汇总: ${passed} 通过, ${failed} 失败`);

  if (failed > 0) {
    console.log('\n⚠️  有检查未通过，请查看详细日志');
    process.exit(1);
  } else {
    console.log('\n✅ 所有检查通过！部署验证成功。');
    process.exit(0);
  }
}

runChecks();
