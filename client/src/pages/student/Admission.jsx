import React, { useState } from 'react';
import Button            from '../../components/ui/Button';
import Alert             from '../../components/ui/Alert';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import Modal             from '../../components/ui/Modal';
import FormField         from '../../components/ui/FormField';
import useApi            from '../../hooks/useApi';
import useForm           from '../../hooks/useForm';
import { admissionService, courseService } from '../../services';
import downloadPdf       from '../../utils/downloadPdf';
import '../admin/Portal.css';

function StudentAdmission() {
  const [applyOpen,    setApplyOpen]    = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [downloading,  setDownloading]  = useState(null); // admission id being downloaded

  const { data, loading, error, refetch } = useApi(
    () => admissionService.getAll(),
    { initialData: { admissions: [] } }
  );

  const { data: coursesData } = useApi(
    () => courseService.getAll({ published: true }),
    { initialData: { courses: [] } }
  );

  const admissions = data?.admissions || [];
  const courses    = coursesData?.courses || [];

  // ── Download admission letter ──────────────────────────
  const handleDownloadLetter = async (admission) => {
    setDownloading(admission._id);
    try {
      const res = await admissionService.downloadLetter(admission._id);
      downloadPdf(
        res.data,
        `Apex-Tech-Admission-Letter-${admission.admissionNumber}.pdf`
      );
    } catch (err) {
      setAlert({ type: 'error', msg: 'Failed to download admission letter. Please try again.' });
    } finally {
      setDownloading(null);
    }
  };

  // ── Apply form ─────────────────────────────────────────
  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { courseId: '', statement: '' },
    validate: (v) => {
      const e = {};
      if (!v.courseId)         e.courseId  = 'Please select a course.';
      if (!v.statement.trim()) e.statement = 'Please write a brief statement.';
      return e;
    },
    onSubmit: async (vals) => {
      await admissionService.apply(vals);
      setAlert({ type: 'success', msg: 'Application submitted! The admin will review it shortly.' });
      setApplyOpen(false);
      reset();
      refetch();
    },
  });

  const statusColor = { Pending: 'warning', Approved: 'success', Rejected: 'error' };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Admission</h1>
        <p className="portal-page__subtitle">
          Your admission records and official admission letters.
        </p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setApplyOpen(true)}>+ Apply for Course</Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading admissions..." />
      ) : admissions.length === 0 ? (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>📋</div>
          <p className="portal-empty__title">No admission records</p>
          <p className="portal-empty__text">
            Apply for a course to get started. The admin will review your application.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {admissions.map((a) => (
            <div key={a._id} style={{ maxWidth: 680 }}>
              <div style={{
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
              }}>
                {/* Header stripe */}
                <div style={{
                  background: 'var(--gradient-primary)',
                  padding: 'var(--space-xl)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎓</div>
                  <h2 style={{
                    color: 'var(--color-text-light)',
                    fontWeight: 'var(--font-weight-extrabold)',
                    fontSize: 'var(--font-size-xl)',
                    marginBottom: 'var(--space-xs)',
                  }}>
                    {a.applicationStatus === 'Approved'
                      ? 'Admission Confirmed'
                      : `Application ${a.applicationStatus}`
                    }
                  </h2>
                  <p style={{ color: 'rgba(249,250,251,0.7)', fontSize: 'var(--font-size-sm)' }}>
                    Apex Tech Academy
                  </p>
                </div>

                {/* Details */}
                <div style={{ padding: 'var(--space-xl)' }}>
                  {[
                    { label: 'Admission Number', value: a.admissionNumber || '—' },
                    { label: 'Course',           value: a.course?.title || '—' },
                    { label: 'Application Date', value: new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    { label: 'Admission Date',   value: a.admissionDate ? new Date(a.admissionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                    { label: 'Status',           value: a.applicationStatus },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-md) 0',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                        {row.label}
                      </span>
                      {row.label === 'Status' ? (
                        <span className={`badge badge--${statusColor[row.value]}`}>
                          {row.value}
                        </span>
                      ) : (
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                          {row.value}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Download button — only for approved admissions */}
                  {a.applicationStatus === 'Approved' && (
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                      <Button
                        fullWidth
                        loading={downloading === a._id}
                        onClick={() => handleDownloadLetter(a)}
                      >
                        Download Admission Letter (PDF)
                      </Button>
                      <p style={{
                        textAlign: 'center',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                        marginTop: 'var(--space-sm)',
                      }}>
                        Official admission letter for {a.course?.title}
                      </p>
                    </div>
                  )}

                  {/* Pending message */}
                  {a.applicationStatus === 'Pending' && (
                    <div style={{
                      marginTop: 'var(--space-lg)',
                      padding: 'var(--space-md)',
                      background: 'var(--color-warning-bg)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid var(--color-warning)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                    }}>
                      Your application is under review. You will be notified once a decision is made.
                    </div>
                  )}

                  {/* Rejected message */}
                  {a.applicationStatus === 'Rejected' && (
                    <div style={{
                      marginTop: 'var(--space-lg)',
                      padding: 'var(--space-md)',
                      background: 'var(--color-error-bg)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid var(--color-error)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {a.notes
                        ? `Feedback: ${a.notes}`
                        : 'Your application was not successful this time. You may apply for another course.'
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="Apply for Course Admission"
        footer={
          <>
            <Button variant="ghost" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit}>Submit Application</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField
            label="Course *"
            name="courseId"
            type="select"
            value={values.courseId}
            onChange={handleChange}
            error={errors.courseId}
            required
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </FormField>
          <FormField
            label="Personal Statement *"
            name="statement"
            type="textarea"
            rows={5}
            value={values.statement}
            onChange={handleChange}
            error={errors.statement}
            required
            placeholder="Tell us why you want to take this course and what you hope to achieve..."
          />
        </div>
      </Modal>
    </div>
  );
}

export default StudentAdmission;
