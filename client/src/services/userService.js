import api from './api';

const userService = {
  getAll:        (params)    => api.get('/users', { params }),
  getById:       (id)        => api.get(`/users/${id}`),
  updateProfile: (data)      => api.put('/users/profile', data),
  update:        (id, data)  => api.put(`/users/${id}`, data),
  setRole:       (id, role)  => api.patch(`/users/${id}/role`, { role }),
  toggleActive:  (id)        => api.patch(`/users/${id}/toggle-active`),
};

export default userService;
