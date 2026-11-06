import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Icon       from '../../components/common/Icons';
import useApi     from '../../hooks/useApi';
import teamService from '../../services/teamService';
import './About.css';

const values = [
  { icon: 'star',     title: 'Excellence',  desc: 'We hold ourselves and our students to the highest standards.' },
  { icon: 'check',    title: 'Integrity',   desc: 'Honesty and transparency in everything we do.' },
  { icon: 'training', title: 'Innovation',  desc: 'Continuously evolving our curriculum to stay ahead of the industry.' },
  { icon: 'users',    title: 'Inclusion',   desc: 'Technology education should be accessible to everyone.' },
];

function About() {
  const { data, loading } = useApi(
    () => teamService.getAll(),
    { initialData: { members: [] } }
  );
  const team = data?.members || [];

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="about">
      <PageHeader
        dark
        title="About Apex Tech Academy"
        subtitle="We are on a mission to make world-class technology education accessible and career-transforming."
      />

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="about__mission-grid">
            <div className="about__mission-text">
              <span className="section-heading__tag">Our Story</span>
              <h2 className="about__heading">Built by Technologists,<br />for Future Technologists</h2>
              <div className="divider" style={{ margin: 'var(--space-md) 0' }} />
              <p>
                Apex Tech Academy was founded with a simple but powerful belief: that anyone,
                regardless of background, can learn technology and build a meaningful career in it.
              </p>
              <p>
                We partner with industry professionals to design courses that are not just
                academically rigorous but practically applicable — because real learning happens
                when students build real things.
              </p>
              <p>
                From our first cohort to our growing community of graduates, our commitment has
                never wavered: to deliver the best technology education available.
              </p>
              <Link to="/register" className="btn btn--primary btn--md" style={{ marginTop: 'var(--space-lg)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Join the Academy <Icon name="arrow" size={16} />
              </Link>
            </div>

            <div className="about__mission-visual">
              <div className="about__visual-card">
                {[
                  { value: '500+', label: 'Graduates' },
                  { value: '15+',  label: 'Courses' },
                  { value: '95%',  label: 'Job Placement' },
                  { value: '20+',  label: 'Instructors' },
                ].map((s) => (
                  <div key={s.label} className="about__visual-stat">
                    <span className="about__visual-number">{s.value}</span>
                    <span className="about__visual-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">What We Stand For</span>
            <h2 className="section-heading__title">Our Core Values</h2>
            <div className="divider" />
          </div>
          <div className="grid-4">
            {values.map((v) => (
              <div key={v.title} className="value-card">
                <div className="value-card__icon">
                  <Icon name={v.icon} size={24} color="var(--color-primary)" />
                </div>
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">The People Behind Apex</span>
            <h2 className="section-heading__title">Meet Our Team</h2>
            <div className="divider" />
          </div>

          {loading ? (
            <LoadingSpinner label="Loading team..." />
          ) : team.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-2xl) 0' }}>
              Team information coming soon.
            </p>
          ) : (
            <div className="grid-4">
              {team.map((member) => (
                <div key={member._id} className="team-card">
                  <div className="team-card__avatar">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      getInitials(member.name)
                    )}
                  </div>
                  <h3 className="team-card__name">{member.name}</h3>
                  <p className="team-card__role">{member.role}</p>
                  {member.bio && <p className="team-card__bio">{member.bio}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section about__cta">
        <div className="container text-center">
          <h2 className="about__cta-title">Ready to Be Part of Our Story?</h2>
          <p className="about__cta-subtitle">
            Take the first step towards a rewarding technology career today.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn--primary btn--lg">Apply Now</Link>
            <Link to="/contact"  className="btn btn--outline btn--lg">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
