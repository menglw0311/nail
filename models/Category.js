const { db } = require('../config/database');

class Category {
  // 获取所有分类（支持用户过滤）
  static getAll(userId = null) {
    if (userId) {
      return db.prepare('SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY type, name').all(userId);
    }
    return db.prepare('SELECT * FROM categories WHERE user_id IS NULL ORDER BY type, name').all();
  }

  // 根据类型获取分类（支持用户过滤）
  static getByType(type, userId = null) {
    if (userId) {
      return db.prepare('SELECT * FROM categories WHERE type = ? AND (user_id = ? OR user_id IS NULL) ORDER BY name').all(type, userId);
    }
    return db.prepare('SELECT * FROM categories WHERE type = ? AND user_id IS NULL ORDER BY name').all(type);
  }

  // 根据ID获取分类
  static getById(id) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  }

  // 创建分类
  static create(categoryData) {
    const { name, type, description, user_id } = categoryData;
    const result = db.prepare(
      'INSERT INTO categories (name, type, description, user_id) VALUES (?, ?, ?, ?)'
    ).run(name, type, description || null, user_id || null);
    return result.lastInsertRowid;
  }

  // 更新分类
  static update(id, categoryData) {
    const { name, type, description } = categoryData;
    const result = db.prepare(
      'UPDATE categories SET name = ?, type = ?, description = ? WHERE id = ?'
    ).run(name, type, description || null, id);
    return result.changes > 0;
  }

  // 删除分类
  static delete(id) {
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

module.exports = Category;
