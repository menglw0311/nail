# 🎉 新功能说明

## 新增功能概览

### 1. 📦 采购清单模块

专为婚礼筹备设计的采购管理系统，帮助你记录和跟踪需要购买的物品。

#### ✨ 主要特性

- ✅ **分类管理**：会亲家、订婚、结婚、其他
- ✅ **状态跟踪**：待购买、已购买、已取消
- ✅ **优先级设置**：高、中、低
- ✅ **详细记录**：物品名称、金额、数量、单位、购买店铺等
- ✅ **统计分析**：总支出、分类统计、购买进度
- ✅ **批量操作**：批量标记已购买、批量删除

### 2. 🎁 礼金记录增强

现有的礼金记录模块可以添加更多事件类型，包括：
- 会亲家
- 订婚
- 结婚
- 其他婚礼相关事件

## 🚀 快速使用

### 采购清单模块

#### 1. API 地址
```
http://你的服务器/api/shopping
```

#### 2. 添加采购项目示例

**会亲家物品**
```bash
curl -X POST http://localhost:3000/api/shopping \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_name": "茶叶礼盒",
    "category": "会亲家",
    "amount": 500,
    "quantity": 2,
    "unit": "盒",
    "priority": 1,
    "status": "待购买",
    "notes": "高档茶叶"
  }'
```

**订婚物品**
```bash
curl -X POST http://localhost:3000/api/shopping \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_name": "订婚戒指",
    "category": "订婚",
    "amount": 5000,
    "quantity": 2,
    "unit": "个",
    "priority": 1,
    "status": "待购买",
    "notes": "18K金"
  }'
```

**结婚物品**
```bash
curl -X POST http://localhost:3000/api/shopping \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_name": "喜糖",
    "category": "结婚",
    "amount": 500,
    "quantity": 100,
    "unit": "盒",
    "priority": 2,
    "status": "待购买"
  }'
```

#### 3. 查看采购清单
```bash
# 查看所有
curl -X GET http://localhost:3000/api/shopping \
  -H "Authorization: Bearer YOUR_TOKEN"

# 按分类查看
curl -X GET "http://localhost:3000/api/shopping?category=结婚" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 按状态查看
curl -X GET "http://localhost:3000/api/shopping?status=待购买" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. 标记已购买
```bash
curl -X PATCH http://localhost:3000/api/shopping/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "已购买"}'
```

#### 5. 查看统计
```bash
# 总体统计
curl -X GET http://localhost:3000/api/shopping/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"

# 分类统计
curl -X GET http://localhost:3000/api/shopping/statistics/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 数据示例

### 采购清单记录

```json
{
  "id": 1,
  "user_id": 1,
  "item_name": "喜糖",
  "category": "结婚",
  "amount": 500,
  "quantity": 100,
  "unit": "盒",
  "status": "已购买",
  "purchase_date": "2024-12-05",
  "shop_name": "某某商店",
  "notes": "买了红色包装的",
  "priority": 2,
  "created_at": "2024-12-01 10:00:00",
  "updated_at": "2024-12-05 15:30:00"
}
```

### 统计数据

```json
{
  "total_items": 50,
  "pending_count": 20,
  "purchased_count": 28,
  "cancelled_count": 2,
  "total_spent": 15000,
  "pending_amount": 5000,
  "avg_amount": 300
}
```

### 分类统计

```json
[
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
  },
  {
    "category": "会亲家",
    "item_count": 5,
    "total_amount": 2000,
    "avg_amount": 400,
    "purchased_count": 3,
    "pending_count": 2
  }
]
```

## 🎨 前端页面建议

### 页面结构

```
┌────────────────────────────────────────────┐
│  采购清单管理                               │
├────────────────────────────────────────────┤
│  [+ 新建]  筛选: [分类▼] [状态▼] [优先级▼] │
├────────────────────────────────────────────┤
│  统计卡片                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │总项目│ │已购买│ │待购买│ │总支出│      │
│  │  50  │ │  28  │ │  22  │ │15000 │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
├────────────────────────────────────────────┤
│                                            │
│  📦 会亲家 (5项) - ¥2,000                  │
│  ─────────────────────────────────────── │
│  [高] □ 茶叶礼盒   ¥500   2盒    待购买   │
│  [高] □ 烟酒       ¥1000  1套    待购买   │
│  [中] ✓ 水果篮     ¥200   2篮    已购买   │
│  ...                                       │
│                                            │
│  💍 订婚 (15项) - ¥7,000                   │
│  ─────────────────────────────────────── │
│  [高] □ 订婚戒指   ¥5000  2个    待购买   │
│  [高] □ 订婚礼服   ¥2000  1套    待购买   │
│  ...                                       │
│                                            │
│  💐 结婚 (30项) - ¥10,000                  │
│  ─────────────────────────────────────── │
│  [高] □ 婚纱       ¥3000  1件    待购买   │
│  [中] □ 喜糖       ¥500   100盒  待购买   │
│  [中] ✓ 喜帖       ¥300   100张  已购买   │
│  ...                                       │
│                                            │
└────────────────────────────────────────────┘
```

