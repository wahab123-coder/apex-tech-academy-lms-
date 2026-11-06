import api from './api';

const certificateService = {
  getAll:           ()                       => api.get('/certificates'),
  issue:            (data)                   => api.post('/certificates', data),
  verify:           (certId)                 => api.get(`/certificates/verify/${certId}`),
  download:         (id)                     => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
  checkEligibility: (studentId, courseId)    => api.get(`/certificates/eligibility/${studentId}/${courseId}`),
};

export default certificateService;
