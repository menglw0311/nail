const express = require('express');
const router = express.Router();
const giftController = require('../controllers/giftController');
const authMiddleware = require('../middleware/auth');

// 应用认证中间件到所有路由
router.use(authMiddleware);

// 礼金记录路由
router.post('/', giftController.createGiftRecord);
router.get('/', giftController.getGiftRecords);
router.get('/statistics', giftController.getStatistics);
router.get('/statistics/event-types', giftController.getEventTypeStatistics);
router.get('/statistics/names', giftController.getNameStatistics);
router.get('/statistics/yearly', giftController.getYearlyStatistics);
router.get('/:id', giftController.getGiftRecordById);
router.put('/:id', giftController.updateGiftRecord);
router.delete('/:id', giftController.deleteGiftRecord);

module.exports = router;

