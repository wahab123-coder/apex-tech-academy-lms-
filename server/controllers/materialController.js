const Material   = require('../models/Material');
const Lesson     = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const { deleteFromCloudinary } = require('../utils/cloudinary');

// ── @GET /api/materials?lessonId= ────────────────────────
exports.getMaterials = async (req, res, next) => {
  try {
    const { lessonId } = req.query;
    if (!lessonId) return res.status(400).json({ success: false, message: 'lessonId is required.' });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    if (req.user.role === 'student') {
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: lesson.course, status: 'Active' });
      if (!enrolled) return res.status(403).json({ success: false, message: 'You are not enrolled in this course.' });
    }

    const materials = await Material.find({ lesson: lessonId, isActive: true })
      .select('-filePath')
      .populate('uploadedBy', 'firstName lastName');

    // Ensure each material has a usable fileUrl
    const materialsWithUrl = materials.map((m) => {
      const obj = m.toObject();
      if (!obj.fileUrl && obj.filePath) {
        obj.fileUrl = buildFileUrl(obj._id, obj.type);
      }
      return obj;
    });

    res.json({ success: true, count: materialsWithUrl.length, materials: materialsWithUrl });
  } catch (err) { next(err); }
};

// ── @POST /api/materials ──────────────────────────────────
exports.uploadMaterial = async (req, res, next) => {
  try {
    const { lessonId, courseId, title, type, externalUrl } = req.body;

    const materialData = {
      lesson:     lessonId,
      course:     courseId,
      uploadedBy: req.user.id,
      title,
      type,
    };

    if (req.file) {
      // Cloudinary returns the URL in req.file.path and public_id in req.file.filename
      materialData.filePath  = req.file.filename; // Cloudinary public_id
      materialData.fileUrl    = req.file.path;     // Cloudinary secure URL
      materialData.fileSize  = req.file.size;
      materialData.mimeType  = req.file.mimetype;
    } else if (externalUrl) {
      materialData.externalUrl = externalUrl;
      materialData.fileUrl     = externalUrl;
    } else {
      return res.status(400).json({ success: false, message: 'A file or external URL is required.' });
    }

    const material = await Material.create(materialData);

    const result = material.toObject();
    delete result.filePath; // never expose internal path
    res.status(201).json({ success: true, material: result });
  } catch (err) { next(err); }
};

// ── @GET /api/materials/:id/download ─────────────────────
exports.downloadMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });

    if (req.user.role === 'student') {
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: material.course, status: 'Active' });
      if (!enrolled) return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // If we have a Cloudinary URL, redirect to it
    if (material.fileUrl) {
      return res.redirect(material.fileUrl);
    }

    return res.status(404).json({ success: false, message: 'File not available.' });
  } catch (err) { next(err); }
};

// ── @GET /api/materials/:id/stream — Video streaming ─────
exports.streamMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });

    if (req.user.role === 'student') {
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: material.course, status: 'Active' });
      if (!enrolled) return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Cloudinary serves videos directly — redirect to the Cloudinary URL
    if (material.fileUrl) {
      return res.redirect(material.fileUrl);
    }

    return res.status(404).json({ success: false, message: 'Video not available.' });
  } catch (err) { next(err); }
};

// ── @DELETE /api/materials/:id ────────────────────────────
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });

    if (req.user.role === 'instructor' && material.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Delete from Cloudinary if it has a Cloudinary public_id
    if (material.filePath && !material.filePath.startsWith('C:') && !material.filePath.startsWith('/uploads')) {
      const resourceType = material.type === 'Video' ? 'video' : material.mimeType?.startsWith('image/') ? 'image' : 'raw';
      await deleteFromCloudinary(material.filePath, resourceType);
    }

    await material.deleteOne();
    res.json({ success: true, message: 'Material deleted.' });
  } catch (err) { next(err); }
};
