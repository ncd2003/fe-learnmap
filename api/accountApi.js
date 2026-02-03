import AuthorBaseApi from './AuthorBaseApi';

export const accountApi = {
  // Lấy tất cả accounts
  getAllAccounts: async () => {
    const response = await AuthorBaseApi.get('/account');
    return response.data;
  },

  // Tạo account mới
  createAccount: async (accountData) => {
    const response = await AuthorBaseApi.post('/account', accountData);
    return response.data;
  },

  // Cập nhật account
  updateAccount: async (id, accountData) => {
    const response = await AuthorBaseApi.put(`/account/${id}`, accountData);
    return response.data;
  },

  // Xóa account
  deleteAccount: async (id) => {
    const response = await AuthorBaseApi.delete(`/account/${id}`);
    return response.data;
  },
};
