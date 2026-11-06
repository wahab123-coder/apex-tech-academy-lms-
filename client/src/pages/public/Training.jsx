import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import './Training.css';

const programs = [
  {
    icon: '🌐', title: 'Web Development Bootcamp', duration: '3 months', mode: 'Online / Physical',
    description: 'An intensive, hands-on bootcamp covering front-end, back-end and database development.',
    outcomes: ['Build full-stack applications', 'Deploy to the cloud', 'Work with REST APIs', 'Version control with Git'],
    price: '$499',
  },
  {
    icon: '🛡️', title: 'Cybersecurity Program', duration: '4 months', mode: 'Online',
    description: 'Deep dive into ethical hacking, penetration testing and enterprise security architecture.',
    outcomes: ['Penetration testing techniques', 'Network security analysis', 'Security auditing', 'Incident response'],
    price: '$599',
  },
  {
    icon: '📊', title: 'Data Analytics Program', duration: '3 months', mode: 'Online / Physical',
    description: 'Learn to collect, clean, analyse and visualise data for business decision-making.',
    outcomes: ['Python & SQL for data', 'Data visualisation with Power BI', 'Statistical analysis', 'Business intelligence'],
    price: '$449',
  },
  {
    icon: '📱', title: 'Mobile App Development', duration: '4 months', mode: 'Online',
    description: 'Build iOS and Android apps using React Native with real-world deployments.',
    outcomes: ['React Native fundamentals', 'State management', 'App Store deployment', 'Firebase integration'],
    price: '$549',
  },
  {
    icon: '☁️', title: 'Cloud & DevOps Engineering', duration: '5 months', mode: 'Online',
    description: 'Master cloud infrastructure, containerisation and automated CI/CD pipelines.',
    outcomes: ['AWS / Azure fundamentals', 'Docker & Kubernetes', 'CI/CD with GitHub Actions', 'Infrastructure as Code'],
    price: '$699',
  },
  {
    icon: '🎨', title: 'UI/UX Design Bootcamp', duration: '3 months', mode: 'Online / Physical',
    description: 'Learn user-centred design and turn ideas into stunning, usable interfaces.',
    outcomes: ['Design thinking process', 'Figma mastery', 'User research & testing', 'Design systems'],
    price: '$399',
  },
];

function Training() {
  return (
    <div className="training-page">
      <PageHeader
        dark
        title="Training Programs"
        subtitle="Structured, career-focused learning paths designed to take you from zero to job-ready."
      />

      <section className="section">
        <div className="container">
          <div className="training-grid">
            {programs.map((p) => (
              <div key={p.title} className="training-card">
                <div className="training-card__header">
                  <span className="training-card__icon">{p.icon}</span>
                  <div>
                    <h3 className="training-card__title">{p.title}</h3>
                    <div className="training-card__meta">
                      <span>⏱ {p.duration}</span>
                      <span>🖥 {p.mode}</span>
                    </div>
                  </div>
                </div>
                <p className="training-card__desc">{p.description}</p>
                <ul className="training-card__outcomes">
                  {p.outcomes.map((o) => (
                    <li key={o}>
                      <span aria-hidden="true">✓</span> {o}
                    </li>
                  ))}
                </ul>
                <div className="training-card__footer">
                  <span className="training-card__price">{p.price}</span>
                  <Link to="/register" className="btn btn--primary btn--sm">Enroll Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Training */}
      <section className="section section--alt">
        <div className="container text-center">
          <span className="section-heading__tag">For Organisations</span>
          <h2 className="section-heading__title" style={{ marginTop: 'var(--space-sm)' }}>Corporate Training</h2>
          <div className="divider" />
          <p className="section-heading__subtitle">
            We offer customised training programs for companies looking to upskill their teams
            in modern technology stacks.
          </p>
          <Link to="/contact" className="btn btn--primary btn--lg" style={{ marginTop: 'var(--space-xl)' }}>
            Request Corporate Training
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Training;
