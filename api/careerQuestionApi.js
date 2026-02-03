import AuthorBaseApi from './AuthorBaseApi';

export const careerQuestionApi = {
  // Lấy tất cả career questions (admin/staff only, requires auth)
  getAllCareerQuestions: async () => {
    const response = await AuthorBaseApi.get('/career-question');
    return response.data;
  },

  // Tạo career questions (admin/staff only, requires auth)
  createCareerQuestions: async (questions) => {
    const response = await AuthorBaseApi.post('/career-question', questions);
    return response.data;
  },

  // Tính toán kết quả career question (student/admin/staff, requires auth)
  calculateCareerQuestion: async (answers) => {
    const response = await AuthorBaseApi.post('/career-question/calculate', answers);
    return response.data;
  },
};
