import api from './api';

const settingsService = {
  getPublic: ()           => api.get('/settings'),
  getAll:    ()           => api.get('/settings/all'),
  update:    (key, data)  => api.put(`/settings/${key}`, data),
};

export default settingsService;
