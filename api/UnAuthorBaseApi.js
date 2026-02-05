import axios from 'axios';
import { toast } from 'react-toastify';

// Sử dụng relative path trong development để tránh CORS, full URL trong production
const API_BASE_URL = 'https://be-learnmap.onrender.com/api/v1';
// const API_BASE_URL = 'http://localhost:8080/api/v1';


// UnAuthorBaseApi - Cho các API public không cần authentication
const UnAuthorBaseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - Tự động xử lý lỗi và hiển thị toast
UnAuthorBaseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server trả về response với status code lỗi
      const { data } = error.response;
      const errorMessage = data?.message || data?.error || 'Có lỗi xảy ra';
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
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

export default UnAuthorBaseApi;
