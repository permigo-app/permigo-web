'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { fetchReviewStats } from '@/lib/reviewApi';

export default function ReviewsBlock() {
  const { user } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [dueCount, setDueCount] = useState<number | null>(null);

  const S = {
    fr: {
      title: 'TES RÉVISIONS',
      due: (n: number) => n === 1 ? '1 question à revoir' : `${n} questions à revoir`,
      sub: "aujourd'hui",
      cta: 'Commencer →',
    },
    nl: {
      title: 'JOUW HERHALINGEN',
      due: (n: number) => n === 1 ? '1 vraag te herhalen' : `${n} vragen te herhalen`,
      sub: 'vandaag',
      cta: 'Beginnen →',
    },
  }[lang];

  useEffect(() => {
    if (!user) return;
    fetchReviewStats().then(stats => setDueCount(stats.dueCount));
  }, [user]);

  // Not logged in, still loading, or nothing due → don't render
  if (!user || dueCount === null || dueCount === 0) return null;

  return (
    <div
      className="fade-in-up"
      style={{ animationDuration: '0.4s', padding: '0 0 12px 0' }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl cursor-pointer press-scale"
        onClick={() => router.push('/revisions')}
        style={{
          background: 'linear-gradient(135deg, rgba(0,184,148,0.12) 0%, rgba(0,184,148,0.06) 100%)',
          border: '1.5px solid rgba(0,184,148,0.35)',
          padding: '14px 16px',
        }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{ width: 48, height: 48, background: 'rgba(0,184,148,0.15)', fontSize: 24 }}
        >
          🔁
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#00B894', lineHeight: 1 }}>
            {S.title}
          </p>
          <p className="font-black" style={{ fontSize: 20, color: '#FFFFFF', lineHeight: 1.2, marginTop: 3 }}>
            {S.due(dueCount)}
          </p>
          <p className="text-xs" style={{ color: '#8B9DC3', marginTop: 2 }}>
            {S.sub}
          </p>
        </div>

        {/* CTA */}
        <button
          className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-black"
          style={{ background: '#00B894', color: '#FFFFFF', border: 'none' }}
        >
          {S.cta}
        </button>
      </div>
    </div>
  );
}
