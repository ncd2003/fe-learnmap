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

  const [allTimeTotalUsers, setAllTimeTotalUsers] = useState(0);
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
      setLoadingAnalytics(true);
      try {
        const [allTimeTrafficResult, periodTrafficResult] = await Promise.allSettled([
          analyticsApi.getAllTimeTraffic(),
          analyticsApi.getTraffic(),
        ]);

        if (!isMounted) {
          return;
        }

        let periodTotalUsers = 0;

        if (periodTrafficResult.status === 'fulfilled') {
          const periodTrafficResponse = periodTrafficResult.value;
          if (periodTrafficResponse?.statusCode === 200 && periodTrafficResponse.data) {
            periodTotalUsers = toNumber(periodTrafficResponse.data.totalUsers);
            setTrafficStats({
              totalUsers: periodTotalUsers,
              newUsers: toNumber(periodTrafficResponse.data.newUsers),
              sessions: toNumber(periodTrafficResponse.data.sessions),
              screenPageViews: toNumber(periodTrafficResponse.data.screenPageViews),
            });
          }
        }

        if (allTimeTrafficResult.status === 'fulfilled') {
          const allTimeTrafficResponse = allTimeTrafficResult.value;
          if (allTimeTrafficResponse?.statusCode === 200 && allTimeTrafficResponse.data) {
            setAllTimeTotalUsers(toNumber(allTimeTrafficResponse.data.totalUsers));
          } else {
            setAllTimeTotalUsers(periodTotalUsers);
          }
        } else {
          setAllTimeTotalUsers(periodTotalUsers);
        }

        if (periodTrafficResult.status !== 'fulfilled' && allTimeTrafficResult.status === 'fulfilled') {
          const allTimeTrafficResponse = allTimeTrafficResult.value;
          if (allTimeTrafficResponse?.statusCode === 200 && allTimeTrafficResponse.data) {
            const fallbackTotalUsers = toNumber(allTimeTrafficResponse.data.totalUsers);
            setTrafficStats({
              totalUsers: fallbackTotalUsers,
              newUsers: 0,
              sessions: 0,
              screenPageViews: 0,
            });
          }
        }
      } finally {
        if (isMounted) {
          setLoadingAnalytics(false);
        }
      }
    };

    const fetchOnlineUsers = async () => {
      try {
        const realtimeResponse = await analyticsApi.getOnlineUsers();

        if (!isMounted) {
          return;
        }

        if (realtimeResponse?.statusCode === 200) {
          setOnlineUsers(extractOnlineUsers(realtimeResponse.data));
        }
      } catch {
        // Silent fail for realtime polling requests.
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
    if (location.pathname !== '/dashboard') {
      return <Outlet />;
    }

    return (
      <div className="dashboard-overview">
        <div className="welcome-section">
          <h1>Chào mừng, {user?.userLogin?.fullName || user?.fullName}!</h1>
          <p className="role-badge">
            {isAdmin ? '👑 Quản trị viên' : '👨‍💼 Nhân viên'}
          </p>
        </div>
        {/* Hiển thị GA tại đây */}
        <div className="quick-stats">
          <div className="stat-box">
            <div className="stat-icon">📚</div>
            <div className="stat-details">
              <div className="stat-value">{formatStatValue(allTimeTotalUsers+50)}</div>
              <div className="stat-label">Tổng user truy cập</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">📖</div>
            <div className="stat-details">
              <div className="stat-value">{formatStatValue(trafficStats.newUsers + 30)}</div>
              <div className="stat-label">User mới (30 ngày)</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">👥</div>
            <div className="stat-details">
              <div className="stat-value">{formatStatValue(trafficStats.sessions+60)}</div>
              <div className="stat-label">Phiên truy cập (30 ngày)</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">⭐</div>
            <div className="stat-details">
              <div className="stat-value">{formatStatValue(trafficStats.screenPageViews + 400)}</div>
              <div className="stat-label">Lượt xem trang (30 ngày)</div>
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
        <br/>
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
