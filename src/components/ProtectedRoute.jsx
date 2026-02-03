import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  const location = useLocation();
  const [shouldShowModal, setShouldShowModal] = useState(false);

  useEffect(() => {
    if (!token || !savedUser) {
      // Lưu intended route và dispatch event hiển thị login modal
      localStorage.setItem('intendedRoute', location.pathname);
      window.dispatchEvent(new CustomEvent('show-login-modal'));
      setShouldShowModal(true);
    }
  }, [token, savedUser, location.pathname]);

  if (!token || !savedUser) {
    // Giữ nguyên ở trang hiện tại, popup sẽ hiển thị
    return null;
  }

  // Nếu có yêu cầu về role
  if (allowedRoles.length > 0) {
    try {
      const userData = JSON.parse(savedUser);
      const userRole = userData?.role;

      if (!allowedRoles.includes(userRole)) {
        // Nếu role không phù hợp, chuyển về trang chủ
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.setItem('intendedRoute', location.pathname);
      window.dispatchEvent(new CustomEvent('show-login-modal'));
      return null;
    }
  }

  return children;
};

export default ProtectedRoute;
