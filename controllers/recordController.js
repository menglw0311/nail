const Record = require('../models/Record');

// 获取所有记录
exports.getAllRecords = (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      category_id: req.query.category_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit
    };

    // 移除 undefined 值
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const userId = req.user ? req.user.id : null;
    if (userId) {
      filters.user_id = userId;
    }
    const records = Record.getAll(filters);
    res.json({
      success: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取记录失败',
      error: error.message
    });
  }
};

// 获取单个记录
exports.getRecordById = (req, res) => {
  try {
    const { id } = req.params;
    const record = Record.getById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取记录失败',
      error: error.message
    });
  }
};

// 创建记录
exports.createRecord = (req, res) => {
  try {
    const { type, category_id, amount, description, record_date } = req.body;

    if (!type || !category_id || !amount || !record_date) {
      return res.status(400).json({
        success: false,
        message: '类型、分类、金额和日期是必填项'
      });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: '类型必须是 income 或 expense'
      });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: '金额必须是大于0的数字'
      });
    }

    const userId = req.user ? req.user.id : null;
    const id = Record.create({
      type,
      category_id,
      amount,
      description,
      record_date,
      user_id: userId
    });

    res.status(201).json({
      success: true,
      message: '记录创建成功',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建记录失败',
      error: error.message
    });
  }
};

// 更新记录
exports.updateRecord = (req, res) => {
  try {
    const { id } = req.params;
    const { type, category_id, amount, description, record_date } = req.body;

    const record = Record.getById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }

    if (type && type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: '类型必须是 income 或 expense'
      });
    }

    if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      return res.status(400).json({
        success: false,
        message: '金额必须是大于0的数字'
      });
    }

    const updated = Record.update(id, {
      type,
      category_id,
      amount,
      description,
      record_date
    });

    if (updated) {
      res.json({
        success: true,
        message: '记录更新成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '记录更新失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新记录失败',
      error: error.message
    });
  }
};

// 删除记录
exports.deleteRecord = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = Record.delete(id);
    if (deleted) {
      res.json({
        success: true,
        message: '记录删除成功'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除记录失败',
      error: error.message
    });
  }
};

// 获取统计信息
exports.getStatistics = (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    // 移除 undefined 值
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const userId = req.user ? req.user.id : null;
    if (userId) {
      filters.user_id = userId;
    }
    const statistics = Record.getStatistics(filters);
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
};

// 获取分类统计（用于饼状图）
exports.getCategoryStatistics = (req, res) => {
  try {
    const filters = {
      type: req.query.type, // 'income' 或 'expense'
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    // 移除 undefined 值
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const userId = req.user ? req.user.id : null;
    if (userId) {
      filters.user_id = userId;
    }

    const statistics = Record.getCategoryStatistics(filters);
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类统计失败',
      error: error.message
    });
  }
};

// 获取每日统计（用于日历）
exports.getDailyStatistics = (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    // 移除 undefined 值
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const userId = req.user ? req.user.id : null;
    if (userId) {
      filters.user_id = userId;
    }

    const statistics = Record.getDailyStatistics(filters);
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取每日统计失败',
      error: error.message
    });
  }
};

