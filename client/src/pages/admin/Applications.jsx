import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { admissionService } from '../../services';
import './Portal.css';

const statusColor = { Pending: 'warning', Approved: 'success', Rejected: 'error' };

function AdminApplications() {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [reviewModal,  setReviewModal]  = useState(null); // { admission, action }
  const [notes,        setNotes]        = useState('');
  const [saving,       setSaving]       = useState(false);
  const [alert,        setAlert]        = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => admissionService.getAll(),
    { initialData: { admissions: [] } }
  );

  const admissions = data?.admissions || [];

  const filtered = admissions.filter((a) => {
    const name = `${a.student?.firstName} ${a.student?.lastName} ${a.student?.email}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.applicationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleReview = async () => {
    if (!reviewModal) return;
    setSaving(true);
    try {
      await admissionService.review(reviewModal.admission._id, {
        status: reviewModal.action,
        notes,
      });
      setAlert({ type: 'success', msg: `Application ${reviewModal.action.toLowerCase()} successfully.` });
      setReviewModal(null);
      setNotes('');
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'student',   label: 'Applicant',       render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
    { key: 'course',    label: 'Course Applied',   render: (v) => v?.title || '—' },
    { key: 'createdAt', label: 'Date',             render: (v) => new Date(v).toLocaleDateString() },
    { key: 'applicationStatus', label: 'Status',   render: (v) => <span className={`badge badge--${statusColor[v]}`}>{v}</span> },
    { key: 'actions',   label: 'Actions',          render: (_, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        {row.applicationStatus === 'Pending' && <>
          <button className="btn btn--primary btn--sm" onClick={() => { setReviewModal({ admission: row, action: 'Approved' }); setNotes(''); }}>Approve</button>
          <button className="btn btn--danger  btn--sm" onClick={() => { setReviewModal({ admission: row, action: 'Rejected' }); setNotes(''); }}>Reject</button>
        </>}
        {row.applicationStatus !== 'Pending' && <button className="btn btn--ghost btn--sm">View</button>}
      </div>
    )},
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Applications</h1>
        <p className="portal-page__subtitle">Review and process admission applications.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search applicants..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {['All','Pending','Approved','Rejected'].map((s) => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading applications..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No applications found." />
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={reviewModal?.action === 'Approved' ? 'Approve Application' : 'Reject Application'}
        footer={<>
          <Button variant="ghost" onClick={() => setReviewModal(null)}>Cancel</Button>
          <Button
            variant={reviewModal?.action === 'Approved' ? 'primary' : 'danger'}
            loading={saving}
            onClick={handleReview}
          >
            Confirm {reviewModal?.action}
          </Button>
        </>}
      >
        <p style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Applicant: <strong>{reviewModal?.admission?.student?.firstName} {reviewModal?.admission?.student?.lastName}</strong><br />
          Course: <strong>{reviewModal?.admission?.course?.title}</strong>
        </p>
        {reviewModal?.action === 'Approved' && (
          <p style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-success-bg)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)' }}>
            ✓ Approving will generate an admission number and automatically enroll the student.
          </p>
        )}
        <FormField label="Admin Notes (optional)" name="notes" type="textarea" rows={3}
          value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes or rejection reason..." />
      </Modal>
    </div>
  );
}

export default AdminApplications;
