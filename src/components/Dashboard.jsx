import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const renderContent = () => {
    // Nếu đang ở nested route, render Outlet (child routes)
    if (location.pathname !== '/dashboard') {
      return <Outlet />;
    }
    
    // Nếu ở route /dashboard chính, render overview
    return (
      <div className="dashboard-overview">
        <div className="welcome-section">
          <h1>Chào mừng, {user?.userLogin?.fullName || user?.fullName}!</h1>
          <p className="role-badge">
            {user?.userLogin?.role === 'ADMIN' ? '👑 Quản trị viên' : '👨‍💼 Nhân viên'}
          </p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => navigate('/dashboard/categories')}>
            <div className="card-icon">📚</div>
            <div className="card-content">
              <h3>Quản lý Danh mục</h3>
              <p>Thêm, sửa, xóa các danh mục khóa học</p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/dashboard/courses')}>
            <div className="card-icon">📖</div>
            <div className="card-content">
              <h3>Quản lý Khóa học</h3>
              <p>Quản lý tất cả khóa học trên hệ thống</p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/dashboard/course-builder')}>
            <div className="card-icon">🏗️</div>
            <div className="card-content">
              <h3>Course Builder</h3>
              <p>Xây dựng cấu trúc khóa học chi tiết</p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {user?.userLogin?.role === 'ADMIN' && (
            <div className="dashboard-card" onClick={() => navigate('/dashboard/accounts')}>
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>Quản lý Người dùng</h3>
                <p>Quản lý tài khoản và phân quyền</p>
              </div>
              <div className="card-arrow">→</div>
            </div>
          )}

          {user?.userLogin?.role === 'ADMIN' && (
            <div className="dashboard-card" onClick={() => navigate('/dashboard/plans')}>
              <div className="card-icon">💎</div>
              <div className="card-content">
                <h3>Quản lý Plan</h3>
                <p>Quản lý các gói dịch vụ</p>
              </div>
              <div className="card-arrow">→</div>
            </div>
          )}

          <div className="dashboard-card" onClick={() => navigate('/dashboard/career-questions')}>
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h3>Câu hỏi Hướng nghiệp</h3>
              <p>Quản lý câu hỏi cho bài test hướng nghiệp</p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Thống kê</h3>
              <p>Xem báo cáo và phân tích dữ liệu</p>
            </div>
            <div className="card-arrow">→</div>
          </div> */}
        </div>

            <div className="quick-stats">
              <div className="stat-box">
                <div className="stat-icon">📚</div>
                <div className="stat-details">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Danh mục</div>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon">📖</div>
                <div className="stat-details">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Khóa học</div>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon">👥</div>
                <div className="stat-details">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Học viên</div>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon">⭐</div>
                <div className="stat-details">
                  <div className="stat-value">4.9</div>
                  <div className="stat-label">Đánh giá TB</div>
                </div>
              </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">LearnMap</span>
          </div>
          <div className="sidebar-subtitle">Dashboard</div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <span className="nav-icon">🏠</span>
            <span>Tổng quan</span>
          </button>

          <button 
            className={`nav-item ${location.pathname === '/dashboard/categories' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/categories')}
          >
            <span className="nav-icon">📚</span>
            <span>Danh mục</span>
          </button>

          <button 
            className={`nav-item ${location.pathname === '/dashboard/courses' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/courses')}
          >
            <span className="nav-icon">📖</span>
            <span>Khóa học</span>
          </button>

          {/* <button
            className={`nav-item ${location.pathname === '/dashboard/course-builder' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/course-builder')}
          >
            <span className="nav-icon">🏗️</span>
            <span>Course Builder</span>
          </button> */}

          {user?.userLogin?.role === 'ADMIN' || user?.userLogin?.role === 'STAFF' && (
            <button 
              className={`nav-item ${location.pathname === '/dashboard/accounts' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard/accounts')}
            >
              <span className="nav-icon">👥</span>
              <span>Người dùng</span>
            </button>
          )}

          {user?.userLogin?.role === 'ADMIN' && (
            <button 
              className={`nav-item ${location.pathname === '/dashboard/plans' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard/plans')}
            >
              <span className="nav-icon">💎</span>
              <span>Plan</span>
            </button>
          )}

          {/* <button className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Thống kê</span>
          </button> */}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => navigate('/')}>
            <span className="nav-icon">🏠</span>
            <span>Về trang chủ</span>
          </button>
          <button className="nav-item logout" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-left">
            <h2>Tổng quan Dashboard</h2>
          </div>
          <div className="topbar-right">
            <div className="user-info">
              <div className="user-avatar">
                {(user?.userLogin?.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.userLogin?.fullName || user?.fullName}</div>
                <div className="user-role">
                  {user?.userLogin?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
