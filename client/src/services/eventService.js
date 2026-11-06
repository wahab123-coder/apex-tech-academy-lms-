import api from './api';

const eventService = {
  getAll:    ()         => api.get('/events'),
  create:    (data)     => api.post('/events', data),
  update:    (id, data) => api.put(`/events/${id}`, data),
  remove:    (id)       => api.delete(`/events/${id}`),
  register:  (id)       => api.post(`/events/${id}/register`),
};

export default eventService;
