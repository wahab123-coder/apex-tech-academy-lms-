import React, { useState } from 'react';
import Table            from '../../components/ui/Table';
import Alert            from '../../components/ui/Alert';
import Button           from '../../components/ui/Button';
import LoadingSpinner   from '../../components/ui/LoadingSpinner';
import PdfPreviewModal  from '../../components/common/PdfPreviewModal';
import useApi           from '../../hooks/useApi';
import { admissionService } from '../../services';
import './Portal.css';

function AdminAdmissions() {
  const [search,   setSearch]   = useState('');
  const [preview,  setPreview]  = useState(null); // { id, admissionNumber, studentName }
  const [alert,    setAlert]    = useState(null);

  const { data, loading, error } = useApi(
    () => admissionService.getAll(),
    { initialData: { admissions: [] } }
  );

  const admissions = data?.admissions || [];
  const approved   = admissions.filter((a) => a.applicationStatus === 'Approved');

  const filtered = approved.filter((a) => {
    const name = `${a.student?.firstName} ${a.student?.lastName} ${a.admissionNumber}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const columns = [
    {
      key: 'admissionNumber',
      label: 'Admission No.',
      render: (v) => (
        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)' }}>
          {v || '—'}
        </span>
      ),
    },
    {
      key: 'student',
      label: 'Student Name',
      render: (v) => v ? `${v.firstName} ${v.lastName}` : '—',
    },
    {
      key: 'course',
      label: 'Course',
      render: (v) => v?.title || '—',
    },
    {
      key: 'admissionDate',
      label: 'Admission Date',
      render: (v) => v
        ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
    },
    {
      key: 'applicationStatus',
      label: 'Status',
      render: (v) => (
        <span className={`badge badge--${v === 'Approved' ? 'success' : v === 'Rejected' ? 'error' : 'warning'}`}>
          {v}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreview({
              id:            row._id,
              admissionNumber: row.admissionNumber,
              studentName:   `${row.student?.firstName} ${row.student?.lastName}`,
            })}
          >
            Preview Letter
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Admissions</h1>
        <p className="portal-page__subtitle">
          Review and download official admission letters for approved students.
        </p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input
            className="portal-search"
            type="search"
            placeholder="Search by name or admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading admissions..." />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          emptyMsg="No approved admission records found."
        />
      )}

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title={`Admission Letter — ${preview?.studentName || ''}`}
        filename={`Apex-Tech-Admission-Letter-${preview?.admissionNumber || ''}.pdf`}
        fetchPdf={() => admissionService.downloadLetter(preview?.id)}
      />
    </div>
  );
}

export default AdminAdmissions;
