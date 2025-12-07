import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Statistics.css';

function Statistics() {
  // 获取当前月份（YYYY-MM格式）
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // 根据月份计算开始和结束日期
  const getMonthRange = (monthStr) => {
    if (!monthStr) return { startDate: '', endDate: '' };
    const [year, month] = monthStr.split('-');
    const startDate = `${year}-${month}-01`;
    // 获取该月最后一天
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  };

  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [dailyStats, setDailyStats] = useState({}); // 每日统计数据，key为日期
  const [chartType, setChartType] = useState('expense'); // 'income' 或 'expense'
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchCategoryStatistics();
  }, [selectedMonth, chartType]);

  useEffect(() => {
    fetchDailyStatistics();
  }, [selectedMonth]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getMonthRange(selectedMonth);
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      console.log('获取统计参数:', params);
      const response = await api.get('/records/statistics', { params });
      console.log('统计响应:', response.data);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
      console.error('错误详情:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryStatistics = async () => {
    try {
      const { startDate, endDate } = getMonthRange(selectedMonth);
      const params = { type: chartType };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/records/statistics/categories', { params });
      if (response.data.success) {
        setCategoryStats(response.data.data);
      }
    } catch (error) {
      console.error('获取分类统计失败:', error);
    }
  };

  const fetchDailyStatistics = async () => {
    try {
      const { startDate, endDate } = getMonthRange(selectedMonth);
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      console.log('获取每日统计参数:', params);
      const response = await api.get('/records/statistics/daily', { params });
      console.log('每日统计响应:', response.data);
      if (response.data.success) {
        // 转换为以日期为key的对象
        const dailyData = {};
        response.data.data.forEach(item => {
          dailyData[item.date] = {
            income: parseFloat(item.income) || 0,
            expense: parseFloat(item.expense) || 0,
            incomeCount: item.incomeCount || 0,
            expenseCount: item.expenseCount || 0
          };
        });
        console.log('处理后的每日数据:', dailyData);
        setDailyStats(dailyData);
      }
    } catch (error) {
      console.error('获取每日统计失败:', error);
      console.error('错误详情:', error.response?.data);
    }
  };

  const resetFilters = () => {
    setSelectedMonth(getCurrentMonth());
  };

  // 格式化月份显示（YYYY年MM月）
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  // 获取颜色
  const getColor = (index) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0',
      '#a8edea', '#fed6e3', '#ffecd2', '#fcb69f'
    ];
    return colors[index % colors.length];
  };

  // 计算百分比
  const getPercentage = (value, data) => {
    const total = data.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    if (total === 0) return 0;
    return ((parseFloat(value) / total) * 100).toFixed(1);
  };

  // 饼状图组件
  const PieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    if (total === 0) return <div className="empty-state">暂无数据</div>;

    let currentAngle = -90; // 从顶部开始
    const radius = 120;
    const centerX = 150;
    const centerY = 150;

    const paths = data.map((item, index) => {
      const value = parseFloat(item.total || 0);
      const percentage = (value / total) * 100;
      const angle = (percentage / 100) * 360;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      currentAngle = endAngle;

      return (
        <path
          key={item.id || index}
          d={pathData}
          fill={getColor(index)}
          stroke="#fff"
          strokeWidth="2"
        />
      );
    });

    return (
      <svg width="300" height="300" viewBox="0 0 300 300" className="pie-chart">
        {paths}
      </svg>
    );
  };

  // 切换月份
  const changeMonth = (direction) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month;
    
    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else if (direction === 'next') {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
    
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // 日历组件
  const Calendar = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = 周日, 1 = 周一, ...

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const days = [];

    // 添加空白单元格（月初的空格）
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // 添加日期单元格
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = dailyStats[dateStr];
      const income = dayData ? (parseFloat(dayData.income) || 0) : 0;
      const expense = dayData ? (parseFloat(dayData.expense) || 0) : 0;
      days.push({ day, date: dateStr, income, expense });
      
      // 调试：打印有数据的日期
      if (income > 0 || expense > 0) {
        console.log(`日期 ${dateStr}: 收入=${income}, 支出=${expense}`);
      }
    }
    
    console.log('日历数据对象:', dailyStats);
    console.log('有数据的日期数量:', Object.keys(dailyStats).length);

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button 
            className="calendar-nav-btn" 
            onClick={() => changeMonth('prev')}
            title="上一月"
          >
            ‹
          </button>
          <div className="calendar-month">{formatMonth(selectedMonth)}</div>
          <button 
            className="calendar-nav-btn" 
            onClick={() => changeMonth('next')}
            title="下一月"
          >
            ›
          </button>
        </div>
        <div className="calendar-grid">
          {/* 星期标题 */}
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
          {/* 日期单元格 */}
          {days.map((dayData, index) => {
            if (dayData === null) {
              return <div key={`empty-${index}`} className="calendar-day empty"></div>;
            }
            const { day, date, income, expense } = dayData;
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={date}
                className={`calendar-day ${isToday ? 'today' : ''} ${income > 0 || expense > 0 ? 'has-data' : ''}`}
              >
                <div className="calendar-day-number">{day}</div>
                <div className="calendar-amounts">
                  {income > 0 && (
                    <div className="calendar-income" title={`收入: ¥${income.toFixed(2)}`}>
                      +¥{income.toFixed(2)}
                    </div>
                  )}
                  {expense > 0 && (
                    <div className="calendar-expense" title={`支出: ¥${expense.toFixed(2)}`}>
                      -¥{expense.toFixed(2)}
                    </div>
                  )}
                  {income === 0 && expense === 0 && (
                    <div className="calendar-no-data">-</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="statistics-page">
      <h2 className="page-title">统计分析</h2>

      <div className="filters-section">
        <div className="filter-group">
          <label>选择月份</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>当前统计</label>
          <div className="current-month-display">{formatMonth(selectedMonth)}</div>
        </div>
        <button className="reset-button" onClick={resetFilters}>重置为当前月</button>
      </div>

      <div className="stats-cards">
        <div className="stat-card income">
          <div className="stat-header">
            <div className="stat-icon">💰</div>
            <div className="stat-title">{formatMonth(selectedMonth)}总收入</div>
          </div>
          <div className="stat-value">¥{stats?.income?.toFixed(2) || '0.00'}</div>
          <div className="stat-detail">{stats?.incomeCount || 0} 笔交易</div>
        </div>

        <div className="stat-card expense">
          <div className="stat-header">
            <div className="stat-icon">💸</div>
            <div className="stat-title">{formatMonth(selectedMonth)}总支出</div>
          </div>
          <div className="stat-value">¥{stats?.expense?.toFixed(2) || '0.00'}</div>
          <div className="stat-detail">{stats?.expenseCount || 0} 笔交易</div>
        </div>

        <div className="stat-card balance">
          <div className="stat-header">
            <div className="stat-icon">💵</div>
            <div className="stat-title">{formatMonth(selectedMonth)}净余额</div>
          </div>
          <div className="stat-value">¥{stats?.balance?.toFixed(2) || '0.00'}</div>
          <div className="stat-detail">
            {stats?.balance >= 0 ? '盈利' : '亏损'}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-section">
          <div className="chart-card">
            <h3>每日收支日历</h3>
            <Calendar />
          </div>
        </div>
        <div className="chart-section">
          <div className="chart-card">
            <h3>{formatMonth(selectedMonth)}收支对比</h3>
            <div className="bar-chart">
              {stats ? (
                <>
                  <div className="bar-item">
                    <div className="bar-label">收入</div>
                    <div className="bar-container">
                      <div
                        className="bar income-bar"
                        style={{
                          width: (() => {
                            const total = (stats.income || 0) + (stats.expense || 0);
                            if (total === 0) return '0%';
                            const percentage = ((stats.income || 0) / total) * 100;
                            return `${Math.min(percentage, 100)}%`;
                          })()
                        }}
                      >
                        ¥{(stats.income || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="bar-item">
                    <div className="bar-label">支出</div>
                    <div className="bar-container">
                      <div
                        className="bar expense-bar"
                        style={{
                          width: (() => {
                            const total = (stats.income || 0) + (stats.expense || 0);
                            if (total === 0) return '0%';
                            const percentage = ((stats.expense || 0) / total) * 100;
                            return `${Math.min(percentage, 100)}%`;
                          })()
                        }}
                      >
                        ¥{(stats.expense || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">暂无数据</div>
              )}
            </div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>{formatMonth(selectedMonth)}{chartType === 'expense' ? '支出' : '收入'}类型占比</h3>
              <div className="chart-type-toggle">
                <button
                  className={chartType === 'expense' ? 'active' : ''}
                  onClick={() => setChartType('expense')}
                >
                  支出
                </button>
                <button
                  className={chartType === 'income' ? 'active' : ''}
                  onClick={() => setChartType('income')}
                >
                  收入
                </button>
              </div>
            </div>
            {categoryStats.length === 0 ? (
              <div className="empty-state">暂无数据</div>
            ) : (
              <div className="pie-chart-container">
                <PieChart data={categoryStats} />
                <div className="pie-legend">
                  {categoryStats.map((item, index) => (
                    <div key={item.id || index} className="legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: getColor(index) }}
                      ></div>
                      <div className="legend-info">
                        <div className="legend-name">{item.name}</div>
                        <div className="legend-amount">¥{parseFloat(item.total).toFixed(2)}</div>
                        <div className="legend-percent">
                          {getPercentage(item.total, categoryStats)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;

