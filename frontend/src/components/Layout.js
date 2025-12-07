import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: '仪表板' },
    { path: '/records', icon: '📝', label: '记账记录' },
    { path: '/categories', icon: '📁', label: '分类管理' },
    { path: '/statistics', icon: '📈', label: '统计分析' },
    { path: '/mahjong', icon: '🀄', label: '麻将记录' },
    { path: '/mahjong-statistics', icon: '🎲', label: '麻将统计' },
    { path: '/gifts', icon: '🎁', label: '礼金记录' },
    { path: '/shopping', icon: '📦', label: '采购清单' }
  ];

  return (
    <div className="layout">
      {/* 移动端遮罩层 */}
      <div 
        className={`sidebar-overlay ${mobileSidebarOpen ? 'show' : ''}`}
        onClick={closeMobileSidebar}
      ></div>
      
      {/* 侧边栏 */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>记账系统</h2>
          <button 
            className="sidebar-toggle" 
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              if (window.innerWidth <= 768) {
                closeMobileSidebar();
              }
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      
      {/* 主内容区 */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="mobile-menu-toggle" onClick={toggleMobileSidebar}>
              ☰
            </button>
            <h1>记账管理系统</h1>
          </div>
          <div className="header-right">
            <span className="user-info">欢迎, {user?.username}</span>
            <button className="logout-button" onClick={handleLogout}>
              退出
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;

