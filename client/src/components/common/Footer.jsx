import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icons';
import './Footer.css';

const footerLinks = {
  Academy: [
    { label: 'About Us',    to: '/about' },
    { label: 'Courses',     to: '/courses' },
    { label: 'Training',    to: '/training' },
    { label: 'Projects',    to: '/projects' },
  ],
  Resources: [
    { label: 'Blog',        to: '/blog' },
    { label: 'Events',      to: '/events' },
    { label: 'Gallery',     to: '/gallery' },
    { label: 'Contact',     to: '/contact' },
  ],
  Account: [
    { label: 'Register',          to: '/register' },
    { label: 'Login',             to: '/login' },
    { label: 'Student Portal',    to: '/student' },
    { label: 'Instructor Portal', to: '/instructor' },
  ],
};

const contactInfo = [
  { icon: 'location', text: 'Off Gambari Road, Ilorin, Kwara State, Nigeria' },
  { icon: 'phone',    text: '07064359797' },
  { icon: 'phone',    text: '07081721079' },
  { icon: 'email',    text: 'info@apextechacademy.com' },
  { icon: 'clock',    text: 'Mon – Fri: 8:00 AM – 6:00 PM' },
];

const socials = [
  { label: 'Twitter',   href: '#', letter: 'X' },
  { label: 'LinkedIn',  href: '#', letter: 'in' },
  { label: 'Instagram', href: '#', letter: 'IG' },
  { label: 'YouTube',   href: '#', letter: 'YT' },
];

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__top">
        <div className="container">
          <div className="footer__grid">

            {/* Brand */}
            <div className="footer__brand">
              <div className="footer__logo-row">
                <div className="footer__logo" aria-hidden="true"><span>A</span></div>
                <div>
                  <p className="footer__brand-name">Apex Tech Academy</p>
                  <p className="footer__tagline">Learn Today. Build Tomorrow.</p>
                </div>
              </div>
              <p className="footer__about">
                A professional technology academy offering world-class courses,
                training programs and career support for the modern workforce.
              </p>
              <div className="footer__socials">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} className="footer__social" aria-label={s.label}>
                    {s.letter}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading} className="footer__col">
                <h3 className="footer__col-heading">{heading}</h3>
                <ul className="footer__col-links">
                  {links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="footer__link">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div className="footer__col">
              <h3 className="footer__col-heading">Contact</h3>
              <ul className="footer__contact-list">
                {contactInfo.map((item, i) => (
                  <li key={i} className="footer__contact-item">
                    <span className="footer__contact-icon">
                      <Icon name={item.icon} size={14} />
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>&copy; {new Date().getFullYear()} Apex Tech Academy. All rights reserved.</p>
          <div className="footer__legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
