const ShoppingItem = require('../models/ShoppingItem');

// 创建采购项目
exports.createItem = (req, res) => {
  try {
    const { item_name, category, amount, quantity, unit, status, purchase_date, shop_name, notes, priority } = req.body;

    // 验证必填字段
    if (!item_name || !category) {
      return res.status(400).json({
        success: false,
        message: '请填写物品名称和分类'
      });
    }

    // 验证分类
    const validCategories = ['会亲家', '订婚', '结婚', '其他'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '分类必须是：会亲家、订婚、结婚、其他'
      });
    }

    // 验证金额
    if (amount && (isNaN(amount) || amount < 0)) {
      return res.status(400).json({
        success: false,
        message: '金额必须是非负数'
      });
    }

    const itemData = {
      item_name,
      category,
      amount: parseFloat(amount) || 0,
      quantity: parseInt(quantity) || 1,
      unit: unit || '个',
      status: status || '待购买',
      purchase_date,
      shop_name,
      notes,
      priority: parseInt(priority) || 2
    };

    const itemId = ShoppingItem.create(req.userId, itemData);

    res.status(201).json({
      success: true,
      message: '采购项目创建成功',
      data: { id: itemId }
    });
  } catch (error) {
    console.error('创建采购项目失败:', error);
    res.status(500).json({
      success: false,
      message: '创建采购项目失败',
      error: error.message
    });
  }
};

// 获取采购清单
exports.getItems = (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      priority: req.query.priority,
      item_name: req.query.item_name,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const items = ShoppingItem.getAll(req.userId, filters);

    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('获取采购清单失败:', error);
    res.status(500).json({
      success: false,
      message: '获取采购清单失败',
      error: error.message
    });
  }
};

// 获取单个采购项目
exports.getItemById = (req, res) => {
  try {
    const item = ShoppingItem.getById(req.userId, req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '采购项目不存在'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('获取采购项目失败:', error);
    res.status(500).json({
      success: false,
      message: '获取采购项目失败',
      error: error.message
    });
  }
};

// 更新采购项目
exports.updateItem = (req, res) => {
  try {
    const { item_name, category, amount, quantity, unit, status, purchase_date, shop_name, notes, priority } = req.body;

    // 验证必填字段
    if (!item_name || !category) {
      return res.status(400).json({
        success: false,
        message: '请填写物品名称和分类'
      });
    }

    // 验证分类
    const validCategories = ['会亲家', '订婚', '结婚', '其他'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '分类必须是：会亲家、订婚、结婚、其他'
      });
    }

    // 验证金额
    if (amount && (isNaN(amount) || amount < 0)) {
      return res.status(400).json({
        success: false,
        message: '金额必须是非负数'
      });
    }

    const itemData = {
      item_name,
      category,
      amount: parseFloat(amount) || 0,
      quantity: parseInt(quantity) || 1,
      unit: unit || '个',
      status: status || '待购买',
      purchase_date,
      shop_name,
      notes,
      priority: parseInt(priority) || 2
    };

    const updated = ShoppingItem.update(req.userId, req.params.id, itemData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '采购项目不存在或更新失败'
      });
    }

    res.json({
      success: true,
      message: '采购项目更新成功'
    });
  } catch (error) {
    console.error('更新采购项目失败:', error);
    res.status(500).json({
      success: false,
      message: '更新采购项目失败',
      error: error.message
    });
  }
};

// 更新状态
exports.updateStatus = (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: '请提供状态'
      });
    }

    const validStatuses = ['待购买', '已购买', '已取消'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '状态必须是：待购买、已购买、已取消'
      });
    }

    const updated = ShoppingItem.updateStatus(req.userId, req.params.id, status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '采购项目不存在'
      });
    }

    res.json({
      success: true,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新状态失败',
      error: error.message
    });
  }
};

// 批量更新状态
exports.batchUpdateStatus = (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要更新的项目ID列表'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: '请提供状态'
      });
    }

    const validStatuses = ['待购买', '已购买', '已取消'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '状态必须是：待购买、已购买、已取消'
      });
    }

    const count = ShoppingItem.batchUpdateStatus(req.userId, ids, status);

    res.json({
      success: true,
      message: `成功更新 ${count} 个项目`,
      count
    });
  } catch (error) {
    console.error('批量更新状态失败:', error);
    res.status(500).json({
      success: false,
      message: '批量更新状态失败',
      error: error.message
    });
  }
};

// 删除采购项目
exports.deleteItem = (req, res) => {
  try {
    const deleted = ShoppingItem.delete(req.userId, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '采购项目不存在或删除失败'
      });
    }

    res.json({
      success: true,
      message: '采购项目删除成功'
    });
  } catch (error) {
    console.error('删除采购项目失败:', error);
    res.status(500).json({
      success: false,
      message: '删除采购项目失败',
      error: error.message
    });
  }
};

// 批量删除
exports.batchDelete = (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的项目ID列表'
      });
    }

    const count = ShoppingItem.batchDelete(req.userId, ids);

    res.json({
      success: true,
      message: `成功删除 ${count} 个项目`,
      count
    });
  } catch (error) {
    console.error('批量删除失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除失败',
      error: error.message
    });
  }
};

// 获取统计数据
exports.getStatistics = (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const statistics = ShoppingItem.getStatistics(req.userId, filters);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
};

// 获取分类统计
exports.getCategoryStatistics = (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const statistics = ShoppingItem.getCategoryStatistics(req.userId, filters);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取分类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类统计失败',
      error: error.message
    });
  }
};

