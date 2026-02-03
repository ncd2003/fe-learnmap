import AuthorBaseApi from './AuthorBaseApi';
import UnAuthorBaseApi from './UnAuthorBaseApi';

export const courseApi = {
  // Lấy tất cả các khóa học (cho Admin, requires auth)
  getAllCourses: async () => {
    const response = await AuthorBaseApi.get('/course');
    return response.data;
  },

  // Lấy các khóa học đã publish (public)
  getAllPublishedCourses: async () => {
    const response = await UnAuthorBaseApi.get('/course/public');
    return response.data;
  },

  // Lấy thông tin khóa học theo ID (requires auth)
  getCourseById: async (id) => {
    const response = await AuthorBaseApi.get(`/course/${id}`);
    return response.data;
  },

  // Lấy khóa học theo category ID (public)
  getCoursesByCategoryId: async (categoryId) => {
    const response = await UnAuthorBaseApi.get(`/course/public/category/${categoryId}`);
    return response.data;
  },

  // Tạo khóa học mới (requires auth)
  createCourse: async (courseData) => {
    const response = await AuthorBaseApi.post('/course', courseData);
    return response.data;
  },

  // Cập nhật khóa học (requires auth)
  updateCourse: async (id, courseData) => {
    const response = await AuthorBaseApi.put(`/course/${id}`, courseData);
    return response.data;
  },

  // Xóa khóa học (requires auth)
  deleteCourse: async (id) => {
    const response = await AuthorBaseApi.delete(`/course/${id}`);
    return response.data;
  },
};
