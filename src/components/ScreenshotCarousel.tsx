'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const SCREENS = [
  { src: '/images/screenshots/Capture d\'écran 1.png', alt: 'Route de progression' },
  { src: '/images/screenshots/Capture d\'écran 2.png', alt: 'Panneaux routiers' },
  { src: '/images/screenshots/Capture d\'écran 3.png', alt: 'Mode Turbo' },
  { src: '/images/screenshots/Capture d\'écran 4.png', alt: 'Mode Turbo en jeu' },
  { src: '/images/screenshots/Capture d\'écran 5.png', alt: 'Profil et progression' },
];

export default function ScreenshotCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % SCREENS.length), []);
  const prev = () => setCurrent(c => (c - 1 + SCREENS.length) % SCREENS.length);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 860, margin: '0 auto' }}>
      {/* Main image */}
      <div style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #2A3550',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        aspectRatio: '16/9',
        background: '#0F1923',
      }}>
        {SCREENS.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === current ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              style={{ objectFit: 'cover' }}
              priority={i === 0}
            />
          </div>
        ))}

        {/* Left arrow */}
        <button
          onClick={prev}
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(10,14,42,0.7)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, zIndex: 10, backdropFilter: 'blur(4px)',
          }}
        >
          ‹
        </button>

        {/* Right arrow */}
        <button
          onClick={next}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(10,14,42,0.7)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, zIndex: 10, backdropFilter: 'blur(4px)',
          }}
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {SCREENS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? '#4ecdc4' : 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Caption */}
      <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'Nunito, sans-serif' }}>
        {SCREENS[current].alt}
      </p>
    </div>
  );
}
