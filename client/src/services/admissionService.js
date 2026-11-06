import api from './api';

const admissionService = {
  getAll:              ()           => api.get('/admissions'),
  apply:               (data)       => api.post('/admissions', data),
  review:              (id, data)   => api.patch(`/admissions/${id}/review`, data),
  downloadLetter:      (id)         => api.get(`/admissions/${id}/letter`, { responseType: 'blob' }),
};

export default admissionService;
