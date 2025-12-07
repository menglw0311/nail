const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupConfig() {
  console.log('=== 数据库配置助手 ===\n');

  const envPath = path.join(__dirname, '..', '.env');
  
  // 检查 .env 文件是否存在
  let currentConfig = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.+)$/);
      if (match) {
        currentConfig[match[1].trim()] = match[2].trim();
      }
    });
    console.log('当前配置:');
    console.log(`  DB_HOST: ${currentConfig.DB_HOST || '(未设置)'}`);
    console.log(`  DB_USER: ${currentConfig.DB_USER || '(未设置)'}`);
    console.log(`  DB_PASSWORD: ${currentConfig.DB_PASSWORD ? '***' : '(未设置)'}`);
    console.log(`  DB_NAME: ${currentConfig.DB_NAME || '(未设置)'}`);
    console.log(`  DB_PORT: ${currentConfig.DB_PORT || '(未设置)'}\n`);
  }

  console.log('请选择数据库类型:');
  console.log('1. 本地数据库 (localhost)');
  console.log('2. 远程数据库 (指定 IP 地址)');
  
  const dbType = await question('请输入选项 (1 或 2): ');

  let host;
  if (dbType === '1') {
    host = 'localhost';
    console.log('\n已选择本地数据库\n');
  } else if (dbType === '2') {
    host = await question('请输入数据库主机地址 (例如: 10.192.136.247): ');
  } else {
    console.log('无效选项，使用默认值 localhost');
    host = 'localhost';
  }

  const user = await question(`数据库用户名 [${currentConfig.DB_USER || 'root'}]: `) || currentConfig.DB_USER || 'root';
  const password = await question('数据库密码: ') || currentConfig.DB_PASSWORD || '';
  const dbName = await question(`数据库名称 [${currentConfig.DB_NAME || 'accounting_db'}]: `) || currentConfig.DB_NAME || 'accounting_db';
  const port = await question(`数据库端口 [${currentConfig.DB_PORT || '3306'}]: `) || currentConfig.DB_PORT || '3306';

  // 生成 .env 文件内容
  const envContent = `# 数据库配置
DB_HOST=${host}
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=${dbName}
DB_PORT=${port}

# 服务器配置
PORT=3000
`;

  // 写入文件
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('\n✅ 配置已保存到 .env 文件！');
  console.log('\n当前配置:');
  console.log(`  DB_HOST: ${host}`);
  console.log(`  DB_USER: ${user}`);
  console.log(`  DB_PASSWORD: ${password ? '***' : '(空)'}`);
  console.log(`  DB_NAME: ${dbName}`);
  console.log(`  DB_PORT: ${port}`);
  console.log(`  PORT: 3000`);
  
  console.log('\n下一步:');
  console.log('1. 运行 npm run test-db 测试数据库连接');
  console.log('2. 如果连接成功，运行 npm run init-db 初始化数据库');
  
  rl.close();
}

setupConfig().catch(err => {
  console.error('错误:', err);
  rl.close();
  process.exit(1);
});

