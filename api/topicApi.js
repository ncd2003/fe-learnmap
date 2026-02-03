import AuthorBaseApi from './AuthorBaseApi';
import UnAuthorBaseApi from './UnAuthorBaseApi';

export const topicApi = {
  // Get all topics (public)
  getAllTopics: async () => {
    const response = await UnAuthorBaseApi.get('/topic/public');
    return response.data;
  },

  // Create a new topic (requires auth)
  createTopic: async (topicData) => {
    const response = await AuthorBaseApi.post('/topic', topicData);
    return response.data;
  },
};
