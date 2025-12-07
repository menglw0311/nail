import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './GiftRecords.css';

function GiftRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    gift_type: '',
    event_type: '',
    name: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    gift_type: '送礼',
    event_type: '婚礼',
    amount: ''
  });

  const eventTypes = ['婚礼', '丧事', '乔迁', '生日', '满月', '升学', '其他'];

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.gift_type) params.gift_type = filters.gift_type;
      if (filters.event_type) params.event_type = filters.event_type;
      if (filters.name) params.name = filters.name;

      const response = await api.get('/gifts', { params });
      
      if (response.data.success) {
        setRecords(response.data.data || []);
        setError(null);
      } else {
        // 后端返回 success: false（不太可能发生）
        console.error('后端返回失败:', response.data);
        setError(response.data.message || '获取记录失败');
      }
    } catch (error) {
      console.error('获取记录失败:', error);
      
      // 只在真正出错时才显示错误消息
      if (error.response?.status === 404) {
        setError('礼金记录表未初始化，请运行: npm run init-gifts');
      } else if (error.response?.status === 401) {
        setError('登录已过期，请重新登录');
      } else if (error.response?.status === 500) {
        setError('服务器错误: ' + (error.response?.data?.message || '请联系管理员'));
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setError('无法连接到服务器，请检查后端是否运行');
      } else if (error.message) {
        setError('网络错误: ' + error.message);
      } else {
        setError('获取记录失败，请检查网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    setError(null); // 清除之前的错误
    setSuccessMessage(null); // 清除成功消息
    if (record) {
      setEditingRecord(record);
      setFormData({
        name: record.name,
        gift_type: record.gift_type,
        event_type: record.event_type,
        amount: record.amount
      });
    } else {
      setEditingRecord(null);
      setFormData({
        name: '',
        gift_type: '送礼',
        event_type: '婚礼',
        amount: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!formData.name.trim()) {
      setError('请填写姓名');
      return;
    }
    
    if (!formData.amount) {
      setError('请填写金额');
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('金额必须是大于0的数字');
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        gift_type: formData.gift_type,
        event_type: formData.event_type,
        amount: amount,
        event_date: new Date().toISOString().split('T')[0] // 使用当前日期
      };

      console.log('提交数据:', submitData);

      if (editingRecord) {
        console.log('更新记录 ID:', editingRecord.id);
        const response = await api.put(`/gifts/${editingRecord.id}`, submitData);
        console.log('更新响应:', response.data);
        
        if (response.data.success) {
          setSuccessMessage('记录更新成功！');
          setTimeout(() => setSuccessMessage(null), 3000);
          handleCloseModal();
          fetchRecords();
        } else {
          setError(response.data.message || '更新失败');
        }
      } else {
        console.log('创建新记录');
        const response = await api.post('/gifts', submitData);
        console.log('创建响应:', response.data);
        
        if (response.data.success) {
          setSuccessMessage('记录添加成功！');
          setTimeout(() => setSuccessMessage(null), 3000);
          handleCloseModal();
          fetchRecords();
        } else {
          setError(response.data.message || '添加失败');
        }
      }
    } catch (error) {
      console.error('提交失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 400) {
        setError(error.response.data.message || '请检查输入的数据');
      } else if (error.response?.status === 401) {
        setError('登录已过期，请重新登录');
      } else if (error.response?.status === 500) {
        setError('服务器错误: ' + (error.response.data.message || '请联系管理员'));
      } else if (error.code === 'ERR_NETWORK') {
        setError('无法连接到服务器，请检查后端是否运行');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('提交失败: ' + error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;

    try {
      const response = await api.delete(`/gifts/${id}`);
      if (response.data.success) {
        setSuccessMessage('记录删除成功！');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchRecords();
      } else {
        setError(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      setError(error.response?.data?.message || '删除失败，请重试');
    }
  };

  const resetFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      gift_type: '',
      event_type: '',
      name: ''
    });
  };

  const getTotalGiving = () => {
    return records
      .filter(r => r.gift_type === '送礼')
      .reduce((sum, r) => sum + r.amount, 0)
      .toFixed(2);
  };

  const getTotalReceiving = () => {
    return records
      .filter(r => r.gift_type === '收礼')
      .reduce((sum, r) => sum + r.amount, 0)
      .toFixed(2);
  };

  const getNetAmount = () => {
    return (getTotalReceiving() - getTotalGiving()).toFixed(2);
  };

  return (
    <div className="gift-records-page">
      <div className="page-header">
        <h1 className="page-title">🎁 礼金记录</h1>
        <button className="add-button" onClick={() => handleOpenModal()}>
          + 添加记录
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="stats-cards">
        <div className="stat-card giving">
          <div className="stat-label">送礼总额</div>
          <div className="stat-value">¥{getTotalGiving()}</div>
          <div className="stat-count">{records.filter(r => r.gift_type === '送礼').length} 次</div>
        </div>
        <div className="stat-card receiving">
          <div className="stat-label">收礼总额</div>
          <div className="stat-value">¥{getTotalReceiving()}</div>
          <div className="stat-count">{records.filter(r => r.gift_type === '收礼').length} 次</div>
        </div>
        <div className="stat-card net">
          <div className="stat-label">净额</div>
          <div className={`stat-value ${parseFloat(getNetAmount()) >= 0 ? 'positive' : 'negative'}`}>
            ¥{getNetAmount()}
          </div>
          <div className="stat-count">
            {parseFloat(getNetAmount()) >= 0 ? '收入大于支出' : '支出大于收入'}
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="filters-section">
        <div className="filter-group">
          <label>姓名</label>
          <input
            type="text"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            placeholder="搜索姓名"
          />
        </div>
        <div className="filter-group">
          <label>类型</label>
          <select
            value={filters.gift_type}
            onChange={(e) => setFilters({ ...filters, gift_type: e.target.value })}
          >
            <option value="">全部</option>
            <option value="送礼">送礼</option>
            <option value="收礼">收礼</option>
          </select>
        </div>
        <div className="filter-group">
          <label>事件类型</label>
          <select
            value={filters.event_type}
            onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
          >
            <option value="">全部</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <button className="reset-button" onClick={resetFilters}>
          重置
        </button>
      </div>

      {/* 成功提示 */}
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <span className="success-text">{successMessage}</span>
          <button className="success-close" onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* 记录表格 */}
      <div className="records-table-container">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>类型</th>
                <th>事件</th>
                <th>金额</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    暂无记录
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id}>
                    <td className="name-cell">{record.name}</td>
                    <td>
                      <span className={`gift-type-badge ${record.gift_type === '送礼' ? 'giving' : 'receiving'}`}>
                        {record.gift_type}
                      </span>
                    </td>
                    <td>
                      <span className="event-type-badge">{record.event_type}</span>
                    </td>
                    <td>
                      <span className={`amount ${record.gift_type === '送礼' ? 'giving' : 'receiving'}`}>
                        {record.gift_type === '送礼' ? '-' : '+'}¥{record.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleOpenModal(record)}
                        >
                          编辑
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(record.id)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 模态框 */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecord ? '编辑记录' : '添加记录'}</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
                <button className="error-close" onClick={() => setError(null)}>×</button>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>类型 *</label>
                  <select
                    value={formData.gift_type}
                    onChange={(e) => setFormData({ ...formData, gift_type: e.target.value })}
                    required
                  >
                    <option value="送礼">送礼</option>
                    <option value="收礼">收礼</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>事件类型 *</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>金额 *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>


              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={handleCloseModal}>
                  取消
                </button>
                <button type="submit" className="submit-button">
                  {editingRecord ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GiftRecords;

