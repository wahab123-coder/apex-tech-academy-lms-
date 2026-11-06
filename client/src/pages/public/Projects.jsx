import React, { useState } from 'react';
import PageHeader     from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert          from '../../components/ui/Alert';
import Icon           from '../../components/common/Icons';
import useApi         from '../../hooks/useApi';
import { projectService } from '../../services';
import './Projects.css';

function Projects() {
  const [activeTag, setActiveTag] = useState('All');

  const { data, loading, error, refetch } = useApi(
    () => projectService.getAll(),
    { initialData: { projects: [] } }
  );

  const projects = data?.projects || [];
  const allTags  = ['All', ...new Set(projects.flatMap((p) => p.tags || []))];
  const filtered = activeTag === 'All'
    ? projects
    : projects.filter((p) => p.tags?.includes(activeTag));

  return (
    <div className="projects-page">
      <PageHeader
        dark
        title="Student Projects"
        subtitle="Real-world projects built by our students during their training programs."
      />

      <section className="section">
        <div className="container">
          {loading && <LoadingSpinner label="Loading projects..." />}
          {error   && <Alert type="error" onClose={refetch}>Failed to load projects.</Alert>}

          {!loading && !error && (
            <>
              {allTags.length > 1 && (
                <div className="projects-filters">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className={`filter-btn ${activeTag === tag ? 'active' : ''}`}
                      onClick={() => setActiveTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
                  No projects available yet.
                </p>
              ) : (
                <div className="projects-grid">
                  {filtered.map((p) => (
                    <div key={p._id} className="project-card">
                      <div className="project-card__image">
                        <span>{p.title?.[0]}</span>
                      </div>
                      <div className="project-card__body">
                        <h3 className="project-card__title">{p.title}</h3>
                        <p className="project-card__desc">{p.description}</p>
                        <div className="project-card__tags">
                          {p.tags?.map((tag) => (
                            <span key={tag} className="badge badge--primary">{tag}</span>
                          ))}
                        </div>
                        <div className="project-card__meta">
                          {p.student && (
                            <span className="project-card__meta-item">
                              <Icon name="users" size={13} />
                              {p.student.firstName} {p.student.lastName}
                            </span>
                          )}
                          {p.publishedAt && (
                            <span className="project-card__meta-item">
                              <Icon name="events" size={13} />
                              {new Date(p.publishedAt).getFullYear()}
                            </span>
                          )}
                        </div>
                        <div className="project-card__actions">
                          {p.liveUrl && (
                            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                              className="btn btn--primary btn--sm">
                              Live Demo <Icon name="arrow" size={13} />
                            </a>
                          )}
                          {p.repoUrl && (
                            <a href={p.repoUrl} target="_blank" rel="noopener noreferrer"
                              className="btn btn--outline btn--sm">
                              Repository
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Projects;
