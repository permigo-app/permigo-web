'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { THEME_ORDER, getThemeData } from '@/lib/lessonData';
import { THEME_EMOJIS } from '@/lib/constants';
import { isLessonCompleted } from '@/lib/progressStorage';
import { isPremium } from '@/lib/premium';
import { useLang } from '@/contexts/LanguageContext';
import ProgressBar from '@/components/ui/ProgressBar';
import PageHeader from '@/components/ui/PageHeader';
import { SkeletonList } from '@/components/ui/SkeletonList';

interface ThemeRow {
  code: string;
  title: string;
  emoji: string;
  pct: number;
  done: number;
  total: number;
  firstLessonId: string;
}

export default function LeconsPage() {
  const { t } = useLang();
  const router = useRouter();
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [userIsPremium, setUserIsPremium] = useState(false);

  useEffect(() => { setUserIsPremium(isPremium()); }, []);

  useEffect(() => {
    const load = async () => {
      const rows = (await Promise.all(THEME_ORDER.map(async (code) => {
        const theme = await getThemeData(code);
        if (!theme) return null;
        const done = theme.lessons.filter((l) => isLessonCompleted(l.id)).length;
        const total = theme.lessons.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return {
          code,
          title: theme.title,
          emoji: THEME_EMOJIS[code] || '📖',
          pct,
          done,
          total,
          firstLessonId: theme.lessons[0]?.id ?? '',
        };
      }))).filter(Boolean) as ThemeRow[];
      setThemes(rows);
    };
    load();
  }, []);

  const totalDone = themes.reduce((a, t) => a + t.done, 0);
  const totalAll = themes.reduce((a, t) => a + t.total, 0);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>
      <PageHeader
        title={t('lecons_page_title')}
        sub={`${totalDone} ${t('lecons_done_of')} ${totalAll}`}
        eyebrow={t('nav_lecons')}
      />

      <div className="lecons-body" style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>
        {themes.length === 0 && <SkeletonList count={9} height={64} />}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-card)',
          borderRadius: 18,
          overflow: 'hidden',
        }}>
          {themes.map((row, i) => {
            const locked = !userIsPremium && row.code !== 'A';
            const inner = (
              <div
                className="press-scale"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px',
                  borderBottom: i < themes.length - 1 ? '1px solid var(--border-row)' : 'none',
                  cursor: 'pointer',
                  opacity: locked ? 0.6 : 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* icône / check / lock */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: locked ? 'var(--bg-input)' : row.pct === 100 ? '#0b2659' : 'var(--bg-icon)',
                  border: `1.5px solid ${locked ? 'var(--border-card)' : row.pct === 100 ? '#f59e0b' : 'var(--border-card)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {locked ? (
                    <span style={{ fontSize: 20 }}>🔒</span>
                  ) : row.pct === 100 ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 22 }}>{row.emoji}</span>
                  )}
                </div>

                {/* content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: locked ? 2 : 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-title)', lineHeight: 1.35 }}>
                      {t('theme_title_' + row.code)}
                    </span>
                    {locked && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#FFD700', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
                        Premium
                      </span>
                    )}
                  </div>
                  {!locked && <ProgressBar pct={row.pct} height={6} color="#0b2659" />}
                  {locked && (
                    <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>Débloquer avec Premium →</span>
                  )}
                </div>

                {/* % + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {locked ? (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#FFD700' }}>7€/mois</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', minWidth: 34, textAlign: 'right' }}>
                      {row.pct}%
                    </span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            );

            return locked ? (
              <div key={row.code} onClick={() => router.push('/premium')}>{inner}</div>
            ) : (
              <Link key={row.code} href={`/lecons/${row.code}`} style={{ textDecoration: 'none' }}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
