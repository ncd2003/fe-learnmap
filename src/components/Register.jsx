import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { toast } from 'react-toastify';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    } else if (formData.email.length < 6 || formData.email.length > 50) {
      newErrors.email = 'Email phải từ 6-50 ký tự';
    }

    // Phone validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Số điện thoại không được để trống';
    } else if (!/^0\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (formData.fullName.length > 80) {
      newErrors.fullName = 'Họ và tên không được quá 80 ký tự';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      const response = await authApi.register(formData);
      
      // Show success toast
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.', {
        position: "top-right",
        autoClose: 2000,
      });
      
      // Navigate to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      // Show error toast
      toast.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 3000,
      });
      
      setErrors({
        submit: error.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-left">
          <div className="auth-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-text">LearnMap</span>
          </div>
          <h1 className="auth-title">Bắt đầu hành trình học tập!</h1>
          <p className="auth-subtitle">Đăng ký để truy cập hàng nghìn khóa học chất lượng cao</p>
          
          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Miễn phí đăng ký</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Học từ các chuyên gia</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Chứng chỉ được công nhận</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper">
            <button onClick={() => navigate('/')} className="btn-back-auth">
              ← Quay lại
            </button>
            
            <h2 className="form-title">Đăng ký tài khoản</h2>
            
            {/* {errors.submit && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                {errors.submit}
              </div>
            )} */}

            <form onSubmit={handleSubmit} className="auth-form register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên *</label>
                  <div className="input-wrapper">
                    {/* <span className="input-icon">👤</span> */}
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className={errors.fullName ? 'input-error' : ''}
                    />
                  </div>
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Số điện thoại *</label>
                  <div className="input-wrapper">
                    {/* <span className="input-icon">📱</span> */}
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="0912345678"
                      className={errors.phoneNumber ? 'input-error' : ''}
                    />
                  </div>
                  {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
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
                <label htmlFor="password">Mật khẩu *</label>
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                <div className="input-wrapper">
                  {/* <span className="input-icon">🔒</span> */}
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'input-error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <label className="checkbox-label terms">
                <input type="checkbox" required />
                <span>Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a></span>
              </label>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>

            <div className="auth-switch">
              Đã có tài khoản?{' '}
              <button onClick={() => navigate('/login')} className="link-button">
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
