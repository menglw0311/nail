const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function checkMySQL() {
  console.log('正在检查 MySQL 服务状态...\n');

  try {
    // 检查 MySQL 服务
    const { stdout: services } = await execPromise('sc query type= service state= all | findstr /i mysql');
    console.log('找到的 MySQL 相关服务:');
    console.log(services || '(未找到 MySQL 服务)');
    console.log('');

    // 检查端口
    try {
      const { stdout: ports } = await execPromise('netstat -an | findstr :3306');
      if (ports) {
        console.log('3306 端口状态:');
        console.log(ports);
      } else {
        console.log('3306 端口未被监听 (MySQL 可能未启动)');
      }
    } catch (e) {
      console.log('3306 端口未被监听');
    }

    console.log('\n建议:');
    console.log('1. 如果是本地数据库，请将 .env 中的 DB_HOST 改为 localhost');
    console.log('2. 启动 MySQL 服务: net start MySQL (需要管理员权限)');
    console.log('3. 或者通过服务管理器启动 MySQL 服务');
    
  } catch (error) {
    console.log('检查过程中出现错误:', error.message);
  }
}

checkMySQL();

