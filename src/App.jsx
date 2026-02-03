import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import AdminCategory from './components/AdminCategory';
import AdminCourse from './components/AdminCourse';
import AdminAccount from './components/AdminAccount';
import AdminPlan from './components/AdminPlan';
import AdminCareerQuestion from './components/AdminCareerQuestion';
import CourseBuilder from './components/CourseBuilder';
import Dashboard from './components/Dashboard';
import Forum from './components/Forum';
import UserPlans from './components/UserPlans';
import CareerTest from './components/CareerTest';
import LoginModal from './components/LoginModal';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthProvider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleShowLoginModal = () => {
      setShowLoginModal(true);
    };

    const handleApiError = (event) => {
      const errorMessage = event.detail?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    };

    window.addEventListener('show-login-modal', handleShowLoginModal);
    window.addEventListener('api-error', handleApiError);

    return () => {
      window.removeEventListener('show-login-modal', handleShowLoginModal);
      window.removeEventListener('api-error', handleApiError);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/plans" element={<UserPlans />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/career-test" element={<CareerTest />} />
            
            {/* Protected routes - require authentication */}
            
            {/* Admin/Staff only routes - Nested routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              {/* Nested admin routes */}
              <Route path="categories" element={<AdminCategory />} />
              <Route path="courses" element={<AdminCourse />} />
              <Route path="course-builder" element={<CourseBuilder />} />
              <Route path="career-questions" element={<AdminCareerQuestion />} />
              <Route 
                path="accounts" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAccount />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="plans" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPlan />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
