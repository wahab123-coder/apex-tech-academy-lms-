import api from './api';

const lessonService = {
  getByCourse: (courseId) => api.get('/lessons', { params: { courseId } }),
  create:      (data)     => api.post('/lessons', data),
  update:      (id, data) => api.put(`/lessons/${id}`, data),
  remove:      (id)       => api.delete(`/lessons/${id}`),
};

export default lessonService;
