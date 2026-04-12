'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const SCREENS = [
  { src: '/images/screenshots/screen1.png', label: 'Route de progression' },
  { src: '/images/screenshots/screen2.png', label: 'Panneaux routiers' },
  { src: '/images/screenshots/screen3.png', label: 'Mode Turbo' },
  { src: '/images/screenshots/screen4.png', label: 'Mode Turbo en jeu' },
  { src: '/images/screenshots/screen5.png', label: 'Profil et progression' },
];

const N = SCREENS.length;

export default function ScreenshotCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % N), 4000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const go = useCallback((dir: 1 | -1) => {
    setCurrent(c => (c + dir + N) % N);
    resetTimer();
  }, [resetTimer]);

  const arrowStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    [side]: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    background: 'rgba(10,14,42,0.65)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    fontSize: 26,
    padding: 0,
  });

  return (
    <div style={{ width: '100%', fontFamily: 'Nunito, sans-serif' }}>

      {/* Image frame — position: relative pour les flèches absolues */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 500,
        overflow: 'hidden',
        borderRadius: 12,
      }}>

        {/* Slide strip */}
        <div style={{
          display: 'flex',
          width: `${N * 100}%`,
          height: '100%',
          transform: `translateX(${-current * (100 / N)}%)`,
          transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {SCREENS.map((s, i) => (
            <div
              key={i}
              style={{
                width: `${100 / N}%`,
                height: '100%',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <Image
                src={s.src}
                alt={s.label}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center center' }}
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Flèche gauche — dans l'image */}
        <button onClick={() => go(-1)} style={arrowStyle('left')}>‹</button>

        {/* Flèche droite — dans l'image */}
        <button onClick={() => go(1)} style={arrowStyle('right')}>›</button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {SCREENS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? '#4ecdc4' : 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Caption */}
      <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: '10px 0 0', padding: 0 }}>
        {SCREENS[current].label}
      </p>
    </div>
  );
}
