const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadMaterial, uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  getMaterials,
  downloadMaterial,
  streamMaterial,
  deleteMaterial,
} = require('../controllers/materialController');

// ── Detect whether a MIME type is a video ─────────────────
const isVideoMime = (mime = '') =>
  mime.startsWith('video/') ||
  ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'].includes(mime);

router.use(protect);

router.get('/',             getMaterials);
router.get('/:id/download', downloadMaterial);
router.get('/:id/stream',   streamMaterial);

// ── POST /api/materials — Upload a learning material ──────
router.post('/',
  authorize('admin', 'instructor'),
  uploadLimiter,
  // Multer handles multipart/form-data; limit is 2 GB (set in cloudinary.js)
  uploadMaterial.single('file'),
  async (req, res, next) => {
    try {
      const { lessonId, courseId, title, type, externalUrl } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title is required.' });
      }

      const materialData = {
        lesson:     lessonId,
        course:     courseId,
        uploadedBy: req.user.id,
        title:      title.trim(),
        type:       type || 'PDF',
      };

      if (req.file) {
        // Determine Cloudinary resource_type:
        //   - 'video' for any video MIME type
        //   - 'raw'   for PDFs, DOCXs, ZIPs (keeps original file intact)
        //   - 'auto'  fallback (Cloudinary detects)
        let resourceType = 'auto';
        if (isVideoMime(req.file.mimetype)) {
          resourceType = 'video';
        } else if (
          req.file.mimetype === 'application/pdf' ||
          req.file.mimetype === 'application/msword' ||
          req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          req.file.mimetype === 'application/zip' ||
          req.file.mimetype === 'text/plain'
        ) {
          resourceType = 'raw';
        }

        console.log(
          `[Upload] "${title}" | type: ${resourceType} | size: ${(req.file.size / 1024 / 1024).toFixed(1)} MB`
        );

        const result = await uploadToCloudinary(
          req.file.buffer,
          'apex-tech-academy/materials',
          resourceType,
          `material-${Date.now()}`
        );

        materialData.filePath = result.publicId;   // stored for deletion
        materialData.fileUrl  = result.url;         // Cloudinary CDN URL
        materialData.fileSize = result.size;
        materialData.mimeType = req.file.mimetype;

        // Store video duration if available
        if (result.duration) {
          materialData.duration = Math.round(result.duration); // seconds
        }

      } else if (externalUrl && externalUrl.trim()) {
        materialData.externalUrl = externalUrl.trim();
        materialData.fileUrl     = externalUrl.trim();
      } else {
        return res.status(400).json({ success: false, message: 'A file or external URL is required.' });
      }

      const Material = require('../models/Material');
      const material = await Material.create(materialData);

      const resultObj = material.toObject();
      delete resultObj.filePath; // never expose internal Cloudinary public_id to clients
      res.status(201).json({ success: true, material: resultObj });

    } catch (err) {
      console.error('[Material Upload Error]', err.message);
      // Multer file-too-large error
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'File is too large. Maximum allowed size is 2 GB.',
        });
      }
      res.status(500).json({ success: false, message: err.message || 'Upload failed.' });
    }
  }
);

router.delete('/:id', authorize('admin', 'instructor'), deleteMaterial);

module.exports = router;
