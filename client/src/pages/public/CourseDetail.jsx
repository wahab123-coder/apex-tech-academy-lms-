import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert          from '../../components/ui/Alert';
import Button         from '../../components/ui/Button';
import Icon           from '../../components/common/Icons';
import useApi         from '../../hooks/useApi';
import { courseService, curriculumService } from '../../services';
import { useAuth }    from '../../context/AuthContext';
import './CourseDetail.css';

const LEVEL_COLOR = { Beginner: 'success', Intermediate: 'warning', Advanced: 'error' };
const TYPE_ICON   = { lecture: '📖', practical: '💻', assignment: '📌', quiz: '✏️', project: '🔧' };

function CourseDetail() {
  const { id }        = useParams();
  const { isAuthenticated, isStudent } = useAuth();
  const navigate      = useNavigate();
  const [openWeeks,   setOpenWeeks] = useState([0]); // first week open by default

  const { data: courseData, loading: cl, error: ce } = useApi(
    () => courseService.getById(id),
    { initialData: { course: null }, deps: [id] }
  );

  const { data: currData, loading: curl } = useApi(
    () => curriculumService.getByCourse(id),
    { initialData: { curriculum: null }, deps: [id] }
  );

  const course     = courseData?.course     || null;
  const curriculum = currData?.curriculum   || null;
  const loading    = cl || curl;

  const toggleWeek = (i) =>
    setOpenWeeks((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  const totalTopics = curriculum?.weeks?.reduce((s, w) => s + (w.topics?.length || 0), 0) || 0;

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/register');
    } else {
      navigate('/student/admission');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner size="lg" label="Loading course..." />
    </div>
  );

  if (ce || !course) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <Alert type="error">Course not found or failed to load.</Alert>
      <Link to="/courses" className="btn btn--outline btn--md">Back to Courses</Link>
    </div>
  );

  return (
    <div className="course-detail">

      {/* ── Hero ── */}
      <section className="course-detail__hero">
        <div className="course-detail__hero-bg" />
        <div className="container course-detail__hero-inner">
          <div className="course-detail__hero-content">
            {/* Breadcrumb */}
            <nav className="course-detail__breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/courses">Courses</Link>
              <span>/</span>
              <span>{course.title}</span>
            </nav>

            {/* Badges */}
            <div className="course-detail__badges">
              <span className={`badge badge--${LEVEL_COLOR[course.level] || 'primary'}`}>
                {course.level}
              </span>
              {course.category && (
                <span className="badge badge--info">{course.category}</span>
              )}
            </div>

            <h1 className="course-detail__title">{course.title}</h1>
            <p className="course-detail__desc">{course.description}</p>

            {/* Meta */}
            <div className="course-detail__meta">
              {course.instructor && (
                <span className="course-detail__meta-item">
                  <Icon name="users" size={15} />
                  {course.instructor.firstName} {course.instructor.lastName}
                </span>
              )}
              {course.duration && (
                <span className="course-detail__meta-item">
                  <Icon name="clock" size={15} />
                  {course.duration}
                </span>
              )}
              {curriculum && (
                <span className="course-detail__meta-item">
                  <Icon name="courses" size={15} />
                  {curriculum.weeks?.length || 0} weeks · {totalTopics} topics
                </span>
              )}
              {course.totalStudents > 0 && (
                <span className="course-detail__meta-item">
                  <Icon name="users" size={15} />
                  {course.totalStudents} students enrolled
                </span>
              )}
            </div>
          </div>

          {/* Enroll card */}
          <div className="course-detail__enroll-card">
            <div className="course-detail__price">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </div>
            <Button fullWidth size="lg" onClick={handleEnroll}>
              {isAuthenticated ? 'Apply for Admission' : 'Enroll Now'}
            </Button>
            {!isAuthenticated && (
              <p className="course-detail__login-hint">
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
              </p>
            )}
            <div className="course-detail__includes">
              <p className="course-detail__includes-title">This course includes:</p>
              <ul>
                {[
                  `${curriculum?.weeks?.length || 0} weeks of structured content`,
                  `${totalTopics} lessons and topics`,
                  curriculum?.totalHours ? `${curriculum.totalHours} of learning` : 'Hands-on projects',
                  'Certificate of completion',
                  'Instructor support',
                ].map((item, i) => (
                  <li key={i}>
                    <Icon name="check" size={14} color="var(--color-success)" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="container course-detail__body">
        <div className="course-detail__main">

          {/* Overview */}
          {curriculum?.overview && (
            <section className="course-detail__section">
              <h2 className="course-detail__section-title">Course Overview</h2>
              <p className="course-detail__overview-text">{curriculum.overview}</p>
            </section>
          )}

          {/* Curriculum */}
          {curriculum && curriculum.weeks?.length > 0 && (
            <section className="course-detail__section">
              <h2 className="course-detail__section-title">
                Course Curriculum
                <span className="course-detail__section-sub">
                  {curriculum.weeks.length} weeks · {totalTopics} topics
                  {curriculum.totalHours && ` · ${curriculum.totalHours}`}
                </span>
              </h2>

              <div className="curriculum-accordion">
                {[...curriculum.weeks]
                  .sort((a, b) => a.weekNumber - b.weekNumber)
                  .map((week, i) => (
                    <div key={week._id} className="curriculum-accordion__week">
                      {/* Week header — clickable */}
                      <button
                        className={`curriculum-accordion__header ${openWeeks.includes(i) ? 'open' : ''}`}
                        onClick={() => toggleWeek(i)}
                        aria-expanded={openWeeks.includes(i)}
                      >
                        <div className="curriculum-accordion__header-left">
                          <span className="curriculum-accordion__week-num">
                            Week {week.weekNumber}
                          </span>
                          <span className="curriculum-accordion__week-title">
                            {week.title}
                          </span>
                        </div>
                        <div className="curriculum-accordion__header-right">
                          <span className="curriculum-accordion__count">
                            {week.topics?.length || 0} topics
                          </span>
                          <svg
                            className="curriculum-accordion__chevron"
                            width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </button>

                      {/* Topics — shown when open */}
                      {openWeeks.includes(i) && (
                        <div className="curriculum-accordion__body">
                          {week.description && (
                            <p className="curriculum-accordion__week-desc">
                              {week.description}
                            </p>
                          )}
                          {week.topics?.map((topic, ti) => (
                            <div key={topic._id} className="curriculum-accordion__topic">
                              <div className="curriculum-accordion__topic-left">
                                <span className="curriculum-accordion__topic-icon">
                                  {TYPE_ICON[topic.type] || '📖'}
                                </span>
                                <span className="curriculum-accordion__topic-title">
                                  {topic.title}
                                </span>
                              </div>
                              <div className="curriculum-accordion__topic-right">
                                {topic.type && (
                                  <span className="curriculum-accordion__topic-type">
                                    {topic.type}
                                  </span>
                                )}
                                {topic.duration && (
                                  <span className="curriculum-accordion__topic-duration">
                                    {topic.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {week.topics?.length === 0 && (
                            <p style={{ padding: 'var(--space-md)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                              Topics will be published soon.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Instructor */}
          {course.instructor && (
            <section className="course-detail__section">
              <h2 className="course-detail__section-title">Your Instructor</h2>
              <div className="course-detail__instructor">
                <div className="course-detail__instructor-avatar">
                  {course.instructor.firstName?.[0]}{course.instructor.lastName?.[0]}
                </div>
                <div>
                  <h3 className="course-detail__instructor-name">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </h3>
                  {course.instructor.bio && (
                    <p className="course-detail__instructor-bio">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Tags */}
          {course.tags?.length > 0 && (
            <section className="course-detail__section">
              <h2 className="course-detail__section-title">Topics Covered</h2>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                {course.tags.map((tag) => (
                  <span key={tag} className="badge badge--primary" style={{ fontSize: 'var(--font-size-sm)', padding: '6px 14px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar CTA (sticky on desktop) */}
        <aside className="course-detail__sidebar">
          <div className="course-detail__sidebar-card">
            <div className="course-detail__price">{course.price === 0 ? 'Free' : `$${course.price}`}</div>
            <Button fullWidth size="lg" onClick={handleEnroll}>
              {isAuthenticated ? 'Apply for Admission' : 'Enroll Now'}
            </Button>
            {!isAuthenticated && (
              <p className="course-detail__login-hint">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            )}
            <div className="course-detail__includes">
              <p className="course-detail__includes-title">Includes:</p>
              <ul>
                {[
                  curriculum?.totalHours ? `${curriculum.totalHours} of content` : null,
                  `${curriculum?.weeks?.length || 0} weeks structured`,
                  'Certificate on completion',
                  'Instructor support',
                  'Lifetime access',
                ].filter(Boolean).map((item, i) => (
                  <li key={i}>
                    <Icon name="check" size={14} color="var(--color-success)" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CourseDetail;
