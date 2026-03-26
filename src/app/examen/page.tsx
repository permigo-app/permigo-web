'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getExamQuestions, getNextThemeCode, type LocalQuestion } from '@/lib/lessonData';
import { setExamPassed, unlockTheme, updateQuizHistory, updateXP, checkAndUpdateStreak } from '@/lib/progressStorage';
import { THEME_COLORS, GASTON_CORRECT, GASTON_WRONG, getRandomMessage } from '@/lib/constants';
import SignImage from '@/components/SignImage';
import Gaston from '@/components/Gaston';

function ExamContent() {
  const params = useSearchParams();
  const router = useRouter();
  const themeCode = params.get('theme') || 'FINAL';
  const questionCount = 50;

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [gastonMsg, setGastonMsg] = useState('');
  const [gastonExpr, setGastonExpr] = useState<'happy' | 'impressed' | 'unhappy' | 'thinking'>('thinking');

  const color = THEME_COLORS[themeCode] || '#74B9FF';

  const startExam = () => {
    const qs = getExamQuestions(themeCode, questionCount);
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setStarted(true);
    setGastonMsg('Réfléchis bien... 🤔');
    setGastonExpr('thinking');
  };

  const handleValidate = () => {
    if (selected === null || validated) return;
    setValidated(true);
    const isCorrect = selected === questions[currentQ].correct;
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setGastonMsg(getRandomMessage(GASTON_CORRECT));
      setGastonExpr('impressed');
    } else {
      setGastonMsg(getRandomMessage(GASTON_WRONG));
      setGastonExpr('unhappy');
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setValidated(false);
    setGastonMsg('Réfléchis bien... 🤔');
    setGastonExpr('thinking');
    if (currentQ + 1 < questions.length) { setCurrentQ(q => q + 1); }
    else { finishExam(); }
  };

  const finishExam = () => {
    const total = questions.length;
    const pct = total > 0 ? (correctCount / total) * 100 : 0;
    const passed = pct >= 82;
    updateQuizHistory(correctCount, total);
    checkAndUpdateStreak();
    let xpEarned = correctCount * 10;
    if (passed) {
      xpEarned += 50;
      if (themeCode !== 'FINAL') {
        setExamPassed(themeCode);
        const next = getNextThemeCode(themeCode);
        if (next) unlockTheme(next);
      }
    }
    updateXP(xpEarned);
    router.push(`/resultats?correct=${correctCount}&total=${total}&stars=0&xp=${xpEarned}&theme=${themeCode}&exam=1`);
  };

  // Start screen
  if (!started) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <span className="text-[80px] block mb-4">📝</span>
        <h1 className="text-2xl font-black mb-2">
          {themeCode === 'FINAL' ? 'Examen blanc final' : `Examen — Thème ${themeCode}`}
        </h1>
        <p className="text-sm mb-1" style={{ color: '#8B9DC3' }}>
          {questionCount} questions
        </p>
        <p className="text-sm mb-8" style={{ color: '#8B9DC3' }}>
          41/50 pour réussir (82%)
        </p>
        <div className="mb-8">
          <Gaston message="Prêt pour l'examen ? Concentre-toi ! 🎓" expression="happy" />
        </div>
        <button
          onClick={startExam}
          className="px-10 py-4 rounded-2xl font-black text-lg text-white press-scale"
          style={{ background: color, boxShadow: `0 4px 16px ${color}50` }}
        >
          Commencer l&apos;examen
        </button>
      </div>
    );
  }

  // Exam in progress
  const q = questions[currentQ];
  if (!q) return null;
  const pctDone = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.push('/')} className="w-9 h-9 rounded-full flex items-center justify-center text-sm press-scale" style={{ background: '#16213E' }}>
          ✕
        </button>
        <div className="flex-1">
          <div className="h-[10px] rounded-full overflow-hidden" style={{ background: '#1E2D4A' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctDone}%`, background: color }} />
          </div>
        </div>
        <span className="text-xs font-bold" style={{ color: '#8B9DC3' }}>{currentQ + 1}/{questions.length}</span>
      </div>

      {/* Score badge */}
      <div className="flex justify-end mb-4">
        <div className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(243,156,18,0.12)', color: '#F39C12' }}>
          {correctCount} correct{correctCount > 1 ? 's' : ''}
        </div>
      </div>

      {q.sign && (
        <div className="flex justify-center mb-4"><SignImage code={q.sign} size={100} /></div>
      )}

      <p className="text-xl font-bold text-center mb-6 leading-relaxed">{q.question}</p>

      {/* 2-column answer grid */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {q.choices.map((choice, i) => {
          let bg = '#16213E';
          let borderColor = '#3A3A5C';
          let textColor = 'white';
          if (validated) {
            if (i === q.correct) { bg = '#0D3B20'; borderColor = '#27AE60'; textColor = '#4ADE80'; }
            else if (i === selected) { bg = '#3B0D0D'; borderColor = '#E74C3C'; textColor = '#FC8181'; }
          } else if (i === selected) {
            bg = 'rgba(0,184,148,0.13)'; borderColor = '#00B894';
          }
          return (
            <button key={i} onClick={() => !validated && setSelected(i)} disabled={validated}
              className="rounded-2xl p-4 text-left font-semibold text-[15px] transition-all press-scale"
              style={{ background: bg, border: `2px solid ${borderColor}`, color: textColor, minHeight: 70 }}>
              {choice}
            </button>
          );
        })}
      </div>

      {validated && (
        <div className="rounded-t-[28px] p-5 mb-4 slide-up" style={{ background: selected === q.correct ? '#1A5C38' : '#6B1A1A' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{selected === q.correct ? '🎉' : '😅'}</span>
            <span className="text-lg font-bold">{selected === q.correct ? 'Correct !' : 'Incorrect'}</span>
          </div>
          <p className="text-sm leading-relaxed opacity-90">{q.explanation}</p>
        </div>
      )}

      <div className="mb-4">
        <Gaston message={gastonMsg} expression={gastonExpr} size="small" />
      </div>

      {!validated ? (
        <button onClick={handleValidate} disabled={selected === null}
          className="w-full h-14 rounded-2xl font-black text-white press-scale"
          style={{ background: selected !== null ? color : '#2A3550', opacity: selected !== null ? 1 : 0.5 }}>
          VALIDER
        </button>
      ) : (
        <button onClick={nextQuestion}
          className="w-full h-14 rounded-2xl font-black text-white press-scale"
          style={{ background: color }}>
          {currentQ + 1 < questions.length ? 'SUIVANTE →' : 'VOIR RÉSULTATS →'}
        </button>
      )}
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ExamContent />
    </Suspense>
  );
}
