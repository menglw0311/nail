const express = require('express');
const router = express.Router();
const shoppingController = require('../controllers/shoppingController');
const auth = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

// 采购清单路由
router.post('/', shoppingController.createItem);                           // 创建采购项目
router.get('/', shoppingController.getItems);                              // 获取采购清单
router.get('/statistics', shoppingController.getStatistics);               // 获取统计数据
router.get('/statistics/categories', shoppingController.getCategoryStatistics); // 获取分类统计
router.get('/:id', shoppingController.getItemById);                        // 获取单个项目
router.put('/:id', shoppingController.updateItem);                         // 更新采购项目
router.patch('/:id/status', shoppingController.updateStatus);              // 更新状态
router.post('/batch/status', shoppingController.batchUpdateStatus);        // 批量更新状态
router.delete('/:id', shoppingController.deleteItem);                      // 删除采购项目
router.post('/batch/delete', shoppingController.batchDelete);              // 批量删除

module.exports = router;

