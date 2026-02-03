import AuthorBaseApi from './AuthorBaseApi';
import UnAuthorBaseApi from './UnAuthorBaseApi';

export const planApi = {
  // Lấy tất cả plans (public)
  getAllPublicPlans: async () => {
    const response = await UnAuthorBaseApi.get('/plan/public');
    return response.data;
  },

  getAllPlans: async () => {
    const response = await AuthorBaseApi.get('/plan');
    return response.data;
  },

  // Tạo plan mới (admin/staff only, requires auth)
  createPlan: async (planData) => {
    const response = await AuthorBaseApi.post('/plan', planData);
    return response.data;
  },

  // Cập nhật plan (admin/staff only, requires auth)
  updatePlan: async (planId, planData) => {
    const response = await AuthorBaseApi.put(`/plan/${planId}`, planData);
    return response.data;
  },
};
