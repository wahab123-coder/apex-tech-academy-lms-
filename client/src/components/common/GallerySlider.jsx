import React, { useState, useEffect, useRef, useCallback } from 'react';
import useApi from '../../hooks/useApi';
import { galleryService } from '../../services';
import Icon from './Icons';
import './GallerySlider.css';

/**
 * GallerySlider
 * Auto-sliding gallery that pulls real images from the API.
 * Falls back to beautiful gradient cards when no real images exist.
 */

// Fallback slides used when no images are in the database
const FALLBACK_SLIDES = [
  {
    id: 1, title: 'Web Development Bootcamp',
    subtitle: 'Students building real-world applications',
    category: 'Classes',
    gradient: 'linear-gradient(135deg, #0a0f1e 0%, #1a2a4a 60%, #0d2a4a 100%)',
    accent: '#00d4ff',
  },
  {
    id: 2, title: 'Graduation Ceremony 2026',
    subtitle: 'Celebrating the achievement of our graduates',
    category: 'Ceremonies',
    gradient: 'linear-gradient(135deg, #0d1f3c 0%, #1a0a2e 60%, #2a0a3e 100%)',
    accent: '#7c3aed',
  },
  {
    id: 3, title: 'Tech Career Fair',
    subtitle: 'Connecting students with top tech employers',
    category: 'Events',
    gradient: 'linear-gradient(135deg, #0a1a0f 0%, #0a2a1a 60%, #0a3a20 100%)',
    accent: '#10b981',
  },
  {
    id: 4, title: 'Cybersecurity Workshop',
    subtitle: 'Hands-on penetration testing and security training',
    category: 'Workshops',
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #2a0f0f 60%, #1a1a0a 100%)',
    accent: '#f59e0b',
  },
  {
    id: 5, title: 'Certificate Presentation',
    subtitle: 'Recognising excellence in our student community',
    category: 'Ceremonies',
    gradient: 'linear-gradient(135deg, #0a0f1e 0%, #0d2040 60%, #1a3050 100%)',
    accent: '#00d4ff',
  },
  {
    id: 6, title: 'Data Science Lab',
    subtitle: 'Exploring machine learning and data analytics',
    category: 'Classes',
    gradient: 'linear-gradient(135deg, #0f0a1e 0%, #1a0d3c 60%, #0d1a3c 100%)',
    accent: '#7c3aed',
  },
];

function GallerySlider() {
  const [current,   setCurrent]   = useState(0);
  const [isPaused,  setIsPaused]  = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);

  const { data } = useApi(
    () => galleryService.getAll(),
    { initialData: { items: [] } }
  );

  // Build slides: use real images if available, else fallback
  const realItems = (data?.items || []).filter(
    (i) => i.imageUrl
  );

  const slides = realItems.length >= 3
    ? realItems.map((item, idx) => ({
        id:       item._id,
        title:    item.title,
        subtitle: item.category,
        category: item.category,
        imageUrl: item.imageUrl,
        altText:  item.altText || item.title,
        gradient: FALLBACK_SLIDES[idx % FALLBACK_SLIDES.length].gradient,
        accent:   FALLBACK_SLIDES[idx % FALLBACK_SLIDES.length].accent,
      }))
    : FALLBACK_SLIDES;

  const total = slides.length;

  const goTo = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((index + total) % total);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (isPaused) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(next, 4500);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, next]);

  return (
    <div
      className="gallery-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Gallery slideshow"
      role="region"
    >
      {/* Slides */}
      <div className="gallery-slider__track">
        {slides.map((slide, i) => {
          const offset = (i - current + total) % total;
          let pos = 'hidden';
          if (offset === 0)                     pos = 'active';
          else if (offset === 1)                pos = 'next';
          else if (offset === total - 1)        pos = 'prev';

          return (
            <div
              key={slide.id}
              className={`gallery-slide gallery-slide--${pos}`}
              aria-hidden={pos !== 'active'}
            >
              {/* Background */}
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.altText || slide.title}
                  className="gallery-slide__img"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div
                  className="gallery-slide__bg"
                  style={{ background: slide.gradient }}
                >
                  {/* Decorative elements */}
                  <div className="gallery-slide__circle"
                    style={{ background: `${slide.accent}15`, border: `1px solid ${slide.accent}30` }} />
                  <div className="gallery-slide__circle gallery-slide__circle--sm"
                    style={{ background: `${slide.accent}10`, border: `1px solid ${slide.accent}20` }} />
                  <div className="gallery-slide__grid" />
                </div>
              )}

              {/* Overlay */}
              <div className="gallery-slide__overlay" />

              {/* Content */}
              <div className="gallery-slide__content">
                <span
                  className="gallery-slide__category"
                  style={{ color: slide.accent, borderColor: `${slide.accent}40`, background: `${slide.accent}15` }}
                >
                  {slide.category}
                </span>
                <h3 className="gallery-slide__title">{slide.title}</h3>
                <p className="gallery-slide__subtitle">{slide.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <button
        className="gallery-slider__arrow gallery-slider__arrow--prev"
        onClick={prev}
        aria-label="Previous slide"
      >
        <Icon name="chevronLeft" size={22} />
      </button>
      <button
        className="gallery-slider__arrow gallery-slider__arrow--next"
        onClick={next}
        aria-label="Next slide"
      >
        <Icon name="chevronRight" size={22} />
      </button>

      {/* Dots */}
      <div className="gallery-slider__dots" role="tablist">
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            className={`gallery-slider__dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="gallery-slider__progress">
        <div
          className="gallery-slider__progress-bar"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          key={current}
        />
      </div>
    </div>
  );
}

export default GallerySlider;
