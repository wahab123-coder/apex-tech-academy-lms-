import api from './api';

const examService = {
  // Admin/Instructor
  getAll:          ()                     => api.get('/exams'),
  getById:         (id)                   => api.get(`/exams/${id}`),
  create:          (data)                 => api.post('/exams', data),
  update:          (id, data)             => api.put(`/exams/${id}`, data),
  remove:          (id)                   => api.delete(`/exams/${id}`),
  addMCQ:          (id, data)              => api.post(`/exams/${id}/mcqs`, data),
  deleteMCQ:       (id, mcqId)            => api.delete(`/exams/${id}/mcqs/${mcqId}`),
  addEssay:        (id, data)              => api.post(`/exams/${id}/essays`, data),
  deleteEssay:     (id, essayId)           => api.delete(`/exams/${id}/essays/${essayId}`),
  getAttempts:     (id)                   => api.get(`/exams/${id}/attempts`),
  gradeAttempt:    (attemptId, data)       => api.patch(`/exams/attempts/${attemptId}/grade`, data),

  // Student
  getAvailable:     ()                    => api.get('/exams/student/available'),
  startExam:        (examId)              => api.get(`/exams/${examId}/take`),
  saveProgress:     (examId, data)        => api.post(`/exams/${examId}/save`, data),
  submitExam:       (examId, data)        => api.post(`/exams/${examId}/submit`, data),
  getResult:        (examId)              => api.get(`/exams/${examId}/result`),
};

export default examService;
