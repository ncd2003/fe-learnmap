import UnAuthorBaseApi from './UnAuthorBaseApi';

export const authApi = {
  // Đăng nhập
  login: async (loginData) => {
    const response = await UnAuthorBaseApi.post('/auth/login', loginData);
    return response.data;
  },

  // Đăng ký
  register: async (registerData) => {
    const response = await UnAuthorBaseApi.post('/auth/register', registerData);
    return response.data;
  },
};
