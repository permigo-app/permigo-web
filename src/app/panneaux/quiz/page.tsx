'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SignImage from '@/components/SignImage';
import rawQuizData from '@/data/panneaux_quiz.json';

interface QuizQuestion {
  id: string;
  sign: string;
  question: string;
  answers: string[];
  correct: number;
  explanation: string;
}

interface QuizCategory {
  id: string;
  title: string;
  color: string;
  icon: string;
  questions: QuizQuestion[];
}

interface ShuffledAnswer {
  text: string;
  originalIdx: number;
}

const quizData = rawQuizData as { categories: QuizCategory[] };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizContent() {
  const params = useSearchParams();
  const router = useRouter();
  const catId = params.get('cat') ?? 'F';

  const cat = quizData.categories.find(c => c.id === catId);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState<ShuffledAnswer[]>([]);
  const [selected, setSelected] = useState<number | null>(null); // index into shuffledAnswers
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Init questions
  useEffect(() => {
    if (cat) {
      setQuestions(shuffle(cat.questions));
      setCurrent(0);
      setSelected(null);
      setScore(0);
      setDone(false);
    }
  }, [catId]); // eslint-disable-line

  // Shuffle answers when question changes
  useEffect(() => {
    const q = questions[current];
    if (!q) return;
    setShuffledAnswers(
      shuffle(q.answers.map((text, i) => ({ text, originalIdx: i })))
    );
  }, [current, questions]);

  if (!cat) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Catégorie introuvable</p>
          <Link href="/panneaux" className="text-sm font-bold" style={{ color: 'var(--brand)' }}>← Retour aux panneaux</Link>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const total = questions.length;

  const handleAnswer = (displayIdx: number) => {
    if (selected !== null) return;
    setSelected(displayIdx);
    if (shuffledAnswers[displayIdx].originalIdx === q.correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 >= total) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setQuestions(shuffle(cat.questions));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  // ── Final screen ──────────────────────────────────────────────
  if (done) {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 70;
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-md mx-auto w-full px-4 py-12 flex flex-col items-center text-center gap-6">
          <span style={{ fontSize: 72 }}>{passed ? '🏆' : '💪'}</span>
          <h1 className="text-3xl font-black" style={{ color: passed ? '#22c55e' : '#f59e0b' }}>
            {passed ? 'Bravo !' : 'Continue !'}
          </h1>

          {/* Score circle */}
          <div
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center"
            style={{ border: `5px solid ${passed ? '#22c55e' : '#f59e0b'}`, background: (passed ? '#22c55e' : '#f59e0b') + '15' }}
          >
            <span className="text-4xl font-black">{pct}%</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{score}/{total}</span>
          </div>

          <div className="rounded-2xl px-6 py-3" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Catégorie <span className="font-black" style={{ color: cat.color }}>{cat.title}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleRestart}
              className="w-full py-4 rounded-2xl font-black text-sm press-scale"
              style={{ background: cat.color, color: '#fff' }}
            >
              🔄 Recommencer
            </button>
            <Link
              href="/panneaux"
              className="w-full py-4 rounded-2xl font-black text-sm text-center press-scale block"
              style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              ← Retour aux panneaux
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!q || shuffledAnswers.length === 0) return null;

  const answered = selected !== null;
  const selectedIsCorrect = answered && shuffledAnswers[selected].originalIdx === q.correct;

  // ── Quiz screen ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={() => router.push('/panneaux')}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 press-scale"
          style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: 16 }}>←</span>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate" style={{ color: cat.color }}>{cat.title}</p>
          {/* Progress bar */}
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((current + (answered ? 1 : 0)) / total) * 100}%`, background: cat.color }}
            />
          </div>
        </div>

        <span className="text-xs font-black flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {current + 1}/{total}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Sign image */}
        <div
          className="rounded-3xl flex items-center justify-center py-8"
          style={{ background: cat.color + '10', border: `1.5px solid ${cat.color}30`, minHeight: 180 }}
        >
          <SignImage code={q.sign} size={140} />
        </div>

        {/* Question */}
        <p className="text-[18px] font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {q.question}
        </p>

        {/* Answer choices */}
        <div className="flex flex-col gap-2.5">
          {shuffledAnswers.map((ans, displayIdx) => {
            const isCorrectAnswer = ans.originalIdx === q.correct;
            let bg = 'var(--card-primary)';
            let border = '2px solid var(--border-subtle)';
            let textColor = 'var(--text-primary)';
            let icon = '';

            if (answered) {
              if (displayIdx === selected) {
                if (selectedIsCorrect) {
                  bg = '#22c55e18'; border = '2px solid #22c55e'; textColor = '#16a34a'; icon = '✓';
                } else {
                  bg = '#ef444418'; border = '2px solid #ef4444'; textColor = '#dc2626'; icon = '✗';
                }
              } else if (isCorrectAnswer) {
                bg = '#22c55e10'; border = '2px solid #22c55e80'; textColor = '#16a34a'; icon = '✓';
              }
            } else if (displayIdx === selected) {
              bg = cat.color + '15'; border = `2px solid ${cat.color}`;
            }

            return (
              <button
                key={displayIdx}
                onClick={() => handleAnswer(displayIdx)}
                disabled={answered}
                className="w-full text-left px-4 py-3.5 rounded-2xl font-semibold text-sm press-scale transition-colors duration-200 flex items-center justify-between gap-3"
                style={{ background: bg, border, color: textColor, cursor: answered ? 'default' : 'pointer' }}
              >
                <span>{ans.text}</span>
                {icon && <span className="font-black text-base flex-shrink-0">{icon}</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && q.explanation && (
          <div
            className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
            style={{
              background: selectedIsCorrect ? '#22c55e10' : '#f59e0b10',
              border: `1px solid ${selectedIsCorrect ? '#22c55e40' : '#f59e0b40'}`,
              color: 'var(--text-secondary)',
            }}
          >
            <span className="font-bold" style={{ color: selectedIsCorrect ? '#16a34a' : '#d97706' }}>
              {selectedIsCorrect ? '✓ Bonne réponse · ' : 'ⓘ  '}
            </span>
            {q.explanation}
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl font-black text-sm press-scale"
            style={{ background: cat.color, color: cat.id === 'F' ? '#fff' : '#fff' }}
          >
            {current + 1 < total ? 'Question suivante →' : 'Voir le score →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PanneauxQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Chargement…</p>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
