'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getXPData, getStreakData, getQuizHistory, getAllStars, getUnlockedThemes, getAllExams, getSurvivalBest } from '@/lib/progressStorage';
import { getUnlockedBadges } from '@/lib/badges';
import { BADGES, THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { getThemeData, THEME_ORDER } from '@/lib/lessonData';
import ProgressBar from '@/components/ProgressBar';
import Gaston from '@/components/Gaston';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [xp, setXp] = useState({ totalXP: 0, level: 1 });
  const [streak, setStreak] = useState({ currentStreak: 0, lastActiveDate: '', bestStreak: 0 });
  const [quiz, setQuiz] = useState({ totalCorrect: 0, totalAnswers: 0 });
  const [stars, setStars] = useState<Record<string, number>>({});
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [exams, setExams] = useState<Record<string, boolean>>({});
  const [survivalBest, setSurvivalBest] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    setXp(getXPData());
    setStreak(getStreakData());
    setQuiz(getQuizHistory());
    setStars(getAllStars());
    setUnlockedThemes(getUnlockedThemes());
    setExams(getAllExams());
    setSurvivalBest(getSurvivalBest());
    setUnlockedBadges(getUnlockedBadges());
  }, []);

  if (!mounted || authLoading) return <div className="min-h-screen" />;

  const completedLessons = Object.values(stars).filter(s => s > 0).length;
  const accuracy = quiz.totalAnswers > 0 ? Math.round((quiz.totalCorrect / quiz.totalAnswers) * 100) : 0;
  const xpInLevel = xp.totalXP % 100;
  const passedExams = Object.values(exams).filter(Boolean).length;
  const badgeCategories = [...new Set(BADGES.map(b => b.category))];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Gradient header */}
      <div
        className="rounded-3xl p-8 mb-6 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(0,184,148,0.35) 0%, rgba(0,184,148,0.1) 60%, transparent 100%)',
        }}
      >
        {/* Car avatar */}
        <div className="car-bounce inline-block mb-4">
          <div
            className="w-[120px] h-[120px] rounded-full mx-auto flex items-center justify-center text-5xl"
            style={{ background: '#16213E', border: '4px solid #00B894', boxShadow: '0 8px 24px rgba(0,184,148,0.3)' }}
          >
            🚗
          </div>
        </div>

        <h1 className="text-xl font-black mb-1">{user?.username || 'Pilote'}</h1>
        {user?.email && (
          <p className="text-xs mb-2" style={{ color: '#8B9DC3' }}>{user.email}</p>
        )}

        {/* Level badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full mb-3" style={{ background: '#00B894' }}>
          <span className="text-sm">⚡</span>
          <span className="text-sm font-black">Niveau {xp.level}</span>
        </div>

        {/* XP bar */}
        <div className="max-w-[200px] mx-auto">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#3A3A5C' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${xpInLevel}%`, background: '#FFD700' }} />
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#8B9DC3' }}>{xpInLevel}/100 XP → Niveau {xp.level + 1}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl p-4 text-center" style={{ background: '#2A2A4A' }}>
          <span className="text-2xl block mb-1">🔥</span>
          <span className="text-2xl font-black">{streak.currentStreak}</span>
          <p className="text-[11px] font-bold" style={{ color: '#8B9DC3' }}>Série jours</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: '#2A2A4A' }}>
          <span className="text-2xl block mb-1">⚡</span>
          <span className="text-2xl font-black">{xp.totalXP}</span>
          <p className="text-[11px] font-bold" style={{ color: '#8B9DC3' }}>XP total</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: '#2A2A4A' }}>
          <span className="text-2xl block mb-1">📖</span>
          <span className="text-2xl font-black">{completedLessons}</span>
          <p className="text-[11px] font-bold" style={{ color: '#8B9DC3' }}>Leçons</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: '#2A2A4A' }}>
          <span className="text-2xl block mb-1">🎯</span>
          <span className="text-2xl font-black">{accuracy}%</span>
          <p className="text-[11px] font-bold" style={{ color: '#8B9DC3' }}>Précision</p>
        </div>
      </div>

      {/* Gaston */}
      <div className="mb-6">
        <Gaston
          message={`Niveau ${xp.level} avec ${xp.totalXP} XP ! ${xp.level >= 5 ? 'Tu es impressionnant ! 🌟' : 'Continue comme ça ! 💪'}`}
          expression="proud"
          size="small"
        />
      </div>

      {/* Theme performance */}
      <h2 className="text-lg font-black mb-3">Performance par thème</h2>
      <div className="flex flex-col gap-2.5 mb-6">
        {THEME_ORDER.map(code => {
          const theme = getThemeData(code);
          if (!theme) return null;
          const lessonIds = theme.lessons.map(l => l.id);
          const done = lessonIds.filter(id => (stars[id] ?? 0) > 0).length;
          const total = lessonIds.length;
          const pct = total > 0 ? (done / total) * 100 : 0;
          const col = THEME_COLORS[code];
          return (
            <div key={code} className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#16213E', borderLeft: `4px solid ${col}` }}>
              <span className="text-xl">{THEME_EMOJIS[code]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold truncate">{theme.title}</span>
                  <span className="text-[11px] font-bold" style={{ color: '#5A6B8A' }}>{done}/{total}</span>
                </div>
                <ProgressBar value={pct} color={col} height={6} />
              </div>
              {exams[code] && <span className="text-sm">✅</span>}
            </div>
          );
        })}
      </div>

      {/* More stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl p-4" style={{ background: '#2A2A4A' }}>
          <p className="text-[11px] font-black" style={{ color: '#8B9DC3' }}>Meilleur streak</p>
          <span className="text-xl font-black">{streak.bestStreak} 🔥</span>
        </div>
        <div className="rounded-2xl p-4" style={{ background: '#2A2A4A' }}>
          <p className="text-[11px] font-black" style={{ color: '#8B9DC3' }}>Record survie</p>
          <span className="text-xl font-black">{survivalBest} 💀</span>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: 'PermiGo', text: `Je suis niveau ${xp.level} sur PermiGo ! 🚗` });
          }
        }}
        className="w-full rounded-2xl p-4 mb-6 font-bold text-sm text-center press-scale"
        style={{ background: '#2A2A4A', border: '1px solid rgba(0,184,148,0.5)', color: '#00B894' }}
      >
        Partager mon progrès 🚗
      </button>

      {/* Badges */}
      <h2 className="text-lg font-black mb-1">Badges</h2>
      <p className="text-xs mb-4" style={{ color: '#8B9DC3' }}>{unlockedBadges.length}/{BADGES.length} débloqués</p>

      {badgeCategories.map(category => (
        <div key={category} className="mb-5">
          <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#8B9DC3' }}>{category}</h3>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.filter(b => b.category === category).map(badge => {
              const unlocked = unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className="rounded-2xl p-4 text-center transition-all"
                  style={{
                    background: '#16213E',
                    opacity: unlocked ? 1 : 0.4,
                    border: unlocked ? '1px solid rgba(255,215,0,0.3)' : '1px solid transparent',
                    boxShadow: unlocked ? '0 2px 8px rgba(255,215,0,0.1)' : 'none',
                  }}
                >
                  <span className="text-[28px] block mb-1">{badge.emoji}</span>
                  <p className="text-xs font-bold">{badge.name}</p>
                  <p className="text-[10px]" style={{ color: '#8B9DC3' }}>{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Auth section */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid #2A3550' }}>
        {user ? (
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-2xl font-bold text-sm press-scale"
            style={{ background: '#16213E', border: '1px solid #FF6B6B', color: '#FF6B6B' }}
          >
            Se déconnecter
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/login')}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm press-scale"
              style={{ background: '#00B894', color: 'white' }}
            >
              Se connecter
            </button>
            <button
              onClick={() => router.push('/register')}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm press-scale"
              style={{ background: '#16213E', border: '1px solid #00B894', color: '#00B894' }}
            >
              S&apos;inscrire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
