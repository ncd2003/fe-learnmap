import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// AuthorBaseApi - Cho các API cần authentication
const AuthorBaseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Tự động thêm token vào header
AuthorBaseApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Tự động xử lý lỗi và hiển thị toast
AuthorBaseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || data?.error || 'Có lỗi xảy ra';

      if (status === 401) {
        // Unauthorized - Token hết hạn hoặc không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentPage');
        
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Dispatch event để hiển thị login modal
        window.dispatchEvent(new CustomEvent('show-login-modal'));
      } else if (status === 403) {
        // Forbidden - Không có quyền truy cập
        toast.error('Bạn không có quyền thực hiện thao tác này.', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Các lỗi khác
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.', {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      // Lỗi khác trong quá trình setup request
      toast.error(error.message || 'Có lỗi xảy ra', {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    return Promise.reject(error);
  }
);

export default AuthorBaseApi;
