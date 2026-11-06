import api from './api';

const progressService = {
  getAll:         (courseId) => api.get('/progress', { params: { courseId } }),
  completeLesson: (data)     => api.post('/progress/complete-lesson', data),
};

export default progressService;
