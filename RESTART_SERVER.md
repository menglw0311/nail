# 重启服务器步骤

## 问题
注册接口显示"接口不存在"，这是因为服务器还在运行旧版本的代码。

## 解决方法

### 1. 停止当前服务器
在运行服务器的终端窗口中，按 `Ctrl + C` 停止服务器

### 2. 重新启动服务器
在项目根目录运行：
```bash
npm start
```

或者开发模式（自动重启）：
```bash
npm run dev
```

### 3. 检查启动日志
启动后应该看到：
```
已注册路由:
  - /api/auth/register (POST)
  - /api/auth/login (POST)
  - /api/auth/me (GET)
  - /api/categories/*
  - /api/records/*
数据库连接成功！
服务器运行在 http://localhost:3000
```

### 4. 测试接口
重启后，注册功能应该可以正常使用了。

## 如果仍有问题

1. 检查是否有多个 Node 进程在运行：
   ```powershell
   Get-Process -Name node
   ```

2. 如果有多个进程，可以结束所有 Node 进程：
   ```powershell
   Stop-Process -Name node -Force
   ```

3. 然后重新启动服务器

