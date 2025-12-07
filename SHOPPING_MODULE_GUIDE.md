# 采购模块使用指南

## 📦 功能概述

采购模块专为婚礼筹备设计，帮助你管理需要购买的物品清单，包括：
- 会亲家所需物品
- 订婚所需物品
- 结婚所需物品
- 其他相关物品

## 🎯 主要功能

### 1. 采购清单管理
- ✅ 添加采购项目（物品名称、金额、数量等）
- ✅ 修改采购项目
- ✅ 删除采购项目
- ✅ 批量操作（批量标记已购买、批量删除）

### 2. 状态管理
- **待购买** - 计划购买但还未购买
- **已购买** - 已完成购买
- **已取消** - 决定不购买

### 3. 优先级管理
- **高优先级 (1)** - 必须尽快购买
- **中优先级 (2)** - 正常购买计划（默认）
- **低优先级 (3)** - 可以稍后购买

### 4. 分类管理
- **会亲家** - 会亲家所需物品
- **订婚** - 订婚仪式所需物品
- **结婚** - 婚礼所需物品
- **其他** - 其他相关物品

### 5. 统计分析
- 总支出统计
- 待购买金额统计
- 分类支出统计
- 购买进度统计

## 🚀 快速开始

### 1. 初始化数据库表

```bash
cd /www/wwwroot/accounting-system
npm run init-shopping
```

### 2. 重启服务器

```bash
pm2 restart accounting-system
# 或
npm start
```

## 📡 API 接口

### 基础路径
```
http://你的服务器/api/shopping
```

### 接口列表

#### 1. 创建采购项目
```http
POST /api/shopping
Authorization: Bearer {token}
Content-Type: application/json

{
  "item_name": "喜糖",
  "category": "结婚",
  "amount": 500,
  "quantity": 100,
  "unit": "盒",
  "status": "待购买",
  "priority": 2,
  "notes": "需要100盒喜糖"
}
```

#### 2. 获取采购清单
```http
GET /api/shopping
Authorization: Bearer {token}

# 支持筛选参数：
?category=结婚          # 按分类筛选
&status=待购买          # 按状态筛选
&priority=1            # 按优先级筛选
&item_name=喜糖        # 按名称搜索
```

#### 3. 获取单个项目
```http
GET /api/shopping/:id
Authorization: Bearer {token}
```

#### 4. 更新采购项目
```http
PUT /api/shopping/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "item_name": "喜糖",
  "category": "结婚",
  "amount": 600,
  "quantity": 120,
  "unit": "盒",
  "status": "已购买",
  "purchase_date": "2024-12-05",
  "shop_name": "某某商店",
  "notes": "实际购买了120盒",
  "priority": 2
}
```

#### 5. 更新状态
```http
PATCH /api/shopping/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "已购买"
}
```

#### 6. 批量更新状态
```http
POST /api/shopping/batch/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3],
  "status": "已购买"
}
```

#### 7. 删除采购项目
```http
DELETE /api/shopping/:id
Authorization: Bearer {token}
```

#### 8. 批量删除
```http
POST /api/shopping/batch/delete
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

#### 9. 获取统计数据
```http
GET /api/shopping/statistics
Authorization: Bearer {token}

