import React, { useState } from 'react';
import { Link }       from 'react-router-dom';
import PageHeader     from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert          from '../../components/ui/Alert';
import Icon           from '../../components/common/Icons';
import useApi         from '../../hooks/useApi';
import { blogService } from '../../services';
import './Blog.css';

const categories = ['All', 'Career', 'Tech', 'Security'];

function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');

  const { data, loading, error, refetch } = useApi(
    () => blogService.getAll(),
    { initialData: { posts: [] } }
  );

  const posts = data?.posts || [];
  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="blog-page">
      <PageHeader
        dark
        title="Blog & News"
        subtitle="Insights, tutorials and career advice from the Apex Tech Academy team."
      />

      <section className="section">
        <div className="container">
          <div className="blog-filters">
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

          {loading && <LoadingSpinner label="Loading posts..." />}
          {error   && <Alert type="error" onClose={refetch}>Failed to load posts. <button className="btn btn--ghost btn--sm" onClick={refetch}>Retry</button></Alert>}

          {!loading && !error && (
            filtered.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
                No posts in this category yet.
              </p>
            ) : (
              <div className="blog-grid">
                {filtered.map((post) => (
                  <article key={post._id} className="blog-card">
                    <div className="blog-card__thumb">
                      <span className={`badge badge--primary blog-card__category`}>{post.category}</span>
                    </div>
                    <div className="blog-card__body">
                      <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h2 className="blog-card__title">{post.title}</h2>
                      </Link>
                      <p className="blog-card__excerpt">{post.excerpt}</p>
                      <div className="blog-card__meta">
                        {post.author && (
                          <span className="blog-card__meta-item">
                            <Icon name="users" size={13} />
                            {post.author.firstName} {post.author.lastName}
                          </span>
                        )}
                        <span className="blog-card__meta-item">
                          <Icon name="events" size={13} />
                          {formatDate(post.publishedAt)}
                        </span>
                        {post.readTime && (
                          <span className="blog-card__meta-item">
                            <Icon name="clock" size={13} />
                            {post.readTime}
                          </span>
                        )}
                      </div>
                      <Link to={`/blog/${post.slug}`} className="blog-card__read">
                        Read Article <Icon name="arrow" size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

export default Blog;
