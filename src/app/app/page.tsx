'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { THEME_ORDER, getThemeData } from '@/lib/lessonData';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import DesignUpdateModal from '@/components/DesignUpdateModal';
import { THEME_EMOJIS, THEME_CITIES } from '@/lib/constants';
import {
  getXPData, getStreakData, checkAndUpdateStreak,
  isLessonCompleted, getLessonProgress, getQuizHistory,
} from '@/lib/progressStorage';
import { fetchDueReviews } from '@/lib/reviewApi';
import { useStreakCelebration } from '@/hooks/useStreakCelebration';
import ProgressBar from '@/components/ui/ProgressBar';

function todayLabel() {
  return new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface Stats {
  globalPct: number;
  completedLessons: number;
  totalLessons: number;
  streak: number;
  xp: number;
  level: number;
  lastScore: number | null;
  activeLesson: { themeCode: string; lessonId: string; lessonTitle: string; pct: number } | null;
}

async function buildStats(): Promise<Stats> {
  let totalLessons = 0;
  let completedLessons = 0;
  let activeLesson: Stats['activeLesson'] = null;

  for (const code of THEME_ORDER) {
    const theme = await getThemeData(code);
    if (!theme) continue;
    for (const lesson of theme.lessons) {
      totalLessons++;
      const done = isLessonCompleted(lesson.id);
      if (done) completedLessons++;
      if (!done && !activeLesson) {
        const prog = getLessonProgress(lesson.id);
        const pct = prog.total > 0 ? Math.round((prog.cardsViewed / prog.total) * 100) : 0;
        activeLesson = { themeCode: code, lessonId: lesson.id, lessonTitle: lesson.title, pct };
      }
    }
  }

  const globalPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const xpData = getXPData();
  const streakData = getStreakData();
  const quiz = getQuizHistory();
  const lastScore = quiz.totalAnswers > 0 ? Math.round((quiz.totalCorrect / quiz.totalAnswers) * 100) : null;

  return { globalPct, completedLessons, totalLessons, streak: streakData.currentStreak, xp: xpData.totalXP, level: xpData.level, lastScore, activeLesson };
}

const TILE_ICONS = {
  lecons: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  turbo: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  examen: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  panneaux: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const TILE_COLORS = [
  { icon: '#22D6C7', bg: 'rgba(34,214,199,0.12)' },
  { icon: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { icon: '#5B9EFF', bg: 'rgba(91,158,255,0.12)' },
  { icon: '#FF6348', bg: 'rgba(255,99,72,0.12)' },
];

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [stats, setStats] = useState<Stats>({
    globalPct: 0, completedLessons: 0, totalLessons: 0,
    streak: 0, xp: 0, level: 1, lastScore: null, activeLesson: null,
  });
  const [dueCount, setDueCount] = useState(0);

  useStreakCelebration();

  useEffect(() => {
    checkAndUpdateStreak();
    buildStats().then(setStats);
    fetchDueReviews().then(records => setDueCount(records.length));
  }, []);

  const initials = user?.username?.charAt(0).toUpperCase() || '?';

  const TILES = [
    { href: '/lecons',   label: t('nav_lecons'),         sub: t('tile_lecons_sub'),   icon: TILE_ICONS.lecons,   color: TILE_COLORS[0] },
    { href: '/turbo',    label: t('tile_reflexe_label'), sub: t('tile_reflexe_sub'),  icon: TILE_ICONS.turbo,    color: TILE_COLORS[1] },
    { href: '/examen',   label: t('tile_examen_label'),  sub: t('tile_examen_sub'),   icon: TILE_ICONS.examen,   color: TILE_COLORS[2] },
    { href: '/panneaux', label: t('nav_panneaux'),        sub: t('tile_panneaux_sub'), icon: TILE_ICONS.panneaux, color: TILE_COLORS[3] },
  ];

  return (
    <>
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-header)',
        paddingTop: 52, paddingBottom: 18, paddingLeft: 20, paddingRight: 20,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: 'var(--text-hint)', letterSpacing: '0.5px', textTransform: 'capitalize' }}>
                {todayLabel()}
              </p>
              <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--text-title)', letterSpacing: -0.5 }}>
                {user?.username ? `${t('home_bonjour')}, ${user.username} 👋` : `${t('home_bonjour')} 👋`}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {stats.streak > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 10px', borderRadius: 99,
                  background: 'rgba(255,99,72,0.15)', border: '1px solid rgba(255,99,72,0.25)',
                }}>
                  <span style={{ fontSize: 13 }}>🔥</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FF6348' }}>{stats.streak}</span>
                </div>
              )}
              <Link href="/profil" style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #22D6C7, #1AB8AB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: '#07080F', textDecoration: 'none',
                flexShrink: 0,
              }}>
                {initials}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="home-body" style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* ── Progress card ── */}
        <div className="home-progress-card" style={{
          background: 'linear-gradient(135deg, #0E1828 0%, #132240 100%)',
          borderRadius: 20, padding: '22px 24px', marginBottom: 20,
          border: '1px solid rgba(34,214,199,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'rgba(34,214,199,0.6)' }}>
            {t('home_progression_globale')}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 42, fontWeight: 900, color: '#22D6C7', lineHeight: 1, letterSpacing: '-1px' }}>
              {stats.globalPct}<span style={{ fontSize: 22, letterSpacing: 0 }}>%</span>
            </p>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>
                {stats.completedLessons}/{stats.totalLessons}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(241,245,249,0.35)', fontWeight: 500 }}>
                {t('home_lecons_terminees')}
              </p>
            </div>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, width: `${stats.globalPct}%`,
              background: 'linear-gradient(90deg, #22D6C7, #55E6DA)',
              transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
        </div>

        <div className="home-col-left">
          {/* ── Reviews due ── */}
          {dueCount > 0 && (
            <div className="reviews-due-card">
              <div className="reviews-due-left">
                <p className="reviews-due-eyebrow">{t('reviews_due_eyebrow')}</p>
                <p className="reviews-due-title">{dueCount} {dueCount > 1 ? t('reviews_due_count_pl') : t('reviews_due_count_sing')}</p>
                <p className="reviews-due-sub">{t('reviews_due_sub')}</p>
              </div>
              <Link href="/revisions" className="reviews-due-btn">{t('reviews_due_btn')}</Link>
            </div>
          )}

          {/* ── Tiles ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {TILES.map((tile) => (
              <Link key={tile.href} href={tile.href} style={{ textDecoration: 'none' }}>
                <div
                  className="press-scale"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 18, padding: '18px 16px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px var(--pm-shadow)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,214,199,0.2)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)';
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: tile.color.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: tile.color.icon, marginBottom: 12,
                  }}>
                    {tile.icon}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-title)', lineHeight: 1.25 }}>{tile.label}</p>
                  <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 400, color: 'var(--text-sub)', lineHeight: 1.4 }}>{tile.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="home-col-right">
          {/* ── Active lesson ── */}
          {stats.activeLesson && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
                {t('home_en_cours')}
              </p>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                borderRadius: 18, padding: '18px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: 'var(--bg-icon)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {THEME_EMOJIS[stats.activeLesson.themeCode] || '📖'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#F59E0B' }}>
                      {THEME_CITIES[stats.activeLesson.themeCode] || stats.activeLesson.themeCode}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t('lesson_title_' + stats.activeLesson.lessonId)}
                    </p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#22D6C7', flexShrink: 0 }}>
                    {stats.activeLesson.pct}%
                  </span>
                </div>
                <ProgressBar pct={stats.activeLesson.pct} height={5} color="#22D6C7" />
                <Link href={`/lecon/${stats.activeLesson.lessonId}`} style={{ textDecoration: 'none' }}>
                  <div className="press-scale" style={{
                    marginTop: 14,
                    background: 'linear-gradient(135deg, #22D6C7, #1AB8AB)',
                    borderRadius: 12, padding: 13, textAlign: 'center',
                    fontWeight: 700, fontSize: 14, color: '#07080F',
                    boxShadow: '0 4px 16px rgba(34,214,199,0.2)',
                  }}>
                    {stats.activeLesson.pct > 0 ? t('home_reprendre') : t('home_commencer_cta')}
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* ── Stats ── */}
          <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
            {t('home_mes_stats')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: t('stat_lecons_label'), value: `${stats.completedLessons}/${stats.totalLessons}`, color: '#22D6C7' },
              { label: t('stat_serie_label'), value: stats.streak > 0 ? `🔥 ${stats.streak}${t('jour_abbr')}` : '—', color: '#FF6348' },
              { label: t('stat_score_label'), value: stats.lastScore !== null ? `${stats.lastScore}%` : '—', color: '#F59E0B' },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                borderRadius: 16, padding: '16px 10px', textAlign: 'center',
              }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: '6px 0 0', fontSize: 10, fontWeight: 600, color: 'var(--text-hint)', lineHeight: 1.3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
    <DesignUpdateModal userId={user?.id} />
    </>
  );
}
