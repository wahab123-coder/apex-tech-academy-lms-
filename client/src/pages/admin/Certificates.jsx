import React, { useState } from 'react';
import Table            from '../../components/ui/Table';
import Alert            from '../../components/ui/Alert';
import Button           from '../../components/ui/Button';
import LoadingSpinner   from '../../components/ui/LoadingSpinner';
import Modal            from '../../components/ui/Modal';
import FormField        from '../../components/ui/FormField';
import PdfPreviewModal  from '../../components/common/PdfPreviewModal';
import useApi           from '../../hooks/useApi';
import useForm          from '../../hooks/useForm';
import { certificateService, userService, courseService, enrollmentService } from '../../services';
import './Portal.css';

function AdminCertificates() {
  const [search,       setSearch]       = useState('');
  const [issueOpen,    setIssueOpen]    = useState(false);
  const [preview,      setPreview]      = useState(null);
  const [alert,        setAlert]        = useState(null);
  const [eligibility,  setEligibility]  = useState(null); // result of eligibility check
  const [checking,     setChecking]     = useState(false);

  const { data, loading, error, refetch } = useApi(
    () => certificateService.getAll(),
    { initialData: { certificates: [] } }
  );

  const { data: studentsData }    = useApi(() => userService.getAll({ role: 'student', limit: 100 }), { initialData: { users: [] } });
  const { data: coursesData }     = useApi(() => courseService.getAll({ published: 'all' }),           { initialData: { courses: [] } });
  const { data: enrollmentsData } = useApi(() => enrollmentService.getAll(),                           { initialData: { enrollments: [] } });

  const certificates = data?.certificates     || [];
  const students     = studentsData?.users    || [];
  const courses      = coursesData?.courses   || [];
  const enrollments  = enrollmentsData?.enrollments || [];

  const filtered = certificates.filter((c) =>
    `${c.student?.firstName} ${c.student?.lastName} ${c.certificateId}`.toLowerCase()
      .includes(search.toLowerCase())
  );

  // ── Issue certificate form ────────────────────────────
  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset, setValues } = useForm({
    initialValues: { studentId: '', courseId: '', grade: 'Pass' },
    validate: (v) => {
      const e = {};
      if (!v.studentId) e.studentId = 'Select a student.';
      if (!v.courseId)  e.courseId  = 'Select a course.';
      return e;
    },
    onSubmit: async (vals) => {
      // Must have passed eligibility check first
      if (!eligibility?.eligible) {
        setApiError('Please check eligibility first before issuing a certificate.');
        return;
      }

      const enrollment = enrollments.find(
        (e) =>
          (e.student?._id === vals.studentId || e.student === vals.studentId) &&
          (e.course?._id  === vals.courseId  || e.course  === vals.courseId)
      );

      await certificateService.issue({
        studentId:    vals.studentId,
        courseId:     vals.courseId,
        enrollmentId: enrollment?._id,
        grade:        vals.grade,
      });

      setAlert({ type: 'success', msg: `Certificate issued successfully. Student will receive it by email.` });
      setIssueOpen(false);
      setEligibility(null);
      reset();
      refetch();
    },
  });

  // Check eligibility when both student and course are selected
  const handleCheckEligibility = async () => {
    if (!values.studentId || !values.courseId) {
      setApiError('Please select both a student and a course first.');
      return;
    }
    setChecking(true);
    setEligibility(null);
    setApiError('');
    try {
      const res = await certificateService.checkEligibility(values.studentId, values.courseId);
      setEligibility(res.data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setChecking(false);
    }
  };

  // Reset eligibility when student or course changes
  const handleFormChange = (e) => {
    handleChange(e);
    setEligibility(null);
    setApiError('');
  };

  const columns = [
    {
      key: 'certificateId',
      label: 'Certificate ID',
      render: (v) => (
        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)' }}>
          {v}
        </span>
      ),
    },
    {
      key: 'student',
      label: 'Student',
      render: (v) => v ? `${v.firstName} ${v.lastName}` : '—',
    },
    {
      key: 'course',
      label: 'Course',
      render: (v) => v?.title || '—',
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (v) => v
        ? <span className="badge badge--success">{v}</span>
        : <span className="badge badge--muted">N/A</span>,
    },
    {
      key: 'issuedAt',
      label: 'Issue Date',
      render: (v) => v
        ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`badge badge--${v === 'Issued' ? 'success' : 'warning'}`}>{v}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {row.status === 'Issued' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreview({
                id:          row._id,
                certId:      row.certificateId,
                studentName: `${row.student?.firstName} ${row.student?.lastName}`,
              })}
            >
              Preview PDF
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Certificates</h1>
        <p className="portal-page__subtitle">
          Issue certificates only after confirming 100% course completion.
        </p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input
            className="portal-search"
            type="search"
            placeholder="Search by student or certificate ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => { setIssueOpen(true); setEligibility(null); reset(); }}>
            + Issue Certificate
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading certificates..." />
      ) : (
        <Table columns={columns} data={filtered} emptyMsg="No certificates issued yet." />
      )}

      {/* ── Issue Certificate Modal ── */}
      <Modal
        isOpen={issueOpen}
        onClose={() => { setIssueOpen(false); setEligibility(null); reset(); }}
        title="Issue Certificate"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setIssueOpen(false); setEligibility(null); reset(); }}>
              Cancel
            </Button>
            <Button
              loading={saving}
              onClick={handleSubmit}
              disabled={!eligibility?.eligible}
              title={!eligibility?.eligible ? 'Check eligibility first' : 'Issue certificate'}
            >
              Issue Certificate
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}

          {/* Step 1 — Select student and course */}
          <div style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            borderLeft: '4px solid var(--color-primary)',
          }}>
            <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 1 — Select Student & Course
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <FormField
                label="Student *"
                name="studentId"
                type="select"
                value={values.studentId}
                onChange={handleFormChange}
                error={errors.studentId}
                required
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstName} {s.lastName} — {s.email}
                  </option>
                ))}
              </FormField>
              <FormField
                label="Course *"
                name="courseId"
                type="select"
                value={values.courseId}
                onChange={handleFormChange}
                error={errors.courseId}
                required
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </FormField>
            </div>
          </div>

          {/* Step 2 — Check eligibility */}
          <div style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            borderLeft: `4px solid ${eligibility ? (eligibility.eligible ? 'var(--color-success)' : 'var(--color-error)') : 'var(--color-border)'}`,
          }}>
            <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 2 — Verify Completion
            </p>

            <Button
              size="sm"
              variant="outline"
              loading={checking}
              onClick={handleCheckEligibility}
              disabled={!values.studentId || !values.courseId}
            >
              Check Course Completion
            </Button>

            {/* Eligibility result */}
            {eligibility && (
              <div style={{
                marginTop: 'var(--space-md)',
                padding: 'var(--space-md)',
                background: eligibility.eligible ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${eligibility.eligible ? 'var(--color-success)' : 'var(--color-error)'}`,
              }}>
                <p style={{
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--font-size-sm)',
                  color: eligibility.eligible ? 'var(--color-success)' : 'var(--color-error)',
                  marginBottom: 'var(--space-xs)',
                }}>
                  {eligibility.eligible ? '✓ Eligible for Certificate' : '✕ Not Eligible'}
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  {eligibility.reason}
                </p>
                {eligibility.totalLessons > 0 && (
                  <div style={{ marginTop: 'var(--space-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      <span>Course Progress</span>
                      <span>{eligibility.completedLessons} / {eligibility.totalLessons} lessons ({eligibility.progress}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(0,0,0,0.1)', borderRadius: 99 }}>
                      <div style={{
                        height: '100%',
                        width: `${eligibility.progress}%`,
                        background: eligibility.eligible ? 'var(--color-success)' : 'var(--color-error)',
                        borderRadius: 99,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )}
                {eligibility.completedAt && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>
                    Completed on: {new Date(eligibility.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 3 — Grade (only shown when eligible) */}
          {eligibility?.eligible && (
            <div style={{
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              borderLeft: '4px solid var(--color-success)',
            }}>
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-success)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Step 3 — Set Grade
              </p>
              <FormField
                label="Grade"
                name="grade"
                type="select"
                value={values.grade}
                onChange={handleChange}
              >
                <option value="Pass">Pass</option>
                <option value="Merit">Merit</option>
                <option value="Distinction">Distinction</option>
                <option value="First Class">First Class</option>
              </FormField>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>
                The certificate and grade will be sent to the student's email automatically.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* ── PDF Preview Modal ── */}
      <PdfPreviewModal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title={`Certificate — ${preview?.studentName || ''}`}
        filename={`Apex-Tech-Certificate-${preview?.certId || ''}.pdf`}
        fetchPdf={() => certificateService.download(preview?.id)}
      />
    </div>
  );
}

export default AdminCertificates;
