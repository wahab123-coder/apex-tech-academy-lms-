import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { assignmentService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'title',      label: 'Assignment' },
  { key: 'course',     label: 'Course',     render: (v) => v?.title || '—' },
  { key: 'createdBy',  label: 'Instructor', render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'dueDate',    label: 'Due Date',   render: (v) => new Date(v).toLocaleDateString() },
  { key: 'isPublished',label: 'Status',     render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Active' : 'Draft'}</span> },
  { key: 'actions',    label: 'Actions',    render: () => <button className="btn btn--ghost btn--sm">View</button> },
];

function AdminAssignments() {
  const [search, setSearch] = useState('');

  const { data, loading, error } = useApi(
    () => assignmentService.getAll(),
    { initialData: { assignments: [] } }
  );

  const assignments = data?.assignments || [];
  const filtered    = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Assignments</h1>
        <p className="portal-page__subtitle">Monitor assignments across all courses.</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search assignments..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading assignments..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No assignments found." />
      )}
    </div>
  );
}

export default AdminAssignments;
