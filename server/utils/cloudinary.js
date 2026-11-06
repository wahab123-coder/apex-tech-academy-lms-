/**
 * Apex Tech Academy — Cloudinary Upload Utility
 * Uses multer memory storage + Cloudinary direct upload API.
 * More reliable than multer-storage-cloudinary (avoids signature issues).
 *
 * Video upload strategy:
 *   Files ≤ 100 MB  → standard upload_stream (single request)
 *   Files  > 100 MB → chunked upload_large (5 MB chunks) — handles up to 2 GB on Cloudinary free plan
 */
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// Use memory storage — file stays in buffer, then we upload to Cloudinary directly
const memStorage = multer.memoryStorage();

// ── Gallery upload (images only) ──────────────────────────
const uploadGallery = multer({
  storage: memStorage,
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for gallery uploads.'), false);
    }
  },
});

// ── Materials upload (PDFs, videos, docs) ─────────────────
// multer limit: 2 GB — Cloudinary free plan supports up to 2 GB per file for video
const uploadMaterial = multer({
  storage: memStorage,
  limits:  { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed.`), false);
    }
  },
});

// ── Submission upload ─────────────────────────────────────
const uploadSubmission = multer({
  storage: memStorage,
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ── Helper: convert Buffer → Readable stream ──────────────
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// ── Standard upload via upload_stream (for files ≤ 100 MB) ─
const uploadSmall = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error('Cloudinary upload_stream error:', error.message);
        reject(error);
      } else {
        resolve(result);
      }
    });
    bufferToStream(fileBuffer).pipe(stream);
  });
};

// ── Chunked upload via upload_large (for files > 100 MB) ──
// Cloudinary upload_large splits the file into chunks automatically.
const CHUNK_SIZE = 20 * 1024 * 1024; // 20 MB chunks

const uploadLargeFile = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    // upload_large accepts a readable stream — convert the buffer first
    const readable = bufferToStream(fileBuffer);

    cloudinary.uploader.upload_large(
      readable,
      { ...options, chunk_size: CHUNK_SIZE },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload_large error:', error.message);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

// ── Main upload helper ─────────────────────────────────────
// Automatically selects standard vs chunked upload based on file size.
const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100 MB

const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'auto', publicId = null) => {
  const options = {
    folder,
    resource_type: resourceType,
    // For videos: use eager transformations to pre-generate streaming formats
    ...(resourceType === 'video' && {
      eager: [
        { streaming_profile: 'hd', format: 'm3u8' }, // HLS for adaptive streaming
      ],
      eager_async: true, // don't block the upload response
    }),
    ...(publicId && { public_id: publicId }),
  };

  try {
    let result;
    if (fileBuffer.length > LARGE_FILE_THRESHOLD) {
      console.log(`[Cloudinary] Large file detected (${(fileBuffer.length / 1024 / 1024).toFixed(1)} MB) — using chunked upload`);
      result = await uploadLargeFile(fileBuffer, options);
    } else {
      result = await uploadSmall(fileBuffer, options);
    }

    return {
      url:      result.secure_url,
      publicId: result.public_id,
      size:     result.bytes,
      format:   result.format,
      duration: result.duration || null,  // video duration in seconds
    };
  } catch (err) {
    console.error('[Cloudinary] Upload failed:', err.message);
    throw err;
  }
};

// ── Helper: delete from Cloudinary ────────────────────────
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return;
    // If it's a URL, extract the public_id
    if (publicId.startsWith('http')) {
      const parts = publicId.split('/upload/');
      if (parts[1]) {
        publicId = parts[1].replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
      }
    }
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = {
  cloudinary,
  uploadGallery,
  uploadMaterial,
  uploadSubmission,
  uploadToCloudinary,
  deleteFromCloudinary,
};
