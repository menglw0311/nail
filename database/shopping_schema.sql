-- 采购清单表
CREATE TABLE IF NOT EXISTS shopping_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,               -- 物品名称
    category TEXT NOT NULL,                -- 分类：会亲家、订婚、结婚、其他
    amount REAL NOT NULL DEFAULT 0,        -- 金额
    quantity INTEGER DEFAULT 1,            -- 数量
    unit TEXT DEFAULT '个',                -- 单位（个、件、套等）
    status TEXT DEFAULT '待购买',          -- 状态：待购买、已购买、已取消
    purchase_date DATE,                    -- 购买日期
    shop_name TEXT,                        -- 购买商店/平台
    notes TEXT,                            -- 备注
    priority INTEGER DEFAULT 2,            -- 优先级：1-高 2-中 3-低
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_shopping_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_category ON shopping_list(category);
CREATE INDEX IF NOT EXISTS idx_shopping_status ON shopping_list(status);
CREATE INDEX IF NOT EXISTS idx_shopping_priority ON shopping_list(priority);
CREATE INDEX IF NOT EXISTS idx_shopping_purchase_date ON shopping_list(purchase_date);

