'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getThemeData, type LocalTheme } from '@/lib/lessonData';
import { THEME_EMOJIS, THEME_CITIES } from '@/lib/constants';
import { isLessonCompleted, getLessonProgress, isExamPassed } from '@/lib/progressStorage';
import { useLang } from '@/contexts/LanguageContext';
import ProgressBar from '@/components/ui/ProgressBar';
import { SkeletonList } from '@/components/ui/SkeletonList';

interface LessonRow {
  id: string;
  title: string;
  index: number;
  status: 'done' | 'active' | 'todo';
  pct: number;
}

export default function ThemeDetailPage() {
  const params = useParams();
  const { t } = useLang();
  const code = (params.code as string).toUpperCase();

  const [theme, setTheme] = useState<LocalTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [themePct, setThemePct] = useState(0);
  const [examPassed, setExamPassed] = useState(false);

  useEffect(() => {
    setLoading(true);
    getThemeData(code).then(t => {
      setTheme(t);
      setLoading(false);
    });
  }, [code]);

  useEffect(() => {
    if (!theme) return;
    const rows: LessonRow[] = theme.lessons.map((lesson, i) => {
      const done = isLessonCompleted(lesson.id);
      const prog = getLessonProgress(lesson.id);
      const pct = prog.total > 0 ? Math.round((prog.cardsViewed / prog.total) * 100) : 0;
      let status: 'done' | 'active' | 'todo';
      if (done) status = 'done';
      else if (prog.cardsViewed > 0) status = 'active';
      else status = 'todo';
      return { id: lesson.id, title: lesson.title, index: i + 1, status, pct };
    });
    const doneCount = rows.filter(r => r.status === 'done').length;
    setThemePct(Math.round((doneCount / rows.length) * 100));
    setLessons(rows);
    setExamPassed(isExamPassed(code));
  }, [theme, code]);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>
        <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)', paddingTop: 52, paddingBottom: 20, paddingLeft: 20, paddingRight: 20, height: 120 }} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
          <SkeletonList count={5} height={64} />
        </div>
      </div>
    );
  }

  if (!theme) return null;

  const city = THEME_CITIES[code] || '';
  const emoji = THEME_EMOJIS[code] || '📖';
  const nextLesson = lessons.find(l => l.status !== 'done');
  const doneCount = lessons.filter(l => l.status === 'done').length;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif', paddingBottom: 140 }}>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)', paddingTop: 52, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <Link href="/lecons" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span style={{ fontSize: 13, color: 'var(--text-hint)', fontWeight: 500 }}>Leçons</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--bg-input)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>
              {emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
                THÈME {code} · {city}
              </p>
              <h1 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: 'var(--text-title)', lineHeight: 1.2 }}>
                {t('theme_title_' + code)}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <ProgressBar pct={themePct} height={7} color="#0b2659" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>
              {doneCount}/{lessons.length}
            </span>
          </div>

        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>

        {/* ── QUICK TOOLS ────────────────────────────────────────── */}
        <div className="theme-tools">
          <Link href={`/flash?theme=${code}`} className="tool-btn">
            <span className="tool-icon">🃏</span>
            <span className="tool-label">{t('tool_flashcards')}</span>
          </Link>
          <Link href={`/revision?theme=${code}`} className="tool-btn">
            <span className="tool-icon">🔄</span>
            <span className="tool-label">{t('tool_revision')}</span>
          </Link>
        </div>

        <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
          {lessons.length} {lessons.length > 1 ? t('lecons_a_etudier_pl') : t('lecons_a_etudier_sing')}
        </p>

        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 18, overflow: 'hidden' }}>
          {lessons.map((lesson, i) => (
            <Link key={lesson.id} href={`/lecon/${lesson.id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  borderBottom: i < lessons.length - 1 ? '1px solid var(--border-row)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Status icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: lesson.status === 'done' ? '#0b2659' : lesson.status === 'active' ? 'var(--bg-icon)' : 'var(--bg-input)',
                  border: `1.5px solid ${lesson.status === 'done' ? '#f59e0b' : lesson.status === 'active' ? 'var(--text-navy)' : 'var(--border-card)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {lesson.status === 'done' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : lesson.status === 'active' ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-navy)" strokeWidth="0">
                      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-hint)' }}>{lesson.index}</span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t('lesson_title_' + lesson.id)}
                  </p>
                  {lesson.status === 'active' && lesson.pct > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <ProgressBar pct={lesson.pct} height={4} color="#0b2659" />
                    </div>
                  )}
                  {lesson.status === 'done' && (
                    <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 600, color: '#22c55e' }}>{t('lecon_terminee')}</p>
                  )}
                </div>

                {/* Badge + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {lesson.status === 'active' && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-navy)', background: 'var(--bg-icon)', padding: '3px 9px', borderRadius: 20 }}>
                      {t('lecon_en_cours_badge')}
                    </span>
                  )}
                  {lesson.status === 'todo' && (
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-hint)' }}>
                      {t('lecon_a_faire')}
                    </span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── EXAM BLOCK ─────────────────────────────────────────── */}
        <div className="theme-exam-block">
          <div className="theme-exam-separator">
            <div className="separator-line" />
            <span className="separator-label">{t('theme_separator')}</span>
            <div className="separator-line" />
          </div>

          <Link
            href={`/examen?theme=${code}`}
            className="theme-exam-card"
            title={`Passer l'examen du Thème ${code}`}
          >
            <div className="theme-exam-icon">📋</div>
            <div className="theme-exam-info">
              <p className="theme-exam-eyebrow">{t('theme_exam_eyebrow')}</p>
              <p className="theme-exam-title">{t('theme_exam_validate')} {code}</p>
              <p className="theme-exam-sub">{t('theme_exam_sub')}</p>
            </div>
            <div className="theme-exam-status">
              {examPassed ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  {t('theme_exam_passed')}
                </span>
              ) : '→'}
            </div>
          </Link>
        </div>

        {themePct === 100 && (
          <div style={{
            marginTop: 16,
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            borderRadius: 14,
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{t('theme_finished_title')}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4ade80' }}>{t('theme_finished_sub')}</p>
            </div>
          </div>
        )}

      </div>

      {/* ── FIXED BOTTOM CTA ─────────────────────────────────────── */}
      {nextLesson && (
        <div style={{
          position: 'fixed', bottom: 70, left: 0, right: 0,
          padding: '0 16px', zIndex: 40, pointerEvents: 'none',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', pointerEvents: 'auto' }}>
            <Link href={`/lecon/${nextLesson.id}`} style={{ textDecoration: 'none' }}>
              <div
                className="press-scale"
                style={{
                  background: '#0b2659',
                  borderRadius: 14,
                  padding: '15px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(11,38,89,.30)',
                }}
              >
                {nextLesson.status === 'active'
                  ? `${t('lecon_reprendre_cta')} ${nextLesson.index} →`
                  : `${t('lecon_commencer_cta')} ${nextLesson.index} ▶`}
              </div>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
