'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { THEME_COLORS } from '@/lib/constants';
import { useLang } from '@/contexts/LanguageContext';

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useLang();

  const correct = Number(params.get('correct') ?? 0);
  const total = Number(params.get('total') ?? 1);
  const earnedStars = Number(params.get('stars') ?? 0);
  const xp = Number(params.get('xp') ?? 0);
  const lessonId = params.get('lesson') ?? '';
  const themeCode = params.get('theme') ?? 'A';
  const isExam = params.get('exam') === '1';
  const partieRaw = params.get('partie');
  const partieNum = partieRaw !== null ? Number(partieRaw) : null;
  const totalParties = Number(params.get('totalParties') ?? 0);
  const hasNextPartie = partieNum !== null && partieNum + 1 < totalParties;

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = isExam ? pct >= 82 : earnedStars > 0;
  const color = THEME_COLORS[themeCode] || '#74B9FF';

  let emoji = '💪';
  let title = t('resultats_courage');

  if (pct === 100) {
    emoji = '🏆'; title = t('resultats_parfait');
  } else if (passed) {
    emoji = '🎉'; title = t('resultats_bravo');
  } else {
    emoji = '💪'; title = t('resultats_courage');
  }

  const scoreColor = passed ? '#00B894' : '#FFD700';

  return (
    <div className="max-w-lg mx-auto px-4 py-8" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Confetti on pass */}
      {passed && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-sm"
              style={{
                left: `${5 + (i * 4.7) % 95}%`,
                top: '-20px',
                background: ['#FFD700','#4ecdc4','#2ecc71','#FF6348','#A29BFE','#FD79A8'][i % 6],
                animation: `confettiFall ${1.5 + (i * 0.13) % 1.5}s ${(i * 0.08) % 0.8}s ease-in forwards`,
                transform: `rotate(${(i * 37) % 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Big result emoji */}
      <div className="text-center mb-6 fade-in-up">
        <span style={{ fontSize: 96 }} className="block mb-2">{emoji}</span>
        <h1 className="text-[28px] font-black" style={{ color: scoreColor }}>{title}</h1>
      </div>

      {/* Stars (lesson only) */}
      {!isExam && (
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              style={{
                fontSize: '2.25rem',
                opacity: i <= earnedStars ? 1 : 0.2,
                display: 'inline-block',
                animation: i <= earnedStars
                  ? `starPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) ${i * 150}ms forwards, starTwinkle 0.8s ease-in-out 3 ${i * 150 + 700}ms`
                  : 'none',
              }}
            >
              ⭐
            </span>
          ))}
        </div>
      )}

      {/* Score circle */}
      <div className="flex justify-center mb-6">
        <div
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center score-reveal"
          style={{ border: `5px solid ${scoreColor}`, background: scoreColor + '15' }}
        >
          <span className="text-[42px] font-black">{pct}%</span>
          <span className="text-sm" style={{ color: 'var(--text-hint)' }}>{correct}/{total}</span>
        </div>
      </div>

      {/* XP earned */}
      <div className="flex justify-center mb-6 slide-up" style={{ animationDelay: '200ms' }}>
        <div className="xp-burst px-8 py-3 rounded-full" style={{ background: 'rgba(255,215,0,0.18)', border: '2px solid rgba(255,215,0,0.4)' }}>
          <span className="text-2xl font-black" style={{ color: '#FFD700' }}>+{xp} XP ⚡</span>
        </div>
      </div>

      {/* Stats row with dividers */}
      <div className="flex items-center justify-around mb-8 py-4 slide-up" style={{ borderTop: '1px solid var(--border-row)', borderBottom: '1px solid var(--border-row)', animationDelay: '350ms' }}>
        <div className="text-center">
          <span className="text-[28px] font-black block" style={{ color: '#00B894' }}>{correct}</span>
          <span className="text-xs" style={{ color: 'var(--text-hint)' }}>{t('resultats_correct')}</span>
        </div>
        <div className="w-[1px] h-10" style={{ background: 'var(--border-row)' }} />
        <div className="text-center">
          <span className="text-[28px] font-black block" style={{ color: '#FF6B6B' }}>{total - correct}</span>
          <span className="text-xs" style={{ color: 'var(--text-hint)' }}>{t('resultats_erreurs')}</span>
        </div>
        <div className="w-[1px] h-10" style={{ background: 'var(--border-row)' }} />
        <div className="text-center">
          <span className="text-[28px] font-black block" style={{ color: scoreColor }}>{pct}%</span>
          <span className="text-xs" style={{ color: 'var(--text-hint)' }}>{t('resultats_score')}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        {passed && hasNextPartie && lessonId && (
          <button
            onClick={() => router.push(`/lecon/${lessonId}?partie=${partieNum! + 1}`)}
            className="w-full py-4 rounded-3xl font-black text-sm press-scale text-white btn-glow-green"
            style={{ background: 'var(--success)' }}
          >
            Partie {partieNum! + 2} →
          </button>
        )}
        {!passed && lessonId && (
          <button
            onClick={() => router.push(`/lecon/${lessonId}${partieNum !== null ? `?partie=${partieNum}` : ''}`)}
            className="w-full py-4 rounded-3xl font-black text-sm press-scale btn-glow-teal"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
          >
            {t('resultats_reessayer')}
          </button>
        )}
        <Link
          href={partieNum !== null && passed ? `/lecon/${lessonId}` : '/app'}
          className="w-full py-4 rounded-3xl font-black text-sm text-center press-scale"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-title)', display: 'block' }}
        >
          {partieNum !== null && passed ? 'Voir toutes les parties' : passed ? t('resultats_continuer') : t('resultats_retour')}
        </Link>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg-page)' }} />}>
      <ResultsContent />
    </Suspense>
  );
}
