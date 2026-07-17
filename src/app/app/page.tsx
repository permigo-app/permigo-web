'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getThemeOrder, getThemeDataLocalized, type Lang } from '@/lib/lessonData';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import DesignUpdateModal from '@/components/DesignUpdateModal';
import { THEME_COLORS } from '@/lib/constants';
import { isLessonCompleted, getCompletedParties, getAllExams } from '@/lib/progressStorage';
import { countThemeParts, lessonEffectivelyCompleted } from '@/lib/medals';
import ExamRoute from '@/components/ExamRoute';
import GlobalTrophies from '@/components/GlobalTrophies';
import RenewalNotice from '@/components/RenewalNotice';
import OnboardingTour from '@/components/OnboardingTour';

function todayLabel() {
  return new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });
}

const THEME_STORAGE_KEY = 'pm_home_theme';

interface ThemeStats {
  code: string;
  title: string;
  // Leçons (info des tuiles) et parties (progression des médailles)
  lessonsCompleted: number;
  lessonsTotal: number;
  partsCompleted: number;
  partsTotal: number;
}

interface Stats {
  globalPct: number;
  partsCompleted: number;
  partsTotal: number;
  examsByTheme: Record<string, boolean>;
  themes: ThemeStats[];
}

async function buildStats(lang: Lang): Promise<Stats> {
  let globalParts = 0;
  let globalPartsDone = 0;
  const themes: ThemeStats[] = [];

  // Chargement PARALLÈLE des thèmes (en séquentiel, 6-9 allers-retours en
  // cascade faisaient ramer l'accueil sur mobile)
  const order = getThemeOrder();
  const loaded = await Promise.all(order.map(code => getThemeDataLocalized(code, lang)));
  for (let i = 0; i < order.length; i++) {
    const code = order[i];
    const theme = loaded[i];
    if (!theme) continue;
    let lessonsCompleted = 0;
    let partsCompleted = 0;
    let partsTotal = 0;
    for (const lesson of theme.lessons) {
      const nParts = lesson.theory?.length ?? 1;
      if (lessonEffectivelyCompleted(lesson.id, nParts, isLessonCompleted, getCompletedParties)) lessonsCompleted++;
      const { done, total } = countThemeParts(lesson.id, nParts, isLessonCompleted, getCompletedParties);
      partsCompleted += done;
      partsTotal += total;
    }
    globalParts += partsTotal;
    globalPartsDone += partsCompleted;
    themes.push({ code, title: theme.title, lessonsCompleted, lessonsTotal: theme.lessons.length, partsCompleted, partsTotal });
  }

  const globalPct = globalParts > 0 ? Math.round((globalPartsDone / globalParts) * 100) : 0;
  const examsByTheme = getAllExams();

  return { globalPct, partsCompleted: globalPartsDone, partsTotal: globalParts, examsByTheme, themes };
}

const ICONS = {
  lecons: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  turbo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  flash: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="13" height="15" rx="2" />
      <path d="M8 3h11a2 2 0 0 1 2 2v13" />
    </svg>
  ),
  erreurs: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  examen: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

interface Tile {
  href: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  color: { icon: string; bg: string };
  badge?: number;
  done?: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [stats, setStats] = useState<Stats>({
    globalPct: 0, partsCompleted: 0, partsTotal: 0,
    examsByTheme: {}, themes: [],
  });
  const [selectedTheme, setSelectedTheme] = useState('A');

