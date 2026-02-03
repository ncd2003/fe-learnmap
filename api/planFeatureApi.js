import AuthorBaseApi from './AuthorBaseApi';

export const planFeatureApi = {
  // Lấy tất cả features có sẵn (requires auth)
  getAllFeatures: async () => {
    const response = await AuthorBaseApi.get('/feature');
    return response.data;
  },

  // Lấy tất cả plan features (requires auth)
  getAllPlanFeatures: async () => {
    const response = await AuthorBaseApi.get('/feature');
    return response.data;
  },
};
