import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个分类吗？')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert('删除失败');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      description: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingCategory(null);
    setShowModal(true);
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="categories-page">
      <div className="page-header">
        <h2 className="page-title">分类管理</h2>
        <button className="add-button" onClick={openAddModal}>+ 添加分类</button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="categories-grid">
          <div className="category-section">
            <h3 className="section-title">收入分类</h3>
            <div className="category-list">
              {incomeCategories.length === 0 ? (
                <div className="empty-state">暂无分类</div>
              ) : (
                incomeCategories.map(category => (
                  <div key={category.id} className="category-card">
                    <div className="category-info">
                      <div className="category-name">{category.name}</div>
                      {category.description && (
                        <div className="category-desc">{category.description}</div>
                      )}
                    </div>
                    <div className="category-actions">
                      <button onClick={() => handleEdit(category)}>编辑</button>
                      <button onClick={() => handleDelete(category.id)} className="delete">删除</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="category-section">
            <h3 className="section-title">支出分类</h3>
            <div className="category-list">
              {expenseCategories.length === 0 ? (
                <div className="empty-state">暂无分类</div>
              ) : (
                expenseCategories.map(category => (
                  <div key={category.id} className="category-card">
                    <div className="category-info">
                      <div className="category-name">{category.name}</div>
                      {category.description && (
                        <div className="category-desc">{category.description}</div>
                      )}
                    </div>
                    <div className="category-actions">
                      <button onClick={() => handleEdit(category)}>编辑</button>
                      <button onClick={() => handleDelete(category.id)} className="delete">删除</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCategory ? '编辑分类' : '添加分类'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
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

export default Categories;

