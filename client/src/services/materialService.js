import api from './api';

const materialService = {
  getByLesson: (lessonId) => api.get('/materials', { params: { lessonId } }),
  upload: (formData) =>
    api.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  download: (id) =>
    api.get(`/materials/${id}/download`, { responseType: 'blob' }),
  remove: (id) => api.delete(`/materials/${id}`),
};

export default materialService;
