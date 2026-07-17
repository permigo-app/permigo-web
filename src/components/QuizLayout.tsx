'use client';

import { type ReactNode, useEffect } from 'react';
import SignImage from '@/components/SignImage';
import { useLang } from '@/contexts/LanguageContext';
import ImageRequestButton from '@/components/ImageRequestButton';
import { playSound } from '@/lib/sounds';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export interface QuizChoice {
  text: string;
  index: number;
}

interface QuizLayoutProps {
  /* Header */
  progress: number; // 0-100
  progressLabel?: string; // e.g. "3/10"
  headerLeft?: ReactNode; // e.g. close button
  headerCenter?: ReactNode; // e.g. timer
  headerRight?: ReactNode; // e.g. score

  /* Question */
  subtitle?: string; // e.g. "Partie 1 — Quiz"
  question: string;
  signCode?: string;
  imageUrl?: string; // illustration de situation (GOCA-style), affichée au-dessus de la question

  /* Choices */
  choices: string[];
  selected: number | null;
  validated: boolean;
  correctIndex: number;
  onSelect: (i: number) => void;

  /* Actions */
  onValidate: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  lastLabel?: string; // default "VOIR RÉSULTATS →"

  /* Sidebar */
  sidebar?: ReactNode;

  /* Feedback */
  explanation?: string;
  shakeWrong?: boolean;

  /* Image request */
  questionId?: string;
}

