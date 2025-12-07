const { db } = require('../config/database');

class MahjongRecord {
  // 创建麻将记录
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO mahjong_records 
      (user_id, game_date, game_time, players, scores, win_amount, table_fee, taxi_fee, cigarette_fee, game_type, location, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.user_id,
      data.game_date,
      data.game_time,
      JSON.stringify(data.players),
      JSON.stringify(data.scores),
      data.win_amount,
      data.table_fee || 0,
      data.taxi_fee || 0,
      data.cigarette_fee || 0,
      data.game_type,
      data.location,
      data.notes
    );
    
    return result.lastInsertRowid;
  }

  // 获取用户的所有麻将记录
  static getAll(user_id, filters = {}) {
    let query = 'SELECT * FROM mahjong_records WHERE user_id = ?';
    const params = [user_id];

    // 添加日期范围筛选
    if (filters.start_date) {
      query += ' AND game_date >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND game_date <= ?';
      params.push(filters.end_date);
    }

    // 添加游戏类型筛选
    if (filters.game_type) {
      query += ' AND game_type = ?';
      params.push(filters.game_type);
    }

    // 添加盈亏筛选
    if (filters.result_type === 'win') {
      query += ' AND win_amount > 0';
    } else if (filters.result_type === 'lose') {
      query += ' AND win_amount < 0';
    }

    query += ' ORDER BY game_date ASC, game_time ASC';

    const records = db.prepare(query).all(...params);
    
    // 解析JSON字段
    return records.map(record => ({
      ...record,
      players: JSON.parse(record.players),
      scores: JSON.parse(record.scores)
    }));
  }

  // 根据ID获取记录
  static getById(id, user_id) {
    const record = db.prepare(
      'SELECT * FROM mahjong_records WHERE id = ? AND user_id = ?'
    ).get(id, user_id);
    
    if (record) {
      record.players = JSON.parse(record.players);
      record.scores = JSON.parse(record.scores);
    }
    
    return record;
  }

  // 更新记录
  static update(id, user_id, data) {
    const stmt = db.prepare(`
      UPDATE mahjong_records 
      SET game_date = ?, 
          game_time = ?, 
          players = ?, 
          scores = ?, 
          win_amount = ?, 
          table_fee = ?,
          taxi_fee = ?,
          cigarette_fee = ?,
          game_type = ?, 
          location = ?, 
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(
      data.game_date,
      data.game_time,
      JSON.stringify(data.players),
      JSON.stringify(data.scores),
      data.win_amount,
      data.table_fee || 0,
      data.taxi_fee || 0,
      data.cigarette_fee || 0,
      data.game_type,
      data.location,
      data.notes,
      id,
      user_id
    );
    
    return result.changes;
  }

  // 删除记录
  static delete(id, user_id) {
    const result = db.prepare(
      'DELETE FROM mahjong_records WHERE id = ? AND user_id = ?'
    ).run(id, user_id);
    
    return result.changes;
  }

  // 获取统计数据
  static getStatistics(user_id, filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_games,
        SUM(CASE WHEN win_amount > 0 THEN 1 ELSE 0 END) as win_games,
        SUM(CASE WHEN win_amount < 0 THEN 1 ELSE 0 END) as lose_games,
        SUM(CASE WHEN win_amount = 0 THEN 1 ELSE 0 END) as draw_games,
        SUM(win_amount) as total_amount,
        AVG(win_amount) as avg_amount,
        MAX(win_amount) as max_win,
        MIN(win_amount) as min_lose
      FROM mahjong_records 
      WHERE user_id = ?
    `;
    
    const params = [user_id];

    if (filters.start_date) {
      query += ' AND game_date >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND game_date <= ?';
      params.push(filters.end_date);
    }
    if (filters.game_type) {
      query += ' AND game_type = ?';
      params.push(filters.game_type);
    }

    return db.prepare(query).get(...params);
  }

  // 按日期统计
  static getDailyStatistics(user_id, filters = {}) {
    let query = `
      SELECT 
        game_date as date,
        COUNT(*) as games,
        SUM(win_amount) as amount,
        SUM(CASE WHEN win_amount > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN win_amount < 0 THEN 1 ELSE 0 END) as loses
      FROM mahjong_records 
      WHERE user_id = ?
    `;
    
    const params = [user_id];

    if (filters.start_date) {
      query += ' AND game_date >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND game_date <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY game_date ORDER BY game_date';

    return db.prepare(query).all(...params);
  }

  // 按游戏类型统计
  static getGameTypeStatistics(user_id, filters = {}) {
    let query = `
      SELECT 
        game_type,
        COUNT(*) as games,
        SUM(win_amount) as total_amount,
        AVG(win_amount) as avg_amount,
        SUM(CASE WHEN win_amount > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN win_amount < 0 THEN 1 ELSE 0 END) as loses
      FROM mahjong_records 
      WHERE user_id = ?
    `;
    
    const params = [user_id];

    if (filters.start_date) {
      query += ' AND game_date >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND game_date <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY game_type ORDER BY games DESC';

    return db.prepare(query).all(...params);
  }

  // 获取月度统计
  static getMonthlyStatistics(user_id, filters = {}) {
    let query = `
      SELECT 
        strftime('%Y-%m', game_date) as month,
        COUNT(*) as games,
        SUM(win_amount) as total_amount,
        AVG(win_amount) as avg_amount,
        SUM(CASE WHEN win_amount > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN win_amount < 0 THEN 1 ELSE 0 END) as loses
      FROM mahjong_records 
      WHERE user_id = ?
    `;
    
    const params = [user_id];

    if (filters.start_date) {
      query += ' AND game_date >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND game_date <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY month ORDER BY month DESC';

    return db.prepare(query).all(...params);
  }
}

module.exports = MahjongRecord;

