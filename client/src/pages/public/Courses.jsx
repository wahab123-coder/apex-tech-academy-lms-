import React, { useState } from 'react';
import CourseCard       from '../../components/ui/CourseCard';
import PageHeader       from '../../components/ui/PageHeader';
import LoadingSpinner   from '../../components/ui/LoadingSpinner';
import Alert            from '../../components/ui/Alert';
import useApi           from '../../hooks/useApi';
import { courseService } from '../../services';
import './Courses.css';

const categories = ['All', 'Web', 'Security', 'Data', 'Mobile', 'Cloud', 'Design'];
const levels     = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function Courses() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel,    setActiveLevel]    = useState('All');
  const [search,         setSearch]         = useState('');

  const { data, loading, error, refetch } = useApi(
    () => courseService.getAll({ published: true }),
    { initialData: { courses: [] } }
  );

  const courses = data?.courses || [];

  const filtered = courses.filter((c) => {
    const matchCat    = activeCategory === 'All' || c.category === activeCategory;
    const matchLevel  = activeLevel    === 'All' || c.level    === activeLevel;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  return (
    <div className="courses-page">
      <PageHeader
        dark
        title="Explore Our Courses"
        subtitle="Choose a course that fits your goals and start learning at your own pace."
      />

      {/* Filters */}
      <section className="courses-filters">
        <div className="container">
          <div className="courses-filters__row">
            <input
              type="search"
              className="courses-filters__search"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search courses"
            />
            <div className="courses-filters__group">
              <span className="courses-filters__label">Category:</span>
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
            <div className="courses-filters__group">
              <span className="courses-filters__label">Level:</span>
              {levels.map((lv) => (
                <button
                  key={lv}
                  className={`filter-btn ${activeLevel === lv ? 'active' : ''}`}
                  onClick={() => setActiveLevel(lv)}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <LoadingSpinner label="Loading courses..." />}

          {error && (
            <Alert type="error" onClose={refetch}>
              Failed to load courses. <button className="btn btn--ghost btn--sm" onClick={refetch}>Try again</button>
            </Alert>
          )}

          {!loading && !error && (
            <>
              <p className="courses-count">
                Showing <strong>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}
              </p>

              {filtered.length > 0 ? (
                <div className="grid-3">
                  {filtered.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={{
                        ...course,
                        instructor: course.instructor
                          ? `${course.instructor.firstName} ${course.instructor.lastName}`
                          : '',
                      }}
                      linkTo={`/courses/${course._id}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="courses-empty">
                  <p>No courses match your filters.</p>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => { setActiveCategory('All'); setActiveLevel('All'); setSearch(''); }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Courses;
