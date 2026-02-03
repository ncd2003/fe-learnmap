import AuthorBaseApi from './AuthorBaseApi';

export const learningPathApi = {
  // Tạo learning path (requires auth)
  createLearningPath: async (data) => {
    const response = await AuthorBaseApi.post('/learning-path', data);
    return response.data;
  },
};

export const chapterApi = {
  // Tạo chapter (requires auth)
  createChapter: async (data) => {
    const response = await AuthorBaseApi.post('/chapter', data);
    return response.data;
  },
};

export const lessonApi = {
  // Tạo lesson (requires auth)
  createLesson: async (data) => {
    const response = await AuthorBaseApi.post('/lesson', data);
    return response.data;
  },
};

export const resourceApi = {
  // Lấy resource theo ID (requires auth)
  getResourceById: async (id) => {
    const response = await AuthorBaseApi.get(`/resource/${id}`);
    return response.data;
  },

  // Tạo resource (requires auth)
  createResource: async (data) => {
    const response = await AuthorBaseApi.post('/resource', data);
    return response.data;
  },
};