  useEffect(() => {
    buildStats(lang).then(setStats);
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && getThemeOrder().includes(saved)) setSelectedTheme(saved);
  }, [lang]);

  const pickTheme = (code: string) => {
    setSelectedTheme(code);
    localStorage.setItem(THEME_STORAGE_KEY, code);
  };

  const themeStats = stats.themes.find(th => th.code === selectedTheme);
  const themeColor = THEME_COLORS[selectedTheme] || '#22D6C7';
  const themeExamPassed = stats.examsByTheme[selectedTheme] === true;

  const SECTIONS: { title: string; tour?: string; tiles: Tile[] }[] = [
    {
      title: t('section_apprendre'),
      tour: 'lecons',
      tiles: [
        {
          href: `/lecons/${selectedTheme}`,
          label: t('nav_lecons'),
          sub: themeStats ? `${themeStats.lessonsCompleted}/${themeStats.lessonsTotal} ${t('tile_lecons_theme_sub')}` : t('tile_lecons_sub'),
          icon: ICONS.lecons,
          color: { icon: '#22D6C7', bg: 'rgba(34,214,199,0.12)' },
        },
      ],
    },
    {
      title: t('section_entrainer'),
      tour: 'turbo',
      tiles: [
        {
          href: `/flash?theme=${selectedTheme}`,
          label: t('tile_flash_label'),
          sub: t('tile_flash_theme_sub'),
          icon: ICONS.flash,
          color: { icon: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
        },
        {
          href: `/turbo?theme=${selectedTheme}`,
          label: t('tile_reflexe_label'),
          sub: t('tile_reflexe_sub'),
          icon: ICONS.turbo,
          color: { icon: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
        },
      ],
    },
    {
      title: t('section_reviser'),
      tour: 'erreurs',
      tiles: [
        {
          href: `/revision?theme=${selectedTheme}`,
          label: t('tile_erreurs_label'),
          sub: t('tile_erreurs_theme_sub'),
          icon: ICONS.erreurs,
          color: { icon: '#F472B6', bg: 'rgba(244,114,182,0.12)' },
        },
      ],
    },
    {
      title: t('section_tester'),
      tiles: [
        {
          href: `/examen?theme=${selectedTheme}`,
          label: t('tile_examen_theme_label'),
          sub: t('tile_examen_theme_sub'),
          icon: ICONS.examen,
          color: { icon: themeColor, bg: 'rgba(34,214,199,0.12)' },
          done: themeExamPassed,
        },
      ],
    },
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
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: 'var(--text-hint)', letterSpacing: '0.5px', textTransform: 'capitalize' }}>
              {todayLabel()}
            </p>
            <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--text-title)', letterSpacing: -0.5 }}>
              {user?.username ? `${t('home_bonjour')}, ${user.username}` : t('home_bonjour')}
            </h1>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="hub-body" style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* ── Rappel de renouvellement (≤ 2 jours) ── */}
        <RenewalNotice />

        {/* ── Progression globale + trophées ── */}
        <div data-tour="progression">
          <GlobalTrophies
            globalPct={stats.globalPct}
            partsCompleted={stats.partsCompleted}
            partsTotal={stats.partsTotal}
            finalExamPassed={stats.examsByTheme['FINAL'] === true}
          />
        </div>

        {/* ── Sélecteur de thème ── */}
        <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
          {t('home_choisir_theme')}
        </p>
        <div className="theme-chips-wrap" data-tour="themes">
        <div className="theme-chips">
          {stats.themes.map((th) => {
            const active = th.code === selectedTheme;
            const complete = th.partsTotal > 0 && th.partsCompleted === th.partsTotal;
            const codeColor = active ? '#07080F' : complete ? '#16a34a' : 'var(--text-title)';
            const titleColor = active ? 'rgba(7,8,15,0.65)' : complete ? '#16a34a' : 'var(--text-sub)';
            return (
              <button
                key={th.code}
                onClick={() => pickTheme(th.code)}
                className="press-scale"
                style={{
                  flexShrink: 0, cursor: 'pointer',
                  padding: '9px 14px', borderRadius: 12,
                  background: active
                    ? 'linear-gradient(135deg, #22D6C7, #1AB8AB)'
                    : complete ? 'rgba(34,197,94,0.14)' : 'var(--bg-card)',
                  border: active
                    ? '1px solid transparent'
                    : complete ? '1.5px solid #22c55e' : '1px solid var(--border-card)',
                  fontFamily: 'Sora, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 800, color: codeColor }}>
                  {th.code}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: titleColor, whiteSpace: 'nowrap' }}>
                  {th.title}
                </span>
                {complete && (
                  <span style={{ color: active ? '#07080F' : '#16a34a', display: 'inline-flex' }}>{ICONS.check}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="theme-chips-fade" />
        </div>

        {/* ── Route du thème sélectionné (médailles + diamant) ── */}
        <div data-tour="route">
          <ExamRoute
            themeCode={selectedTheme}
            themeTitle={themeStats?.title ?? ''}
            partsCompleted={themeStats?.partsCompleted ?? 0}
            partsTotal={themeStats?.partsTotal ?? 0}
            examPassed={themeExamPassed}
          />
        </div>

        {/* ── Sections du thème ── */}
        <div className="hub-sections">
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 20 }} {...(section.tour ? { 'data-tour': section.tour } : {})}>
            <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
              {section.title}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: section.tiles.length === 1 ? '1fr' : '1fr 1fr', gap: 12 }}>
              {section.tiles.map((tile) => (
                <Link key={tile.href} href={tile.href} style={{ textDecoration: 'none' }}>
                  <div
                    className="press-scale"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 18, padding: '16px', cursor: 'pointer',
                      position: 'relative', height: '100%',
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
                    {tile.badge !== undefined && tile.badge > 0 && (
                      <span style={{
                        position: 'absolute', top: 12, right: 12,
                        minWidth: 20, height: 20, borderRadius: 99, padding: '0 6px',
                        background: '#5B9EFF', color: '#fff',
                        fontSize: 11, fontWeight: 800,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {tile.badge}
                      </span>
                    )}
                    {tile.done && (
                      <span style={{
                        position: 'absolute', top: 12, right: 12,
                        width: 20, height: 20, borderRadius: 99,
                        background: 'rgba(34,214,199,0.15)', color: '#22D6C7',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {ICONS.check}
                      </span>
                    )}
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: tile.color.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: tile.color.icon, marginBottom: 11,
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
        ))}
        </div>

      </div>
    </div>
    <DesignUpdateModal userId={user?.id} />
    <OnboardingTour />
    </>
  );
}
