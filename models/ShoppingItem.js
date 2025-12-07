const { db } = require('../config/database');

class ShoppingItem {
  // 创建采购项目
  static create(userId, itemData) {
    const stmt = db.prepare(`
      INSERT INTO shopping_list (
        user_id, item_name, category, amount, quantity, unit,
        status, purchase_date, shop_name, notes, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId,
      itemData.item_name,
      itemData.category,
      itemData.amount || 0,
      itemData.quantity || 1,
      itemData.unit || '个',
      itemData.status || '待购买',
      itemData.purchase_date || null,
      itemData.shop_name || null,
      itemData.notes || null,
      itemData.priority || 2
    );
    
    return result.lastInsertRowid;
  }

  // 获取采购清单
  static getAll(userId, filters = {}) {
    let query = 'SELECT * FROM shopping_list WHERE user_id = ?';
    const params = [userId];

    // 添加筛选条件
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.item_name) {
      query += ' AND item_name LIKE ?';
      params.push(`%${filters.item_name}%`);
    }

    if (filters.start_date) {
      query += ' AND purchase_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND purchase_date <= ?';
      params.push(filters.end_date);
    }

    // 排序：优先级高的在前，然后按创建时间倒序
    query += ' ORDER BY priority ASC, created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // 获取单条记录
  static getById(userId, id) {
    const stmt = db.prepare('SELECT * FROM shopping_list WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId);
  }

  // 更新采购项目
  static update(userId, id, itemData) {
    const stmt = db.prepare(`
      UPDATE shopping_list 
      SET item_name = ?, 
          category = ?, 
          amount = ?, 
          quantity = ?,
          unit = ?,
          status = ?,
          purchase_date = ?,
          shop_name = ?,
          notes = ?,
          priority = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(
      itemData.item_name,
      itemData.category,
      itemData.amount || 0,
      itemData.quantity || 1,
      itemData.unit || '个',
      itemData.status || '待购买',
      itemData.purchase_date || null,
      itemData.shop_name || null,
      itemData.notes || null,
      itemData.priority || 2,
      id,
      userId
    );
    
    return result.changes > 0;
  }

  // 更新状态
  static updateStatus(userId, id, status) {
    const stmt = db.prepare(`
      UPDATE shopping_list 
      SET status = ?, 
          updated_at = CURRENT_TIMESTAMP,
          purchase_date = CASE WHEN ? = '已购买' AND purchase_date IS NULL THEN CURRENT_DATE ELSE purchase_date END
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(status, status, id, userId);
    return result.changes > 0;
  }

  // 批量更新状态
  static batchUpdateStatus(userId, ids, status) {
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`
      UPDATE shopping_list 
      SET status = ?, 
          updated_at = CURRENT_TIMESTAMP,
          purchase_date = CASE WHEN ? = '已购买' AND purchase_date IS NULL THEN CURRENT_DATE ELSE purchase_date END
      WHERE id IN (${placeholders}) AND user_id = ?
    `);
    
    const result = stmt.run(status, status, ...ids, userId);
    return result.changes;
  }

  // 删除采购项目
  static delete(userId, id) {
    const stmt = db.prepare('DELETE FROM shopping_list WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  // 批量删除
  static batchDelete(userId, ids) {
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`DELETE FROM shopping_list WHERE id IN (${placeholders}) AND user_id = ?`);
    const result = stmt.run(...ids, userId);
    return result.changes;
  }

  // 获取统计数据
  static getStatistics(userId, filters = {}) {
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (filters.category) {
      whereClause += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.start_date) {
      whereClause += ' AND purchase_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      whereClause += ' AND purchase_date <= ?';
      params.push(filters.end_date);
    }

    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN status = '待购买' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = '已购买' THEN 1 ELSE 0 END) as purchased_count,
        SUM(CASE WHEN status = '已取消' THEN 1 ELSE 0 END) as cancelled_count,
        SUM(CASE WHEN status = '已购买' THEN amount ELSE 0 END) as total_spent,
        SUM(CASE WHEN status = '待购买' THEN amount ELSE 0 END) as pending_amount,
        AVG(CASE WHEN status = '已购买' THEN amount END) as avg_amount
      FROM shopping_list
      ${whereClause}
    `);

    return stmt.get(...params);
  }

  // 按分类统计
  static getCategoryStatistics(userId, filters = {}) {
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      whereClause += ' AND purchase_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      whereClause += ' AND purchase_date <= ?';
      params.push(filters.end_date);
    }

    const stmt = db.prepare(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        SUM(CASE WHEN status = '已购买' THEN 1 ELSE 0 END) as purchased_count,
        SUM(CASE WHEN status = '待购买' THEN 1 ELSE 0 END) as pending_count
      FROM shopping_list
      ${whereClause}
      GROUP BY category
      ORDER BY total_amount DESC
    `);

    return stmt.all(...params);
  }
}

module.exports = ShoppingItem;

