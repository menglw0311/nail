const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// 读取现有配置
let currentConfig = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.+)$/);
    if (match) {
      currentConfig[match[1].trim()] = match[2].trim();
    }
  });
}

// 修改为本地数据库配置
const newConfig = {
  DB_HOST: 'localhost',
  DB_USER: currentConfig.DB_USER || 'root',
  DB_PASSWORD: currentConfig.DB_PASSWORD || '',
  DB_NAME: currentConfig.DB_NAME || 'accounting_db',
  DB_PORT: currentConfig.DB_PORT || '3306',
  PORT: currentConfig.PORT || '3000'
};

// 生成新的 .env 内容
const envContent = `# 数据库配置
DB_HOST=${newConfig.DB_HOST}
DB_USER=${newConfig.DB_USER}
DB_PASSWORD=${newConfig.DB_PASSWORD}
DB_NAME=${newConfig.DB_NAME}
DB_PORT=${newConfig.DB_PORT}

# 服务器配置
PORT=${newConfig.PORT}
`;

// 写入文件
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ .env 文件已更新为本地数据库配置！\n');
console.log('当前配置:');
console.log(`  DB_HOST: ${newConfig.DB_HOST}`);
console.log(`  DB_USER: ${newConfig.DB_USER}`);
console.log(`  DB_PASSWORD: ${newConfig.DB_PASSWORD ? '***' : '(空)'}`);
console.log(`  DB_NAME: ${newConfig.DB_NAME}`);
console.log(`  DB_PORT: ${newConfig.DB_PORT}\n`);

console.log('下一步操作:');
console.log('1. 确保 MySQL 服务已启动');
console.log('2. 运行: npm run test-db (测试连接)');
console.log('3. 如果连接成功，运行: npm run init-db (初始化数据库)');

