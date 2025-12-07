-- 麻将记录表
CREATE TABLE IF NOT EXISTS mahjong_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME,
  players TEXT NOT NULL,           -- JSON格式存储玩家名字列表
  scores TEXT NOT NULL,             -- JSON格式存储各玩家分数
  win_amount DECIMAL(10, 2),        -- 盈利金额（正数为赢，负数为输）
  game_type VARCHAR(50),            -- 游戏类型（如：血战、血流等）
  location VARCHAR(100),            -- 地点
  notes TEXT,                       -- 备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_mahjong_user_id ON mahjong_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mahjong_game_date ON mahjong_records(game_date);
CREATE INDEX IF NOT EXISTS idx_mahjong_win_amount ON mahjong_records(win_amount);

