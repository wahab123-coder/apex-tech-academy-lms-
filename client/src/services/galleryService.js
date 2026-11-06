import api from './api';

const galleryService = {
  getAll:     (params)   => api.get('/gallery', { params }),
  getAllAdmin: ()         => api.get('/gallery/all'),
  upload:     (formData) =>
    api.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update:     (id, data) => api.patch(`/gallery/${id}`, data),
  remove:     (id)       => api.delete(`/gallery/${id}`),
};

export default galleryService;
