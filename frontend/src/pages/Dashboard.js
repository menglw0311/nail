import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, recordsRes] = await Promise.all([
        api.get('/records/statistics'),
        api.get('/records?limit=5')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (recordsRes.data.success) {
        setRecentRecords(recordsRes.data.data);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="dashboard">
      <h2 className="page-title">仪表板</h2>
      
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">总收入</div>
            <div className="stat-value">¥{stats?.income?.toFixed(2) || '0.00'}</div>
            <div className="stat-count">{stats?.incomeCount || 0} 笔</div>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">总支出</div>
            <div className="stat-value">¥{stats?.expense?.toFixed(2) || '0.00'}</div>
            <div className="stat-count">{stats?.expenseCount || 0} 笔</div>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <div className="stat-label">余额</div>
            <div className="stat-value">¥{stats?.balance?.toFixed(2) || '0.00'}</div>
            <div className="stat-count">净收入</div>
          </div>
        </div>
      </div>

      <div className="recent-records">
        <h3>最近记录</h3>
        {recentRecords.length === 0 ? (
          <div className="empty-state">暂无记录</div>
        ) : (
          <div className="records-list">
            {recentRecords.map(record => (
              <div key={record.id} className="record-item">
                <div className="record-type">{record.type === 'income' ? '收入' : '支出'}</div>
                <div className="record-info">
                  <div className="record-category">{record.category_name}</div>
                  <div className="record-description">{record.description || '无描述'}</div>
                </div>
                <div className={`record-amount ${record.type}`}>
                  {record.type === 'income' ? '+' : '-'}¥{parseFloat(record.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

