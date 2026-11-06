import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../common/Icons';
import './CourseCard.css';

/**
 * CourseCard — displays a course in card format for public and portal use
 *
 * Props:
 *   course — { _id, title, description, instructor, duration, level, thumbnail, price }
 *   linkTo — string (navigation target, defaults to /courses/:id)
 */
function CourseCard({ course = {}, linkTo }) {
  const {
    _id,
    title       = 'Course Title',
    description = '',
    instructor  = '',
    duration    = '',
    level       = 'Beginner',
    thumbnail   = null,
    price       = null,
  } = course;

  // Default linkTo is the course detail page
  const destination = linkTo || (_id ? `/courses/${_id}` : '/courses');

  const levelColors = {
    Beginner:     'success',
    Intermediate: 'warning',
    Advanced:     'error',
  };

  return (
    <div className="course-card">
      {/* Thumbnail */}
      <Link to={destination} className="course-card__thumb-link">
        <div className="course-card__thumb">
          {thumbnail ? (
            <img src={thumbnail} alt={title} loading="lazy" />
          ) : (
            <div className="course-card__thumb-placeholder">
              <Icon name="courses" size={40} color="var(--color-primary)" />
            </div>
          )}
          <span className={`badge badge--${levelColors[level] || 'primary'} course-card__level`}>
            {level}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="course-card__body">
        <Link to={destination} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="course-card__title">{title}</h3>
        </Link>
        {description && (
          <p className="course-card__desc">{description}</p>
        )}
        <div className="course-card__meta">
          {instructor && (
            <span className="course-card__meta-item">
              <Icon name="users" size={13} color="var(--color-text-muted)" />
              {instructor}
            </span>
          )}
          {duration && (
            <span className="course-card__meta-item">
              <Icon name="clock" size={13} color="var(--color-text-muted)" />
              {duration}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="course-card__footer">
        {price !== null && (
          <span className="course-card__price">
            {price === 0 ? 'Free' : `$${price}`}
          </span>
        )}
        <Link to={destination} className="btn btn--primary btn--sm">
          View Course
        </Link>
      </div>
    </div>
  );
}

export default CourseCard;
