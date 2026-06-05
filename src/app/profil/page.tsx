'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getXPData, getStreakData, getQuizHistory, getAllStars, getUnlockedThemes, getAllExams, getSurvivalBest, getStudyTime, formatStudyTime } from '@/lib/progressStorage';
import { getUnlockedBadges } from '@/lib/badges';
import { BADGES, THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { getThemeDataLocalized, THEME_ORDER } from '@/lib/lessonData';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { isSoundMuted, toggleMute } from '@/lib/sounds';

// Semantic category colors — intentionally hardcoded, not theme vars
const CAT_COLORS: Record<string, { bg: string; bgStrong: string; border: string; glow: string; check: string }> = {
  Progression: { bg: 'rgba(52,152,219,0.12)',  bgStrong: 'rgba(52,152,219,0.25)',  border: '#3498DB', glow: 'rgba(52,152,219,0.45)',  check: '#3498DB' },
  Régularité:  { bg: 'rgba(230,126,34,0.12)',   bgStrong: 'rgba(230,126,34,0.25)',   border: '#E67E22', glow: 'rgba(230,126,34,0.45)',   check: '#E67E22' },
  Précision:   { bg: 'rgba(241,196,15,0.12)',   bgStrong: 'rgba(241,196,15,0.25)',   border: '#F1C40F', glow: 'rgba(241,196,15,0.45)',   check: '#F1C40F' },
  Examens:     { bg: 'rgba(78,205,196,0.12)',   bgStrong: 'rgba(78,205,196,0.25)',   border: '#4ecdc4', glow: 'rgba(78,205,196,0.45)',   check: '#4ecdc4' },
  Survie:      { bg: 'rgba(231,76,60,0.12)',    bgStrong: 'rgba(231,76,60,0.25)',    border: '#E74C3C', glow: 'rgba(231,76,60,0.45)',    check: '#E74C3C' },
  Exploration: { bg: 'rgba(46,204,113,0.12)',   bgStrong: 'rgba(46,204,113,0.25)',   border: '#2ECC71', glow: 'rgba(46,204,113,0.45)',   check: '#2ECC71' },
  Niveaux:     { bg: 'rgba(155,89,182,0.12)',   bgStrong: 'rgba(155,89,182,0.25)',   border: '#9B59B6', glow: 'rgba(155,89,182,0.45)',   check: '#9B59B6' },
};

const CAT_KEY_MAP: Record<string, string> = {
  Progression: 'badge_cat_progression', Régularité: 'badge_cat_regularite',
  Précision: 'badge_cat_precision', Examens: 'badge_cat_examens',
  Survie: 'badge_cat_survie', Exploration: 'badge_cat_exploration', Niveaux: 'badge_cat_niveaux',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const [mounted, setMounted] = useState(false);
  const [xp, setXp] = useState({ totalXP: 0, level: 1 });
  const [streak, setStreak] = useState({ currentStreak: 0, lastActiveDate: '', bestStreak: 0 });
  const [quiz, setQuiz] = useState({ totalCorrect: 0, totalAnswers: 0 });
  const [stars, setStars] = useState<Record<string, number>>({});
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [exams, setExams] = useState<Record<string, boolean>>({});
  const [survivalBest, setSurvivalBest] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    setMounted(true);
    const xpData = getXPData();
    const streakData = getStreakData();
    const quizData = getQuizHistory();
    const starsData = getAllStars();
    setXp(xpData);
    setStreak(streakData);
    setQuiz(quizData);
    setStars(starsData);
    setUnlockedThemes(getUnlockedThemes());
    setExams(getAllExams());
    setSurvivalBest(getSurvivalBest());
    setStudyTime(getStudyTime());
    setUnlockedBadges(getUnlockedBadges());
    setMuted(isSoundMuted());
    setPremium(localStorage.getItem('isPremium') === 'true');
    setHasLocalData(
      xpData.totalXP > 0 ||
      streakData.currentStreak > 0 ||
      quizData.totalAnswers > 0 ||
      Object.keys(starsData).length > 0
    );
  }, []);

  if (!mounted || authLoading) return <div className="min-h-screen" />;

  const completedLessons = Object.values(stars).filter(s => s > 0).length;
  const passedExams = Object.values(exams).filter(Boolean).length;
  const xpForCurrentLevel = (xp.level - 1) ** 2 * 30;
  const xpForNextLevel    = xp.level ** 2 * 30;
  const xpInLevel         = xp.totalXP - xpForCurrentLevel;
  const xpNeededInLevel   = xpForNextLevel - xpForCurrentLevel;
  const xpBarPct          = xpNeededInLevel > 0
    ? Math.min(100, Math.round((xpInLevel / xpNeededInLevel) * 100))
    : 100;
  const badgeCategories = [...new Set(BADGES.map(b => b.category))];

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('@onboarding_done');
    document.cookie = 'onboarding_done=; path=/; max-age=0; SameSite=Lax';
    window.location.href = '/login';
  };

  // ── Reusable sub-components (inline for single-file clarity) ──

  const AvatarCard = ({ size }: { size: 'sm' | 'lg' }) => {
    const sz = size === 'lg' ? 88 : 72;
    const initial = (user?.username?.charAt(0) || '?').toUpperCase();
    return (
      <div
        className="rounded-full flex items-center justify-center mb-3"
        style={{
          width: sz, height: sz,
          background: '#0b2659',
          border: '3px solid #f59e0b',
          fontSize: sz * 0.38,
          fontWeight: 800,
          color: '#f59e0b',
          fontFamily: 'Sora, sans-serif',
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
    );
  };

  const XPBar = ({ height }: { height: string }) => (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>
          XP vers {t('niveau')} {xp.level + 1}
        </span>
        <span className="text-[11px] font-bold" style={{ color: 'var(--brand)' }}>
          {xpInLevel} / {xpNeededInLevel}
        </span>
      </div>
      <div className={`rounded-full overflow-hidden`} style={{ height, background: 'var(--border-subtle)' }}>
        <div
          className="h-full rounded-full progress-animate"
          style={{ width: `${Math.max(xpBarPct, 2)}%`, background: 'var(--brand)' }}
        />
      </div>
    </div>
  );

  const ThemeList = () => (
    <div className="flex flex-col gap-2">
      {THEME_ORDER.map(code => {
        const theme = getThemeDataLocalized(code, lang);
        if (!theme) return null;
        const lessonIds = theme.lessons.map(l => l.id);
        const done = lessonIds.filter(id => (stars[id] ?? 0) > 0).length;
        const total = lessonIds.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const col = THEME_COLORS[code];
        return (
          <div key={code} className="rounded-xl p-3 flex items-center gap-3 card-hover"
            style={{ background: 'var(--card-primary)', borderLeft: `4px solid ${col}` }}>
            <span className="text-lg flex-shrink-0">{THEME_EMOJIS[code]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{theme.title}</span>
                <span className="text-[11px] font-bold flex-shrink-0 ml-2" style={{ color: 'var(--text-disabled)' }}>{done}/{total}</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 7, background: 'var(--border-subtle)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(pct, 2)}%`, background: col }} />
              </div>
            </div>
            <span className="text-xs font-bold flex-shrink-0" style={{ color: pct === 100 ? 'var(--success)' : col }}>{pct}%</span>
            {exams[code] && <span className="text-sm flex-shrink-0">✅</span>}
          </div>
        );
      })}
    </div>
  );

  const BadgeGrid = ({ cols }: { cols: string }) => (
    <>
      {badgeCategories.map(category => {
        const cc = CAT_COLORS[category] ?? CAT_COLORS['Examens'];
        return (
          <div key={category} className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: cc.border }}>
              {t(CAT_KEY_MAP[category] ?? category)}
            </h3>
            <div className={`grid ${cols} gap-2.5`}>
              {BADGES.filter(b => b.category === category).map(badge => {
                const unlocked = unlockedBadges.includes(badge.id);
                const isHovered = hoveredBadge === badge.id;
                return (
                  <div
                    key={badge.id}
                    className="rounded-2xl p-3 text-center relative transition-all duration-200 cursor-default"
                    style={{
                      background: unlocked ? cc.bgStrong : 'var(--bg-secondary)',
                      border: unlocked ? `2px solid ${cc.border}` : '1px solid var(--border-subtle)',
                      boxShadow: unlocked ? `0 0 15px ${cc.glow}` : 'none',
                    }}
                    onMouseEnter={() => setHoveredBadge(badge.id)}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    {unlocked && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                        style={{ background: cc.check }}>✓</div>
                    )}
                    {!unlocked && (
                      <div className="absolute top-2 right-2 text-[10px]" style={{ opacity: 0.4 }}>🔒</div>
                    )}
                    {!unlocked && isHovered && (
                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold z-20 pointer-events-none"
                        style={{ background: 'var(--bg-secondary)', border: `1px solid ${cc.border}`, color: cc.border }}>
                        {t(`badge_${badge.id}_desc` as any)}
                      </div>
                    )}
                    <span className="block mb-1.5"
                      style={{ fontSize: 40, lineHeight: 1, filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)' }}>
                      {badge.emoji}
                    </span>
                    <p className="text-[11px] font-black leading-tight"
                      style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                      {t(`badge_${badge.id}` as any)}
                    </p>
                    <p className="text-[10px] mt-1 leading-tight"
                      style={{ color: unlocked ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
                      {t(`badge_${badge.id}_desc` as any)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>

      {/* Page header */}
      <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)', paddingTop: 52, paddingBottom: 18, paddingLeft: 20, paddingRight: 20 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>Compte</p>
        <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--text-title)', letterSpacing: -0.5 }}>Mon profil</h1>
      </div>

      <div className="py-6 px-4">
      <div className="max-w-screen-xl mx-auto">

        {/* ════════════════════════════════════════
            MOBILE LAYOUT — lg:hidden
        ════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-4 pb-24">

          {/* 1. Avatar + nom + niveau */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex flex-col items-center mb-4">
              <AvatarCard size="sm" />
              <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{user?.username || t('pilote')}</h1>
              {user?.email && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mt-2"
                style={{ background: '#0b2659' }}>
                <span className="text-sm" style={{ color: '#f59e0b' }}>⚡</span>
                <span className="text-sm font-bold" style={{ color: '#f59e0b', fontFamily: 'Sora, sans-serif' }}>{t('niveau')} {xp.level}</span>
              </div>
            </div>
            <XPBar height="12px" />
          </div>

          {/* 2. Stats 2×2 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '🔥', value: streak.currentStreak, label: t('serie_jours'), color: '#FF6348' },
              { emoji: '⚡', value: xp.totalXP,           label: t('xp_total'),    color: 'var(--premium)' },
              { emoji: '📖', value: completedLessons,       label: t('lecons'),      color: 'var(--brand)' },
              { emoji: '⏱️', value: formatStudyTime(studyTime), label: t('temps_etudie'), color: 'var(--secondary)' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-4 flex flex-col items-center gap-1"
                style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 26 }}>{stat.emoji}</span>
                <span className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</span>
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-disabled)' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* 3. Performance par thème */}
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--brand)' }}>
              {t('performance_theme')}
            </h2>
            <ThemeList />
          </div>

          {/* 4. Badges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--brand)' }}>{t('badges')}</h2>
              <span className="text-xs font-bold" style={{ color: 'var(--text-disabled)' }}>
                {unlockedBadges.length}/{BADGES.length} {t('debloques')}
              </span>
            </div>
            <BadgeGrid cols="grid-cols-2" />
          </div>

          {/* 5. Séparateur */}
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />

          {/* 7. Paramètres */}
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-disabled)' }}>
              Paramètres
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
              {premium ? (
                <Link href="/profil" className="flex items-center gap-3 px-4 py-3.5 press-scale"
                  style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--card-secondary)' }}>
                  <span>⭐</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>Premium ✓</span>
                </Link>
              ) : (
                <Link href="/premium" className="flex items-center gap-3 px-4 py-3.5 press-scale premium-pulse"
                  style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,201,40,0.08)' }}>
                  <span>⭐</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--premium)' }}>Passer Premium</span>
                </Link>
              )}
              {!user && (
                <Link href="/login" className="flex items-center gap-3 px-4 py-3.5 press-scale"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>🔑</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{t('nav_connexion')}</span>
                </Link>
              )}
              <button
                onClick={() => { const next = toggleMute(); setMuted(next); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 press-scale"
                style={{ background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
              >
                <span>{muted ? '🔇' : '🔊'}</span>
                <span className="text-sm font-bold" style={{ color: muted ? 'var(--text-disabled)' : 'var(--text-secondary)' }}>
                  {muted ? 'Sons coupés' : 'Sons actifs'}
                </span>
              </button>
              <div style={{ height: 1, background: 'var(--border-subtle)' }} />
              <a href="https://www.iubenda.com/privacy-policy/43486445" target="_blank"
                className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>Politique de confidentialité</span>
              </a>
              <a href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy" target="_blank"
                className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>Cookies</span>
              </a>
              <a href="/terms" className="flex items-center px-4 py-3">
                <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>CGU</span>
              </a>
            </div>
          </div>

          {/* 8. Déconnexion */}
          {user && (
            <button onClick={handleSignOut}
              className="py-3 rounded-xl font-bold text-sm press-scale"
              style={{ background: 'transparent', border: '1.5px solid var(--error)', color: 'var(--error)' }}>
              {t('se_deconnecter')}
            </button>
          )}

          <p className="text-center text-xs" style={{ color: 'var(--text-disabled)' }}>© 2025-2026 MyPermiGo</p>
        </div>

        {/* ════════════════════════════════════════
            DESKTOP LAYOUT — hidden on mobile
        ════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:flex-row gap-4 lg:gap-6">

          {/* ══ SIDEBAR GAUCHE ══ */}
          <div className="w-full lg:w-64 xl:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-6 flex flex-col gap-5">

              {/* Profile card */}
              <div className="rounded-2xl p-6 fade-in-up" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex flex-col items-center mb-5">
                  <AvatarCard size="lg" />
                  <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{user?.username || t('pilote')}</h1>
                  {user?.email && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                  )}
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mt-2"
                    style={{ background: 'var(--card-secondary)', border: '1px solid var(--brand)' }}>
                    <span className="text-sm">⚡</span>
                    <span className="text-sm font-black" style={{ color: 'var(--brand)' }}>{t('niveau')} {xp.level}</span>
                  </div>
                </div>

                {/* XP bar */}
                <div className="mb-5">
                  <XPBar height="14px" />
                </div>

                {/* Separator */}
                <div className="h-px mb-5" style={{ background: 'var(--border-subtle)' }} />

                {/* Stats 2x2 */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { emoji: '🔥', value: streak.currentStreak,      label: t('serie_jours'), color: '#FF6348' },
                    { emoji: '⚡', value: xp.totalXP,                label: t('xp_total'),    color: 'var(--premium)' },
                    { emoji: '📖', value: completedLessons,            label: t('lecons'),      color: 'var(--brand)' },
                    { emoji: '⏱',  value: formatStudyTime(studyTime), label: t('temps_etudie'), color: 'var(--secondary)' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl p-3 text-center card-hover"
                      style={{ background: 'var(--card-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <span className="text-lg block mb-0.5">{stat.emoji}</span>
                      <span className="text-xl font-black block" style={{ color: stat.color }}>{stat.value}</span>
                      <p className="text-[10px] font-bold" style={{ color: 'var(--text-disabled)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

              </div>

              {/* Share */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'PermiGo', text: `Je suis niveau ${xp.level} sur PermiGo avec ${xp.totalXP} XP ! 🚗` });
                    }
                  }}
                  className="rounded-xl py-2.5 px-8 font-bold text-sm press-scale"
                  style={{ background: 'transparent', border: '1.5px solid var(--brand)', color: 'var(--brand)' }}
                >
                  {t('partager_progres')}
                </button>
              </div>

              {/* Auth — only if no local data AND not logged in */}
              {!user && !hasLocalData && (
                <div className="flex gap-3">
                  <button onClick={() => router.push('/login')}
                    className="flex-1 py-3 rounded-xl font-bold text-sm press-scale"
                    style={{ background: 'var(--brand)', color: 'var(--bg-primary)' }}>
                    {t('se_connecter')}
                  </button>
                  <button onClick={() => router.push('/register')}
                    className="flex-1 py-3 rounded-xl font-bold text-sm press-scale"
                    style={{ background: 'transparent', border: '1.5px solid var(--brand)', color: 'var(--brand)' }}>
                    {t('s_inscrire')}
                  </button>
                </div>
              )}

              {/* Sign out */}
              {user && (
                <button onClick={handleSignOut}
                  className="py-2.5 rounded-xl font-bold text-sm press-scale"
                  style={{ background: 'transparent', border: '1.5px solid var(--error)', color: 'var(--error)' }}>
                  {t('se_deconnecter')}
                </button>
              )}
            </div>
          </div>

          {/* ══ CONTENU PRINCIPAL ══ */}
          <div className="flex-1 min-w-0">

            {/* Performance par thème */}
            <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--brand)' }}>
              {t('performance_theme')}
            </h2>
            <div className="flex flex-col gap-2.5 mb-8">
              {THEME_ORDER.map(code => {
                const theme = getThemeDataLocalized(code, lang);
                if (!theme) return null;
                const lessonIds = theme.lessons.map(l => l.id);
                const done = lessonIds.filter(id => (stars[id] ?? 0) > 0).length;
                const total = lessonIds.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const col = THEME_COLORS[code];
                return (
                  <div key={code} className="rounded-xl p-3.5 flex items-center gap-3 card-hover"
                    style={{ background: 'var(--card-primary)', borderLeft: `4px solid ${col}` }}>
                    <span className="text-xl flex-shrink-0">{THEME_EMOJIS[code]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{theme.title}</span>
                        <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'var(--text-disabled)' }}>{done}/{total}</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'var(--border-subtle)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(pct, 2)}%`, background: col }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0 ml-1" style={{ color: pct === 100 ? 'var(--success)' : col }}>{pct}%</span>
                    {exams[code] && <span className="text-sm flex-shrink-0">✅</span>}
                  </div>
                );
              })}
            </div>

            {/* Badges */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--brand)' }}>{t('badges')}</h2>
              <span className="text-xs font-bold" style={{ color: 'var(--text-disabled)' }}>
                {unlockedBadges.length}/{BADGES.length} {t('debloques')}
              </span>
            </div>
            {badgeCategories.map(category => {
              const cc = CAT_COLORS[category] ?? CAT_COLORS['Examens'];
              return (
                <div key={category} className="mb-8">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: cc.border }}>
                    {t(CAT_KEY_MAP[category] ?? category)}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {BADGES.filter(b => b.category === category).map(badge => {
                      const unlocked = unlockedBadges.includes(badge.id);
                      const isHovered = hoveredBadge === badge.id;
                      return (
                        <div
                          key={badge.id}
                          className="rounded-2xl p-4 text-center transition-all duration-200 relative cursor-default card-hover"
                          style={{
                            background: unlocked ? cc.bgStrong : 'var(--bg-secondary)',
                            border: unlocked ? `2px solid ${cc.border}` : '1px solid var(--border-subtle)',
                            boxShadow: unlocked ? `0 0 15px ${cc.glow}` : 'none',
                          }}
                          onMouseEnter={() => setHoveredBadge(badge.id)}
                          onMouseLeave={() => setHoveredBadge(null)}
                        >
                          {unlocked && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                              style={{ background: cc.check }}>✓</div>
                          )}
                          {!unlocked && (
                            <div className="absolute top-2 right-2 text-[11px]" style={{ opacity: 0.5 }}>🔒</div>
                          )}
                          {!unlocked && isHovered && (
                            <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold z-20 pointer-events-none"
                              style={{ background: 'var(--bg-secondary)', border: `1px solid ${cc.border}`, color: cc.border }}>
                              {t(`badge_${badge.id}_desc` as any)}
                            </div>
                          )}
                          <span className="block mb-2"
                            style={{ fontSize: 56, lineHeight: 1, filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)' }}>
                            {badge.emoji}
                          </span>
                          <p className="text-xs font-black leading-tight"
                            style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                            {t(`badge_${badge.id}` as any)}
                          </p>
                          <p className="text-[10px] mt-1 leading-tight"
                            style={{ color: unlocked ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>
                            {t(`badge_${badge.id}_desc` as any)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
