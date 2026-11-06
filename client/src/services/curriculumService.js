import api from './api';

const curriculumService = {
  getByCourse:  (courseId)              => api.get(`/curriculum/${courseId}`),
  create:       (data)                  => api.post('/curriculum', data),
  update:       (courseId, data)        => api.put(`/curriculum/${courseId}`, data),
  remove:       (courseId)              => api.delete(`/curriculum/${courseId}`),

  // Week management
  addWeek:      (courseId, data)        => api.post(`/curriculum/${courseId}/weeks`, data),
  updateWeek:   (courseId, weekId, data)=> api.put(`/curriculum/${courseId}/weeks/${weekId}`, data),
  deleteWeek:   (courseId, weekId)      => api.delete(`/curriculum/${courseId}/weeks/${weekId}`),

  // Topic management
  addTopic:     (courseId, weekId, data)=>
    api.post(`/curriculum/${courseId}/weeks/${weekId}/topics`, data),
  deleteTopic:  (courseId, weekId, topicId) =>
    api.delete(`/curriculum/${courseId}/weeks/${weekId}/topics/${topicId}`),
};

export default curriculumService;
