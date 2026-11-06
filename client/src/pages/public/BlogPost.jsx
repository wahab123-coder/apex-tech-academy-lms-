import React from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert          from '../../components/ui/Alert';
import Icon           from '../../components/common/Icons';
import useApi         from '../../hooks/useApi';
import { blogService } from '../../services';
import './BlogPost.css';

function BlogPost() {
  const { slug } = useParams();

  const { data, loading, error } = useApi(
    () => blogService.getBySlug(slug),
    { initialData: { post: null }, deps: [slug] }
  );

  const post = data?.post || null;

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner size="lg" label="Loading article..." />
    </div>
  );

  if (error || !post) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-xl)' }}>
      <Alert type="error">Article not found.</Alert>
      <Link to="/blog" className="btn btn--outline btn--md">Back to Blog</Link>
    </div>
  );

  return (
    <div className="blog-post-page">

      {/* ── Hero ── */}
      <section className="blog-post__hero">
        <div className="blog-post__hero-bg" />
        <div className="container blog-post__hero-inner">
          {/* Breadcrumb */}
          <nav className="blog-post__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <span>{post.title}</span>
          </nav>

          {/* Category badge */}
          {post.category && (
            <span className="badge badge--primary blog-post__category">{post.category}</span>
          )}

          {/* Title */}
          <h1 className="blog-post__title">{post.title}</h1>

          {/* Meta */}
          <div className="blog-post__meta">
            {post.author && (
              <div className="blog-post__author">
                <div className="blog-post__author-avatar">
                  {post.author.firstName?.[0]}{post.author.lastName?.[0]}
                </div>
                <div>
                  <p className="blog-post__author-name">
                    {post.author.firstName} {post.author.lastName}
                  </p>
                </div>
              </div>
            )}
            <div className="blog-post__meta-items">
              {post.publishedAt && (
                <span className="blog-post__meta-item">
                  <Icon name="events" size={14} />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              {post.readTime && (
                <span className="blog-post__meta-item">
                  <Icon name="clock" size={14} />
                  {post.readTime}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container blog-post__body">
        <div className="blog-post__main">

          {/* Excerpt */}
          {post.excerpt && (
            <p className="blog-post__excerpt">{post.excerpt}</p>
          )}

          {/* Article content */}
          <div className="blog-post__content">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="blog-post__tags">
              <span className="blog-post__tags-label">Tags:</span>
              {post.tags.map((tag) => (
                <span key={tag} className="badge badge--muted">{tag}</span>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="blog-post__back">
            <Link to="/blog" className="btn btn--outline btn--md">
              <Icon name="chevronLeft" size={16} />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="blog-post__sidebar">
          <div className="blog-post__sidebar-card">
            <h3 className="blog-post__sidebar-title">About the Author</h3>
            {post.author ? (
              <div className="blog-post__sidebar-author">
                <div className="blog-post__author-avatar blog-post__author-avatar--lg">
                  {post.author.firstName?.[0]}{post.author.lastName?.[0]}
                </div>
                <h4>{post.author.firstName} {post.author.lastName}</h4>
                {post.author.bio && <p>{post.author.bio}</p>}
              </div>
            ) : (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Apex Tech Academy Team
              </p>
            )}
          </div>

          <div className="blog-post__sidebar-card">
            <h3 className="blog-post__sidebar-title">Ready to Learn?</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 'var(--line-height-relaxed)' }}>
              Explore our courses and start your tech career today.
            </p>
            <Link to="/courses" className="btn btn--primary btn--sm" style={{ width: '100%', justifyContent: 'center' }}>
              View Courses
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BlogPost;
