'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getXPData, getStreakData, getQuizHistory, getAllStars, getUnlockedThemes, getAllExams, getSurvivalBest, getStudyTime, formatStudyTime } from '@/lib/progressStorage';
import { getUnlockedBadges } from '@/lib/badges';
import { BADGES, THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { getThemeDataLocalized, THEME_ORDER } from '@/lib/lessonData';
import Image from 'next/image';
import Gaston from '@/components/Gaston';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { GASTON_PROFILE, getRandomMsg } from '@/locales/messages';
import { isSoundMuted, toggleMute } from '@/lib/sounds';

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
  const [userCar, setUserCar] = useState<{ carType: string; carColor: string; carImage?: string }>({ carType: 'berline', carColor: '#1E88E5', carImage: '/images/cars/car-red.png' });
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
    try {
      const rawCar = localStorage.getItem('userCar');
      if (rawCar) {
        const c = JSON.parse(rawCar);
        setUserCar({ carType: c.id || 'berline', carColor: c.color || '#1E88E5', carImage: c.image || '/images/cars/car-red.png' });
      } else {
        const raw = localStorage.getItem('userProfile');
        if (raw) {
          const p = JSON.parse(raw);
          if (p.carType) setUserCar({ carType: p.carType, carColor: p.carColor || '#1E88E5', carImage: '/images/cars/car-red.png' });
        }
      }
    } catch {}
    setUnlockedBadges(getUnlockedBadges());
    setMuted(isSoundMuted());
    setPremium(localStorage.getItem('isPremium') === 'true');
    // Check if user has any data in localStorage
    setHasLocalData(
      xpData.totalXP > 0 ||
      streakData.currentStreak > 0 ||
      quizData.totalAnswers > 0 ||
      Object.keys(starsData).length > 0
    );
  }, []);

  const gastonMsg = useMemo(() => {
    if (!mounted) return '';
    if (xp.level >= 10) return t('profil_champion');
    if (xp.level >= 5) return `${t('niveau')} ${xp.level} ! ${t('profil_niveau_msg')}`;
    return getRandomMsg(GASTON_PROFILE[lang]);
  }, [mounted, xp.level, lang]);

  if (!mounted || authLoading) return <div className="min-h-screen" />;

  const completedLessons = Object.values(stars).filter(s => s > 0).length;
  const passedExams = Object.values(exams).filter(Boolean).length;
  // XP dans le niveau actuel (formule : niveau(N) = (N-1)² × 30)
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
    window.location.href = '/landing';
  };

  return (
    <div className="py-8 px-4" style={{ minHeight: '100vh' }}>
      <div className="max-w-screen-xl mx-auto">

        {/* ════════════════════════════════════════
            MOBILE LAYOUT — lg:hidden
        ════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-4 pb-24">

          {/* 1. Avatar + nom + niveau */}
          <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
            <div className="flex flex-col items-center mb-4">
              <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-3"
                style={{ background: '#0F1923', border: '4px solid #4ecdc4', boxShadow: '0 0 24px rgba(78,205,196,0.25)' }}>
                <Image src={userCar.carImage || '/images/cars/car-red.png'} alt="car" width={68} height={68}
                  style={{ objectFit: 'contain', filter: `drop-shadow(0 4px 8px ${userCar.carColor}88)` }} />
              </div>
              <h1 className="text-xl font-black">{user?.username || t('pilote')}</h1>
              {user?.email && <p className="text-xs mt-0.5" style={{ color: '#8B9DC3' }}>{user.email}</p>}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mt-2"
                style={{ background: 'rgba(78,205,196,0.15)', border: '1px solid #4ecdc4' }}>
                <span className="text-sm">⚡</span>
                <span className="text-sm font-black" style={{ color: '#4ecdc4' }}>{t('niveau')} {xp.level}</span>
              </div>
            </div>

            {/* 2. Barre XP */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold" style={{ color: '#8B9DC3' }}>XP vers {t('niveau')} {xp.level + 1}</span>
                <span className="text-[11px] font-bold" style={{ color: '#4ecdc4' }}>{xpInLevel} / {xpNeededInLevel}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full progress-animate"
                  style={{ width: `${Math.max(xpBarPct, 2)}%`, background: 'linear-gradient(90deg, #4ecdc4, #2ecc71)' }} />
              </div>
            </div>
          </div>

          {/* 3. Grille 2x2 stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 flex flex-col items-center gap-1"
              style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <span style={{ fontSize: 26 }}>🔥</span>
              <span className="text-2xl font-black" style={{ color: '#FF6348' }}>{streak.currentStreak}</span>
              <span className="text-[11px] font-bold" style={{ color: '#5A6B8A' }}>{t('serie_jours')}</span>
            </div>
            <div className="rounded-2xl p-4 flex flex-col items-center gap-1"
              style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <span style={{ fontSize: 26 }}>⚡</span>
              <span className="text-2xl font-black" style={{ color: '#FFD700' }}>{xp.totalXP}</span>
              <span className="text-[11px] font-bold" style={{ color: '#5A6B8A' }}>{t('xp_total')}</span>
            </div>
            <div className="rounded-2xl p-4 flex flex-col items-center gap-1"
              style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <span style={{ fontSize: 26 }}>📖</span>
              <span className="text-2xl font-black" style={{ color: '#4ecdc4' }}>{completedLessons}</span>
              <span className="text-[11px] font-bold" style={{ color: '#5A6B8A' }}>{t('lecons')}</span>
            </div>
            <div className="rounded-2xl p-4 flex flex-col items-center gap-1"
              style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <span style={{ fontSize: 26 }}>⏱️</span>
              <span className="text-2xl font-black" style={{ color: '#A29BFE' }}>{formatStudyTime(studyTime)}</span>
              <span className="text-[11px] font-bold" style={{ color: '#5A6B8A' }}>{t('temps_etudie')}</span>
            </div>
          </div>

          {/* 4. Progression par thème */}
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#4ecdc4' }}>{t('performance_theme')}</h2>
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
                  <div key={code} className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background: '#16213E', borderLeft: `4px solid ${col}` }}>
                    <span className="text-lg flex-shrink-0">{THEME_EMOJIS[code]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold truncate">{theme.title}</span>
                        <span className="text-[11px] font-bold flex-shrink-0 ml-2" style={{ color: '#5A6B8A' }}>{done}/{total}</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: 7, background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(pct, 2)}%`, background: col }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: pct === 100 ? '#2ecc71' : col }}>{pct}%</span>
                    {exams[code] && <span className="text-sm flex-shrink-0">✅</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Badges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#4ecdc4' }}>{t('badges')}</h2>
              <span className="text-xs font-bold" style={{ color: '#5A6B8A' }}>{unlockedBadges.length}/{BADGES.length} {t('debloques')}</span>
            </div>
            {badgeCategories.map(category => {
              const catKeyMap: Record<string, string> = {
                Progression: 'badge_cat_progression', Régularité: 'badge_cat_regularite',
                Précision: 'badge_cat_precision', Examens: 'badge_cat_examens',
                Survie: 'badge_cat_survie', Exploration: 'badge_cat_exploration', Niveaux: 'badge_cat_niveaux',
              };
              const catColors: Record<string, { bgStrong: string; border: string; glow: string; check: string }> = {
                Progression: { bgStrong: 'rgba(52,152,219,0.25)',  border: '#3498DB', glow: 'rgba(52,152,219,0.45)', check: '#3498DB' },
                Régularité:  { bgStrong: 'rgba(230,126,34,0.25)',  border: '#E67E22', glow: 'rgba(230,126,34,0.45)', check: '#E67E22' },
                Précision:   { bgStrong: 'rgba(241,196,15,0.25)',  border: '#F1C40F', glow: 'rgba(241,196,15,0.45)', check: '#F1C40F' },
                Examens:     { bgStrong: 'rgba(78,205,196,0.25)',  border: '#4ecdc4', glow: 'rgba(78,205,196,0.45)', check: '#4ecdc4' },
                Survie:      { bgStrong: 'rgba(231,76,60,0.25)',   border: '#E74C3C', glow: 'rgba(231,76,60,0.45)', check: '#E74C3C' },
                Exploration: { bgStrong: 'rgba(46,204,113,0.25)',  border: '#2ECC71', glow: 'rgba(46,204,113,0.45)', check: '#2ECC71' },
                Niveaux:     { bgStrong: 'rgba(155,89,182,0.25)',  border: '#9B59B6', glow: 'rgba(155,89,182,0.45)', check: '#9B59B6' },
              };
              const cc = catColors[category] ?? catColors['Examens'];
              return (
                <div key={category} className="mb-5">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: cc.border }}>
                    {t(catKeyMap[category] ?? category)}
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {BADGES.filter(b => b.category === category).map(badge => {
                      const unlocked = unlockedBadges.includes(badge.id);
                      return (
                        <div key={badge.id}
                          className={`rounded-2xl p-3 text-center relative ${unlocked ? 'badge-unlocked-glow' : ''}`}
                          style={{
                            background: unlocked ? cc.bgStrong : 'rgba(255,255,255,0.03)',
                            border: unlocked ? `2px solid ${cc.border}` : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: unlocked ? `0 0 15px ${cc.glow}` : 'none',
                          }}>
                          {unlocked && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: cc.check }}>✓</div>
                          )}
                          {!unlocked && (
                            <div className="absolute top-2 right-2 text-[10px]" style={{ opacity: 0.4 }}>🔒</div>
                          )}
                          <span className="block mb-1.5" style={{ fontSize: 40, lineHeight: 1, filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)' }}>
                            {badge.emoji}
                          </span>
                          <p className="text-[11px] font-black leading-tight" style={{ color: unlocked ? '#FFFFFF' : '#5A6B8A' }}>
                            {t(`badge_${badge.id}` as any)}
                          </p>
                          <p className="text-[10px] mt-1 leading-tight" style={{ color: unlocked ? 'rgba(255,255,255,0.55)' : '#3A4560' }}>
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

          {/* 6. Card Prof. Gaston dit... */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.2)' }}>
            <Gaston message={gastonMsg} expression="proud" size="small" title={t('prof_gaston_dit')} />
          </div>

          {/* 6. Séparateur */}
          <div style={{ height: 1, background: '#2A3550' }} />

          {/* 7. Menu settings */}
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#5A6B8A' }}>Paramètres</h2>
            <div className="rounded-2xl overflow-hidden" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              {premium ? (
                <Link href="/profil" className="flex items-center gap-3 px-4 py-3.5 press-scale"
                  style={{ borderBottom: '1px solid #1a2535', background: 'rgba(78,205,196,0.08)' }}>
                  <span>⭐</span>
                  <span className="text-sm font-bold" style={{ color: '#4ecdc4' }}>Premium ✓</span>
                </Link>
              ) : (
                <Link href="/premium" className="flex items-center gap-3 px-4 py-3.5 press-scale premium-pulse"
                  style={{ borderBottom: '1px solid #1a2535', background: 'rgba(255,215,0,0.08)' }}>
                  <span>⭐</span>
                  <span className="text-sm font-bold" style={{ color: '#FFD700' }}>Passer Premium</span>
                </Link>
              )}
              {!user && (
                <Link href="/login" className="flex items-center gap-3 px-4 py-3.5 press-scale"
                  style={{ borderBottom: '1px solid #1a2535' }}>
                  <span>🔑</span>
                  <span className="text-sm font-bold" style={{ color: '#8B9DC3' }}>{t('nav_connexion')}</span>
                </Link>
              )}
              <button onClick={() => { const next = toggleMute(); setMuted(next); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 press-scale"
                style={{ background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #2A3550' }}>
                <span>{muted ? '🔇' : '🔊'}</span>
                <span className="text-sm font-bold" style={{ color: muted ? '#5A6B8A' : '#8B9DC3' }}>
                  {muted ? 'Sons coupés' : 'Sons actifs'}
                </span>
              </button>
              <div style={{ height: 1, background: '#2A3550' }} />
              <a href="https://www.iubenda.com/privacy-policy/43486445" target="_blank"
                className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid #1a2535' }}>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Politique de confidentialité</span>
              </a>
              <a href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy" target="_blank"
                className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid #1a2535' }}>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Cookies</span>
              </a>
              <a href="/terms" className="flex items-center px-4 py-3">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>CGU</span>
              </a>
            </div>
          </div>

          {/* Déconnexion */}
          {user && (
            <button onClick={handleSignOut}
              className="py-3 rounded-xl font-bold text-sm press-scale"
              style={{ background: 'transparent', border: '1.5px solid #FF6B6B', color: '#FF6B6B' }}>
              {t('se_deconnecter')}
            </button>
          )}

          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>© 2025-2026 MyPermiGo</p>
        </div>

        {/* ════════════════════════════════════════
            DESKTOP LAYOUT — hidden on mobile
        ════════════════════════════════════════ */}
        {/* ── 2-column layout: sidebar + main ── */}
        <div className="hidden lg:flex lg:flex-row gap-4 lg:gap-6">

          {/* ══════════ SIDEBAR GAUCHE (sticky on desktop) ══════════ */}
          <div className="w-full lg:w-64 xl:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-6 flex flex-col gap-5">

              {/* Profile card */}
              <div className="rounded-2xl p-6 fade-in-up" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
                {/* Avatar + name */}
                <div className="flex flex-col items-center mb-5">
                  <div
                    className="w-[100px] h-[100px] rounded-full flex items-center justify-center mb-3 car-bounce"
                    style={{ background: '#0F1923', border: '4px solid #4ecdc4', boxShadow: '0 0 24px rgba(78,205,196,0.25)' }}
                  >
                    <Image
                      src={userCar.carImage || '/images/cars/car-red.png'}
                      alt="car"
                      width={80}
                      height={80}
                      style={{ objectFit: 'contain', filter: `drop-shadow(0 4px 8px ${userCar.carColor}88)` }}
                    />
                  </div>
                  <h1 className="text-xl font-black">{user?.username || t('pilote')}</h1>
                  {user?.email && (
                    <p className="text-xs mt-0.5" style={{ color: '#8B9DC3' }}>{user.email}</p>
                  )}
                  {/* Level badge */}
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mt-2" style={{ background: 'rgba(78,205,196,0.15)', border: '1px solid #4ecdc4' }}>
                    <span className="text-sm">⚡</span>
                    <span className="text-sm font-black" style={{ color: '#4ecdc4' }}>{t('niveau')} {xp.level}</span>
                  </div>
                </div>

                {/* XP bar */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold" style={{ color: '#8B9DC3' }}>XP vers {t('niveau')} {xp.level + 1}</span>
                    <span className="text-[11px] font-bold" style={{ color: '#4ecdc4' }}>{xpInLevel} / {xpNeededInLevel}</span>
                  </div>
                  <div className="h-3.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full progress-animate"
                      style={{ width: `${Math.max(xpBarPct, 2)}%`, background: 'linear-gradient(90deg, #4ecdc4, #2ecc71)' }}
                    />
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px mb-5" style={{ background: '#2A3550' }} />

                {/* Stats grid 2x2 */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { emoji: '🔥', value: streak.currentStreak, label: t('serie_jours') },
                    { emoji: '⚡', value: xp.totalXP, label: t('xp_total') },
                    { emoji: '📖', value: completedLessons, label: t('lecons') },
                    { emoji: '⏱', value: formatStudyTime(studyTime), label: t('temps_etudie') },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl p-3 text-center card-hover" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-lg block mb-0.5">{stat.emoji}</span>
                      <span className="text-xl font-black block">{stat.value}</span>
                      <p className="text-[10px] font-bold" style={{ color: '#5A6B8A' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Prof. Gaston */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
                  <Gaston
                    message={gastonMsg}
                    expression="proud"
                    size="small"
                    title={t('prof_gaston_dit')}
                  />
                </div>
              </div>

              {/* Share button — compact, centered */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'PermiGo', text: `Je suis niveau ${xp.level} sur PermiGo avec ${xp.totalXP} XP ! 🚗` });
                    }
                  }}
                  className="rounded-xl py-2.5 px-8 font-bold text-sm press-scale"
                  style={{ background: 'transparent', border: '1.5px solid #4ecdc4', color: '#4ecdc4' }}
                >
                  {t('partager_progres')}
                </button>
              </div>

              {/* Auth — only if no local data AND not logged in */}
              {!user && !hasLocalData && (
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="flex-1 py-3 rounded-xl font-bold text-sm press-scale"
                    style={{ background: '#4ecdc4', color: '#0a0e2a' }}
                  >
                    {t('se_connecter')}
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="flex-1 py-3 rounded-xl font-bold text-sm press-scale"
                    style={{ background: 'transparent', border: '1.5px solid #4ecdc4', color: '#4ecdc4' }}
                  >
                    {t('s_inscrire')}
                  </button>
                </div>
              )}

              {/* Sign out — only if logged in */}
              {user && (
                <button
                  onClick={handleSignOut}
                  className="py-2.5 rounded-xl font-bold text-sm press-scale"
                  style={{ background: 'transparent', border: '1.5px solid #FF6B6B', color: '#FF6B6B' }}
                >
                  {t('se_deconnecter')}
                </button>
              )}
            </div>
          </div>

          {/* ══════════ CONTENU PRINCIPAL (scrollable) ══════════ */}
          <div className="flex-1 min-w-0">

            {/* ── Performance par thème ── */}
            <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#4ecdc4' }}>{t('performance_theme')}</h2>
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
                  <div
                    key={code}
                    className="rounded-xl p-3.5 flex items-center gap-3 card-hover"
                    style={{ background: '#16213E', borderLeft: `4px solid ${col}` }}
                  >
                    <span className="text-xl flex-shrink-0">{THEME_EMOJIS[code]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold truncate">{theme.title}</span>
                        <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#5A6B8A' }}>{done}/{total}</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(255,255,255,0.1)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(pct, 2)}%`, background: col }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0 ml-1" style={{ color: pct === 100 ? '#2ecc71' : col }}>{pct}%</span>
                    {exams[code] && <span className="text-sm flex-shrink-0">✅</span>}
                  </div>
                );
              })}
            </div>

            {/* ── Badges ── */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#4ecdc4' }}>{t('badges')}</h2>
              <span className="text-xs font-bold" style={{ color: '#5A6B8A' }}>{unlockedBadges.length}/{BADGES.length} {t('debloques')}</span>
            </div>

            {badgeCategories.map(category => {
              const catKeyMap: Record<string, string> = {
                Progression: 'badge_cat_progression',
                Régularité: 'badge_cat_regularite',
                Précision: 'badge_cat_precision',
                Examens: 'badge_cat_examens',
                Survie: 'badge_cat_survie',
                Exploration: 'badge_cat_exploration',
                Niveaux: 'badge_cat_niveaux',
              };
              const catColors: Record<string, { bg: string; bgStrong: string; border: string; glow: string; check: string }> = {
                Progression: { bg: 'rgba(52,152,219,0.12)', bgStrong: 'rgba(52,152,219,0.25)', border: '#3498DB', glow: 'rgba(52,152,219,0.45)', check: '#3498DB' },
                Régularité:  { bg: 'rgba(230,126,34,0.12)',  bgStrong: 'rgba(230,126,34,0.25)',  border: '#E67E22', glow: 'rgba(230,126,34,0.45)',  check: '#E67E22' },
                Précision:   { bg: 'rgba(241,196,15,0.12)',  bgStrong: 'rgba(241,196,15,0.25)',  border: '#F1C40F', glow: 'rgba(241,196,15,0.45)',  check: '#F1C40F' },
                Examens:     { bg: 'rgba(78,205,196,0.12)',  bgStrong: 'rgba(78,205,196,0.25)',  border: '#4ecdc4', glow: 'rgba(78,205,196,0.45)',  check: '#4ecdc4' },
                Survie:      { bg: 'rgba(231,76,60,0.12)',   bgStrong: 'rgba(231,76,60,0.25)',   border: '#E74C3C', glow: 'rgba(231,76,60,0.45)',   check: '#E74C3C' },
                Exploration: { bg: 'rgba(46,204,113,0.12)',  bgStrong: 'rgba(46,204,113,0.25)',  border: '#2ECC71', glow: 'rgba(46,204,113,0.45)',  check: '#2ECC71' },
                Niveaux:     { bg: 'rgba(155,89,182,0.12)',  bgStrong: 'rgba(155,89,182,0.25)',  border: '#9B59B6', glow: 'rgba(155,89,182,0.45)',  check: '#9B59B6' },
              };
              const cc = catColors[category] ?? catColors['Examens'];
              return (
              <div key={category} className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: cc.border }}>
                  {t(catKeyMap[category] ?? category)}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {BADGES.filter(b => b.category === category).map(badge => {
                    const unlocked = unlockedBadges.includes(badge.id);
                    const isHovered = hoveredBadge === badge.id;
                    return (
                      <div
                        key={badge.id}
                        className={`rounded-2xl p-4 text-center transition-all duration-200 relative cursor-default card-hover ${unlocked ? 'badge-unlocked-glow' : ''}`}
                        style={{
                          background: unlocked ? cc.bgStrong : 'rgba(255,255,255,0.03)',
                          border: unlocked ? `2px solid ${cc.border}` : '1px solid rgba(255,255,255,0.08)',
                          boxShadow: unlocked ? `0 0 15px ${cc.glow}` : 'none',
                        }}
                        onMouseEnter={() => setHoveredBadge(badge.id)}
                        onMouseLeave={() => setHoveredBadge(null)}
                      >
                        {/* Unlocked checkmark */}
                        {unlocked && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white" style={{ background: cc.check }}>✓</div>
                        )}
                        {/* Locked icon */}
                        {!unlocked && (
                          <div className="absolute top-2 right-2 text-[11px]" style={{ opacity: 0.5 }}>🔒</div>
                        )}

                        {/* Tooltip on hover for locked */}
                        {!unlocked && isHovered && (
                          <div
                            className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold z-20 pointer-events-none"
                            style={{ background: '#0F1923', border: `1px solid ${cc.border}`, color: cc.border }}
                          >
                            {t(`badge_${badge.id}_desc` as any)}
                          </div>
                        )}

                        <span
                          className="block mb-2"
                          style={{
                            fontSize: 56,
                            lineHeight: 1,
                            filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)',
                          }}
                        >
                          {badge.emoji}
                        </span>
                        <p className="text-xs font-black leading-tight" style={{ color: unlocked ? '#FFFFFF' : '#5A6B8A' }}>
                          {t(`badge_${badge.id}` as any)}
                        </p>
                        <p className="text-[10px] mt-1 leading-tight" style={{ color: unlocked ? 'rgba(255,255,255,0.6)' : '#3A4560' }}>
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
  );
}
