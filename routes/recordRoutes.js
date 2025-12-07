const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const authenticateToken = require('../middleware/auth');

// 所有记录路由都需要认证
router.use(authenticateToken);

// 获取统计信息（必须在 /:id 之前）
router.get('/statistics', recordController.getStatistics);

// 获取分类统计（用于饼状图）
router.get('/statistics/categories', recordController.getCategoryStatistics);

// 获取每日统计（用于日历）
router.get('/statistics/daily', recordController.getDailyStatistics);

// 获取所有记录
router.get('/', recordController.getAllRecords);

// 获取单个记录（必须在最后，避免匹配到 /statistics/daily）
router.get('/:id', recordController.getRecordById);

// 创建记录
router.post('/', recordController.createRecord);

// 更新记录
router.put('/:id', recordController.updateRecord);

// 删除记录
router.delete('/:id', recordController.deleteRecord);

module.exports = router;