### 组件建议

1. **ShoppingList.js** - 采购清单主页面
2. **ShoppingForm.js** - 添加/编辑表单
3. **ShoppingItem.js** - 单个采购项组件
4. **ShoppingStats.js** - 统计卡片组件
5. **CategoryGroup.js** - 分类分组显示

## 📝 API 路由总览

```
GET    /api/shopping                      获取采购清单
POST   /api/shopping                      创建采购项目
GET    /api/shopping/statistics           获取统计数据
GET    /api/shopping/statistics/categories 获取分类统计
GET    /api/shopping/:id                  获取单个项目
PUT    /api/shopping/:id                  更新采购项目
PATCH  /api/shopping/:id/status           更新状态
POST   /api/shopping/batch/status         批量更新状态
DELETE /api/shopping/:id                  删除采购项目
POST   /api/shopping/batch/delete         批量删除
```

## 📚 详细文档

- **完整使用指南**: `SHOPPING_MODULE_GUIDE.md`
- **API 文档**: 查看上面的接口说明
- **数据库Schema**: `database/shopping_schema.sql`

## 🔧 技术实现

### 后端文件

- `database/shopping_schema.sql` - 数据库表结构
- `models/ShoppingItem.js` - 数据模型
- `controllers/shoppingController.js` - 控制器
- `routes/shoppingRoutes.js` - 路由配置
- `scripts/initShoppingTable.js` - 初始化脚本

### 已集成到服务器

路由已添加到 `server.js`，重启后即可使用。

## 🚀 部署到服务器

### 1. 上传新文件
```bash
scp -r models/ShoppingItem.js root@服务器IP:/www/wwwroot/accounting-system/models/
scp -r controllers/shoppingController.js root@服务器IP:/www/wwwroot/accounting-system/controllers/
scp -r routes/shoppingRoutes.js root@服务器IP:/www/wwwroot/accounting-system/routes/
scp -r database/shopping_schema.sql root@服务器IP:/www/wwwroot/accounting-system/database/
scp -r scripts/initShoppingTable.js root@服务器IP:/www/wwwroot/accounting-system/scripts/
```

### 2. 更新主文件
```bash
scp server.js root@服务器IP:/www/wwwroot/accounting-system/
scp package.json root@服务器IP:/www/wwwroot/accounting-system/
scp config/database.js root@服务器IP:/www/wwwroot/accounting-system/config/
```

### 3. 在服务器上初始化
```bash
ssh root@服务器IP
cd /www/wwwroot/accounting-system
npm run init-shopping
pm2 restart accounting-system
```

## ✅ 验证安装

```bash
# 查看服务器日志
pm2 logs accounting-system

# 测试 API
curl http://你的服务器IP:3000/api
# 应该看到 shopping 相关的端点
```

## 💡 使用建议

### 1. 会亲家准备清单
- 茶叶礼盒
- 烟酒
- 水果
- 红包
- 其他礼品

### 2. 订婚物品清单
- 订婚戒指
- 订婚礼服
- 订婚宴席
- 装饰用品
- 摄影服务

### 3. 结婚物品清单
- 婚纱礼服
- 喜糖喜帖
- 婚车装饰
- 婚礼布置
- 酒水饮料
- 其他用品

## 🎉 功能亮点

1. **智能分类** - 按婚礼流程分类管理
2. **优先级管理** - 合理安排购买顺序
3. **预算控制** - 实时跟踪支出
4. **进度可视** - 清楚了解采购进度
5. **批量操作** - 提高操作效率
6. **统计分析** - 全面掌握预算情况

---

**祝你婚礼筹备顺利！** 🎊💐💍

