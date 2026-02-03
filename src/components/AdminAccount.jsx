import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi } from '../../api/accountApi';
import { toast } from 'react-toastify';
import './AdminAccount.css';

function AdminAccount() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'STUDENT',
    fullName: '',
    phoneNumber: '',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountApi.getAllAccounts();
      if (response.statusCode === 200 && response.data) {
        setAccounts(Array.isArray(response.data) ? response.data : []);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      setAccounts([]);
      toast.error('Không thể tải danh sách tài khoản', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      email: '',
      role: 'STUDENT',
      fullName: '',
      phoneNumber: '',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      email: '',
      role: 'STUDENT',
      fullName: '',
      phoneNumber: '',
      status: 'ACTIVE',
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email?.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.fullName?.trim()) {
      errors.fullName = 'Họ tên không được để trống';
    }
    
    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 số)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await accountApi.createAccount(formData);
      toast.success('Tạo tài khoản thành công!');
      handleCloseModal();
      fetchAccounts();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    // Handle role as object or string
    const roleName = typeof role === 'object' ? role.name : role;
    
    const badges = {
      'ADMIN': { text: '👑 Admin', className: 'role-admin' },
      'STAFF': { text: '👨‍💼 Staff', className: 'role-staff' },
      'STUDENT': { text: '🎓 Student', className: 'role-student' },
    };
    return badges[roleName] || { text: roleName, className: 'role-default' };
  };

  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': { text: '✅ Hoạt động', className: 'status-active' },
      'INACTIVE': { text: '❌ Không hoạt động', className: 'status-inactive' },
    };
    return badges[status] || { text: status, className: 'status-default' };
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="admin-account-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-title">Quản lý Tài khoản</h1>
            <p className="admin-subtitle">Quản lý người dùng trên hệ thống</p>
          </div>
        </div>
        <button onClick={handleOpenModal} className="btn-add-account">
          + Thêm tài khoản mới
        </button>
      </div>

      <div className="admin-content">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-value">{accounts.length}</div>
              <div className="stat-label">Tổng tài khoản</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👑</div>
            <div className="stat-info">
              <div className="stat-value">
                {accounts.filter(acc => acc.role?.name === 'ADMIN').length}
              </div>
              <div className="stat-label">Admin</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍💼</div>
            <div className="stat-info">
              <div className="stat-value">
                {accounts.filter(acc => acc.role?.name === 'STAFF').length}
              </div>
              <div className="stat-label">Staff</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <div className="stat-value">
                {accounts.filter(acc => acc.role?.name === 'STUDENT').length}
              </div>
              <div className="stat-label">Student</div>
            </div>
          </div>
        </div>

        <div className="accounts-table-container">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Chưa có tài khoản nào. Hãy thêm tài khoản mới!
                  </td>
                </tr>
              ) : (
                accounts.map(account => {
                  const roleBadge = getRoleBadge(account.role);
                  const statusBadge = getStatusBadge(account.status);
                  return (
                    <tr key={account.id}>
                      <td>{account.id}</td>
                      <td className="account-fullname">{account.fullName || '—'}</td>
                      <td className="account-email">{account.email || '—'}</td>
                      <td>{account.phoneNumber || '—'}</td>
                      <td>
                        <span className={`role-badge ${roleBadge.className}`}>
                          {roleBadge.text}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.className}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm tài khoản mới</h2>
              <button onClick={handleCloseModal} className="btn-close">×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="info-box">
                <span className="info-icon">ℹ️</span>
                <div className="info-text">
                  <strong>Mật khẩu mặc định:</strong> Tài khoản mới sẽ được tạo với mật khẩu mặc định là <strong>123456</strong>
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email..."
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && (
                  <span className="error-message">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên..."
                  className={formErrors.fullName ? 'error' : ''}
                />
                {formErrors.fullName && (
                  <span className="error-message">{formErrors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại (không bắt buộc)..."
                  className={formErrors.phoneNumber ? 'error' : ''}
                />
                {formErrors.phoneNumber && (
                  <span className="error-message">{formErrors.phoneNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label>Vai trò *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">🎓 Student</option>
                  <option value="STAFF">👨‍💼 Staff</option>
                  <option value="ADMIN">👑 Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="btn-cancel"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAccount;
