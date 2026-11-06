import api from './api';

const paymentService = {
  getAll:       ()              => api.get('/payments'),
  initiate:     (data)          => api.post('/payments/initiate', data),
  verify:       (reference)     => api.get(`/payments/verify/${reference}`),
  adminVerify:  (id)            => api.patch(`/payments/${id}/verify`),
};

export default paymentService;
