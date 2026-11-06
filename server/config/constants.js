// Application-wide constants

module.exports = {
  ROLES: {
    ADMIN:      'admin',
    INSTRUCTOR: 'instructor',
    STUDENT:    'student',
  },

  COURSE_LEVELS: ['Beginner', 'Intermediate', 'Advanced'],

  MATERIAL_TYPES: ['PDF', 'Video', 'Notes', 'Link'],

  APPLICATION_STATUSES: ['Pending', 'Approved', 'Rejected'],

  PAYMENT_STATUSES: ['Pending', 'Verified', 'Failed', 'Refunded'],

  CERTIFICATE_STATUSES: ['Pending', 'Issued'],

  SUBMISSION_STATUSES: ['Pending', 'Graded'],

  // File upload limits
  MAX_FILE_SIZE_MB: 50,
  ALLOWED_FILE_TYPES: [
    // Images — for gallery uploads
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Video
    'video/mp4',
    'video/webm',
    // Archives & code
    'application/zip',
    'text/html',
    'text/javascript',
  ],
};
