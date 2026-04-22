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
        style={{ background: 'rgba(10,14,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #2A3550' }}
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
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: '#4ecdc4' }}
              />
            </div>
            {progressLabel && (
              <span className="text-xs font-bold flex-shrink-0" style={{ color: '#4ecdc4' }}>{progressLabel}</span>
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
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#5A6B8A' }}>{subtitle}</p>
            )}

            {/* Sign image */}
            {signCode && (
              <div className="flex justify-center mb-5">
                <div className="rounded-xl p-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <SignImage code={signCode} size={120} />
                </div>
              </div>
            )}

            {/* Question */}
            <p className="text-2xl font-bold text-white text-center mb-3 leading-relaxed max-w-2xl mx-auto fade-in-up">{question}</p>

            {/* Image request — juste sous la question, masqué si un panneau est déjà affiché */}
            {questionId && !signCode && <ImageRequestButton id={questionId} />}

            {/* Answer grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              {choices.map((choice, i) => {
                let bg = 'rgba(255,255,255,0.07)';
                let border = '1px solid rgba(255,255,255,0.15)';
                let textCol = '#e5e7eb';
                let labelBg = 'rgba(255,255,255,0.15)';
                let labelCol = 'white';
                let icon: string | null = null;

                if (validated) {
                  if (i === correctIndex) {
                    bg = 'rgba(46,204,113,0.15)';
                    border = '2px solid #2ecc71';
                    textCol = '#2ecc71';
                    labelBg = '#2ecc71';
                    labelCol = 'white';
                    icon = '✓';
                  } else if (i === selected) {
                    bg = 'rgba(231,76,60,0.15)';
                    border = '2px solid #e74c3c';
                    textCol = '#e74c3c';
                    labelBg = '#e74c3c';
                    labelCol = 'white';
                    icon = '✗';
                  }
                } else if (i === selected) {
                  bg = 'rgba(78,205,196,0.15)';
                  border = '2px solid #4ecdc4';
                  labelBg = '#4ecdc4';
                  labelCol = '#0a0e2a';
                  textCol = 'white';
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
                        e.currentTarget.style.background = 'rgba(78,205,196,0.12)';
                        e.currentTarget.style.borderColor = '#4ecdc4';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!validated && i !== selected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
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
                <span className="absolute xp-float-particle text-lg font-black" style={{ color: '#FFD700', top: -20 }}>
                  +10 ✨
                </span>
              </div>
            )}

            {/* Feedback panel after validation */}
            {validated && (
              <div
                className="rounded-2xl p-5 mb-5 feedback-slide"
                style={{
                  background: isCorrect ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)',
                  border: `1.5px solid ${isCorrect ? 'rgba(46,204,113,0.4)' : 'rgba(231,76,60,0.4)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{isCorrect ? '🎉' : '😅'}</span>
                  <span className="text-base font-black" style={{ color: isCorrect ? '#2ecc71' : '#e74c3c' }}>
                    {isCorrect ? t('correct') : t('incorrect')}
                  </span>
                </div>
                {explanation && <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>{explanation}</p>}
              </div>
            )}

            {/* Validate / Next button */}
            {!validated ? (
              <button
                onClick={onValidate}
                disabled={selected === null}
                className="w-full py-4 rounded-xl font-black text-base press-scale btn-glow-teal"
                style={{
                  background: selected !== null ? 'linear-gradient(135deg, #4ecdc4, #26a69a)' : 'linear-gradient(135deg, #4ecdc4, #26a69a)',
                  color: selected !== null ? '#0a0e2a' : '#0a0e2a',
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
                style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: 'white' }}
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
