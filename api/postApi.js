import AuthorBaseApi from './AuthorBaseApi';
import UnAuthorBaseApi from './UnAuthorBaseApi';

export const postApi = {
  // Get all posts by topic ID (public)
  getPostsByTopicId: async (topicId) => {
    const response = await UnAuthorBaseApi.get(`/post/public/${topicId}`);
    return response.data;
  },

  // Create a new post (requires auth)
  createPost: async (postData) => {
    const response = await AuthorBaseApi.post('/post', postData);
    return response.data;
  },
};
