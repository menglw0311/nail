import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Categories from './pages/Categories';
import Statistics from './pages/Statistics';
import Mahjong from './pages/Mahjong';
import MahjongStatistics from './pages/MahjongStatistics';
import GiftRecords from './pages/GiftRecords';
import Shopping from './pages/Shopping';
import Layout from './components/Layout';
import './pages/MobileOptimized.css';

// 受保护的路由组件
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>加载中...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

// 公开路由组件（已登录用户重定向到仪表板）
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>加载中...</div>;
  }

  return user ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="records" element={<Records />} />
            <Route path="categories" element={<Categories />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="mahjong" element={<Mahjong />} />
            <Route path="mahjong-statistics" element={<MahjongStatistics />} />
            <Route path="gifts" element={<GiftRecords />} />
            <Route path="shopping" element={<Shopping />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

