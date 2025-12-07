const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middleware/auth');

// 所有分类路由都需要认证
router.use(authenticateToken);

// 获取所有分类
router.get('/', categoryController.getAllCategories);

// 根据类型获取分类
router.get('/type/:type', categoryController.getCategoriesByType);

// 获取单个分类
router.get('/:id', categoryController.getCategoryById);

// 创建分类
router.post('/', categoryController.createCategory);

// 更新分类
router.put('/:id', categoryController.updateCategory);

// 删除分类
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;

