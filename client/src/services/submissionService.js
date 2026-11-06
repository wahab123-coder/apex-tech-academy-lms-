import api from './api';

const submissionService = {
  getAll:  (params)        => api.get('/submissions', { params }),
  submit:  (formData)      =>
    api.post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  grade:   (id, data)      => api.patch(`/submissions/${id}/grade`, data),
};

export default submissionService;
