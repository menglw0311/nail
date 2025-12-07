import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Shopping.css';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api');

function Shopping() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priority: ''
  });
  
  const [formData, setFormData] = useState({
    item_name: '',
    category: '结婚',
    amount: '',
    quantity: 1,
    unit: '个',
    status: '待购买',
    priority: 2,
    purchase_date: '',
    shop_name: '',
    notes: ''
  });

  const categories = ['会亲家', '订婚', '结婚', '其他'];
  const statuses = ['待购买', '已购买', '已取消'];
  const priorities = [
    { value: 1, label: '高' },
    { value: 2, label: '中' },
    { value: 3, label: '低' }
  ];

  useEffect(() => {
    fetchItems();
    fetchStatistics();
    fetchCategoryStats();
  }, [filters]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await axios.get(`${API_URL}/shopping?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data.data || []);
    } catch (error) {
      console.error('获取采购清单失败:', error);
      alert('获取采购清单失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shopping/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(response.data.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/shopping/statistics/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategoryStats(response.data.data || []);
    } catch (error) {
      console.error('获取分类统计失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingItem) {
        await axios.put(`${API_URL}/shopping/${editingItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('更新成功');
      } else {
        await axios.post(`${API_URL}/shopping`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('添加成功');
      }
      resetForm();
      fetchItems();
      fetchStatistics();
      fetchCategoryStats();
    } catch (error) {
      console.error('操作失败:', error);
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      category: item.category,
      amount: item.amount,
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      priority: item.priority,
      purchase_date: item.purchase_date || '',
      shop_name: item.shop_name || '',
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个采购项目吗？')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/shopping/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('删除成功');
      fetchItems();
      fetchStatistics();
      fetchCategoryStats();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/shopping/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchItems();
      fetchStatistics();
      fetchCategoryStats();
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('更新状态失败');
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      category: '结婚',
      amount: '',
      quantity: 1,
      unit: '个',
      status: '待购买',
      priority: 2,
      purchase_date: '',
      shop_name: '',
      notes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const getPriorityLabel = (priority) => {
    const p = priorities.find(p => p.value === priority);
    return p ? p.label : '中';
  };

  const getPriorityClass = (priority) => {
    if (priority === 1) return 'priority-high';
    if (priority === 3) return 'priority-low';
    return 'priority-medium';
  };

  const groupByCategory = () => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = items.filter(item => item.category === cat);
    });
    return grouped;
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const groupedItems = groupByCategory();

  return (
    <div className="shopping-container">
      <div className="shopping-header">
        <h2>📦 采购清单管理</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + 添加物品
        </button>
      </div>

      {/* 统计卡片 */}
      {statistics && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.total_items || 0}</div>
              <div className="stat-label">总项目</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.purchased_count || 0}</div>
              <div className="stat-label">已购买</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.pending_count || 0}</div>
              <div className="stat-label">待购买</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-value">¥{statistics.total_spent?.toFixed(2) || '0.00'}</div>
              <div className="stat-label">总支出</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-info">
              <div className="stat-value">¥{statistics.pending_amount?.toFixed(2) || '0.00'}</div>
              <div className="stat-label">待支出</div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选器 */}
      <div className="filters">
        <select 
          value={filters.category} 
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="filter-select"
        >
          <option value="">全部分类</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="filter-select"
        >
          <option value="">全部状态</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select 
          value={filters.priority} 
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
          className="filter-select"
        >
          <option value="">全部优先级</option>
          {priorities.map(p => (
            <option key={p.value} value={p.value}>{p.label}优先级</option>
          ))}
        </select>
      </div>

      {/* 采购清单 */}
      <div className="shopping-list">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          if (categoryItems.length === 0 && filters.category) return null;
          
          const catStat = categoryStats.find(s => s.category === category);
          return (
            <div key={category} className="category-group">
              <div className="category-header">
                <h3>
                  {category === '会亲家' && '🤝'}
                  {category === '订婚' && '💍'}
                  {category === '结婚' && '💐'}
                  {category === '其他' && '📌'}
                  {' '}{category}
                </h3>
                {catStat && (
                  <span className="category-stat">
                    {catStat.item_count}项 | 
                    已购买{catStat.purchased_count} | 
                    待购买{catStat.pending_count} | 
                    ¥{catStat.total_amount?.toFixed(2)}
                  </span>
                )}
              </div>
              {categoryItems.length > 0 ? (
                <div className="items-list">
                  {categoryItems.map(item => (
                    <div key={item.id} className={`item-card ${item.status === '已购买' ? 'purchased' : ''}`}>
                      <div className="item-priority">
                        <span className={`priority-badge ${getPriorityClass(item.priority)}`}>
                          {getPriorityLabel(item.priority)}
                        </span>
                      </div>
                      <div className="item-content">
                        <div className="item-name">{item.item_name}</div>
                        <div className="item-details">
                          <span>¥{item.amount}</span>
                          <span>{item.quantity}{item.unit}</span>
                          {item.shop_name && <span>📍 {item.shop_name}</span>}
                        </div>
                        {item.notes && <div className="item-notes">{item.notes}</div>}
                        {item.purchase_date && (
                          <div className="item-date">购买日期: {item.purchase_date}</div>
                        )}
                      </div>
                      <div className="item-actions">
                        <select 
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`status-select status-${item.status}`}
                        >
                          {statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button className="btn-icon" onClick={() => handleEdit(item)} title="编辑">
                          ✏️
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(item.id)} title="删除">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !filters.category && <div className="empty-category">暂无物品</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 表单弹窗 */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? '编辑采购项目' : '添加采购项目'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="shopping-form">
              <div className="form-row">
                <div className="form-group">
                  <label>物品名称 *</label>
                  <input
                    type="text"
                    value={formData.item_name}
                    onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>分类 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>金额</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>数量</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>优先级</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                  >
                    {priorities.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>购买日期</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>购买商店</label>
                  <input
                    type="text"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({...formData, shop_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shopping;

