import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restore user session on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({ userLogin: userData, access_token: token });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentPage');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData) => {
    // Clear old data first
    localStorage.clear();
    
    setUser(userData);

    // Save to localStorage
    if (userData?.access_token) {
      localStorage.setItem('token', userData.access_token);
    }
    if (userData?.userLogin) {
      localStorage.setItem('user', JSON.stringify(userData.userLogin));
    }

    // Dispatch login success event
    window.dispatchEvent(new CustomEvent('login-success'));

    // Check for intended route
    const intendedRoute = localStorage.getItem('intendedRoute');
    
    if (intendedRoute) {
      localStorage.removeItem('intendedRoute');
      navigate(intendedRoute);
    } else {
      // Check user role and redirect accordingly
      const userRole = userData?.userLogin?.role;
      if (userRole === 'ADMIN' || userRole === 'STAFF') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  const logout = () => {
    setUser(null);
    // Clear all localStorage data
    localStorage.clear();
    navigate('/');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
