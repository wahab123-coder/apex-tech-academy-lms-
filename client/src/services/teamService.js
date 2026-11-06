import api from './api';

const teamService = {
  getAll:          ()           => api.get('/team'),
  getAllAdmin:      ()           => api.get('/team/all'),
  create:          (data)       => api.post('/team', data),
  update:          (id, data)   => api.put(`/team/${id}`, data),
  toggleVisibility:(id)         => api.patch(`/team/${id}/visibility`),
  remove:          (id)         => api.delete(`/team/${id}`),
};

export default teamService;
