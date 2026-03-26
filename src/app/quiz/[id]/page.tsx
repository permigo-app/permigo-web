'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonData, getThemeForLesson, type LocalQuestion } from '@/lib/lessonData';
import { setStars, updateQuizHistory, updateXP, checkAndUpdateStreak } from '@/lib/progressStorage';
import { THEME_COLORS, GASTON_CORRECT, GASTON_WRONG, getRandomMessage } from '@/lib/constants';
import SignImage from '@/components/SignImage';
import Gaston from '@/components/Gaston';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = (params.id as string)?.toUpperCase();

  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [gastonMsg, setGastonMsg] = useState('Réfléchis bien... 🤔');
  const [gastonExpr, setGastonExpr] = useState<'happy' | 'impressed' | 'unhappy' | 'thinking'>('thinking');
  const [themeCode, setThemeCode] = useState('A');

  useEffect(() => {
    const lesson = getLessonData(lessonId);
    if (lesson) setQuestions([...lesson.questions].sort(() => Math.random() - 0.5));
    const t = getThemeForLesson(lessonId);
    if (t) setThemeCode(t.theme);
  }, [lessonId]);

  const color = THEME_COLORS[themeCode] || '#74B9FF';

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
    else {
      const total = questions.length;
      const pct = total > 0 ? correctCount / total : 0;
      let earnedStars = 0;
      if (pct >= 1) earnedStars = 3;
      else if (pct >= 0.7) earnedStars = 2;
      else if (pct >= 0.5) earnedStars = 1;
      setStars(lessonId, earnedStars);
      updateQuizHistory(correctCount, total);
      checkAndUpdateStreak();
      const xpEarned = correctCount * 10 + 50;
      updateXP(xpEarned);
      router.push(`/resultats?correct=${correctCount}&total=${total}&stars=${earnedStars}&xp=${xpEarned}&lesson=${lessonId}&theme=${themeCode}`);
    }
  };

  if (questions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen"><p style={{ color: '#8B9DC3' }}>Chargement...</p></div>;
  }

  const q = questions[currentQ];
  const pctDone = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5" style={{ minHeight: '100vh' }}>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.push('/')} className="w-9 h-9 rounded-full flex items-center justify-center text-sm press-scale" style={{ background: '#16213E' }}>✕</button>
        <div className="flex-1">
          <div className="h-[10px] rounded-full overflow-hidden" style={{ background: '#1E2D4A' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctDone}%`, background: color }} />
          </div>
        </div>
        <span className="text-xs font-bold" style={{ color: '#8B9DC3' }}>{currentQ + 1}/{questions.length}</span>
      </div>

      {q.sign && <div className="flex justify-center mb-5"><SignImage code={q.sign} size={100} /></div>}

      <p className="text-xl font-bold text-center mb-6 leading-relaxed">{q.question}</p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {q.choices.map((choice, i) => {
          let bg = '#252545'; let borderColor = 'rgba(255,255,255,0.08)'; let textColor = 'rgba(255,255,255,0.82)';
          if (validated) {
            if (i === q.correct) { bg = '#0D3B20'; borderColor = '#27AE60'; textColor = '#4ADE80'; }
            else if (i === selected) { bg = '#3B0D0D'; borderColor = '#E74C3C'; textColor = '#FC8181'; }
          } else if (i === selected) { bg = 'rgba(0,184,148,0.13)'; borderColor = '#00B894'; }
          return (
            <button key={i} onClick={() => !validated && setSelected(i)} disabled={validated}
              className="rounded-2xl p-4 text-left font-semibold text-[15px] leading-snug transition-all press-scale"
              style={{ background: bg, border: `2px solid ${borderColor}`, color: textColor, minHeight: 72 }}>
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
