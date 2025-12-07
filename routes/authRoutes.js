const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;

