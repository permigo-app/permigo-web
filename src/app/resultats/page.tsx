'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { THEME_COLORS } from '@/lib/constants';
import { useLang } from '@/contexts/LanguageContext';
import { TIER_COLORS, type Tier } from '@/lib/medals';
import { scopedKey } from '@/lib/license';
import { MedalIcon } from '@/components/ExamRoute';
import SignImage from '@/components/SignImage';

interface ExamReviewItem {
  id: string;
  question: string;
  choices: string[];
  selected: number;
  correct: number;
  explanation: string;
  severe: boolean;
  sign?: string;
}

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useLang();

  const correct = Number(params.get('correct') ?? 0);
  const total = Number(params.get('total') ?? 1);
  const earnedStars = Number(params.get('stars') ?? 0);
  const lessonId = params.get('lesson') ?? '';
  const themeCode = params.get('theme') ?? 'A';
  const isExam = params.get('exam') === '1';
  // Cotation examen : points après pénalités (erreur grave = -5) + nb d'erreurs graves
  const pointsRaw = params.get('points');
  const points = pointsRaw !== null ? Number(pointsRaw) : null;
  const severeCount = Number(params.get('severe') ?? 0);
  const partieRaw = params.get('partie');
  const partieNum = partieRaw !== null ? Number(partieRaw) : null;
  const totalParties = Number(params.get('totalParties') ?? 0);
  const hasNextPartie = partieNum !== null && partieNum + 1 < totalParties;
  const medalParam = params.get('medal') as Tier | null;
  const unlockedMedal = medalParam && medalParam !== 'none' ? medalParam : null;

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  // Examen : le verdict se base sur les POINTS (pénalités graves incluses)
  const examPoints = isExam && points !== null ? points : null;
  const examPct = examPoints !== null && total > 0 ? Math.round((examPoints / total) * 100) : pct;
  const passed = isExam ? examPct >= 82 : earnedStars > 0;

  // Récapitulatif des fautes (déposé par la page examen dans localStorage)
  const [faults, setFaults] = useState<ExamReviewItem[] | null>(null);
  useEffect(() => {
    if (!isExam) return;
    try {
      const raw = localStorage.getItem(scopedKey('exam_last_review'));
      if (!raw) return;
      const review = JSON.parse(raw);
      // On n'affiche que si le dépôt correspond bien à CET examen (frais + même config)
      if (review.theme !== themeCode || review.total !== total) return;
      if (Date.now() - (review.ts ?? 0) > 30 * 60 * 1000) return;
      const items = (review.items as ExamReviewItem[]).filter(it => it.selected !== it.correct);
      setFaults(items);
    } catch { /* ignore */ }
  }, [isExam, themeCode, total]);
  const color = THEME_COLORS[themeCode] || '#74B9FF';

  const title = pct === 100 ? t('resultats_parfait') : passed ? t('resultats_bravo') : t('resultats_courage');

  const scoreColor = passed ? '#00B894' : '#FFD700';

  return (
    <div className="max-w-lg mx-auto px-4 py-8" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Result title */}
      <div className="text-center mb-6">
        <h1 className="text-[28px] font-black" style={{ color: scoreColor }}>{title}</h1>
      </div>

      {/* Médaille de thème fraîchement débloquée */}
      {unlockedMedal && (
        <div
          className="flex items-center gap-3 rounded-3xl px-4 py-3 mb-6 slide-up"
          style={{
            background: `${TIER_COLORS[unlockedMedal].main}22`,
            border: `1px solid ${TIER_COLORS[unlockedMedal].main}66`,
            animationDelay: '150ms',
          }}
        >
          <MedalIcon kind={unlockedMedal} achieved size={40} />
          <div>
            <div className="font-black text-sm" style={{ color: 'var(--text-title)' }}>
              {t('resultats_medaille_debloquee')}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-hint)' }}>
              {t('resultats_medaille_theme_prefix')} {themeCode} · {t('route_medal_' + unlockedMedal)}
            </div>
          </div>
        </div>
      )}

      {/* Score circle */}
      <div className="flex justify-center mb-6">
        <div
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center"
          style={{ border: `5px solid ${scoreColor}`, background: scoreColor + '15' }}
        >
          <span className="text-[42px] font-black">{examPoints !== null ? `${examPoints}/${total}` : `${pct}%`}</span>
          <span className="text-sm" style={{ color: 'var(--text-hint)' }}>
            {examPoints !== null ? `${t('resultats_points')} · ${correct}/${total} ${t('resultats_correct').toLowerCase()}` : `${correct}/${total}`}
          </span>
        </div>
      </div>

      {/* Erreurs graves (examen) */}
      {isExam && severeCount > 0 && (
        <div
          className="rounded-2xl px-4 py-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--text-sub)' }}
        >
          <span className="font-bold" style={{ color: '#dc2626' }}>⚠ {severeCount} {severeCount > 1 ? t('resultats_erreurs_graves') : t('resultats_erreur_grave')}</span>
          {' — '}{t('resultats_erreur_grave_regle')}
        </div>
      )}

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

      {/* Récapitulatif des fautes (examen, conditions réelles) */}
      {isExam && faults !== null && (
        <div className="mb-8">
          <h2 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--brand)' }}>
            {faults.length === 0 ? t('resultats_sans_faute') : `${t('resultats_tes_fautes')} (${faults.length})`}
          </h2>
          {faults.length > 0 && (
            <div className="flex flex-col gap-3">
              {faults.map(f => (
                <div key={f.id} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    {f.sign && (
                      <div className="flex-shrink-0">
                        <SignImage code={f.sign} size={52} />
                      </div>
                    )}
                    <p className="text-sm font-bold flex-1" style={{ color: 'var(--text-title)', margin: 0 }}>
                      {f.question}
                      {f.severe && (
                        <span className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-full align-middle" style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}>
                          ⚠ -5 pts
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-3">
                    {f.selected >= 0 && (
                      <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#dc2626' }}>
                        ✗ {t('resultats_ta_reponse')} : {f.choices[f.selected]}
                      </div>
                    )}
                    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.35)', color: '#16a34a' }}>
                      ✓ {t('resultats_bonne_reponse')} : {f.choices[f.correct]}
                    </div>
                  </div>
                  {f.explanation && (
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)', margin: 0 }}>
                      {f.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
