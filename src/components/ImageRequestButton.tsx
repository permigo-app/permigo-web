'use client';

import { useState, useEffect, useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { supabase, hasSupabase } from '@/lib/supabase';

const STORAGE_KEY = 'image_requests';
const VOTED_KEY = 'image_requests_voted';

function getRequestsLocal(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function getVoted(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(VOTED_KEY) || '{}'); } catch { return {}; }
}

function markVotedLocal(id: string) {
  const voted = getVoted();
  voted[id] = true;
  localStorage.setItem(VOTED_KEY, JSON.stringify(voted));
}

async function recordImageRequestSupabase(id: string): Promise<boolean> {
  if (!hasSupabase || !supabase) return false;
  try {
    // Get current votes
    const { data, error: fetchError } = await supabase
      .from('image_requests')
      .select('votes')
      .eq('question_id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') return false; // PGRST116 = not found

    const currentVotes = data?.votes ?? 0;

    const { error: upsertError } = await supabase
      .from('image_requests')
      .upsert({ question_id: id, votes: currentVotes + 1 }, { onConflict: 'question_id' });

    return !upsertError;
  } catch {
    return false;
  }
}

export async function recordImageRequest(id: string): Promise<boolean> {
  const voted = getVoted();
  if (voted[id]) return false;

  // Try Supabase first
  const ok = await recordImageRequestSupabase(id);

  // Always fallback to localStorage
  const requests = getRequestsLocal();
  requests[id] = (requests[id] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  markVotedLocal(id);

  return true;
}

export function hasVoted(id: string): boolean {
  return !!getVoted()[id];
}

interface Props {
  id: string;
}

export default function ImageRequestButton({ id }: Props) {
  const { lang } = useLang();
  const [voted, setVoted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toastMsg = lang === 'nl' ? 'Bedankt! We noteren het 👍' : 'Merci ! On en prend note 👍';
  const btnLabel = lang === 'nl' ? '📸 Een afbeelding zou hier helpen — Stemmen' : '📸 Une image ici aiderait à comprendre — Voter';
  const votedLabel = lang === 'nl' ? '✓ Stem geregistreerd !' : '✓ Vote enregistré !';

  useEffect(() => {
    setVoted(hasVoted(id));
  }, [id]);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const handleClick = async () => {
    if (voted) return;
    await recordImageRequest(id);
    setVoted(true);
    setShowToast(true);
    toastTimer.current = setTimeout(() => setShowToast(false), 2800);
  };

  return (
    <>
      <div className="image-request-wrapper flex justify-center" style={{ marginBottom: 24 }}>
        <button
          onClick={handleClick}
          disabled={voted}
          className="image-request-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: voted ? 'rgba(46,204,113,0.12)' : 'rgba(78,205,196,0.15)',
            border: voted ? '1.5px solid #2ecc71' : '1.5px dashed #4ecdc4',
            borderRadius: 12,
            padding: '10px 20px',
            color: voted ? '#2ecc71' : '#4ecdc4',
            fontSize: 14,
            fontWeight: 700,
            cursor: voted ? 'default' : 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!voted) e.currentTarget.style.background = 'rgba(78,205,196,0.25)'; }}
          onMouseLeave={e => { if (!voted) e.currentTarget.style.background = 'rgba(78,205,196,0.15)'; }}
        >
          {voted ? votedLabel : btnLabel}
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className="fixed z-[200] left-1/2 fade-in-up"
          style={{
            bottom: 80,
            transform: 'translateX(-50%)',
            background: '#16213E',
            border: '1px solid rgba(78,205,196,0.35)',
            borderRadius: 12,
            padding: '12px 22px',
            color: '#4ecdc4',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}
