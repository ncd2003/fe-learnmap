import AuthorBaseApi from './AuthorBaseApi';
import UnAuthorBaseApi from './UnAuthorBaseApi';

export const commentApi = {
  // Get all comments by post ID (public)
  getCommentsByPostId: async (postId) => {
    const response = await UnAuthorBaseApi.get(`/comment/public/${postId}`);
    return response.data;
  },

  // Create a new comment (requires auth)
  createComment: async (postId, commentData) => {
    const response = await AuthorBaseApi.post('/comment', {
      content: commentData.content,
      postId: postId,
    });
    return response.data;
  },
};
