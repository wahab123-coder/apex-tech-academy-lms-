import React, { useState } from 'react';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { projectService, enrollmentService } from '../../services';
import '../admin/Portal.css';
import './StudentProjects.css';

const validate = (v) => {
  const e = {};
  if (!v.title.trim())       e.title       = 'Title is required';
  if (!v.description.trim()) e.description = 'Description is required';
  if (!v.course)             e.course      = 'Select a course';
  return e;
};

// ── Git Clone Box ─────────────────────────────────────────
function GitCloneBox({ repoUrl }) {
  const [copied, setCopied] = useState(false);

  if (!repoUrl) return null;

  const cloneCmd = `git clone ${repoUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cloneCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // Fallback — select the text
      const el = document.querySelector(`[data-clone="${repoUrl}"]`);
      el?.select();
    }
  };

  return (
    <div className="git-clone-box">
      <div className="git-clone-box__label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="6" y1="9" x2="6" y2="15"/><line x1="9" y1="6" x2="15" y2="6"/>
          <line x1="9" y1="18" x2="15" y2="18"/>
        </svg>
        Clone this project
      </div>
      <div className="git-clone-box__row">
        <code className="git-clone-box__cmd" data-clone={repoUrl}>
          {cloneCmd}
        </code>
        <button
          className={`git-clone-box__copy ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy clone command"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
function StudentProjects() {
  const [open,  setOpen]  = useState(false);
  const [alert, setAlert] = useState(null);

  const { data: enrollData } = useApi(
    () => enrollmentService.getAll(),
    { initialData: { enrollments: [] } }
  );
  const enrollments = enrollData?.enrollments || [];

  const { data, loading, error, refetch } = useApi(
    () => projectService.getAll(),
    { initialData: { projects: [] } }
  );

  const enrolledCourseIds = enrollments.map((e) => e.course?._id);
  const projects = (data?.projects || []).filter((p) =>
    enrolledCourseIds.includes(p.course?._id) || !p.student
  );

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: {
      title: '', description: '', course: '',
      tags: '', repoUrl: '', liveUrl: '',
    },
    validate,
    onSubmit: async (vals) => {
      await projectService.create({
        title:       vals.title,
        description: vals.description,
        course:      vals.course,
        tags:        vals.tags.split(',').map((t) => t.trim()).filter(Boolean),
        repoUrl:     vals.repoUrl || undefined,
        liveUrl:     vals.liveUrl || undefined,
      });
      setAlert({ type: 'success', msg: `"${vals.title}" submitted for review.` });
      setOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">My Projects</h1>
        <p className="portal-page__subtitle">
          Projects you have built during your courses. Add a Git repository so others can clone your work.
        </p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setOpen(true)}>+ Submit Project</Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading projects..." />
      ) : projects.length === 0 ? (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>🔧</div>
          <p className="portal-empty__title">No projects yet</p>
          <p className="portal-empty__text">Submit a project with your Git repository link to showcase your work.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {projects.map((p) => (
            <div key={p._id} className="project-portal-card">
              {/* Header row */}
              <div className="project-portal-card__top">
                <div className="project-portal-card__info">
                  <h3 className="project-portal-card__title">{p.title}</h3>
                  <p className="project-portal-card__desc">{p.description}</p>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                    {(p.tags || []).map((t) => (
                      <span key={t} className="badge badge--primary">{t}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {p.course?.title}
                    {p.publishedAt && ` · ${new Date(p.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
                <div className="project-portal-card__meta">
                  <span className={`badge badge--${p.status === 'Published' ? 'success' : p.status === 'Rejected' ? 'error' : 'warning'}`}>
                    {p.status}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn--primary btn--sm">
                        Live Demo
                      </a>
                    )}
                    {p.repoUrl && (
                      <a href={p.repoUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn--outline btn--sm">
                        Repository
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Git clone box */}
              {p.repoUrl && <GitCloneBox repoUrl={p.repoUrl} />}
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Submit Project" size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>Submit for Review</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField label="Project Title *" name="title" value={values.title}
            onChange={handleChange} error={errors.title} required />
          <FormField label="Description *" name="description" type="textarea" rows={4}
            value={values.description} onChange={handleChange} error={errors.description} required />
          <FormField label="Course *" name="course" type="select" value={values.course}
            onChange={handleChange} error={errors.course} required>
            <option value="">Select the course this project is for</option>
            {enrollments.map((e) => (
              <option key={e.course?._id} value={e.course?._id}>{e.course?.title}</option>
            ))}
          </FormField>
          <FormField label="Technologies (comma-separated)" name="tags" value={values.tags}
            onChange={handleChange} placeholder="React, Node.js, MongoDB" />

          {/* Git repo URL */}
          <div>
            <FormField
              label="Git Repository URL"
              name="repoUrl"
              value={values.repoUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repo.git"
            />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Supports GitHub, GitLab, Bitbucket or any Git-compatible URL.
              Others will be able to clone your project using this URL.
            </p>
          </div>

          {/* Preview clone command */}
          {values.repoUrl && (
            <GitCloneBox repoUrl={values.repoUrl} />
          )}

          <FormField label="Live Demo URL (optional)" name="liveUrl" value={values.liveUrl}
            onChange={handleChange} placeholder="https://myproject.vercel.app" />
        </div>
      </Modal>
    </div>
  );
}

export default StudentProjects;
