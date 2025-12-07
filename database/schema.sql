-- SQLite 数据库表结构

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建记账记录表
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);
CREATE INDEX IF NOT EXISTS idx_records_date ON records(record_date);
CREATE INDEX IF NOT EXISTS idx_records_category ON records(category_id);

-- 插入默认分类数据
INSERT OR IGNORE INTO categories (name, type, description) VALUES
('工资', 'income', '工资收入'),
('奖金', 'income', '奖金收入'),
('投资收益', 'income', '投资收益'),
('其他收入', 'income', '其他收入'),
('餐饮', 'expense', '餐饮支出'),
('交通', 'expense', '交通支出'),
('购物', 'expense', '购物支出'),
('娱乐', 'expense', '娱乐支出'),
('医疗', 'expense', '医疗支出'),
('教育', 'expense', '教育支出'),
('住房', 'expense', '住房支出'),
('其他支出', 'expense', '其他支出');
