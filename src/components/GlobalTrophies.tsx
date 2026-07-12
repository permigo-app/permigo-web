'use client';

import { useLang } from '@/contexts/LanguageContext';
import { TIER_COLORS, TIER_PCT } from '@/lib/medals';

interface GlobalTrophiesProps {
  globalPct: number;
  partsCompleted: number;
  partsTotal: number;
  finalExamPassed: boolean;
}

type TrophyKey = 'bronze' | 'argent' | 'or' | 'diamant';

const TROPHIES: { key: TrophyKey; pct: number }[] = [
  { key: 'bronze', pct: TIER_PCT.bronze },
  { key: 'argent', pct: TIER_PCT.argent },
  { key: 'or', pct: TIER_PCT.or },
  { key: 'diamant', pct: 100 },
];

export function TrophyIcon({ kind, achieved, size = 22 }: { kind: TrophyKey; achieved: boolean; size?: number }) {
  const c = TIER_COLORS[kind];
  const op = achieved ? 1 : 0.35;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* coupe */}
      <path d="M7 3h10v6a5 5 0 0 1-10 0z" fill={c.main} fillOpacity={op} />
      {/* anses */}
      <path d="M7 4H4a1 1 0 0 0-1 1c0 2.8 1.8 4.6 4 5.1M17 4h3a1 1 0 0 1 1 1c0 2.8-1.8 4.6-4 5.1"
        stroke={c.ribbon} strokeOpacity={op} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* pied + socle */}
      <path d="M11 14h2v3h-2z" fill={c.ribbon} fillOpacity={op} />
      <path d="M8 17h8v3H8z" fill={c.main} fillOpacity={op} />
    </svg>
  );
}

// Bandeau compact : progression globale (toutes parties de leçons confondues)
// avec les trophées posés SUR la ligne, comme le rail de médailles du thème.
// Trophée Diamant = 100% + examen final réussi.
export default function GlobalTrophies({ globalPct, partsCompleted, partsTotal, finalExamPassed }: GlobalTrophiesProps) {
  const { t } = useLang();

  const achieved = (tr: { key: TrophyKey; pct: number }) =>
    tr.key === 'diamant' ? globalPct >= 100 && finalExamPassed : globalPct >= tr.pct;

  const nextTrophy = TROPHIES.find(tr => !achieved(tr));

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-card)',
      borderRadius: 16, padding: '14px 16px 10px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)', whiteSpace: 'nowrap' }}>
          {t('home_progression_globale')}
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#22D6C7', whiteSpace: 'nowrap' }}>
          {partsCompleted}/{partsTotal} · {globalPct}%
        </span>
      </div>

      {/* ── Rail : ligne de progression + trophées dessus ── */}
      <div style={{ position: 'relative', padding: '0 4px' }}>
        <div style={{ position: 'absolute', left: 4, right: 4, top: 13, height: 4, borderRadius: 99, background: 'var(--bg-input)' }}>
          <div style={{
            height: '100%', borderRadius: 99, width: `${Math.min(100, globalPct)}%`,
            background: 'linear-gradient(90deg, #22D6C7, #55E6DA)',
            transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
          {TROPHIES.map(tr => {
            const earned = achieved(tr);
            const isNext = nextTrophy?.key === tr.key;
            return (
              <div key={tr.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 44 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: earned ? '2px solid rgba(34,214,199,0.55)' : isNext ? '2px solid var(--border-card)' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrophyIcon kind={tr.key} achieved={earned} size={17} />
                </div>
                <span style={{
                  marginTop: 3, fontSize: 8.5, fontWeight: 700,
                  color: earned ? 'var(--text-title)' : 'var(--text-hint)',
                }}>
                  {tr.key === 'diamant' ? t('route_examen_label') : `${tr.pct}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
