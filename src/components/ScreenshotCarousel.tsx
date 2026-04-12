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
// Center image: width 65% of container, so left edge at 17.5%, right edge at 82.5%
const IMG_W = 65; // % of container
const SIDE_OFFSET = 90; // % of image width — how far side images slide

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

  // Compute circular position relative to current: -1, 0, 1, or hidden
  const getPos = (idx: number): number => {
    let pos = idx - current;
    if (pos > N / 2) pos -= N;
    if (pos < -N / 2) pos += N;
    return pos;
  };

  return (
    <div style={{ width: '100%', fontFamily: 'Nunito, sans-serif', border: 'none', outline: 'none' }}>

      {/* ── Track ── */}
      <div style={{ position: 'relative', width: '100%', height: 480, overflow: 'hidden', border: 'none', outline: 'none', background: 'transparent', clipPath: 'inset(0)' }}>

        {SCREENS.map((s, i) => {
          const pos = getPos(i);
          const isCenter = pos === 0;
          const isVisible = Math.abs(pos) <= 1;

          return (
            <div
              key={i}
              onClick={() => isVisible && !isCenter && go(pos > 0 ? 1 : -1)}
              style={{
                position: 'absolute',
                top: 0,
                height: '100%',
                width: `${IMG_W}%`,
                left: '50%',
                // translateX(-50%) centers the image, then offset by pos * SIDE_OFFSET% of its own width
                transform: `translateX(calc(-50% + ${pos * SIDE_OFFSET}%)) scale(${isCenter ? 1 : 0.82})`,
                opacity: isVisible ? (isCenter ? 1 : 0.35) : 0,
                filter: isCenter ? 'none' : 'blur(3px)',
                zIndex: isCenter ? 2 : 1,
                transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: isVisible && !isCenter ? 'pointer' : 'default',
                pointerEvents: isVisible ? 'auto' : 'none',
              }}
            >
              <Image
                src={s.src}
                alt={s.label}
                fill
                style={{ objectFit: 'cover', objectPosition: '30% center' }}
                priority={i === 0}
              />
            </div>
          );
        })}

        {/* ── Left arrow — inside left edge of center image ── */}
        <button
          onClick={() => go(-1)}
          style={{
            position: 'absolute',
            left: `calc(${(100 - IMG_W) / 2}% + 14px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'rgba(10,14,42,0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 24,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ‹
        </button>

        {/* ── Right arrow — inside right edge of center image ── */}
        <button
          onClick={() => go(1)}
          style={{
            position: 'absolute',
            right: `calc(${(100 - IMG_W) / 2}% + 14px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'rgba(10,14,42,0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: 24,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ›
        </button>
      </div>

      {/* ── Dots ── */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
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
              transition: 'all 0.35s ease',
            }}
          />
        ))}
      </div>

      {/* ── Caption ── */}
      <p style={{
        textAlign: 'center',
        marginTop: 10,
        fontSize: 13,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.4)',
        minHeight: 20,
        transition: 'opacity 0.3s',
      }}>
        {SCREENS[current].label}
      </p>
    </div>
  );
}
