import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { authApi } from '../../api/authApi';
import { toast } from 'react-toastify';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login(formData);
      
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
      login(response.data);
      
      // Show success toast
      toast.success('Đăng nhập thành công!', {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      // Show error toast
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.', {
        position: "top-right",
        autoClose: 3000,
      });
      
      setErrors({
        submit: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-text">LearnMap</span>
          </div>
          <h1 className="auth-title">Chào mừng trở lại!</h1>
          <p className="auth-subtitle">Đăng nhập để tiếp tục hành trình học tập của bạn</p>
          
          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Truy cập hơn 1000+ khóa học</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Học mọi lúc, mọi nơi</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Chứng chỉ hoàn thành</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper">
            <button onClick={() => navigate('/')} className="btn-back-auth">
              ← Quay lại
            </button>
            
            <h2 className="form-title">Đăng nhập</h2>
            
            {/* {errors.submit && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                {errors.submit}
              </div>
            )} */}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  {/* <span className="input-icon">📧</span> */}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={errors.email ? 'input-error' : ''}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="input-wrapper">
                  {/* <span className="input-icon">🔒</span> */}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={errors.password ? 'input-error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="forgot-password">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            {/* <div className="auth-divider">
              <span>Hoặc đăng nhập với</span>
            </div>

            <div className="social-login">
              <button className="btn-social google">
                <span className="social-icon">G</span>
                Google
              </button>
              <button className="btn-social facebook">
                <span className="social-icon">f</span>
                Facebook
              </button>
            </div> */}

            <div className="auth-switch">
              Chưa có tài khoản?{' '}
              <button onClick={() => navigate('/register')} className="link-button">
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
