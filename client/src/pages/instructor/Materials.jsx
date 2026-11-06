import React, { useState, useRef, useEffect } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { materialService, lessonService, courseService } from '../../services';
import api            from '../../services/api';
import '../admin/Portal.css';

// ── Material type badge ───────────────────────────────────
const TypeBadge = ({ type }) => {
  const colors = {
    PDF:   { bg: '#fff3cd', color: '#856404' },
    Video: { bg: '#cce5ff', color: '#004085' },
    Notes: { bg: '#d4edda', color: '#155724' },
    Link:  { bg: '#e2d9f3', color: '#6f42c1' },
  };
  const s = colors[type] || { bg: 'var(--color-bg-secondary)', color: 'var(--color-text)' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 99, fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
      {type}
    </span>
  );
};

// ── Format seconds → h:mm:ss or m:ss ─────────────────────
const formatDuration = (secs) => {
  if (!secs) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ── Table column definitions ──────────────────────────────
const buildColumns = (handleDelete) => [
  { key: 'title',  label: 'Title' },
  { key: 'lesson', label: 'Lesson',    render: (v) => v?.title || '—' },
  { key: 'type',   label: 'Type',      render: (v) => <TypeBadge type={v} /> },
  { key: 'fileSize', label: 'Size',    render: (v) => v ? `${(v / 1024 / 1024).toFixed(1)} MB` : '—' },
  { key: 'duration', label: 'Duration', render: (v, row) => row.type === 'Video' ? formatDuration(v) : '—' },
  { key: 'createdAt', label: 'Date',   render: (v) => new Date(v).toLocaleDateString() },
  { key: 'actions', label: 'Actions',  render: (_, row) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {row.type === 'Video' && row.fileUrl && (
        <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">Watch</a>
      )}
      {row.type === 'PDF' && row.fileUrl && (
        <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">View PDF</a>
      )}
      {(row.type === 'Notes' || row.type === 'Link') && (row.fileUrl || row.externalUrl) && (
        <a href={row.fileUrl || row.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">Open</a>
      )}
      <button className="btn btn--danger btn--sm" onClick={() => handleDelete(row._id, row.title)}>
        Delete
      </button>
    </div>
  )},
];

// ── Upload progress bar ───────────────────────────────────
function UploadProgress({ percent }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>
        <span>Uploading to Cloudinary…</span>
        <span>{percent}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, background: 'var(--color-primary)', borderRadius: 99, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────
function InstructorMaterials() {
  const [open,            setOpen]           = useState(false);
  const [alert,           setAlert]          = useState(null);
  const [uploading,       setUploading]      = useState(false);
  const [uploadPercent,   setUploadPercent]  = useState(0);
  const [selectedCourse,  setSelectedCourse] = useState('');
  const [selectedLesson,  setSelectedLesson] = useState('');
  const [title,           setTitle]          = useState('');
  const [type,            setType]           = useState('PDF');
  const [lessons,         setLessons]        = useState([]);
  const [materials,       setMaterials]      = useState([]);
  const [loadingLessons,  setLoadingLessons] = useState(false);
  const [loadingMaterials,setLoadingMaterials] = useState(false);
  const fileRef = useRef(null);

  // Load instructor's courses
  const { data: coursesData, loading: loadingCourses, error: coursesError } = useApi(
    () => courseService.getMine(),
    { initialData: { courses: [] } }
  );
  const courses = coursesData?.courses || [];

  // When selected course changes, load its lessons
  useEffect(() => {
    if (!selectedCourse) { setLessons([]); setMaterials([]); return; }
    setLoadingLessons(true);
    lessonService.getByCourse(selectedCourse)
      .then((res) => setLessons(res.data?.lessons || res.lessons || []))
      .catch(() => setLessons([]))
      .finally(() => setLoadingLessons(false));
  }, [selectedCourse]);

  // When selected lesson changes, load its materials
  useEffect(() => {
    if (!selectedLesson) { setMaterials([]); return; }
    setLoadingMaterials(true);
    materialService.getByLesson(selectedLesson)
      .then((res) => setMaterials(res.data?.materials || res.materials || []))
      .catch(() => setMaterials([]))
      .finally(() => setLoadingMaterials(false));
  }, [selectedLesson]);

  const refreshMaterials = () => {
    if (!selectedLesson) return;
    setLoadingMaterials(true);
    materialService.getByLesson(selectedLesson)
      .then((res) => setMaterials(res.data?.materials || res.materials || []))
      .catch(() => setMaterials([]))
      .finally(() => setLoadingMaterials(false));
  };

  const resetForm = () => {
    setTitle('');
    setSelectedLesson('');
    setType('PDF');
    setUploadPercent(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = async (id, materialTitle) => {
    if (!window.confirm(`Delete "${materialTitle}"?`)) return;
    try {
      await materialService.remove(id);
      setAlert({ type: 'success', msg: 'Material deleted.' });
      refreshMaterials();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to delete material.' });
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setAlert({ type: 'error', msg: 'Please enter a title.' });
      return;
    }
    if (!selectedCourse) {
      setAlert({ type: 'error', msg: 'Please select a course.' });
      return;
    }
    if (!selectedLesson) {
      setAlert({ type: 'error', msg: 'Please select a lesson.' });
      return;
    }
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setAlert({ type: 'error', msg: 'Please choose a file to upload.' });
      return;
    }

    // Validate file size: PDFs/Notes max 100MB, Videos max 2GB
    const maxSize = type === 'Video' ? 2 * 1024 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxLabel = type === 'Video' ? '2 GB' : '100 MB';
      setAlert({ type: 'error', msg: `File too large. Max size for ${type} is ${maxLabel}.` });
      return;
    }

    setUploading(true);
    setUploadPercent(0);
    try {
      const fd = new FormData();
      fd.append('file',     file);
      fd.append('title',    title.trim());
      fd.append('type',     type);
      fd.append('lessonId', selectedLesson);
      fd.append('courseId', selectedCourse);

      // Use XMLHttpRequest for upload progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const token = localStorage.getItem('ata_token');

        // 30 min timeout for very large video uploads
        xhr.timeout = 30 * 60 * 1000;

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadPercent(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.message || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error',   () => reject(new Error('Network error during upload.')));
        xhr.addEventListener('abort',   () => reject(new Error('Upload cancelled.')));
        xhr.addEventListener('timeout', () => reject(new Error('Upload timed out. The file may be too large or your connection is slow.')));

        // Build the absolute URL for XHR — use VITE_API_URL env or fall back to same-origin /api
        const baseURL = import.meta.env.VITE_API_URL || '/api';
        xhr.open('POST', `${baseURL}/materials`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(fd);
      });

      setAlert({ type: 'success', msg: `${type} "${title}" uploaded successfully.` });
      setOpen(false);
      resetForm();
      refreshMaterials();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const columns = buildColumns(handleDelete);

  // Determine accepted file types based on material type
  const getAccept = () => {
    switch (type) {
      case 'Video': return 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv';
      case 'PDF':   return 'application/pdf,.pdf';
      case 'Notes': return '.pdf,.docx,.doc,.txt,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:      return '.pdf,.mp4,.webm,.mov,.docx,.zip,.txt';
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Learning Materials</h1>
        <p className="portal-page__subtitle">Upload PDFs, videos and notes for your course lessons.</p>
      </div>

      {alert         && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {coursesError  && <Alert type="error">Failed to load courses: {coursesError}</Alert>}

      {/* Course + Lesson Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <div className="form-field" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <label className="form-field__label">Course</label>
          <select className="form-field__input" value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedLesson(''); }}>
            <option value="">— Select a course —</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>

        <div className="form-field" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <label className="form-field__label">Lesson</label>
          {loadingLessons ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 8 }}>Loading lessons…</p>
          ) : (
            <select className="form-field__input" value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)} disabled={!selectedCourse}>
              <option value="">— Select a lesson —</option>
              {lessons.map((l) => <option key={l._id} value={l._id}>{l.order}. {l.title}</option>)}
            </select>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <Button size="sm" onClick={() => { if (!selectedCourse) { setAlert({ type: 'error', msg: 'Select a course first.' }); return; } setOpen(true); }}>
            + Upload Material
          </Button>
        </div>
      </div>

      {/* Materials table */}
      {!selectedCourse && (
        <div className="portal-empty">
          <p className="portal-empty__title">Select a course to view its materials</p>
          <p className="portal-empty__text">Choose a course from the dropdown above.</p>
        </div>
      )}

      {selectedCourse && !selectedLesson && !loadingLessons && (
        <div className="portal-empty">
          <p className="portal-empty__title">Select a lesson to view its materials</p>
          {lessons.length === 0
            ? <p className="portal-empty__text">No lessons found for this course. Add lessons first.</p>
            : <p className="portal-empty__text">Choose a lesson from the dropdown above.</p>
          }
        </div>
      )}

      {selectedLesson && (
        loadingMaterials
          ? <LoadingSpinner label="Loading materials…" />
          : <Table columns={columns} data={materials} emptyMsg="No materials uploaded for this lesson yet." />
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={open}
        onClose={() => { if (!uploading) { setOpen(false); resetForm(); } }}
        title="Upload Learning Material"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setOpen(false); resetForm(); }} disabled={uploading}>
              Cancel
            </Button>
            <Button loading={uploading} onClick={handleUpload}>
              {uploading ? `Uploading ${uploadPercent}%…` : 'Upload'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <FormField
            label="Title *"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to HTML - Lecture Slides"
            required
          />

          <div className="form-field">
            <label className="form-field__label">Course</label>
            <input className="form-field__input" value={courses.find((c) => c._id === selectedCourse)?.title || ''} readOnly style={{ background: 'var(--color-bg-secondary)', cursor: 'default' }} />
          </div>

          <div className="form-field">
            <label className="form-field__label">Lesson *</label>
            <select className="form-field__input" value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}>
              <option value="">Select lesson</option>
              {lessons.map((l) => <option key={l._id} value={l._id}>{l.order}. {l.title}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label className="form-field__label">Type</label>
            <select className="form-field__input" value={type} onChange={(e) => { setType(e.target.value); if (fileRef.current) fileRef.current.value = ''; }}>
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Notes">Notes / Document</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-field__label">File *</label>
            <input ref={fileRef} type="file" className="form-field__input" accept={getAccept()} />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {type === 'Video' && 'Supported: MP4, WebM, MOV, AVI, MKV — max 2 GB'}
              {type === 'PDF'   && 'Supported: PDF — max 100 MB'}
              {type === 'Notes' && 'Supported: PDF, DOCX, TXT, ZIP — max 100 MB'}
            </p>
          </div>

          {uploading && <UploadProgress percent={uploadPercent} />}
        </div>
      </Modal>
    </div>
  );
}

export default InstructorMaterials;
