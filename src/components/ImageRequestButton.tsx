'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'image_requests';
const VOTED_KEY = 'image_requests_voted';

function getRequests(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function getVoted(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(VOTED_KEY) || '{}'); } catch { return {}; }
}

export function recordImageRequest(id: string): boolean {
  const voted = getVoted();
  if (voted[id]) return false; // already voted
  const requests = getRequests();
  requests[id] = (requests[id] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  voted[id] = true;
  localStorage.setItem(VOTED_KEY, JSON.stringify(voted));
  return true;
}

export function hasVoted(id: string): boolean {
  return !!getVoted()[id];
}

interface Props {
  id: string; // e.g. "A1_c0" or "A1_q3"
}

const LABELS = {
  fr: { suggest: 'Une image aiderait ici', thanks: 'Merci !', title: "Signaler qu'une image serait utile ici" },
  nl: { suggest: 'Een afbeelding zou helpen', thanks: 'Bedankt!', title: 'Melden dat een afbeelding nuttig zou zijn' },
};

export default function ImageRequestButton({ id }: Props) {
  const { lang } = useLang();
  const labels = LABELS[lang] ?? LABELS.fr;
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    setVoted(hasVoted(id));
  }, [id]);

  const handleClick = () => {
    if (voted) return;
    recordImageRequest(id);
    setVoted(true);
  };

  return (
    <button
      onClick={handleClick}
      disabled={voted}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
      style={{
        background: 'transparent',
        border: voted ? '1px solid #2ecc71' : '1px solid rgba(255,255,255,0.15)',
        color: voted ? '#2ecc71' : '#5A6B8A',
        cursor: voted ? 'default' : 'pointer',
      }}
      title={labels.title}
    >
      <span>{voted ? '✓' : '🖼️'}</span>
      <span>{voted ? labels.thanks : labels.suggest}</span>
    </button>
  );
}
