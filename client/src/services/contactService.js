import api from './api';

const contactService = {
  send: (data) => api.post('/contact', data),
};

export default contactService;
