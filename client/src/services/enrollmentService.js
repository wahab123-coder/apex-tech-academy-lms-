import api from './api';

const enrollmentService = {
  getAll:   ()            => api.get('/enrollments'),
  enroll:   (data)        => api.post('/enrollments', data),
  updateStatus: (id, status) => api.patch(`/enrollments/${id}`, { status }),
};

export default enrollmentService;
