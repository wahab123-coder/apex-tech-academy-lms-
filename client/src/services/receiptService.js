import api from './api';

const receiptService = {
  getAll:   ()    => api.get('/receipts'),
  getById:  (id)  => api.get(`/receipts/${id}`),
};

export default receiptService;
