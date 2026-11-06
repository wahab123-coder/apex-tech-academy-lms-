import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon           from '../../components/common/Icons';
import { courseService, blogService, eventService, projectService } from '../../services';
import './Search.css';

const TABS = ['All', 'Courses', 'Blog', 'Events', 'Projects'];

function SearchResult({ type, item }) {
  const typeConfig = {
    course:  { color: 'primary',  label: 'Course',  link: `/courses/${item._id}` },
    blog:    { color: 'info',     label: 'Article', link: `/blog/${item.slug}` },
    event:   { color: 'success',  label: 'Event',   link: '/events' },
    project: { color: 'warning',  label: 'Project', link: '/projects' },
  };

  const cfg = typeConfig[type] || typeConfig.course;

  const title = item.title || item.name || '—';
  const desc  = item.description || item.excerpt || item.bio || '';

  return (
    <Link to={cfg.link} className="search-result">
      <div className="search-result__top">
        <span className={`badge badge--${cfg.color}`}>{cfg.label}</span>
        {type === 'course' && item.level && (
          <span className="badge badge--muted">{item.level}</span>
        )}
      </div>
      <h3 className="search-result__title">{title}</h3>
      {desc && (
        <p className="search-result__desc">
          {desc.length > 150 ? desc.slice(0, 150) + '…' : desc}
        </p>
      )}
      <div className="search-result__meta">
        {type === 'course' && item.instructor && (
          <span>
            <Icon name="users" size={13} />
            {item.instructor.firstName} {item.instructor.lastName}
          </span>
        )}
        {type === 'course' && item.duration && (
          <span><Icon name="clock" size={13} /> {item.duration}</span>
        )}
        {type === 'blog' && item.author && (
          <span>
            <Icon name="users" size={13} />
            {item.author.firstName} {item.author.lastName}
          </span>
        )}
        {type === 'event' && item.date && (
          <span>
            <Icon name="events" size={13} />
            {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {type === 'project' && item.student && (
          <span>
            <Icon name="users" size={13} />
            {item.student.firstName} {item.student.lastName}
          </span>
        )}
      </div>
    </Link>
  );
}

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query,        setQuery]        = useState(searchParams.get('q') || '');
  const [inputValue,   setInputValue]   = useState(searchParams.get('q') || '');
  const [activeTab,    setActiveTab]    = useState('All');
  const [results,      setResults]      = useState({ courses: [], blog: [], events: [], projects: [] });
  const [loading,      setLoading]      = useState(false);
  const [searched,     setSearched]     = useState(false);

  // Run search when query changes
  useEffect(() => {
    if (!query.trim()) { setResults({ courses: [], blog: [], events: [], projects: [] }); setSearched(false); return; }

    setLoading(true);
    setSearched(true);
    const q = query.toLowerCase();

    Promise.all([
      courseService.getAll({ published: true }).catch(() => ({ data: { courses: [] } })),
      blogService.getAll().catch(() => ({ data: { posts: [] } })),
      eventService.getAll().catch(() => ({ data: { events: [] } })),
      projectService.getAll().catch(() => ({ data: { projects: [] } })),
    ]).then(([coursesRes, blogRes, eventsRes, projectsRes]) => {
      const courses  = (coursesRes.data?.courses  || []).filter((c) =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
      const blog = (blogRes.data?.posts || []).filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
      const events = (eventsRes.data?.events || []).filter((e) =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.type?.toLowerCase().includes(q)
      );
      const projects = (projectsRes.data?.projects || []).filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
      setResults({ courses, blog, events, projects });
    }).finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputValue);
    setSearchParams({ q: inputValue });
    setActiveTab('All');
  };

  const total = results.courses.length + results.blog.length + results.events.length + results.projects.length;

  // Filter results by active tab
  const getVisible = () => {
    switch (activeTab) {
      case 'Courses':  return results.courses.map((i)  => ({ type: 'course',  item: i }));
      case 'Blog':     return results.blog.map((i)     => ({ type: 'blog',    item: i }));
      case 'Events':   return results.events.map((i)   => ({ type: 'event',   item: i }));
      case 'Projects': return results.projects.map((i) => ({ type: 'project', item: i }));
      default: return [
        ...results.courses.map((i)  => ({ type: 'course',  item: i })),
        ...results.blog.map((i)     => ({ type: 'blog',    item: i })),
        ...results.events.map((i)   => ({ type: 'event',   item: i })),
        ...results.projects.map((i) => ({ type: 'project', item: i })),
      ];
    }
  };

  const visible = getVisible();

  return (
    <div className="search-page">
      {/* Hero search bar */}
      <section className="search-hero">
        <div className="container">
          <h1 className="search-hero__title">Search Apex Tech Academy</h1>
          <p className="search-hero__subtitle">Find courses, articles, events and student projects</p>
          <form onSubmit={handleSearch} className="search-hero__form">
            <div className="search-hero__input-wrap">
              <Icon name="courses" size={18} color="var(--color-text-muted)" />
              <input
                type="search"
                className="search-hero__input"
                placeholder="Search courses, blog posts, events..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn--primary btn--lg">Search</button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="section">
        <div className="container">
          {loading && <LoadingSpinner label="Searching..." />}

          {!loading && searched && (
            <>
              {/* Result count */}
              <p className="search-count">
                {total === 0
                  ? `No results found for "${query}"`
                  : `${total} result${total !== 1 ? 's' : ''} for "${query}"`
                }
              </p>

              {total > 0 && (
                <>
                  {/* Tab filters */}
                  <div className="search-tabs">
                    {TABS.map((tab) => {
                      const count = tab === 'All' ? total
                        : tab === 'Courses'  ? results.courses.length
                        : tab === 'Blog'     ? results.blog.length
                        : tab === 'Events'   ? results.events.length
                        : results.projects.length;

                      return (
                        <button
                          key={tab}
                          className={`search-tab ${activeTab === tab ? 'active' : ''}`}
                          onClick={() => setActiveTab(tab)}
                          disabled={count === 0 && tab !== 'All'}
                        >
                          {tab}
                          {count > 0 && <span className="search-tab__count">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Results list */}
                  <div className="search-results">
                    {visible.length === 0 ? (
                      <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-xl) 0' }}>
                        No {activeTab.toLowerCase()} results for this search.
                      </p>
                    ) : (
                      visible.map(({ type, item }) => (
                        <SearchResult key={`${type}-${item._id}`} type={type} item={item} />
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {!loading && !searched && (
            <div className="search-suggestions">
              <h2 className="search-suggestions__title">Popular searches</h2>
              <div className="search-suggestions__tags">
                {['Web Development', 'Cybersecurity', 'Python', 'React', 'Data Science', 'Mobile App'].map((s) => (
                  <button
                    key={s}
                    className="search-suggestion-tag"
                    onClick={() => { setInputValue(s); setQuery(s); setSearchParams({ q: s }); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Search;
