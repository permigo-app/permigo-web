'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getExamQuestions, getNextThemeCode, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { setExamPassed, unlockTheme, updateQuizHistory, updateXP, checkAndUpdateStreak } from '@/lib/progressStorage';
import { THEME_COLORS, GASTON_CORRECT, GASTON_WRONG, getRandomMessage } from '@/lib/constants';
import QuizLayout from '@/components/QuizLayout';
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
  const [shakeWrong, setShakeWrong] = useState(false);

  const color = THEME_COLORS[themeCode] || '#74B9FF';

  const startExam = () => {
    const qs = getExamQuestions(themeCode, questionCount).map(q => {
      const s = shuffleChoices(q);
      return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
    });
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
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
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
        <span className="text-[80px] block mb-4">{'📝'}</span>
        <h1 className="text-2xl font-black mb-2">
          {themeCode === 'FINAL' ? 'Examen blanc final' : `Examen — Thème ${themeCode}`}
        </h1>
        <p className="text-sm mb-1" style={{ color: '#8B9DC3' }}>
          {questionCount} questions
        </p>
        <p className="text-sm mb-8" style={{ color: '#8B9DC3' }}>
          {'41/50 pour réussir (82%)'}
        </p>
        <div className="mb-8">
          <Gaston message="Prêt pour l'examen ? Concentre-toi !" expression="happy" />
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
  const passThreshold = Math.ceil(questions.length * 0.82);

  return (
    <QuizLayout
      progress={pctDone}
      progressLabel={`${currentQ + 1}/${questions.length}`}
      headerLeft={
        <button onClick={() => router.push('/')} className="w-9 h-9 rounded-full flex items-center justify-center press-scale" style={{ background: 'rgba(255,255,255,0.08)', color: '#8B9DC3' }}>
          {'✕'}
        </button>
      }
      headerCenter={
        <span className="text-sm font-bold">{'📝'} Examen {themeCode !== 'FINAL' ? `Thème ${themeCode}` : 'Final'}</span>
      }
      headerRight={
        <div className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(243,156,18,0.12)', color: '#F39C12' }}>
          {correctCount} correct{correctCount > 1 ? 's' : ''}
        </div>
      }
      subtitle={`Examen ${themeCode !== 'FINAL' ? `Thème ${themeCode}` : 'Final'}`}
      question={q.question}
      signCode={q.sign}
      choices={[...q.choices]}
      selected={selected}
      validated={validated}
      correctIndex={q.correct}
      onSelect={setSelected}
      onValidate={handleValidate}
      onNext={nextQuestion}
      isLastQuestion={currentQ + 1 >= questions.length}
      explanation={q.explanation}
      shakeWrong={shakeWrong}
      sidebar={
        <>
          {/* Score en temps réel */}
          <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>Score en direct</h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>Correctes</span>
              <span className="text-xl font-black" style={{ color: '#2ecc71' }}>{correctCount}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>Questions</span>
              <span className="text-xl font-black">{currentQ + (validated ? 1 : 0)}/{questions.length}</span>
            </div>
            <div className="h-px my-2" style={{ background: '#2A3550' }} />
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>{'Seuil réussite'}</span>
              <span className="text-sm font-bold" style={{ color: '#F39C12' }}>{passThreshold}/{questions.length}</span>
            </div>
          </div>

          {/* Gaston */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
            <Gaston message={gastonMsg} expression={gastonExpr} size="small" title="Prof. Gaston" />
          </div>
        </>
      }
    />
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ExamContent />
    </Suspense>
  );
}
