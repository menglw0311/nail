const GiftRecord = require('../models/GiftRecord');

// 创建礼金记录
exports.createGiftRecord = (req, res) => {
  try {
    const { name, gift_type, event_type, amount, event_date, relationship, location, notes } = req.body;

    // 验证必填字段
    if (!name || !gift_type || !event_type || !amount || !event_date) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段：姓名、类型、事件类型、金额、日期'
      });
    }

    // 验证礼金类型
    if (!['送礼', '收礼'].includes(gift_type)) {
      return res.status(400).json({
        success: false,
        message: '类型必须是 "送礼" 或 "收礼"'
      });
    }

    // 验证金额
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '金额必须是大于0的数字'
      });
    }

    const giftData = {
      name,
      gift_type,
      event_type,
      amount: parseFloat(amount),
      event_date,
      relationship,
      location,
      notes
    };

    const giftId = GiftRecord.create(req.userId, giftData);

    res.status(201).json({
      success: true,
      message: '礼金记录创建成功',
      data: { id: giftId }
    });
  } catch (error) {
    console.error('创建礼金记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建礼金记录失败',
      error: error.message
    });
  }
};

// 获取礼金记录列表
exports.getGiftRecords = (req, res) => {
  try {
    const filters = {
      gift_type: req.query.gift_type,
      event_type: req.query.event_type,
      name: req.query.name,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const records = GiftRecord.getAll(req.userId, filters);

    res.json({
      success: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    console.error('获取礼金记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取礼金记录失败',
      error: error.message
    });
  }
};

// 获取单条礼金记录
exports.getGiftRecordById = (req, res) => {
  try {
    const record = GiftRecord.getById(req.userId, req.params.id);

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
    console.error('获取礼金记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取礼金记录失败',
      error: error.message
    });
  }
};

// 更新礼金记录
exports.updateGiftRecord = (req, res) => {
  try {
    const { name, gift_type, event_type, amount, event_date, relationship, location, notes } = req.body;

    // 验证必填字段
    if (!name || !gift_type || !event_type || !amount || !event_date) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段：姓名、类型、事件类型、金额、日期'
      });
    }

    // 验证礼金类型
    if (!['送礼', '收礼'].includes(gift_type)) {
      return res.status(400).json({
        success: false,
        message: '类型必须是 "送礼" 或 "收礼"'
      });
    }

    // 验证金额
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '金额必须是大于0的数字'
      });
    }

    const giftData = {
      name,
      gift_type,
      event_type,
      amount: parseFloat(amount),
      event_date,
      relationship,
      location,
      notes
    };

    const updated = GiftRecord.update(req.userId, req.params.id, giftData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '记录不存在或更新失败'
      });
    }

    res.json({
      success: true,
      message: '礼金记录更新成功'
    });
  } catch (error) {
    console.error('更新礼金记录失败:', error);
    res.status(500).json({
      success: false,
      message: '更新礼金记录失败',
      error: error.message
    });
  }
};

// 删除礼金记录
exports.deleteGiftRecord = (req, res) => {
  try {
    const deleted = GiftRecord.delete(req.userId, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '记录不存在或删除失败'
      });
    }

    res.json({
      success: true,
      message: '礼金记录删除成功'
    });
  } catch (error) {
    console.error('删除礼金记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除礼金记录失败',
      error: error.message
    });
  }
};

// 获取统计数据
exports.getStatistics = (req, res) => {
  try {
    const filters = {
      gift_type: req.query.gift_type,
      event_type: req.query.event_type,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const statistics = GiftRecord.getStatistics(req.userId, filters);

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

// 获取事件类型统计
exports.getEventTypeStatistics = (req, res) => {
  try {
    const filters = {
      gift_type: req.query.gift_type,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const statistics = GiftRecord.getEventTypeStatistics(req.userId, filters);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取事件类型统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取事件类型统计失败',
      error: error.message
    });
  }
};

// 获取姓名统计（人情往来）
exports.getNameStatistics = (req, res) => {
  try {
    const statistics = GiftRecord.getNameStatistics(req.userId);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取姓名统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取姓名统计失败',
      error: error.message
    });
  }
};

// 获取年度统计
exports.getYearlyStatistics = (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const statistics = GiftRecord.getYearlyStatistics(req.userId, year);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取年度统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取年度统计失败',
      error: error.message
    });
  }
};