# 支持筛选：
?category=结婚
&start_date=2024-01-01
&end_date=2024-12-31
```

返回示例：
```json
{
  "success": true,
  "data": {
    "total_items": 50,
    "pending_count": 20,
    "purchased_count": 28,
    "cancelled_count": 2,
    "total_spent": 15000,
    "pending_amount": 5000,
    "avg_amount": 300
  }
}
```

#### 10. 获取分类统计
```http
GET /api/shopping/statistics/categories
Authorization: Bearer {token}
```

返回示例：
```json
{
  "success": true,
  "data": [
    {
      "category": "结婚",
      "item_count": 30,
      "total_amount": 10000,
      "avg_amount": 333.33,
      "purchased_count": 20,
      "pending_count": 10
    },
    {
      "category": "订婚",
      "item_count": 15,
      "total_amount": 3000,
      "avg_amount": 200,
      "purchased_count": 5,
      "pending_count": 10
    }
  ]
}
```

## 📝 数据字段说明

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| item_name | String | 是 | 物品名称 | "喜糖" |
| category | String | 是 | 分类 | "会亲家"/"订婚"/"结婚"/"其他" |
| amount | Number | 否 | 金额 | 500 |
| quantity | Number | 否 | 数量 | 100 |
| unit | String | 否 | 单位 | "盒"/"个"/"套" |
| status | String | 否 | 状态 | "待购买"/"已购买"/"已取消" |
| purchase_date | Date | 否 | 购买日期 | "2024-12-05" |
| shop_name | String | 否 | 购买商店 | "某某商店" |
| notes | String | 否 | 备注 | "需要红色包装" |
| priority | Number | 否 | 优先级 | 1(高)/2(中)/3(低) |

## 💡 使用示例

### 示例1：会亲家物品清单

```javascript
// 创建会亲家物品
const items = [
  {
    item_name: "茶叶礼盒",
    category: "会亲家",
    amount: 500,
    quantity: 2,
    unit: "盒",
    priority: 1,
    notes: "高档茶叶"
  },
  {
    item_name: "烟酒",
    category: "会亲家",
    amount: 1000,
    quantity: 1,
    unit: "套",
    priority: 1
  },
  {
    item_name: "水果篮",
    category: "会亲家",
    amount: 200,
    quantity: 2,
    unit: "篮",
    priority: 2
  }
];
```

### 示例2：订婚物品清单

```javascript
const items = [
  {
    item_name: "订婚戒指",
    category: "订婚",
    amount: 5000,
    quantity: 2,
    unit: "个",
    priority: 1,
    notes: "18K金"
  },
  {
    item_name: "订婚礼服",
    category: "订婚",
    amount: 2000,
    quantity: 1,
    unit: "套",
    priority: 1
  }
];
```

### 示例3：结婚物品清单

```javascript
const items = [
  {
    item_name: "婚纱",
    category: "结婚",
    amount: 3000,
    quantity: 1,
    unit: "件",
    priority: 1,
    notes: "需要定制"
  },
  {
    item_name: "喜糖",
    category: "结婚",
    amount: 500,
    quantity: 100,
    unit: "盒",
    priority: 2
  },
  {
    item_name: "喜帖",
    category: "结婚",
    amount: 300,
    quantity: 100,
    unit: "张",
    priority: 1
  },
  {
    item_name: "婚车装饰",
    category: "结婚",
    amount: 200,
    quantity: 1,
    unit: "套",
    priority: 2
  }
];
```

## 🎨 前端开发建议

### 页面布局建议

```
┌─────────────────────────────────────────┐
│  采购清单                                │
├─────────────────────────────────────────┤
│  [+ 添加物品]  筛选: [分类▼] [状态▼]    │
├─────────────────────────────────────────┤
│                                          │
│  会亲家 (3项, 待购买: 2, 已购买: 1)      │
│  ─────────────────────────────────────  │
│  □ 茶叶礼盒    ¥500  2盒   [高] 待购买  │
│  □ 烟酒        ¥1000 1套   [高] 待购买  │
│  ✓ 水果篮      ¥200  2篮   [中] 已购买  │
│                                          │
│  订婚 (2项, 待购买: 2, 已购买: 0)        │
│  ─────────────────────────────────────  │
│  □ 订婚戒指    ¥5000 2个   [高] 待购买  │
│  □ 订婚礼服    ¥2000 1套   [高] 待购买  │
│                                          │
│  结婚 (15项, 待购买: 10, 已购买: 5)      │
│  ─────────────────────────────────────  │
│  □ 婚纱        ¥3000 1件   [高] 待购买  │
│  □ 喜糖        ¥500  100盒 [中] 待购买  │
│  ...                                     │
│                                          │
├─────────────────────────────────────────┤
│  统计: 总计50项 | 已购买28项 | 待购买22项│
│        总支出: ¥15,000 | 待支出: ¥5,000 │
└─────────────────────────────────────────┘
```

### 功能组件建议

1. **清单展示组件** - 分类展示采购项目
2. **添加/编辑表单** - 创建和修改采购项目
3. **批量操作工具栏** - 批量标记、批量删除
4. **筛选器** - 按分类、状态、优先级筛选
5. **统计卡片** - 显示统计数据
6. **进度条** - 显示购买进度

## 🔐 权限说明

- 所有采购接口都需要登录认证
- 用户只能查看和管理自己的采购清单
- 不同用户的数据完全隔离

## 📊 统计功能

### 1. 总体统计
- 总项目数
- 待购买项目数
- 已购买项目数
- 已取消项目数
- 总支出金额
- 待支出金额
- 平均单项金额

### 2. 分类统计
- 各分类项目数量
- 各分类总金额
- 各分类购买进度

### 3. 购买进度
```
会亲家: ████████░░ 80% (4/5)
订婚:   ██████░░░░ 60% (3/5)
结婚:   ███░░░░░░░ 30% (9/30)
```

## 🎯 使用场景

### 场景1：筹备会亲家
```
1. 创建"会亲家"分类物品
2. 设置高优先级
3. 购买后标记为"已购买"
4. 查看统计确认预算
```

### 场景2：订婚准备
```
1. 列出所有订婚需要的物品
2. 按优先级排序
3. 逐项购买并标记
4. 跟踪支出
```

### 场景3：婚礼筹备
```
1. 详细列出婚礼所需物品
2. 分配优先级
3. 设置购买计划
4. 实时跟踪进度和预算
```

## 🔄 与其他模块的关系

### 与礼金记录模块
- 采购模块：管理需要购买的物品
- 礼金记录：记录送礼和收礼
- 可以配合使用，全面管理婚礼开支

### 与记账模块
- 采购完成后，可以在记账模块记录实际支出
- 采购模块侧重计划，记账模块侧重实际

## 📱 移动端适配建议

- 列表式展示，易于滚动
- 滑动操作（左滑删除、右滑标记已购买）
- 大按钮，方便点击
- 简化表单，快速添加

## 🐛 常见问题

### Q1: 如何修改已购买的物品？
A: 可以直接更新物品信息，状态会保持不变

### Q2: 如何取消误标记的已购买？
A: 使用更新状态接口，将状态改回"待购买"

### Q3: 如何导出采购清单？
A: 可以通过统计接口获取数据，然后在前端导出为 Excel 或 PDF

### Q4: 能否设置购买提醒？
A: 当前版本不支持，可以通过前端添加浏览器通知功能

## 🎉 下一步

1. 初始化采购表：`npm run init-shopping`
2. 重启服务器：`pm2 restart accounting-system`
3. 开始添加采购项目
4. 跟踪购买进度

---

祝婚礼筹备顺利！🎊

