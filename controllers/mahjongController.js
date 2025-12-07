const MahjongRecord = require('../models/MahjongRecord');

// 获取所有麻将记录
exports.getAllRecords = (req, res) => {
  try {
    const user_id = req.user.id;
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      game_type: req.query.game_type,
      result_type: req.query.result_type
    };

    const records = MahjongRecord.getAll(user_id, filters);
    
    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('获取麻将记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取记录失败',
      error: error.message
    });
  }
};

// 根据ID获取记录
exports.getRecordById = (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const record = MahjongRecord.getById(id, user_id);
    
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
    console.error('获取记录失败:', error);
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
    const user_id = req.user.id;
    const { game_date, game_time, players, scores, win_amount, table_fee, taxi_fee, cigarette_fee, game_type, location, notes } = req.body;
    
    // 验证必填字段
    if (!game_date || !players || !scores || win_amount === undefined) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 验证玩家和分数数组长度一致
    if (players.length !== scores.length) {
      return res.status(400).json({
        success: false,
        message: '玩家数量与分数数量不匹配'
      });
    }
    
    const recordId = MahjongRecord.create({
      user_id,
      game_date,
      game_time: game_time || null,
      players,
      scores,
      win_amount,
      table_fee: table_fee || 0,
      taxi_fee: taxi_fee || 0,
      cigarette_fee: cigarette_fee || 0,
      game_type: game_type || null,
      location: location || null,
      notes: notes || null
    });
    
    res.status(201).json({
      success: true,
      message: '记录创建成功',
      data: { id: recordId }
    });
  } catch (error) {
    console.error('创建记录失败:', error);
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
    const user_id = req.user.id;
    const { game_date, game_time, players, scores, win_amount, table_fee, taxi_fee, cigarette_fee, game_type, location, notes } = req.body;
    
    // 验证必填字段
    if (!game_date || !players || !scores || win_amount === undefined) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 验证玩家和分数数组长度一致
    if (players.length !== scores.length) {
      return res.status(400).json({
        success: false,
        message: '玩家数量与分数数量不匹配'
      });
    }
    
    const changes = MahjongRecord.update(id, user_id, {
      game_date,
      game_time: game_time || null,
      players,
      scores,
      win_amount,
      table_fee: table_fee || 0,
      taxi_fee: taxi_fee || 0,
      cigarette_fee: cigarette_fee || 0,
      game_type: game_type || null,
      location: location || null,
      notes: notes || null
    });
    
    if (changes === 0) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '记录更新成功'
    });
  } catch (error) {
    console.error('更新记录失败:', error);
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
    const user_id = req.user.id;
    
    const changes = MahjongRecord.delete(id, user_id);
    
    if (changes === 0) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '记录删除成功'
    });
  } catch (error) {
    console.error('删除记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除记录失败',
      error: error.message
    });
  }
};

// 获取统计数据
exports.getStatistics = (req, res) => {
  try {
    const user_id = req.user.id;
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      game_type: req.query.game_type
    };

    const stats = MahjongRecord.getStatistics(user_id, filters);
    
    res.json({
      success: true,
      data: stats
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

// 获取每日统计
exports.getDailyStatistics = (req, res) => {
  try {
    const user_id = req.user.id;
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const stats = MahjongRecord.getDailyStatistics(user_id, filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取每日统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取每日统计失败',
      error: error.message
    });
  }
};

// 获取游戏类型统计
exports.getGameTypeStatistics = (req, res) => {
  try {
    const user_id = req.user.id;
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const stats = MahjongRecord.getGameTypeStatistics(user_id, filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取游戏类型统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取游戏类型统计失败',
      error: error.message
    });
  }
};

// 获取月度统计
exports.getMonthlyStatistics = (req, res) => {
  try {
    const user_id = req.user.id;
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const stats = MahjongRecord.getMonthlyStatistics(user_id, filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取月度统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取月度统计失败',
      error: error.message
    });
  }
};