export default function QuizLayout({
  progress,
  progressLabel,
  headerLeft,
  headerCenter,
  headerRight,
  subtitle,
  question,
  signCode,
  imageUrl,
  choices,
  selected,
  validated,
  correctIndex,
  onSelect,
  onValidate,
  onNext,
  isLastQuestion,
  lastLabel = 'VOIR RÉSULTATS →',
  sidebar,
  explanation,
  shakeWrong,
  questionId,
}: QuizLayoutProps) {
  const { t } = useLang();
  const isCorrect = selected === correctIndex;

  useEffect(() => {
    if (validated) {
      playSound(isCorrect ? 'correct' : 'wrong');
    }
  }, [validated, isCorrect]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-30 px-6 py-3"
        style={{ background: 'var(--bg-blur)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            {headerLeft}
            <div className="flex-1 flex items-center justify-center gap-3">
              {headerCenter}
            </div>
            {headerRight}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'var(--brand)' }}
              />
            </div>
            {progressLabel && (
              <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--brand)' }}>{progressLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2-column layout ── */}
      <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-6">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* ── Left: Question + Answers (60%) ── */}
          <div className="flex-1 min-w-0 lg:flex-[3]">
            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-disabled)' }}>{subtitle}</p>
            )}

            {/* Illustration de situation (prioritaire sur le panneau seul) */}
            {imageUrl && (
              <div className="flex justify-center mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  loading="lazy"
                  className="rounded-xl w-full max-w-md"
                  style={{ border: '1px solid var(--border-subtle)', aspectRatio: '4 / 3', objectFit: 'cover', background: 'var(--card-secondary)' }}
                />
              </div>
            )}

            {/* Sign image */}
            {!imageUrl && signCode && (
              <div className="flex justify-center mb-5">
                <div className="rounded-xl p-4 flex items-center justify-center" style={{ background: 'var(--card-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <SignImage code={signCode} size={120} />
                </div>
              </div>
            )}

            {/* Question */}
            <p className="text-2xl font-bold text-center mb-3 leading-relaxed max-w-2xl mx-auto fade-in-up" style={{ color: 'var(--text-primary)' }}>{question}</p>

            {/* Image request — juste sous la question, masqué si un panneau est déjà affiché */}
            {questionId && !signCode && !imageUrl && <ImageRequestButton id={questionId} />}

            {/* Answer grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              {choices.map((choice, i) => {
                let bg = 'var(--card-primary)';
                let border = '1px solid var(--border-subtle)';
                let textCol = 'var(--text-primary)';
                let labelBg = 'var(--card-secondary)';
                let labelCol = 'var(--text-primary)';
                let icon: string | null = null;

                if (validated) {
                  if (i === correctIndex) {
                    bg = 'rgba(46,204,113,0.12)';
                    border = '2px solid var(--success)';
                    textCol = 'var(--success)';
                    labelBg = 'var(--success)';
                    labelCol = '#ffffff';
                    icon = '✓';
                  } else if (i === selected) {
                    bg = 'rgba(231,76,60,0.12)';
                    border = '2px solid var(--error)';
                    textCol = 'var(--error)';
                    labelBg = 'var(--error)';
                    labelCol = '#ffffff';
                    icon = '✗';
                  }
                } else if (i === selected) {
                  bg = 'rgba(78,205,196,0.15)';
                  border = '2px solid var(--brand)';
                  labelBg = 'var(--brand)';
                  labelCol = 'var(--bg-primary)';
                  textCol = 'var(--text-primary)';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !validated && onSelect(i)}
                    disabled={validated}
                    className={`rounded-xl p-5 flex items-center gap-3 text-left press-scale ${
                      shakeWrong && validated && i === selected && i !== correctIndex ? 'shake' : ''
                    } ${validated && i === correctIndex ? 'correct-pulse' : ''
                    } ${validated && i === selected && i !== correctIndex ? 'wrong-flash' : ''}`}
                    style={{ background: bg, border, minHeight: 80, cursor: validated ? 'default' : 'pointer', transition: 'background 0s, border-color 0s' }}
                    onMouseEnter={e => {
                      if (!validated && i !== selected) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(78,205,196,0.12)';
                        (e.currentTarget as HTMLButtonElement).style.border = '1px solid var(--brand)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!validated && i !== selected) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-primary)';
                        (e.currentTarget as HTMLButtonElement).style.border = '1px solid var(--border-subtle)';
                      }
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: labelBg, color: labelCol }}
                    >
                      {icon || CHOICE_LABELS[i]}
                    </div>
                    <span className="flex-1 text-sm font-semibold leading-relaxed" style={{ color: textCol }}>
                      {choice}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* XP float particle on correct */}
            {validated && isCorrect && (
              <div className="relative flex justify-center pointer-events-none" style={{ height: 0 }}>
                <span className="absolute xp-float-particle text-lg font-black" style={{ color: 'var(--premium)', top: -20 }}>
                  +10 ✨
                </span>
              </div>
            )}

            {/* Feedback panel after validation */}
            {validated && (
              <div
                className="rounded-2xl p-5 mb-5 feedback-slide"
                style={{
                  background: isCorrect ? 'rgba(46,204,113,0.10)' : 'rgba(231,76,60,0.10)',
                  border: `1.5px solid ${isCorrect ? 'rgba(46,204,113,0.4)' : 'rgba(231,76,60,0.4)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{isCorrect ? '🎉' : '😅'}</span>
                  <span className="text-base font-black" style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                    {isCorrect ? t('correct') : t('incorrect')}
                  </span>
                </div>
                {explanation && <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{explanation}</p>}
              </div>
            )}

            {/* Validate / Next button */}
            {!validated ? (
              <button
                onClick={onValidate}
                disabled={selected === null}
                className="w-full py-4 rounded-xl font-black text-base press-scale btn-glow-teal"
                style={{
                  background: 'var(--brand)',
                  color: 'var(--bg-primary)',
                  cursor: selected !== null ? 'pointer' : 'not-allowed',
                  opacity: selected !== null ? 1 : 0.35,
                }}
              >
                {t('valider')}
              </button>
            ) : (
              <button
                onClick={onNext}
                className="w-full py-4 rounded-xl font-black text-base press-scale btn-glow-green"
                style={{ background: 'var(--success)', color: '#ffffff' }}
              >
                {isLastQuestion ? lastLabel : t('question_suivante')}
              </button>
            )}
          </div>

          {/* ── Right sidebar (40%) — desktop only ── */}
          {sidebar && (
            <div className="hidden lg:block lg:flex-[2] lg:max-w-[280px] xl:max-w-[380px]">
              <div className="sticky top-20 flex flex-col gap-5">
                {sidebar}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
