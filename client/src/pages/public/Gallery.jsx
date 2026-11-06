import React, { useState } from 'react';
import PageHeader     from '../../components/ui/PageHeader';
import GallerySlider  from '../../components/common/GallerySlider';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert          from '../../components/ui/Alert';
import useApi         from '../../hooks/useApi';
import { galleryService } from '../../services';
import './Gallery.css';

const categories = ['All', 'Classes', 'Events', 'Ceremonies', 'Workshops'];

const gradients = [
  'linear-gradient(135deg,#0a0f1e,#1a2a4a)',
  'linear-gradient(135deg,#0d1f3c,#2a1060)',
  'linear-gradient(135deg,#001a10,#003a20)',
  'linear-gradient(135deg,#1a0a0a,#3a1010)',
  'linear-gradient(135deg,#0a0f1e,#1a0a3c)',
  'linear-gradient(135deg,#0f1a0a,#203a10)',
];

function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox,       setLightbox]       = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => galleryService.getAll(),
    { initialData: { items: [] } }
  );

  const items = data?.items || [];
  const filtered = activeCategory === 'All'
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <div className="gallery-page">
      <PageHeader
        dark
        title="Gallery"
        subtitle="A glimpse into life at Apex Tech Academy — classes, events and celebrations."
      />

      {/* Featured slider at top */}
      <div className="gallery-page__slider">
        <GallerySlider />
      </div>

      {/* Grid section */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">All Photos</span>
            <h2 className="section-heading__title">Browse by Category</h2>
            <div className="divider" />
          </div>

          {/* Category filters */}
          <div className="gallery-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading && <LoadingSpinner label="Loading gallery..." />}

          {error && (
            <Alert type="error" onClose={refetch}>
              Failed to load gallery.{' '}
              <button className="btn btn--ghost btn--sm" onClick={refetch}>Try again</button>
            </Alert>
          )}

          {!loading && !error && (
            filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-4xl) 0', color: 'var(--color-text-muted)' }}>
                <p>No images in this category yet.</p>
              </div>
            ) : (
              <div className="gallery-grid">
                {filtered.map((item, i) => (
                  <button
                    key={item._id}
                    className="gallery-item"
                    style={
                      item.imageUrl
                        ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: gradients[i % gradients.length] }
                    }
                    onClick={() => setLightbox({ ...item, gradient: gradients[i % gradients.length] })}
                    aria-label={`View ${item.title}`}
                  >
                    <div className="gallery-item__overlay">
                      <p className="gallery-item__title">{item.title}</p>
                      <span className="badge badge--primary">{item.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="gallery-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
        >
          <div className="gallery-lightbox__content" onClick={(e) => e.stopPropagation()}>
            <div
              className="gallery-lightbox__image"
              style={
                lightbox.imageUrl
                  ? { backgroundImage: `url(${lightbox.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: lightbox.gradient }
              }
            />
            <div className="gallery-lightbox__info">
              <h3>{lightbox.title}</h3>
              <span className="badge badge--primary">{lightbox.category}</span>
            </div>
            <button className="gallery-lightbox__close" onClick={() => setLightbox(null)} aria-label="Close">
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
