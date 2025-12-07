import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './MahjongStatistics.css';

function MahjongStatistics() {
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getMonthRange = (monthStr) => {
    if (!monthStr) return { startDate: '', endDate: '' };
    const [year, month] = monthStr.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  };

  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStatistics();
  }, [selectedYear]);

  const fetchAllStatistics = async () => {
    setLoading(true);
    try {
      // 获取年度统计数据和记录
      const yearParams = {
        start_date: `${selectedYear}-01-01`,
        end_date: `${selectedYear}-12-31`
      };

      const [statsRes, recordsRes] = await Promise.all([
        api.get('/mahjong/statistics', { params: yearParams }),
        api.get('/mahjong', { params: yearParams })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (recordsRes.data.success) setRecords(recordsRes.data.data || []);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const resetFilters = () => {
    setSelectedYear(new Date().getFullYear());
  };

  const getWinRate = () => {
    if (!stats || stats.total_games === 0) return 0;
    return ((stats.win_games / stats.total_games) * 100).toFixed(1);
  };

  const calculateTotalCost = (record) => {
    const winAmount = record.win_amount || 0;
    const tableFee = record.table_fee || 0;
    const taxiFee = record.taxi_fee || 0;
    const cigaretteFee = record.cigarette_fee || 0;
    return winAmount - tableFee - taxiFee - cigaretteFee;
  };

  const handleRecordClick = (record) => {
    setSelectedRecord(record);
  };

  const closeRecordDetail = () => {
    setSelectedRecord(null);
  };

  const getChartData = () => {
    if (records.length === 0) return [];
    // 按日期排序
    return [...records].sort((a, b) => new Date(a.game_date) - new Date(b.game_date));
  };

  const getMaxAbsValue = () => {
    if (records.length === 0) return 100;
    const values = records.map(r => Math.abs(r.win_amount || 0));
    return Math.max(...values, 100);
  };


  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="mahjong-statistics-page">
      <h2 className="page-title">麻将统计分析</h2>

      <div className="filters-section">
        <div className="filter-group">
          <label>选择年份</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2023, 2024, 2025, 2026, 2027].sort((a, b) => b - a).map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>当前统计年份</label>
          <div className="current-month-display">{selectedYear}年</div>
        </div>
        <button className="reset-button" onClick={resetFilters}>重置为当前年</button>
      </div>

      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-header">
            <div className="stat-icon">🎲</div>
            <div className="stat-title">{selectedYear}年总场次</div>
          </div>
          <div className="stat-value">{stats?.total_games || 0} 场</div>
          <div className="stat-detail">
            胜: {stats?.win_games || 0} | 负: {stats?.lose_games || 0}
          </div>
        </div>

        <div className="stat-card win">
          <div className="stat-header">
            <div className="stat-icon">🏆</div>
            <div className="stat-title">年度胜率</div>
          </div>
          <div className="stat-value">{getWinRate()}%</div>
          <div className="stat-detail">
            {stats?.win_games || 0} 胜 / {stats?.total_games || 0} 场
          </div>
        </div>

        <div className="stat-card amount">
          <div className="stat-header">
            <div className="stat-icon">💰</div>
            <div className="stat-title">{selectedYear}年总盈亏</div>
          </div>
          <div className={`stat-value ${(stats?.total_amount || 0) >= 0 ? 'positive' : 'negative'}`}>
            {(stats?.total_amount || 0) >= 0 ? '+' : ''}¥{(stats?.total_amount || 0).toFixed(2)}
          </div>
          <div className="stat-detail">
            均场: ¥{(stats?.avg_amount || 0).toFixed(2)}
          </div>
        </div>

        <div className="stat-card extreme">
          <div className="stat-header">
            <div className="stat-icon">📊</div>
            <div className="stat-title">单局最佳/最差</div>
          </div>
          <div className="stat-value small">
            <span className="positive">+¥{(stats?.max_win || 0).toFixed(2)}</span>
          </div>
          <div className="stat-detail">
            <span className="negative">¥{(stats?.min_lose || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 年度输赢折线图 */}
      <div className="chart-section full-width">
        <div className="chart-card">
          <h3>{selectedYear}年度输赢趋势</h3>
          {records.length === 0 ? (
            <div className="empty-state">暂无数据</div>
          ) : (
            <div className="line-chart-container">
              <svg className="line-chart" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
                {/* 零线 */}
                <line x1="50" y1="200" x2="950" y2="200" stroke="#ddd" strokeWidth="1" strokeDasharray="5,5" />
                
                {/* 绘制折线和节点 */}
                {(() => {
                  const chartData = getChartData();
                  const maxValue = getMaxAbsValue();
                  const points = chartData.map((record, index) => {
                    const x = 50 + (index / Math.max(chartData.length - 1, 1)) * 900;
                    const y = 200 - (record.win_amount / maxValue) * 150;
                    return { x, y, record };
                  });

                  return (
                    <>
                      {/* 折线 */}
                      <polyline
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="#667eea"
                        strokeWidth="2"
                      />
                      
                      {/* 节点 */}
                      {points.map((point, index) => (
                        <g key={index}>
                          {/* 节点圆圈 */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill={point.record.win_amount >= 0 ? '#27ae60' : '#e74c3c'}
                            stroke="white"
                            strokeWidth="2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRecordClick(point.record)}
                          />
                          {/* 悬停效果 */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="10"
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRecordClick(point.record)}
                          />
                        </g>
                      ))}

                      {/* 零线标签 */}
                      <text x="25" y="205" fontSize="12" fill="#999">¥0</text>
                      
                      {/* Y轴标签 */}
                      <text x="10" y="60" fontSize="12" fill="#27ae60">+¥{maxValue.toFixed(0)}</text>
                      <text x="10" y="350" fontSize="12" fill="#e74c3c">-¥{maxValue.toFixed(0)}</text>
                    </>
                  );
                })()}
              </svg>
              
              {/* 图例 */}
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
                  <span>赢</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
                  <span>输</span>
                </div>
                <div className="legend-tip">💡 点击节点查看详情</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 记录详情弹窗 */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={closeRecordDetail}>
          <div className="record-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 麻将记录详情</h3>
              <button className="close-btn" onClick={closeRecordDetail}>×</button>
            </div>
            <div className="detail-content">
              <div className="detail-row">
                <span className="detail-label">日期：</span>
                <span className="detail-value">{selectedRecord.game_date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">输赢金额：</span>
                <span className={`detail-value amount ${selectedRecord.win_amount >= 0 ? 'win' : 'lose'}`}>
                  {selectedRecord.win_amount >= 0 ? '+' : ''}¥{selectedRecord.win_amount.toFixed(2)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">台费：</span>
                <span className="detail-value">¥{(selectedRecord.table_fee || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">打车费：</span>
                <span className="detail-value">¥{(selectedRecord.taxi_fee || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">烟钱：</span>
                <span className="detail-value">¥{(selectedRecord.cigarette_fee || 0).toFixed(2)}</span>
              </div>
              <div className="detail-divider"></div>
              <div className="detail-row total">
                <span className="detail-label">总消费：</span>
                <span className={`detail-value total-cost ${calculateTotalCost(selectedRecord) >= 0 ? 'positive' : 'negative'}`}>
                  {calculateTotalCost(selectedRecord) >= 0 ? '+' : ''}¥{calculateTotalCost(selectedRecord).toFixed(2)}
                </span>
              </div>
              <div className="detail-formula">
                总消费 = 输赢({selectedRecord.win_amount >= 0 ? '+' : ''}{selectedRecord.win_amount.toFixed(2)}) 
                - 台费({(selectedRecord.table_fee || 0).toFixed(2)}) 
                - 打车费({(selectedRecord.taxi_fee || 0).toFixed(2)}) 
                - 烟钱({(selectedRecord.cigarette_fee || 0).toFixed(2)})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MahjongStatistics;

