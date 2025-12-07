import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Records.css';

function Records() {
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({ 
    type: '', 
    category_id: '',
    start_date: '',
    end_date: ''
  });
  
  const [formData, setFormData] = useState({
    type: 'expense',
    category_id: '',
    amount: '',
    description: '',
    record_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCategories();
    fetchRecords();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const response = await api.get('/records', { params });
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/records/${editingRecord.id}`, formData);
      } else {
        await api.post('/records', formData);
      }
      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      fetchRecords();
    } catch (error) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      category_id: record.category_id,
      amount: record.amount,
      description: record.description || '',
      record_date: record.record_date
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords();
    } catch (error) {
      alert('删除失败');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category_id: '',
      amount: '',
      description: '',
      record_date: new Date().toISOString().split('T')[0]
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingRecord(null);
    setShowModal(true);
  };

  return (
    <div className="records-page">
      <div className="page-header">
        <h2 className="page-title">记账记录</h2>
        <button className="add-button" onClick={openAddModal}>+ 添加记录</button>
      </div>

      <div className="filters">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">全部类型</option>
          <option value="income">收入</option>
          <option value="expense">支出</option>
        </select>
        <select
          value={filters.category_id}
          onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
        >
          <option value="">全部分类</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <div className="filter-date-group">
          <label>开始日期</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          />
        </div>
        <div className="filter-date-group">
          <label>结束日期</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          />
        </div>
        <button 
          className="filter-reset-button"
          onClick={() => setFilters({ type: '', category_id: '', start_date: '', end_date: '' })}
        >
          重置筛选
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="records-table">
          {records.length === 0 ? (
            <div className="empty-state">暂无记录</div>
          ) : (
            records.map(record => (
              <div key={record.id} className="record-row">
                <div className="record-date">{record.record_date}</div>
                <div className="record-category">{record.category_name}</div>
                <div className="record-desc">{record.description || '-'}</div>
                <div className={`record-amount ${record.type}`}>
                  {record.type === 'income' ? '+' : '-'}¥{parseFloat(record.amount).toFixed(2)}
                </div>
                <div className="record-actions">
                  <button onClick={() => handleEdit(record)}>编辑</button>
                  <button onClick={() => handleDelete(record.id)} className="delete">删除</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingRecord ? '编辑记录' : '添加记录'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="income">收入</option>
                  <option value="expense">支出</option>
                </select>
              </div>
              <div className="form-group">
                <label>分类</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">请选择分类</option>
                  {categories
                    .filter(cat => cat.type === formData.type)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>金额</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>日期</label>
                <input
                  type="date"
                  value={formData.record_date}
                  onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Records;

