import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Mahjong.css';

function Mahjong() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({
    result_type: ''
  });

  const [formData, setFormData] = useState({
    game_date: new Date().toISOString().split('T')[0],
    win_amount: '',
    table_fee: '',
    taxi_fee: '',
    cigarette_fee: ''
  });

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.result_type) params.result_type = filters.result_type;

      const response = await api.get('/mahjong', { params });
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.error('获取记录失败:', error);
      alert('获取记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        game_date: record.game_date,
        win_amount: record.win_amount,
        table_fee: record.table_fee || '',
        taxi_fee: record.taxi_fee || '',
        cigarette_fee: record.cigarette_fee || ''
      });
    } else {
      setEditingRecord(null);
      setFormData({
        game_date: new Date().toISOString().split('T')[0],
        win_amount: '',
        table_fee: '',
        taxi_fee: '',
        cigarette_fee: ''
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
    
    if (!formData.win_amount) {
      alert('请填写盈亏金额');
      return;
    }

    const data = {
      game_date: formData.game_date,
      game_time: '',
      players: ['我'],
      scores: [0],
      win_amount: parseFloat(formData.win_amount),
      table_fee: parseFloat(formData.table_fee) || 0,
      taxi_fee: parseFloat(formData.taxi_fee) || 0,
      cigarette_fee: parseFloat(formData.cigarette_fee) || 0,
      game_type: '',
      location: '',
      notes: ''
    };

    try {
      if (editingRecord) {
        await api.put(`/mahjong/${editingRecord.id}`, data);
        alert('记录更新成功');
      } else {
        await api.post('/mahjong', data);
        alert('记录添加成功');
      }
      handleCloseModal();
      fetchRecords();
    } catch (error) {
      console.error('保存失败:', error);
      alert(error.response?.data?.message || '保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;

    try {
      await api.delete(`/mahjong/${id}`);
      alert('删除成功');
      fetchRecords();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const resetFilters = () => {
    setFilters({
      result_type: ''
    });
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="mahjong-page">
      <div className="page-header">
        <h2 className="page-title">麻将记录</h2>
        <button className="add-button" onClick={() => handleOpenModal()}>
          ➕ 添加记录
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>结果</label>
          <select
            value={filters.result_type}
            onChange={(e) => setFilters({ ...filters, result_type: e.target.value })}
          >
            <option value="">全部</option>
            <option value="win">赢</option>
            <option value="lose">输</option>
          </select>
        </div>
        <button className="reset-button" onClick={resetFilters}>
          重置筛选
        </button>
      </div>

      <div className="records-table-container">
        <table className="records-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>盈亏</th>
              <th>台费</th>
              <th>打车费</th>
              <th>烟钱</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">暂无记录</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td>{record.game_date}</td>
                  <td>
                    <span className={`amount ${record.win_amount >= 0 ? 'win' : 'lose'}`}>
                      {record.win_amount >= 0 ? '+' : ''}¥{record.win_amount.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className="fee-amount">
                      ¥{(record.table_fee || 0).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className="fee-amount">
                      ¥{(record.taxi_fee || 0).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className="fee-amount">
                      ¥{(record.cigarette_fee || 0).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleOpenModal(record)}
                      >
                        编辑
                      </button>
                      <button
                        className="delete-btn"
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
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRecord ? '编辑记录' : '添加记录'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>游戏日期 *</label>
                <input
                  type="date"
                  value={formData.game_date}
                  onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>盈亏金额 * (正数为赢，负数为输)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="输入金额，如 +100 或 -50"
                  value={formData.win_amount}
                  onChange={(e) => setFormData({ ...formData, win_amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>台费</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="输入台费，如 20"
                  value={formData.table_fee}
                  onChange={(e) => setFormData({ ...formData, table_fee: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>打车费</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="输入打车费，如 30"
                  value={formData.taxi_fee}
                  onChange={(e) => setFormData({ ...formData, taxi_fee: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>烟钱</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="输入烟钱，如 50"
                  value={formData.cigarette_fee}
                  onChange={(e) => setFormData({ ...formData, cigarette_fee: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  取消
                </button>
                <button type="submit" className="submit-btn">
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

export default Mahjong;

