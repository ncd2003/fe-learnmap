import AuthorBaseApi from './AuthorBaseApi';

export const subscriptionApi = {
  // Create a new subscription (requires auth)
  createSubscription: async (subscriptionData) => {
    const response = await AuthorBaseApi.post('/subscription', subscriptionData);
    return response.data;
  },
};
