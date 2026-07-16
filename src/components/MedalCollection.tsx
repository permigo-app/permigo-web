'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { getThemeOrder, getThemeDataLocalized } from '@/lib/lessonData';
import { isLessonCompleted, getCompletedParties, getAllExams } from '@/lib/progressStorage';
import { computeTier, countThemeParts, TIER_PCT, TIER_COLORS, type Tier } from '@/lib/medals';
import { MedalIcon } from '@/components/ExamRoute';
import { TrophyIcon } from '@/components/GlobalTrophies';

interface ThemeMedal {
  code: string;
  title: string;
  tier: Tier;
  examPassed: boolean;
}

// Étagère de collection : la médaille la plus haute de chaque thème
// + les trophées globaux. Tout est gagné par la maîtrise réelle.
export default function MedalCollection() {
  const { t, lang } = useLang();
  const [medals, setMedals] = useState<ThemeMedal[]>([]);
  const [globalPct, setGlobalPct] = useState(0);
  const [finalExamPassed, setFinalExamPassed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const exams = getAllExams();
      const result: ThemeMedal[] = [];
      let totalAll = 0, completedAll = 0;
      for (const code of getThemeOrder()) {
        const theme = await getThemeDataLocalized(code, lang);
        if (!theme) continue;
        // Progression par parties de leçons — même unité que la route du thème
        let completed = 0, total = 0;
        for (const lesson of theme.lessons) {
          const parts = countThemeParts(lesson.id, lesson.theory?.length ?? 1, isLessonCompleted, getCompletedParties);
          completed += parts.done;
          total += parts.total;
        }
        totalAll += total;
        completedAll += completed;
        // La médaille de l'étagère reflète UNIQUEMENT la progression des leçons
        // (max Or) — l'examen réussi est signalé par la pastille diamant en coin,
        // pas en remplaçant la médaille elle-même.
        result.push({ code, title: theme.title, tier: computeTier(completed, total, false), examPassed: exams[code] === true });
      }
      if (cancelled) return;
      setMedals(result);
      setGlobalPct(totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0);
      setFinalExamPassed(exams['FINAL'] === true);
    };
    load();
    return () => { cancelled = true; };
  }, [lang]);

  const trophyEarned = (key: 'bronze' | 'argent' | 'or' | 'diamant') =>
    key === 'diamant' ? globalPct >= 100 && finalExamPassed : globalPct >= TIER_PCT[key];

  const earnedCount = medals.filter(m => m.tier !== 'none').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--brand)' }}>
          {t('collection_titre')}
        </h2>
        <span className="text-xs font-bold" style={{ color: 'var(--text-disabled)' }}>
          {earnedCount}/{medals.length || 9}
        </span>
      </div>

      {/* ── Trophées globaux ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        background: 'var(--card-primary)', border: '1px solid var(--border-subtle)',
        borderRadius: 16, padding: '16px 12px 12px', marginBottom: 12,
      }}>
        {(['bronze', 'argent', 'or', 'diamant'] as const).map(key => {
          const earned = trophyEarned(key);
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <TrophyIcon kind={key} achieved={earned} size={30} />
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: earned ? 'var(--text-primary)' : 'var(--text-disabled)',
              }}>
                {t('route_medal_' + key)}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Médailles des thèmes (étagère) ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 10,
        background: 'var(--card-primary)', border: '1px solid var(--border-subtle)',
        borderRadius: 16, padding: 14,
      }}>
        {medals.map(m => (
          <div key={m.code} title={`${m.code} · ${m.title}${m.examPassed ? ' · ' + t('route_medal_examen') : ''}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
            <div style={{ position: 'relative' }}>
              {m.tier === 'none' ? (
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: '2px dashed var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: 'var(--text-disabled)',
                }}>
                  {m.code}
                </div>
              ) : (
                <MedalIcon kind={m.tier} achieved size={34} />
              )}
              {m.examPassed && (
                <div style={{
                  position: 'absolute', top: -5, right: -5,
                  width: 15, height: 15, borderRadius: '50%',
                  background: 'var(--card-primary)',
                  border: `1.5px solid ${TIER_COLORS.diamant.main}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <path d="M7 3h10l4 6-9 12L3 9z" fill={TIER_COLORS.diamant.main} />
                  </svg>
                </div>
              )}
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, maxWidth: '100%',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              color: m.tier === 'none' ? 'var(--text-disabled)' : 'var(--text-secondary)',
            }}>
              {m.code} · {m.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
