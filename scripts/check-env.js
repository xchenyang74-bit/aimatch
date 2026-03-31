#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 部署前运行，确保必需变量已设置
 */

const requiredEnvVars = [
  'SECONDME_CLIENT_ID',
  'SECONDME_CLIENT_SECRET',
  'SECONDME_REDIRECT_URI',
  'SECONDME_OAUTH_URL',
  'SECONDME_API_BASE_URL',
  'SECONDME_TOKEN_ENDPOINT',
  'SECONDME_REFRESH_ENDPOINT',
  'DATABASE_URL',
];

console.log('🔍 检查环境变量...\n');

const missing = [];
const present = [];

for (const varName of requiredEnvVars) {
  if (process.env[varName]) {
    present.push(varName);
    console.log(`✅ ${varName}: 已设置`);
  } else {
    missing.push(varName);
    console.log(`❌ ${varName}: 缺失`);
  }
}

console.log('\n📊 汇总:');
console.log(`   已设置: ${present.length}/${requiredEnvVars.length}`);
console.log(`   缺失: ${missing.length}/${requiredEnvVars.length}`);

if (missing.length > 0) {
  console.log('\n⚠️  缺失的变量:');
  missing.forEach(v => console.log(`   - ${v}`));
  process.exit(1);
} else {
  console.log('\n✅ 所有必需变量已设置！');
  process.exit(0);
}
