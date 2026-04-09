import AuthorBaseApi from './AuthorBaseApi';

export const analyticsApi = {
  getTraffic: async (startDate = '30daysAgo', endDate = 'today') => {
    const response = await AuthorBaseApi.get('/analytics/admin/traffic', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getAllTimeTraffic: async () => {
    const response = await AuthorBaseApi.get('/analytics/admin/traffic', {
      params: { startDate: '3650daysAgo', endDate: 'today' },
    });
    return response.data;
  },

  getOnlineUsers: async () => {
    const response = await AuthorBaseApi.get('/analytics/admin/online-users', {
      skipErrorToast: true,
    });
    return response.data;
  },

  getOverview: async (startDate = '30daysAgo', endDate = 'today') => {
    const response = await AuthorBaseApi.get('/analytics/admin/overview', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
