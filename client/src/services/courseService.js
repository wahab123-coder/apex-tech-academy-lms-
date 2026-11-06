import api from './api';

const courseService = {
  getAll:    (params) => api.get('/courses', { params }),
  getById:   (id)     => api.get(`/courses/${id}`),
  getMine:   ()       => api.get('/courses/instructor/mine'),
  create:    (data)   => api.post('/courses', data),
  update:    (id, data) => api.put(`/courses/${id}`, data),
  remove:    (id)     => api.delete(`/courses/${id}`),
};

export default courseService;
