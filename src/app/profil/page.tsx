'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuizHistory, getAllStars, getUnlockedThemes, getAllExams, getSurvivalBest, isLessonCompleted, getCompletedParties } from '@/lib/progressStorage';
import { lessonEffectivelyCompleted, countThemeParts } from '@/lib/medals';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { getThemeDataLocalized, THEME_ORDER, type LocalTheme } from '@/lib/lessonData';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { isSoundMuted, toggleMute } from '@/lib/sounds';
import { useIsPremium } from '@/lib/premium';
import { supabase } from '@/lib/supabase';
import RenewalNotice from '@/components/RenewalNotice';
import MedalCollection from '@/components/MedalCollection';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const [mounted, setMounted] = useState(false);
  const [quiz, setQuiz] = useState({ totalCorrect: 0, totalAnswers: 0 });
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [exams, setExams] = useState<Record<string, boolean>>({});
  const [survivalBest, setSurvivalBest] = useState(0);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [muted, setMuted] = useState(false);
  const premium = useIsPremium();
  const [themeMap, setThemeMap] = useState<Record<string, LocalTheme>>({});
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    setMounted(true);
    const quizData = getQuizHistory();
    const starsData = getAllStars();
    setQuiz(quizData);
    setUnlockedThemes(getUnlockedThemes());
    setExams(getAllExams());
    setSurvivalBest(getSurvivalBest());
    setMuted(isSoundMuted());
    setHasLocalData(
      quizData.totalAnswers > 0 ||
      Object.keys(starsData).length > 0
    );
    // Load all theme data asynchronously
    Promise.all(THEME_ORDER.map(async (code) => {
      const theme = await getThemeDataLocalized(code, lang);
      return theme ? [code, theme] as [string, LocalTheme] : null;
    })).then(results => {
      const map: Record<string, LocalTheme> = {};
      for (const r of results) { if (r) map[r[0]] = r[1]; }
      setThemeMap(map);
    });
  }, [lang]);

  if (!mounted || authLoading) return <div className="min-h-screen" />;

  const completedLessons = Object.values(themeMap).reduce((sum, theme) =>
    sum + theme.lessons.filter(l =>
      lessonEffectivelyCompleted(l.id, l.theory?.length ?? 1, isLessonCompleted, getCompletedParties)
    ).length,
  0);
  const passedExams = Object.values(exams).filter(Boolean).length;

  // Progression globale (toutes parties confondues) — la métrique « suis-je
  // prêt pour l'examen ? », même unité que la route des thèmes et les médailles
  const globalParts = Object.values(themeMap).reduce((acc, theme) => {
    for (const lesson of theme.lessons) {
      const parts = countThemeParts(lesson.id, lesson.theory?.length ?? 1, isLessonCompleted, getCompletedParties);
      acc.done += parts.done;
      acc.total += parts.total;
    }
    return acc;
  }, { done: 0, total: 0 });
  const globalPct = globalParts.total > 0 ? Math.round((globalParts.done / globalParts.total) * 100) : 0;

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const sessionData = supabase ? await supabase.auth.getSession() : null;
      const token = sessionData?.data?.session?.access_token;
      if (!token) {
        setCancelError('Session expirée. Reconnecte-toi puis réessaie.');
        return;
      }
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setCancelled(true);
        setShowConfirm(false);
      } else {
        const data = await res.json().catch(() => null);
        setCancelError(data?.error || 'Erreur lors de la résiliation. Réessaie ou contacte le support.');
      }
    } catch {
      setCancelError('Erreur réseau. Vérifie ta connexion et réessaie.');
    } finally { setCancelling(false); }
  };

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('@onboarding_done');
    document.cookie = 'onboarding_done=; path=/; max-age=0; SameSite=Lax';
    window.location.href = '/login';
  };

  // ── Section abonnement ──
  const SubscriptionSection = () => {
    if (!premium) return null;
    if (cancelled) return (
      <div style={{ background: '#f0fdf4', borderRadius: 16, padding: 20, border: '1.5px solid #22c55e', marginTop: 16 }}>
        <p style={{ fontWeight: 800, fontSize: 15, color: '#16a34a', marginBottom: 4 }}>✅ Résiliation confirmée</p>
        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>
          Votre abonnement ne sera pas renouvelé. Votre accès premium reste actif jusqu&apos;à la fin de la période payée.
        </p>
      </div>
    );
    if (showConfirm) return (
      <div style={{ background: '#fef2f2', borderRadius: 16, padding: 20, border: '1.5px solid #ef4444', marginTop: 16 }}>
        <p style={{ fontWeight: 800, fontSize: 15, color: '#dc2626', marginBottom: 8 }}>Confirmer la résiliation ?</p>
        <p style={{ fontSize: 13, color: '#374151', marginBottom: 16, lineHeight: 1.6, margin: '0 0 16px' }}>
          Votre accès premium restera actif jusqu&apos;à la fin de la période en cours. Vous ne serez plus débité après.
        </p>
        {cancelError && (
          <p style={{ fontSize: 13, color: '#dc2626', fontWeight: 600, margin: '0 0 12px' }}>{cancelError}</p>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleCancel} disabled={cancelling}
            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
            {cancelling ? 'Résiliation...' : 'Oui, résilier'}
          </button>
          <button onClick={() => setShowConfirm(false)}
            style={{ background: 'var(--bg-card)', color: 'var(--text-title)', border: '1.5px solid var(--border-card)', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
            Annuler
          </button>
        </div>
      </div>
    );
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1.5px solid var(--border-card)', marginTop: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-title)', marginBottom: 4 }}>Abonnement Premium actif</p>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 16 }}>14,99€/mois · Renouvellement automatique</p>
        <button onClick={() => setShowConfirm(true)}
          style={{ background: 'none', border: '1.5px solid #ef4444', color: '#ef4444', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
          Résilier mon abonnement
        </button>
      </div>
    );
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

  const ThemeList = () => (
    <div className="flex flex-col gap-2">
      {THEME_ORDER.map(code => {
        const theme = themeMap[code];
        if (!theme) return (
          <div key={code} className="animate-pulse rounded-xl" style={{ height: 56, background: 'var(--border-subtle)' }} />
        );
        const done = theme.lessons.filter(l =>
          lessonEffectivelyCompleted(l.id, l.theory?.length ?? 1, isLessonCompleted, getCompletedParties)
        ).length;
        const total = theme.lessons.length;
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

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>

      {/* Page header */}
      <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)', paddingTop: 52, paddingBottom: 18, paddingLeft: 20, paddingRight: 20 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>Compte</p>
        <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--text-title)', letterSpacing: -0.5 }}>Mon profil</h1>
      </div>

      <div className="py-6 px-4">
      <div className="max-w-screen-xl mx-auto">

        {/* ── Rappel de renouvellement (≤ 2 jours) ── */}
        <RenewalNotice />

        {/* ════════════════════════════════════════
            MOBILE LAYOUT — lg:hidden
        ════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-4 pb-24">

          {/* 1. Avatar + nom */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex flex-col items-center">
              <AvatarCard size="sm" />
              <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{user?.username || t('pilote')}</h1>
              {user?.email && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>}
            </div>
          </div>

          {/* 2. Progression globale */}
          <div className="rounded-2xl p-4 flex flex-col items-center gap-2"
            style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
            <span className="text-2xl font-black" style={{ color: 'var(--brand)' }}>{globalPct}%</span>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: 'var(--border-subtle)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(globalPct, 2)}%`, background: 'var(--brand)' }} />
            </div>
            <span className="text-[11px] font-bold" style={{ color: 'var(--text-disabled)' }}>{t('profil_progression')}</span>
          </div>

          {/* 3. Performance par thème */}
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--brand)' }}>
              {t('performance_theme')}
            </h2>
            <ThemeList />
          </div>

          {/* 4. Ma collection */}
          <MedalCollection />

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
              <Link href="/choix-permis" className="flex items-center gap-3 px-4 py-3.5 press-scale"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span>🪪</span>
                <span className="text-sm font-bold flex-1" style={{ color: 'var(--text-secondary)' }}>
                  {t('profil_mon_permis')} : B
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--brand)' }}>{t('profil_changer_permis')} →</span>
              </Link>
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

          {/* 8. Abonnement */}
          <SubscriptionSection />

          {/* 9. Déconnexion */}
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
                </div>

                {/* Separator */}
                <div className="h-px mb-5" style={{ background: 'var(--border-subtle)' }} />

                {/* Progression globale */}
                <div className="rounded-xl p-4 text-center card-hover mb-5"
                  style={{ background: 'var(--card-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-xl font-black block mb-2" style={{ color: 'var(--brand)' }}>{globalPct}%</span>
                  <div className="w-full rounded-full overflow-hidden mb-2" style={{ height: 7, background: 'var(--border-subtle)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(globalPct, 2)}%`, background: 'var(--brand)' }} />
                  </div>
                  <p className="text-[10px] font-bold" style={{ color: 'var(--text-disabled)' }}>{t('profil_progression')}</p>
                </div>

              </div>

              {/* Share */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'PermiGo', text: `J'ai terminé ${completedLessons} leçons sur PermiGo !` });
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

              {/* Abonnement */}
              <SubscriptionSection />

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
                const theme = themeMap[code];
                if (!theme) return (
                  <div key={code} className="animate-pulse rounded-xl" style={{ height: 60, background: 'var(--border-subtle)' }} />
                );
                const done = theme.lessons.filter(l =>
                  lessonEffectivelyCompleted(l.id, l.theory?.length ?? 1, isLessonCompleted, getCompletedParties)
                ).length;
                const total = theme.lessons.length;
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

            {/* Ma collection */}
            <MedalCollection />

          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
