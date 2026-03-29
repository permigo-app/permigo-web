'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getXPData, getStreakData, getQuizHistory, getAllStars, getUnlockedThemes, getAllExams, getSurvivalBest, getStudyTime, formatStudyTime } from '@/lib/progressStorage';
import { getUnlockedBadges } from '@/lib/badges';
import { BADGES, THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { getThemeDataLocalized, THEME_ORDER } from '@/lib/lessonData';
import Gaston from '@/components/Gaston';
import CarSVG from '@/components/CarSVG';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { GASTON_PROFILE, getRandomMsg } from '@/locales/messages';

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
  const [userCar, setUserCar] = useState<{ carType: string; carColor: string }>({ carType: 'berline', carColor: '#1E88E5' });
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

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
      const raw = localStorage.getItem('userProfile');
      if (raw) {
        const p = JSON.parse(raw);
        if (p.carType) setUserCar({ carType: p.carType, carColor: p.carColor || '#1E88E5' });
      }
    } catch {}
    setUnlockedBadges(getUnlockedBadges());
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
  const xpInLevel = xp.totalXP % 100;
  const passedExams = Object.values(exams).filter(Boolean).length;
  const badgeCategories = [...new Set(BADGES.map(b => b.category))];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="py-8 px-6" style={{ minHeight: '100vh' }}>
      <div className="max-w-screen-xl mx-auto">
        {/* ── 2-column layout: sidebar + main ── */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* ══════════ SIDEBAR GAUCHE (sticky on desktop) ══════════ */}
          <div className="w-full lg:w-64 xl:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-6 flex flex-col gap-5">

              {/* Profile card */}
              <div className="rounded-2xl p-6" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
                {/* Avatar + name */}
                <div className="flex flex-col items-center mb-5">
                  <div
                    className="w-[100px] h-[100px] rounded-full flex items-center justify-center mb-3 car-bounce"
                    style={{ background: '#0F1923', border: '4px solid #4ecdc4', boxShadow: '0 0 24px rgba(78,205,196,0.25)' }}
                  >
                    <CarSVG type={userCar.carType} color={userCar.carColor} size={70} />
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
                    <span className="text-[11px] font-bold" style={{ color: '#8B9DC3' }}>XP</span>
                    <span className="text-[11px] font-bold" style={{ color: '#4ecdc4' }}>{xpInLevel}/100 → {t('niveau')} {xp.level + 1}</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(xpInLevel, 2)}%`, background: 'linear-gradient(90deg, #4ecdc4, #2ecc71)' }}
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
                    <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
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
                    className="rounded-xl p-3.5 flex items-center gap-3"
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

            {badgeCategories.map(category => (
              <div key={category} className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5A6B8A' }}>{
                  { Progression: t('badge_cat_progression'), Régularité: t('badge_cat_regularite'), Précision: t('badge_cat_precision'), Examens: t('badge_cat_examens') }[category] || category
                }</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {BADGES.filter(b => b.category === category).map(badge => {
                    const unlocked = unlockedBadges.includes(badge.id);
                    const isHovered = hoveredBadge === badge.id;
                    return (
                      <div
                        key={badge.id}
                        className="rounded-2xl p-4 text-center transition-all duration-200 relative"
                        style={{
                          background: unlocked ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.03)',
                          border: unlocked ? '1.5px solid rgba(78,205,196,0.5)' : '1.5px solid #2A3550',
                          boxShadow: unlocked ? '0 0 12px rgba(78,205,196,0.4)' : 'none',
                        }}
                        onMouseEnter={() => setHoveredBadge(badge.id)}
                        onMouseLeave={() => setHoveredBadge(null)}
                      >
                        {/* Unlocked: green checkmark */}
                        {unlocked && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: '#2ecc71', color: 'white' }}>✓</div>
                        )}
                        {/* Locked: lock icon */}
                        {!unlocked && (
                          <div className="absolute top-2 right-2 text-[10px]" style={{ opacity: 0.5 }}>🔒</div>
                        )}

                        {/* Tooltip on hover for locked */}
                        {!unlocked && isHovered && (
                          <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold z-10"
                            style={{ background: '#0F1923', border: '1px solid #4ecdc4', color: '#4ecdc4' }}
                          >
                            {t('debloquer') + ' : '}{t(`badge_${badge.id}_desc`)}
                          </div>
                        )}

                        <span
                          className={`text-[28px] block mb-1.5 ${unlocked ? 'node-pulse' : ''}`}
                          style={{ filter: unlocked ? 'none' : 'grayscale(1) opacity(0.4)' }}
                        >
                          {badge.emoji}
                        </span>
                        <p className="text-xs font-bold" style={{ color: unlocked ? '#FFFFFF' : '#5A6B8A' }}>{t(`badge_${badge.id}`)}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: unlocked ? '#8B9DC3' : '#3A4560' }}>{t(`badge_${badge.id}_desc`)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
