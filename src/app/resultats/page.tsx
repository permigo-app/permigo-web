'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Gaston from '@/components/Gaston';
import { THEME_COLORS } from '@/lib/constants';

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const correct = Number(params.get('correct') ?? 0);
  const total = Number(params.get('total') ?? 1);
  const earnedStars = Number(params.get('stars') ?? 0);
  const xp = Number(params.get('xp') ?? 0);
  const lessonId = params.get('lesson') ?? '';
  const themeCode = params.get('theme') ?? 'A';
  const isExam = params.get('exam') === '1';

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = isExam ? pct >= 82 : earnedStars > 0;
  const color = THEME_COLORS[themeCode] || '#74B9FF';

  let emoji = '💪';
  let title = 'Courage !';
  let gastonExpr: 'party' | 'impressed' | 'encouraging' | 'unhappy' = 'encouraging';
  let gastonMsg = 'Continue à t\'entraîner, tu vas y arriver ! 💪';

  if (pct === 100) {
    emoji = '🏆'; title = 'Parfait !'; gastonExpr = 'party';
    gastonMsg = 'INCROYABLE ! Score parfait ! Tu es un génie ! 🎉';
  } else if (passed) {
    emoji = '🎉'; title = 'Bravo !'; gastonExpr = 'impressed';
    gastonMsg = 'Super résultat ! Je suis fier de toi ! 🌟';
  } else {
    emoji = '💪'; title = 'Courage !'; gastonExpr = 'unhappy';
    gastonMsg = 'Pas grave, on apprend de ses erreurs ! Réessaie ! 💪';
  }

  const scoreColor = passed ? '#00B894' : '#FFD700';

  return (
    <div className="max-w-lg mx-auto px-4 py-8" style={{ background: '#1B1B2F', minHeight: '100vh' }}>
      {/* Big result emoji */}
      <div className="text-center mb-6 slide-up">
        <span className="text-[80px] block mb-2">{emoji}</span>
        <h1 className="text-[28px] font-black" style={{ color: scoreColor }}>{title}</h1>
      </div>

      {/* Stars (lesson only) */}
      {!isExam && (
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              className="text-4xl transition-all"
              style={{
                opacity: i <= earnedStars ? 1 : 0.2,
                animationDelay: `${i * 200}ms`,
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
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center"
          style={{ border: `5px solid ${scoreColor}`, background: scoreColor + '15' }}
        >
          <span className="text-[42px] font-black">{pct}%</span>
          <span className="text-sm" style={{ color: '#8B9DC3' }}>{correct}/{total}</span>
        </div>
      </div>

      {/* XP earned */}
      <div className="flex justify-center mb-6">
        <div className="px-6 py-2.5 rounded-full" style={{ background: 'rgba(255,215,0,0.15)' }}>
          <span className="text-xl font-black" style={{ color: '#FFD700' }}>+{xp} XP ⚡</span>
        </div>
      </div>

      {/* Stats row with dividers */}
      <div className="flex items-center justify-around mb-8 py-4" style={{ borderTop: '1px solid #2A3550', borderBottom: '1px solid #2A3550' }}>
        <div className="text-center">
          <span className="text-[28px] font-black block" style={{ color: '#00B894' }}>{correct}</span>
          <span className="text-xs" style={{ color: '#5A6B8A' }}>Correct</span>
        </div>
        <div className="w-[1px] h-10" style={{ background: '#2A3550' }} />
        <div className="text-center">
          <span className="text-[28px] font-black block" style={{ color: '#FF6B6B' }}>{total - correct}</span>
          <span className="text-xs" style={{ color: '#5A6B8A' }}>Erreurs</span>
        </div>
        <div className="w-[1px] h-10" style={{ background: '#2A3550' }} />
        <div className="text-center">
          <span className="text-[28px] font-black block" style={{ color: scoreColor }}>{pct}%</span>
          <span className="text-xs" style={{ color: '#5A6B8A' }}>Score</span>
        </div>
      </div>

      {/* Gaston */}
      <div className="mb-6">
        <Gaston message={gastonMsg} expression={gastonExpr} size="small" />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        {!passed && lessonId && (
          <button
            onClick={() => router.push(`/lecon/${lessonId}`)}
            className="w-full py-4 rounded-3xl font-black text-sm press-scale"
            style={{ background: '#16213E', border: '1px solid #2A3550' }}
          >
            🔄 Réessayer
          </button>
        )}
        <Link
          href="/"
          className="w-full py-4 rounded-3xl font-black text-sm text-center press-scale text-white"
          style={{ background: passed ? '#27AE60' : '#00B894', boxShadow: '0 4px 12px rgba(0,184,148,0.4)' }}
        >
          {passed ? '✓ Continuer' : '← Retour'}
        </Link>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#1B1B2F' }} />}>
      <ResultsContent />
    </Suspense>
  );
}
