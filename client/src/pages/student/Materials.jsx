import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { materialService, lessonService, enrollmentService } from '../../services';
import '../admin/Portal.css';
import './StudentMaterials.css';

const typeIcon  = { PDF: '📄', Video: '🎬', Notes: '📝', Link: '🔗' };
const typeColor = { PDF: 'error', Video: 'info', Notes: 'success', Link: 'primary' };

// ── Video player component ────────────────────────────────
function VideoPlayer({ url, title }) {
  return (
    <div className="material-video-wrap">
      <video
        controls
        controlsList="nodownload"
        className="material-video"
        preload="metadata"
        title={title}
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

// ── PDF viewer component ──────────────────────────────────
function PdfViewer({ url, title }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="material-pdf-wrap">
      {!expanded ? (
        <button className="btn btn--outline btn--sm" onClick={() => setExpanded(true)}>
          Preview PDF
        </button>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => setExpanded(false)}>
              Close Preview
            </button>
          </div>
          <iframe
            src={url}
            title={title}
            className="material-pdf-frame"
            allow="fullscreen"
          />
        </>
      )}
    </div>
  );
}

function StudentMaterials() {
  const [params]     = useSearchParams();
  const courseId     = params.get('courseId');
  const [expanded,   setExpanded] = useState({}); // track which material is expanded

  const { data: enrollData }  = useApi(() => enrollmentService.getAll(), { initialData: { enrollments: [] } });
  const enrollments           = enrollData?.enrollments || [];
  const activeCourseId        = courseId || enrollments[0]?.course?._id;

  const { data: lessonsData } = useApi(
    () => activeCourseId
      ? lessonService.getByCourse(activeCourseId)
      : Promise.resolve({ data: { lessons: [] } }),
    { initialData: { lessons: [] }, deps: [activeCourseId] }
  );
  const lessons = lessonsData?.lessons || [];

  const { data: allMaterials, loading, error } = useApi(
    () => Promise.all(
      lessons.map((l) =>
        materialService.getByLesson(l._id)
          .then((r) => (r.data?.materials || []).map((m) => ({ ...m, lessonTitle: l.title })))
          .catch(() => [])
      )
    ).then((arrays) => ({ materials: arrays.flat() })),
    { initialData: { materials: [] }, deps: [lessons.length] }
  );

  const materials = allMaterials?.materials || [];

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Learning Materials</h1>
        <p className="portal-page__subtitle">
          Videos, PDFs and notes uploaded by your instructors.
        </p>
      </div>

      {error   && <Alert type="error">{error}</Alert>}
      {loading && <LoadingSpinner label="Loading materials..." />}

      {!loading && materials.length === 0 && (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>📄</div>
          <p className="portal-empty__title">No materials yet</p>
          <p className="portal-empty__text">
            Your instructors haven't uploaded any materials for your courses yet.
          </p>
        </div>
      )}

      {!loading && materials.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {materials.map((m) => (
            <div key={m._id} className="material-card">
              {/* Material header row */}
              <div className="material-card__header">
                <div className="material-card__icon">
                  {typeIcon[m.type] || '📁'}
                </div>
                <div className="material-card__info">
                  <p className="material-card__title">{m.title}</p>
                  <p className="material-card__meta">
                    {m.lessonTitle}
                    {m.fileSize && ` · ${(m.fileSize / 1024 / 1024).toFixed(1)} MB`}
                  </p>
                </div>
                <div className="material-card__actions">
                  <span className={`badge badge--${typeColor[m.type] || 'primary'}`}>
                    {m.type}
                  </span>

                  {/* Video — toggle inline player */}
                  {m.type === 'Video' && m.fileUrl && (
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => toggleExpand(m._id)}
                    >
                      {expanded[m._id] ? 'Hide Video' : 'Watch Video'}
                    </button>
                  )}

                  {/* PDF — toggle inline viewer */}
                  {m.type === 'PDF' && m.fileUrl && (
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => toggleExpand(m._id)}
                    >
                      {expanded[m._id] ? 'Close PDF' : 'View PDF'}
                    </button>
                  )}

                  {/* Notes or Link — open directly */}
                  {(m.type === 'Notes' || m.type === 'Link') && (m.fileUrl || m.externalUrl) && (
                    <a
                      href={m.fileUrl || m.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--primary btn--sm"
                    >
                      Open
                    </a>
                  )}

                  {/* Download button for PDFs and Notes */}
                  {(m.type === 'PDF' || m.type === 'Notes') && m.fileUrl && (
                    <a href={m.fileUrl} download className="btn btn--outline btn--sm">
                      Download
                    </a>
                  )}
                </div>
              </div>

              {/* Inline video player */}
              {m.type === 'Video' && m.fileUrl && expanded[m._id] && (
                <div className="material-card__player">
                  <VideoPlayer url={m.fileUrl} title={m.title} />
                </div>
              )}

              {/* Inline PDF viewer */}
              {m.type === 'PDF' && m.fileUrl && expanded[m._id] && (
                <div className="material-card__player">
                  <PdfViewer url={m.fileUrl} title={m.title} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentMaterials;
