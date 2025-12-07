const { db } = require('../config/database');

class Record {
  // 获取所有记录
  static getAll(filters = {}) {
    let query = `
      SELECT r.*, c.name as category_name, c.type as category_type
      FROM records r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND r.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.type) {
      query += ' AND r.type = ?';
      params.push(filters.type);
    }

    if (filters.category_id) {
      query += ' AND r.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.start_date) {
      query += ' AND r.record_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND r.record_date <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY r.record_date DESC, r.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // 根据ID获取记录
  static getById(id) {
    return db.prepare(
      `SELECT r.*, c.name as category_name, c.type as category_type
       FROM records r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.id = ?`
    ).get(id);
  }

  // 创建记录
  static create(recordData) {
    const { type, category_id, amount, description, record_date, user_id } = recordData;
    const result = db.prepare(
      'INSERT INTO records (type, category_id, amount, description, record_date, user_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(type, category_id, parseFloat(amount), description || null, record_date, user_id);
    return result.lastInsertRowid;
  }

  // 更新记录
  static update(id, recordData) {
    const { type, category_id, amount, description, record_date } = recordData;
    const result = db.prepare(
      'UPDATE records SET type = ?, category_id = ?, amount = ?, description = ?, record_date = ? WHERE id = ?'
    ).run(type, category_id, parseFloat(amount), description || null, record_date, id);
    return result.changes > 0;
  }

  // 删除记录
  static delete(id) {
    const result = db.prepare('DELETE FROM records WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // 统计总收入和总支出
  static getStatistics(filters = {}) {
    let query = `
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM records
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.start_date) {
      query += ' AND record_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND record_date <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY type';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    
    const stats = {
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    };

    rows.forEach(row => {
      if (row.type === 'income') {
        stats.income = parseFloat(row.total) || 0;
        stats.incomeCount = row.count || 0;
      } else if (row.type === 'expense') {
        stats.expense = parseFloat(row.total) || 0;
        stats.expenseCount = row.count || 0;
      }
    });

    stats.balance = stats.income - stats.expense;
    return stats;
  }

  // 按分类统计（用于饼状图）
  static getCategoryStatistics(filters = {}) {
    let query = `
      SELECT 
        c.id,
        c.name,
        c.type,
        SUM(r.amount) as total,
        COUNT(*) as count
      FROM records r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND r.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.type) {
      query += ' AND r.type = ?';
      params.push(filters.type);
    }

    if (filters.start_date) {
      query += ' AND r.record_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND r.record_date <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY c.id, c.name, c.type ORDER BY total DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // 获取每日统计（用于日历）
  static getDailyStatistics(filters = {}) {
    let query = `
      SELECT 
        record_date,
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM records
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.start_date) {
      query += ' AND record_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND record_date <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY record_date, type ORDER BY record_date';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    
    // 转换为按日期组织的对象
    const dailyStats = {};
    rows.forEach(row => {
      const date = row.record_date;
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          income: 0,
          expense: 0,
          incomeCount: 0,
          expenseCount: 0
        };
      }
      if (row.type === 'income') {
        dailyStats[date].income = parseFloat(row.total) || 0;
        dailyStats[date].incomeCount = row.count || 0;
      } else if (row.type === 'expense') {
        dailyStats[date].expense = parseFloat(row.total) || 0;
        dailyStats[date].expenseCount = row.count || 0;
      }
    });

    return Object.values(dailyStats);
  }
}

module.exports = Record;
