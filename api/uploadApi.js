import AuthorBaseApi from './AuthorBaseApi';

export const uploadApi = {
  // Upload image file (requires auth)
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await AuthorBaseApi.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Server trả về URL trực tiếp dưới dạng string
    return response.data;
  },

  // Upload video file (requires auth)
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await AuthorBaseApi.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Server trả về URL trực tiếp dưới dạng string
    return response.data;
  },

  // Upload document file (requires auth)
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await AuthorBaseApi.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Server trả về URL trực tiếp dưới dạng string
    return response.data;
  },
};
