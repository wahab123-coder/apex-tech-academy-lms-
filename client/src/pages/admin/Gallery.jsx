import React, { useState, useRef } from 'react';
import Button         from '../../components/ui/Button';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { galleryService } from '../../services';
import './Portal.css';

const gradients = [
  'linear-gradient(135deg,#0a0f1e,#1a2a4a)',
  'linear-gradient(135deg,#0d1f3c,#7c3aed33)',
  'linear-gradient(135deg,#00d4ff22,#0a0f1e)',
  'linear-gradient(135deg,#1a2a4a,#00d4ff22)',
];

function AdminGallery() {
  const [selected,  setSelected]  = useState([]);
  const [alert,     setAlert]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data, loading, error, refetch } = useApi(
    () => galleryService.getAllAdmin(),
    { initialData: { items: [] } }
  );
  const items = data?.items || [];

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('title', file.name.replace(/\.[^.]+$/, ''));
        fd.append('category', 'Other');
        await galleryService.upload(fd);
      }
      setAlert({ type: 'success', msg: `${files.length} image(s) uploaded.` });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      await Promise.all(selected.map((id) => galleryService.remove(id)));
      setAlert({ type: 'success', msg: `${selected.length} item(s) deleted.` });
      setSelected([]);
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Gallery</h1>
        <p className="portal-page__subtitle">Upload and manage gallery images.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          {selected.length > 0 && (
            <span className="badge badge--info">{selected.length} selected</span>
          )}
        </div>
        <div className="section-toolbar__right">
          {selected.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete Selected</Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <Button size="sm" loading={uploading} onClick={() => fileInputRef.current?.click()}>
            + Upload Images
          </Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading gallery..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
          {items.map((item, i) => (
            <div
              key={item._id}
              onClick={() => toggle(item._id)}
              style={{
                height: 180, borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                position: 'relative', display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-end', padding: 'var(--space-sm)',
                border: selected.includes(item._id) ? '2px solid var(--color-primary)' : '2px solid transparent',
                background: item.imageUrl && !item.imageUrl.startsWith('/uploads')
                  ? `url(${item.imageUrl}) center/cover` : gradients[i % gradients.length],
                transition: 'border-color var(--transition-fast)',
              }}
            >
              {selected.includes(item._id) && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 24, height: 24, background: 'var(--color-primary)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--color-bg-dark)',
                  fontWeight: 'bold', fontSize: 14,
                }}>✓</div>
              )}
              <div style={{
                background: 'rgba(10,15,30,0.7)', padding: 'var(--space-sm)',
                borderRadius: 'var(--radius-md)',
              }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', marginBottom: 4 }}>
                  {item.title}
                </p>
                <span className="badge badge--primary">{item.category}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p style={{ gridColumn: '1/-1', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
              No images uploaded yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminGallery;
