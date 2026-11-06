import api from './api';

const messageService = {
  getAll:  ()      => api.get('/messages'),
  send:    (data)  => api.post('/messages', data),
  markRead:(id)    => api.patch(`/messages/${id}/read`),
};

export default messageService;
