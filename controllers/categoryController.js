const Category = require('../models/Category');

// 获取所有分类
exports.getAllCategories = (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const categories = Category.getAll(userId);
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message
    });
  }
};

// 根据类型获取分类
exports.getCategoriesByType = (req, res) => {
  try {
    const { type } = req.params;
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: '类型必须是 income 或 expense'
      });
    }
    const userId = req.user ? req.user.id : null;
    const categories = Category.getByType(type, userId);
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message
    });
  }
};

// 获取单个分类
exports.getCategoryById = (req, res) => {
  try {
    const { id } = req.params;
    const category = Category.getById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message
    });
  }
};

// 创建分类
exports.createCategory = (req, res) => {
  try {
    const { name, type, description } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: '分类名称和类型是必填项'
      });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: '类型必须是 income 或 expense'
      });
    }

    const userId = req.user ? req.user.id : null;
    const id = Category.create({ name, type, description, user_id: userId });
    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message
    });
  }
};

// 更新分类
exports.updateCategory = (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description } = req.body;

    const category = Category.getById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    if (type && type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: '类型必须是 income 或 expense'
      });
    }

    const updated = Category.update(id, { name, type, description });
    if (updated) {
      res.json({
        success: true,
        message: '分类更新成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '分类更新失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新分类失败',
      error: error.message
    });
  }
};

// 删除分类
exports.deleteCategory = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = Category.delete(id);
    if (deleted) {
      res.json({
        success: true,
        message: '分类删除成功'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    });
  }
};

