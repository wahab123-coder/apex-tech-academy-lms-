import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { projectService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'title',    label: 'Project Title' },
  { key: 'student',  label: 'Student',  render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'course',   label: 'Course',   render: (v) => v?.title || '—' },
  { key: 'tags',     label: 'Tags',     render: (v) => (v || []).map(t => <span key={t} className="badge badge--primary" style={{ marginRight: 4 }}>{t}</span>) },
  { key: 'status',   label: 'Status',   render: (v) => <span className={`badge badge--${v === 'Published' ? 'success' : v === 'Rejected' ? 'error' : 'warning'}`}>{v}</span> },
  { key: 'actions',  label: 'Actions',  render: (_, row) => (
    <div style={{ display: 'flex', gap: 6 }}>
      {row.status === 'Review' && (
        <button className="btn btn--primary btn--sm" onClick={() => {}}>Publish</button>
      )}
      <button className="btn btn--ghost btn--sm">View</button>
    </div>
  )},
];

function AdminProjects() {
  const [search, setSearch] = useState('');
  const [alert,  setAlert]  = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => projectService.getAll(),
    { initialData: { projects: [] } }
  );

  const projects = data?.projects || [];
  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = async (id) => {
    try {
      await projectService.publish(id);
      setAlert({ type: 'success', msg: 'Project published.' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Projects</h1>
        <p className="portal-page__subtitle">Review and publish student projects.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search projects..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading projects..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No projects found." />
      )}
    </div>
  );
}

export default AdminProjects;
