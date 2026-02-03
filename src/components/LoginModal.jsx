import { useState } from 'react';
import { useAuth } from './AuthProvider';
import './LoginModal.css';

function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { authApi } = await import('../../api/authApi');
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Clear old data first
      localStorage.clear();
      
      // Save token and user info to localStorage
      if (response.data?.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      if (response.data?.userLogin) {
        localStorage.setItem('user', JSON.stringify(response.data.userLogin));
      }
      
      // Use AuthProvider login
      await login(response.data);
      
      // Login successful - close modal (AuthProvider will handle navigation)
      onClose();
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>×</button>
        
        <div className="login-modal-header">
          <h2>Đăng nhập</h2>
          <p>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-modal-form">
          {error && <div className="login-modal-error">{error}</div>}

          <div className="login-modal-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
              placeholder="Nhập email của bạn"
            />
          </div>

          <div className="login-modal-field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button type="submit" className="login-modal-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
