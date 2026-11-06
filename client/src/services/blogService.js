import api from './api';

const blogService = {
  getAll:    (params)   => api.get('/blog', { params }),
  getBySlug: (slug)     => api.get(`/blog/${slug}`),
  create:    (data)     => api.post('/blog', data),
  update:    (id, data) => api.put(`/blog/${id}`, data),
  remove:    (id)       => api.delete(`/blog/${id}`),
};

export default blogService;
