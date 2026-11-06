const multer = require('multer');
const path   = require('path');
const { MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES } = require('../config/constants');

/**
 * Storage — files go to /uploads/<subfolder> on the server.
 * These paths are NEVER directly exposed via static middleware.
 * Access is gated through authenticated, authorized API routes.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Route-specific subfolders for organisation
    const folder = req.uploadFolder || 'general';
    cb(null, path.join(__dirname, '..', 'uploads', folder));
  },
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

/**
 * setUploadFolder — middleware to set the upload subfolder
 * before multer processes the file.
 */
const setUploadFolder = (folder) => (req, res, next) => {
  req.uploadFolder = folder;
  next();
};

module.exports = { upload, setUploadFolder };
