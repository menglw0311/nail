-- 礼金记录表
CREATE TABLE IF NOT EXISTS gift_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,                    -- 姓名
    gift_type TEXT NOT NULL,               -- 类型：送礼 或 收礼
    event_type TEXT NOT NULL,              -- 事件类型：婚礼、丧事、乔迁、生日等
    amount REAL NOT NULL,                  -- 金额
    event_date DATE NOT NULL,              -- 事件日期
    relationship TEXT,                     -- 关系（朋友、同事、亲戚等）
    location TEXT,                         -- 地点
    notes TEXT,                            -- 备注
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_gift_user_id ON gift_records(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_type ON gift_records(gift_type);
CREATE INDEX IF NOT EXISTS idx_gift_event_type ON gift_records(event_type);
CREATE INDEX IF NOT EXISTS idx_gift_event_date ON gift_records(event_date);
CREATE INDEX IF NOT EXISTS idx_gift_name ON gift_records(name);

