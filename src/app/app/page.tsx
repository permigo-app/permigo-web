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
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  turbo: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  examen: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  panneaux: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

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
    { href: '/lecons', label: t('nav_lecons'), sub: t('tile_lecons_sub'), icon: TILE_ICONS.lecons },
    { href: '/turbo', label: t('tile_reflexe_label'), sub: t('tile_reflexe_sub'), icon: TILE_ICONS.turbo },
    { href: '/examen', label: t('tile_examen_label'), sub: t('tile_examen_sub'), icon: TILE_ICONS.examen },
    { href: '/panneaux', label: t('nav_panneaux'), sub: t('tile_panneaux_sub'), icon: TILE_ICONS.panneaux },
  ];

  return (
    <>
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)', paddingTop: 52, paddingBottom: 18, paddingLeft: 20, paddingRight: 20 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {stats.streak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <span style={{ fontSize: 13 }}>🔥</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}>{stats.streak}</span>
                </div>
              )}
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0b2659', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#f59e0b' }}>
                {initials}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="home-body" style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>

        <div className="home-progress-card" style={{ background: '#0b2659', borderRadius: 18, padding: '20px 22px', marginBottom: 20, color: '#fff' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            {t('home_progression_globale')}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8, marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 38, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{stats.globalPct}%</p>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>{stats.completedLessons}/{stats.totalLessons}</p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{t('home_lecons_terminees')}</p>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 8, width: `${stats.globalPct}%`, background: '#f59e0b', transition: 'width 0.6s ease-out' }} />
          </div>
        </div>

        <div className="home-col-left">
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {TILES.map((tile) => (
              <Link key={tile.href} href={tile.href} style={{ textDecoration: 'none' }}>
                <div
                  className="press-scale"
                  style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 18, padding: '18px 16px', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 18px var(--pm-shadow)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0b2659', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: 12 }}>
                    {tile.icon}
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-title)', lineHeight: 1.2 }}>{tile.label}</p>
                  <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 400, color: 'var(--text-sub)', lineHeight: 1.4 }}>{tile.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="home-col-right">
          {stats.activeLesson && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
                {t('home_en_cours')}
              </p>
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 18, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {THEME_EMOJIS[stats.activeLesson.themeCode] || '📖'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#f59e0b' }}>
                      {THEME_CITIES[stats.activeLesson.themeCode] || stats.activeLesson.themeCode}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t('lesson_title_' + stats.activeLesson.lessonId)}
                    </p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-navy)', flexShrink: 0 }}>{stats.activeLesson.pct}%</span>
                </div>
                <ProgressBar pct={stats.activeLesson.pct} height={6} color="#0b2659" />
                <Link href={`/lecon/${stats.activeLesson.lessonId}`} style={{ textDecoration: 'none' }}>
                  <div className="press-scale" style={{ marginTop: 14, background: '#0b2659', borderRadius: 12, padding: '13px', textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                    {stats.activeLesson.pct > 0 ? t('home_reprendre') : t('home_commencer_cta')}
                  </div>
                </Link>
              </div>
            </div>
          )}

          <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
            {t('home_mes_stats')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: t('stat_lecons_label'), value: `${stats.completedLessons}/${stats.totalLessons}`, accent: '#0b2659' },
              { label: t('stat_serie_label'), value: stats.streak > 0 ? `🔥 ${stats.streak}${t('jour_abbr')}` : '—', accent: '#ea580c' },
              { label: t('stat_score_label'), value: stats.lastScore !== null ? `${stats.lastScore}%` : '—', accent: '#0b2659' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: s.accent, lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 500, color: 'var(--text-hint)' }}>{s.label}</p>
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
