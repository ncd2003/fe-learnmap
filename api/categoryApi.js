import AuthorBaseApi from './AuthorBaseApi';
import UnAuthorBaseApi from './UnAuthorBaseApi';

export const categoryApi = {
  // Lấy tất cả categories (public)
  getAllCategoriesPublic: async () => {
    const response = await UnAuthorBaseApi.get('/category/public');
    return response.data;
  },

  // Tạo category mới (requires auth)
  createCategory: async (categoryData) => {
    const response = await AuthorBaseApi.post('/category', categoryData);
    return response.data;
  },

  // Cập nhật category (requires auth)
  updateCategory: async (id, categoryData) => {
    const response = await AuthorBaseApi.put(`/category/${id}`, categoryData);
    return response.data;
  },

  // Xóa category (requires auth)
  deleteCategory: async (id) => {
    const response = await AuthorBaseApi.delete(`/category/${id}`);
    return response.data;
  },
};
