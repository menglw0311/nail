const express = require('express');
const router = express.Router();
const mahjongController = require('../controllers/mahjongController');
const authenticateToken = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticateToken);

// 统计相关路由（放在前面，避免被 /:id 匹配）
router.get('/statistics', mahjongController.getStatistics);
router.get('/statistics/daily', mahjongController.getDailyStatistics);
router.get('/statistics/game-types', mahjongController.getGameTypeStatistics);
router.get('/statistics/monthly', mahjongController.getMonthlyStatistics);

// CRUD 路由
router.get('/', mahjongController.getAllRecords);
router.get('/:id', mahjongController.getRecordById);
router.post('/', mahjongController.createRecord);
router.put('/:id', mahjongController.updateRecord);
router.delete('/:id', mahjongController.deleteRecord);

module.exports = router;

