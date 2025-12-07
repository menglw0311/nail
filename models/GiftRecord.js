const { db } = require('../config/database');

class GiftRecord {
  // 创建礼金记录
  static create(userId, giftData) {
    const stmt = db.prepare(`
      INSERT INTO gift_records (
        user_id, name, gift_type, event_type, amount, 
        event_date, relationship, location, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId,
      giftData.name,
      giftData.gift_type,
      giftData.event_type,
      giftData.amount,
      giftData.event_date,
      giftData.relationship || null,
      giftData.location || null,
      giftData.notes || null
    );
    
    return result.lastInsertRowid;
  }

  // 获取礼金记录列表
  static getAll(userId, filters = {}) {
    let query = 'SELECT * FROM gift_records WHERE user_id = ?';
    const params = [userId];

    // 添加筛选条件
    if (filters.gift_type) {
      query += ' AND gift_type = ?';
      params.push(filters.gift_type);
    }

    if (filters.event_type) {
      query += ' AND event_type = ?';
      params.push(filters.event_type);
    }

    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.start_date) {
      query += ' AND event_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND event_date <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY event_date DESC, created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // 获取单条记录
  static getById(userId, id) {
    const stmt = db.prepare('SELECT * FROM gift_records WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId);
  }

  // 更新记录
  static update(userId, id, giftData) {
    const stmt = db.prepare(`
      UPDATE gift_records 
      SET name = ?, 
          gift_type = ?, 
          event_type = ?, 
          amount = ?, 
          event_date = ?,
          relationship = ?,
          location = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(
      giftData.name,
      giftData.gift_type,
      giftData.event_type,
      giftData.amount,
      giftData.event_date,
      giftData.relationship || null,
      giftData.location || null,
      giftData.notes || null,
      id,
      userId
    );
    
    return result.changes > 0;
  }

  // 删除记录
  static delete(userId, id) {
    const stmt = db.prepare('DELETE FROM gift_records WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  // 获取统计数据
  static getStatistics(userId, filters = {}) {
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (filters.gift_type) {
      whereClause += ' AND gift_type = ?';
      params.push(filters.gift_type);
    }

    if (filters.event_type) {
      whereClause += ' AND event_type = ?';
      params.push(filters.event_type);
    }

    if (filters.start_date) {
      whereClause += ' AND event_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      whereClause += ' AND event_date <= ?';
      params.push(filters.end_date);
    }

    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN gift_type = '送礼' THEN 1 ELSE 0 END) as giving_count,
        SUM(CASE WHEN gift_type = '收礼' THEN 1 ELSE 0 END) as receiving_count,
        SUM(CASE WHEN gift_type = '送礼' THEN amount ELSE 0 END) as total_giving,
        SUM(CASE WHEN gift_type = '收礼' THEN amount ELSE 0 END) as total_receiving,
        SUM(CASE WHEN gift_type = '收礼' THEN amount ELSE -amount END) as net_amount,
        AVG(CASE WHEN gift_type = '送礼' THEN amount END) as avg_giving,
        AVG(CASE WHEN gift_type = '收礼' THEN amount END) as avg_receiving
      FROM gift_records
      ${whereClause}
    `);

    return stmt.get(...params);
  }

  // 按事件类型统计
  static getEventTypeStatistics(userId, filters = {}) {
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (filters.gift_type) {
      whereClause += ' AND gift_type = ?';
      params.push(filters.gift_type);
    }

    if (filters.start_date) {
      whereClause += ' AND event_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      whereClause += ' AND event_date <= ?';
      params.push(filters.end_date);
    }

    const stmt = db.prepare(`
      SELECT 
        event_type,
        gift_type,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        MAX(amount) as max_amount,
        MIN(amount) as min_amount
      FROM gift_records
      ${whereClause}
      GROUP BY event_type, gift_type
      ORDER BY total_amount DESC
    `);

    return stmt.all(...params);
  }

  // 按姓名统计（找出欠人情的和欠我们的）
  static getNameStatistics(userId) {
    const stmt = db.prepare(`
      SELECT 
        name,
        SUM(CASE WHEN gift_type = '送礼' THEN amount ELSE 0 END) as total_giving,
        SUM(CASE WHEN gift_type = '收礼' THEN amount ELSE 0 END) as total_receiving,
        SUM(CASE WHEN gift_type = '收礼' THEN amount ELSE -amount END) as balance,
        COUNT(*) as interaction_count,
        MAX(event_date) as last_event_date
      FROM gift_records
      WHERE user_id = ?
      GROUP BY name
      ORDER BY ABS(balance) DESC
    `);

    return stmt.all(userId);
  }

  // 获取年度统计
  static getYearlyStatistics(userId, year) {
    const stmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', event_date) as month,
        gift_type,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM gift_records
      WHERE user_id = ? AND strftime('%Y', event_date) = ?
      GROUP BY month, gift_type
      ORDER BY month
    `);

    return stmt.all(userId, year.toString());
  }
}

module.exports = GiftRecord;

