const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // 根据用户名获取用户
  static getByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  // 根据邮箱获取用户
  static getByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  // 根据ID获取用户
  static getById(id) {
    return db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(id);
  }

  // 创建用户
  static async create(userData) {
    const { username, email, password } = userData;
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = db.prepare(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
    ).run(username, email, hashedPassword);
    
    return result.lastInsertRowid;
  }

  // 验证密码
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  // 更新用户信息
  static update(id, userData) {
    const { username, email } = userData;
    const result = db.prepare(
      'UPDATE users SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(username, email, id);
    return result.changes > 0;
  }

  // 更新密码
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = db.prepare(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(hashedPassword, id);
    return result.changes > 0;
  }
}

module.exports = User;

