import api from './api';

const announcementService = {
  getAll:  ()         => api.get('/announcements'),
  create:  (data)     => api.post('/announcements', data),
  remove:  (id)       => api.delete(`/announcements/${id}`),
};

export default announcementService;
