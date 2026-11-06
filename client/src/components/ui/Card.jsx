import React from 'react';
import './Card.css';

/**
 * Card — reusable card container
 *
 * Props:
 *   variant  — 'default' | 'elevated' | 'outlined' | 'dark'
 *   padding  — 'sm' | 'md' | 'lg' | 'none'
 *   hover    — bool (adds hover lift effect)
 *   className, children
 */
function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'card',
    `card--${variant}`,
    `card--pad-${padding}`,
    hover ? 'card--hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`card__header ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`card__body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`card__footer ${className}`}>{children}</div>;
}

export default Card;
