import api from './api';

const projectService = {
  getAll:    ()     => api.get('/projects'),
  create:    (data) => api.post('/projects', data),
  publish:   (id)   => api.patch(`/projects/${id}/publish`),
  remove:    (id)   => api.delete(`/projects/${id}`),
};

export default projectService;
