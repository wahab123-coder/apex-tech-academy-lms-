import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import api            from '../../services/api';
import './Portal.css';

const typeIcon = { PDF: '📄', Video: '🎬', Notes: '📝', Link: '🔗' };

const columns = [
  { key: 'title',      label: 'Title' },
  { key: 'course',     label: 'Course',     render: (v) => v?.title || '—' },
  { key: 'lesson',     label: 'Lesson',     render: (v) => v?.title || '—' },
  { key: 'type',       label: 'Type',       render: (v) => <span>{typeIcon[v]} {v}</span> },
  { key: 'uploadedBy', label: 'Instructor', render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'createdAt',  label: 'Uploaded',   render: (v) => new Date(v).toLocaleDateString() },
  { key: 'actions',    label: 'Actions',    render: (_, row) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <a href={`/api/materials/${row._id}/download`} className="btn btn--ghost btn--sm" target="_blank" rel="noopener noreferrer">Download</a>
    </div>
  )},
];

function AdminMaterials() {
  const [search, setSearch] = useState('');

  // Fetch all lessons and then materials per lesson would be complex;
  // use a flat admin endpoint pattern instead
  const { data, loading, error } = useApi(
    () => api.get('/lessons').then(async (r) => {
      // Collect materials for first 20 lessons
      const lessonIds = (r.data?.lessons || []).slice(0, 20).map(l => l._id);
      const all = await Promise.all(
        lessonIds.map(id => api.get(`/materials?lessonId=${id}`).then(res => res.data?.materials || []).catch(() => []))
      );
      return { materials: all.flat() };
    }),
    { initialData: { materials: [] } }
  );

  const materials = data?.materials || [];
  const filtered  = materials.filter((m) =>
    `${m.title} ${m.course?.title}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Learning Materials</h1>
        <p className="portal-page__subtitle">Overview of all uploaded course materials.</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search materials..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading materials..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No materials found." />
      )}
    </div>
  );
}

export default AdminMaterials;
