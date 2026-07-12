'use client';

import { useLang } from '@/contexts/LanguageContext';
import { TIER_COLORS, TIER_PCT } from '@/lib/medals';

interface ExamRouteProps {
  themeCode: string;
  themeTitle: string;
  // Progression par PARTIES de leçons (unité fine, pas la leçon entière)
  partsCompleted: number;
  partsTotal: number;
  examPassed: boolean;
}

type MilestoneKey = 'bronze' | 'argent' | 'or' | 'diamant';

const MILESTONES: { key: MilestoneKey; pct: number }[] = [
  { key: 'bronze', pct: TIER_PCT.bronze },
  { key: 'argent', pct: TIER_PCT.argent },
  { key: 'or', pct: TIER_PCT.or },
  { key: 'diamant', pct: 100 },
];

export function MedalIcon({ kind, achieved, size = 34 }: { kind: MilestoneKey; achieved: boolean; size?: number }) {
  const c = TIER_COLORS[kind];
  const op = achieved ? 1 : 0.4;
  if (kind === 'diamant') {
    // Gemme taillée — la récompense de l'examen
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M7 3h10l4 6-9 12L3 9z" fill={c.main} fillOpacity={op} />
        <path d="M7 3l5 6-5 0zM17 3l-5 6 5 0z" fill={c.ribbon} fillOpacity={op * 0.9} />
        <path d="M3 9h18l-9 12z" fill={c.ribbon} fillOpacity={op * 0.5} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M8.2 1.5h3l-2.4 6.2h-3z" fill={c.ribbon} fillOpacity={op * 0.85} />
      <path d="M15.8 1.5h-3l2.4 6.2h3z" fill={c.ribbon} fillOpacity={op * 0.85} />
      <circle cx="12" cy="14.5" r="7" fill={c.main} fillOpacity={op} />
      <circle cx="12" cy="14.5" r="4.6" fill="none" stroke="rgba(0,0,0,0.22)" strokeOpacity={op} strokeWidth="1.4" />
    </svg>
  );
}

export default function ExamRoute({ themeCode, themeTitle, partsCompleted, partsTotal, examPassed }: ExamRouteProps) {
  const { t } = useLang();

  const lessonsPct = partsTotal > 0 ? Math.round((partsCompleted / partsTotal) * 100) : 0;
  const done = (m: { key: MilestoneKey; pct: number }) =>
    m.key === 'diamant' ? lessonsPct >= 100 && examPassed : lessonsPct >= m.pct;

  const nextIdx = MILESTONES.findIndex(m => !done(m));
  const next = nextIdx === -1 ? null : MILESTONES[nextIdx];
  const mastered = next === null;

  // Progression dans le segment courant : objectif proche = motivant
  let segPct = 100;
  let nextDetail = '';
  if (next) {
    if (next.key === 'diamant') {
      segPct = 100;
      nextDetail = t('route_diamant_hint');
    } else {
      const prevPct = nextIdx === 0 ? 0 : MILESTONES[nextIdx - 1].pct;
      const segStart = Math.ceil((prevPct / 100) * partsTotal);
      const segEnd = Math.ceil((next.pct / 100) * partsTotal);
      const partsLeft = Math.max(0, segEnd - partsCompleted);
      segPct = segEnd > segStart
        ? Math.min(100, Math.max(0, Math.round(((partsCompleted - segStart) / (segEnd - segStart)) * 100)))
        : 100;
      nextDetail = `${partsLeft} ${partsLeft > 1 ? t('route_parts_remaining_pl') : t('route_parts_remaining_sing')}`;
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0E1828 0%, #132240 100%)',
      borderRadius: 20, padding: '22px 24px', marginBottom: 20,
      border: '1px solid rgba(34,214,199,0.12)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'rgba(34,214,199,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t('route_theme_eyebrow')} {themeCode} · {themeTitle}
          </p>
          {mastered ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <MedalIcon kind="diamant" achieved size={44} />
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#7DD3FC' }}>{t('route_theme_master')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <MedalIcon kind={next!.key} achieved size={44} />
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(241,245,249,0.4)' }}>
                  {t('route_next_step')}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: '#F1F5F9', lineHeight: 1.1 }}>
                  {t('route_medal_' + next!.key)}
                </p>
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', paddingTop: 2, flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'rgba(241,245,249,0.75)' }}>
            {partsCompleted}/{partsTotal}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(241,245,249,0.35)', fontWeight: 500 }}>
            {t('route_parties_terminees')}
          </p>
        </div>
      </div>

      {/* ── Barre vers la prochaine médaille ── */}
      {!mastered && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(241,245,249,0.55)' }}>{nextDetail}</span>
            {next?.key !== 'diamant' && (
              <span style={{ fontSize: 12, fontWeight: 800, color: '#22D6C7' }}>{segPct}%</span>
            )}
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, width: `${Math.max(segPct, 3)}%`,
              background: next?.key === 'diamant'
                ? 'linear-gradient(90deg, #38BDF8, #7DD3FC)'
                : 'linear-gradient(90deg, #22D6C7, #55E6DA)',
              transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
        </div>
      )}

      {/* ── Piste des médailles du thème ── */}
      <div style={{ position: 'relative', marginTop: 22, padding: '0 8px' }}>
        <div style={{ position: 'absolute', left: 8, right: 8, top: 16, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{
            height: '100%', borderRadius: 99, width: `${Math.min(100, lessonsPct)}%`,
            background: 'linear-gradient(90deg, #22D6C7, #55E6DA)',
            transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
          {MILESTONES.map((m) => {
            const achieved = done(m);
            const isNext = next?.key === m.key;
            return (
              <div key={m.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#0E1828',
                  border: achieved ? '2px solid rgba(34,214,199,0.5)' : isNext ? '2px solid rgba(241,245,249,0.35)' : '2px solid rgba(241,245,249,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MedalIcon kind={m.key} achieved={achieved} size={m.key === 'diamant' ? 20 : 26} />
                </div>
                <p style={{
                  margin: '7px 0 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.4px',
                  color: achieved ? '#F1F5F9' : isNext ? 'rgba(241,245,249,0.75)' : 'rgba(241,245,249,0.35)',
                }}>
                  {t('route_medal_' + m.key)}
                </p>
                <p style={{ margin: '1px 0 0', fontSize: 9, fontWeight: 600, color: 'rgba(241,245,249,0.25)' }}>
                  {m.key === 'diamant' ? t('route_examen_label') : `${m.pct}%`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
