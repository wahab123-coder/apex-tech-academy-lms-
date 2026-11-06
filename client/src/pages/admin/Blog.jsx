import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { blogService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'title',       label: 'Title' },
  { key: 'author',      label: 'Author',      render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'category',    label: 'Category' },
  { key: 'publishedAt', label: 'Published',   render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  { key: 'isPublished', label: 'Status',      render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Published' : 'Draft'}</span> },
  { key: 'actions',     label: 'Actions',     render: (_, row) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn btn--ghost btn--sm">Edit</button>
      <button className="btn btn--danger btn--sm">Delete</button>
    </div>
  )},
];

const validate = (v) => {
  const e = {};
  if (!v.title.trim())   e.title   = 'Required';
  if (!v.content.trim()) e.content = 'Required';
  return e;
};

function AdminBlog() {
  const [search, setSearch] = useState('');
  const [open,   setOpen]   = useState(false);
  const [alert,  setAlert]  = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => blogService.getAll({ published: 'all' }),
    { initialData: { posts: [] } }
  );

  const posts    = data?.posts || [];
  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { title: '', category: 'Tech', excerpt: '', content: '', isPublished: false },
    validate,
    onSubmit: async (vals) => {
      await blogService.create({ ...vals, isPublished: vals.isPublished === true || vals.isPublished === 'true' });
      setAlert({ type: 'success', msg: `Post "${vals.title}" created.` });
      setOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Blog</h1>
        <p className="portal-page__subtitle">Create and manage blog posts and news articles.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search posts..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setOpen(true)}>+ New Post</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading posts..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No posts found." />
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="New Blog Post" size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Publish</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField label="Title"    name="title"    value={values.title}   onChange={handleChange} error={errors.title} required />
          <FormField label="Category" name="category" type="select" value={values.category} onChange={handleChange}>
            <option>Tech</option><option>Career</option><option>Security</option><option>Academy News</option>
          </FormField>
          <FormField label="Excerpt"  name="excerpt"  value={values.excerpt} onChange={handleChange} placeholder="Short summary..." />
          <FormField label="Content"  name="content"  type="textarea" rows={8} value={values.content} onChange={handleChange} error={errors.content} required />
        </div>
      </Modal>
    </div>
  );
}

export default AdminBlog;
