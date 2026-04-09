import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { analyticsApi } from '../../api/analyticsApi';
import './Dashboard.css';

function Dashboard() {
  const REALTIME_REFRESH_MS = 15000;

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [trafficStats, setTrafficStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    sessions: 0,
    screenPageViews: 0,
  });
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const userRole = user?.userLogin?.role || user?.role;
  const isAdmin = userRole === 'ADMIN';
  const isAdminOrStaff = userRole === 'ADMIN' || userRole === 'STAFF';

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const extractOnlineUsers = (data) => {
    if (typeof data === 'number') {
      return toNumber(data);
    }

    if (!data || typeof data !== 'object') {
      return 0;
    }

    const possibleKeys = [
      'onlineUsers',
      'activeUsers',
      'currentUsers',
      'usersOnline',
      'concurrentUsers',
      'totalUsers',
    ];

    for (const key of possibleKeys) {
      if (data[key] !== undefined) {
        return toNumber(data[key]);
      }
    }

    const firstNumericValue = Object.values(data).find((value) => Number.isFinite(Number(value)));
    return firstNumericValue !== undefined ? toNumber(firstNumericValue) : 0;
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoadingAnalytics(false);
      return;
    }

    let isMounted = true;

    const fetchTraffic = async () => {
      try {
        const trafficResponse = await analyticsApi.getTraffic();

        if (!isMounted) {
          return;
        }

        if (trafficResponse?.statusCode === 200 && trafficResponse.data) {
          setTrafficStats({
            totalUsers: toNumber(trafficResponse.data.totalUsers),
            newUsers: toNumber(trafficResponse.data.newUsers),
            sessions: toNumber(trafficResponse.data.sessions),
            screenPageViews: toNumber(trafficResponse.data.screenPageViews),
          });
        }
      } finally {
        if (isMounted) {
          setLoadingAnalytics(false);
        }
      }
    };

    const fetchOnlineUsers = async () => {
      const realtimeResponse = await analyticsApi.getOnlineUsers();

      if (!isMounted) {
        return;
      }

      if (realtimeResponse?.statusCode === 200) {
        setOnlineUsers(extractOnlineUsers(realtimeResponse.data));
      }
    };

    fetchTraffic();
    fetchOnlineUsers();

    const realtimeInterval = window.setInterval(() => {
      fetchOnlineUsers();
    }, REALTIME_REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(realtimeInterval);
    };
  }, [isAdmin]);

  const formatStatValue = (value) => {
    if (loadingAnalytics) {
      return '...';
    }

    return toNumber(value).toLocaleString('vi-VN');
  };

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
            {isAdmin ? '👑 Quản trị viên' : '👨‍💼 Nhân viên'}
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

          {isAdmin && (
            <div className="dashboard-card" onClick={() => navigate('/dashboard/accounts')}>
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h3>Quản lý Người dùng</h3>
                <p>Quản lý tài khoản và phân quyền</p>
              </div>
              <div className="card-arrow">→</div>
            </div>
          )}

          {isAdmin && (
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
                  <div className="stat-value">{formatStatValue(trafficStats.totalUsers)}</div>
                  <div className="stat-label">Tổng người dùng</div>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon">📖</div>
                <div className="stat-details">
                  <div className="stat-value">{formatStatValue(trafficStats.newUsers)}</div>
                  <div className="stat-label">Người dùng mới</div>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon">👥</div>
                <div className="stat-details">
                  <div className="stat-value">{formatStatValue(trafficStats.sessions)}</div>
                  <div className="stat-label">Phiên truy cập</div>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon">⭐</div>
                <div className="stat-details">
                  <div className="stat-value">{formatStatValue(trafficStats.screenPageViews)}</div>
                  <div className="stat-label">Lượt xem trang</div>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon">🟢</div>
                <div className="stat-details">
                  <div className="stat-value">{formatStatValue(onlineUsers)}</div>
                  <div className="stat-label">Đang online (cập nhật 15s)</div>
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

          {isAdminOrStaff && (
            <button 
              className={`nav-item ${location.pathname === '/dashboard/accounts' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard/accounts')}
            >
              <span className="nav-icon">👥</span>
              <span>Người dùng</span>
            </button>
          )}

          {isAdmin && (
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
                  {isAdmin ? 'Quản trị viên' : 'Nhân viên'}
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
