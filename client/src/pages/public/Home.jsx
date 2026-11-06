import React from 'react';
import { Link } from 'react-router-dom';
import CourseCard     from '../../components/ui/CourseCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import GallerySlider  from '../../components/common/GallerySlider';
import Icon           from '../../components/common/Icons';
import useApi         from '../../hooks/useApi';
import { courseService } from '../../services';
import './Home.css';

const stats = [
  { value: '500+', label: 'Students Trained' },
  { value: '20+',  label: 'Expert Instructors' },
  { value: '15+',  label: 'Courses Available' },
  { value: '95%',  label: 'Employment Rate' },
];

const benefits = [
  { icon: 'certificate', title: 'Industry-Certified Courses',  desc: 'Curriculum designed by professionals and aligned with industry standards.' },
  { icon: 'projects',    title: 'Hands-On Projects',           desc: 'Build real projects that go straight into your portfolio.' },
  { icon: 'star',        title: 'Accredited Certificates',     desc: 'Earn certificates recognised by top employers.' },
  { icon: 'users',       title: 'Career Support',              desc: 'Job placement assistance, CV reviews and interview coaching.' },
  { icon: 'training',    title: 'Online & In-Person',          desc: 'Flexible learning modes designed around your schedule.' },
  { icon: 'message',     title: 'Peer Community',              desc: 'Join a thriving network of learners and alumni.' },
];

const trainingPrograms = [
  { icon: 'courses',  title: 'Web Development Bootcamp',  duration: '3 months', mode: 'Online / Physical' },
  { icon: 'training', title: 'Cybersecurity Program',     duration: '4 months', mode: 'Online' },
  { icon: 'blog',     title: 'Data Analytics Program',    duration: '3 months', mode: 'Online / Physical' },
  { icon: 'projects', title: 'Mobile App Development',    duration: '4 months', mode: 'Online' },
];

function Home() {
  const { data, loading } = useApi(
    () => courseService.getAll({ published: true }),
    { initialData: { courses: [] } }
  );
  const featuredCourses = (data?.courses || []).slice(0, 3);

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg-grid" aria-hidden="true" />
        <div className="hero__bg-dots"  aria-hidden="true" />
        <div className="container hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            Next cohort starts soon — Apply now
          </div>
          <h1 className="hero__title">
            Learn Today.<br />
            <span className="hero__title--accent">Build Tomorrow.</span>
          </h1>
          <p className="hero__subtitle">
            Apex Tech Academy offers world-class technology training programs that transform
            passionate learners into industry-ready professionals.
          </p>
          <div className="hero__actions">
            <Link to="/register" className="btn btn--primary btn--lg">
              Get Started — It's Free
            </Link>
            <Link to="/courses" className="btn btn--outline btn--lg hero__outline-btn">
              Explore Courses
            </Link>
          </div>
          <div className="hero__trust">
            <div className="hero__trust-avatars">
              {['J','A','F','Z','E'].map((l, i) => (
                <div key={i} className="hero__trust-avatar" style={{ zIndex: 5 - i }}>{l}</div>
              ))}
            </div>
            <p className="hero__trust-text">Joined by <strong>500+ students</strong> across Nigeria</p>
          </div>
        </div>
        <div className="hero__scroll-indicator" aria-hidden="true"><span /></div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar__grid">
            {stats.map((s) => (
              <div key={s.label} className="stats-bar__item">
                <span className="stats-bar__value">{s.value}</span>
                <span className="stats-bar__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">Our Courses</span>
            <h2 className="section-heading__title">Start Learning Today</h2>
            <div className="divider" />
            <p className="section-heading__subtitle">
              Choose from our wide range of technology courses built for the modern job market.
            </p>
          </div>
          {loading ? (
            <LoadingSpinner label="Loading courses..." />
          ) : (
            <div className="grid-3">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={{
                    ...course,
                    instructor: course.instructor
                      ? `${course.instructor.firstName} ${course.instructor.lastName}`
                      : '',
                  }}
                />
              ))}
            </div>
          )}
          <div className="home__view-all">
            <Link to="/courses" className="btn btn--outline btn--md">
              View All Courses
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Apex Tech ── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">Why Choose Us</span>
            <h2 className="section-heading__title">The Apex Advantage</h2>
            <div className="divider" />
            <p className="section-heading__subtitle">
              We don't just teach technology — we transform careers.
            </p>
          </div>
          <div className="grid-3">
            {benefits.map((b) => (
              <div key={b.title} className="benefit-card">
                <div className="benefit-card__icon">
                  <Icon name={b.icon} size={26} color="var(--color-primary)" />
                </div>
                <h3 className="benefit-card__title">{b.title}</h3>
                <p className="benefit-card__desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Training Programs ── */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">Training Programs</span>
            <h2 className="section-heading__title">Structured Learning Paths</h2>
            <div className="divider" />
            <p className="section-heading__subtitle">
              Intensive programs designed to take you from beginner to job-ready.
            </p>
          </div>
          <div className="grid-4">
            {trainingPrograms.map((p) => (
              <div key={p.title} className="program-card">
                <div className="program-card__icon">
                  <Icon name={p.icon} size={28} color="var(--color-primary)" />
                </div>
                <h3 className="program-card__title">{p.title}</h3>
                <div className="program-card__meta-list">
                  <span className="program-card__meta">
                    <Icon name="clock" size={13} /> {p.duration}
                  </span>
                  <span className="program-card__meta">
                    <Icon name="courses" size={13} /> {p.mode}
                  </span>
                </div>
                <Link to="/training" className="program-card__link">
                  Learn more <Icon name="arrow" size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery Slideshow ── */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">Life at Apex Tech</span>
            <h2 className="section-heading__title">Our Campus & Community</h2>
            <div className="divider" />
            <p className="section-heading__subtitle">
              A glimpse into learning, growth and celebration at Apex Tech Academy.
            </p>
          </div>
        </div>
        <GallerySlider />
        <div className="container">
          <div className="home__view-all">
            <Link to="/gallery" className="btn btn--outline btn--md">
              View Full Gallery <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2 className="cta-banner__title">Ready to Start Your Tech Journey?</h2>
            <p className="cta-banner__subtitle">
              Join hundreds of students who have transformed their careers with Apex Tech Academy.
            </p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/register" className="btn btn--primary btn--lg">Apply Now</Link>
            <Link to="/contact"  className="btn btn--outline btn--lg cta-banner__outline">Contact Us</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
