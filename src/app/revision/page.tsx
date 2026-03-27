'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getThemeData, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import QuizLayout from '@/components/QuizLayout';
import Gaston from '@/components/Gaston';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GASTON_REVISION = [
  'Prends ton temps, c\'est de la révision !',
  'Chaque question est une chance de progresser.',
  'Tu connais déjà la réponse, cherche bien.',
  'Bonne révision, tu gères !',
];

export default function RevisionPage() {
  const params = useSearchParams();
  const router = useRouter();
  const themeCode = params.get('theme') || 'A';
  const themeColor = THEME_COLORS[themeCode] || '#74B9FF';
  const themeEmoji = THEME_EMOJIS[themeCode] || '🔄';

  const themeData = getThemeData(themeCode);

  const [questions, setQuestions] = useState<LocalQuestion[]>(() => {
    if (!themeData) return [];
    return shuffle(themeData.lessons.flatMap(l => l.questions)).map(q => {
      const s = shuffleChoices(q);
      return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
    });
  });

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [gastonMsg, setGastonMsg] = useState(GASTON_REVISION[0]);

  const validateSelected = useCallback(() => {
    if (selected === null || validated) return;
    setValidated(true);
    if (selected === questions[index].correct) {
      setCorrectCount(c => c + 1);
      setGastonMsg('Bien joué ! Continue comme ça !');
    } else {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
      setGastonMsg('Pas grave, retiens la bonne réponse !');
    }
  }, [selected, validated, questions, index]);

  const goNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex(i => i + 1);
    setSelected(null);
    setValidated(false);
    setShakeWrong(false);
    setGastonMsg(GASTON_REVISION[(index + 1) % GASTON_REVISION.length]);
  }, [index, questions.length]);

  const restart = useCallback(() => {
    if (!themeData) return;
    setQuestions(shuffle(themeData.lessons.flatMap(l => l.questions)).map(q => {
      const s = shuffleChoices(q);
      return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
    }));
    setIndex(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setDone(false);
    setShakeWrong(false);
  }, [themeData]);

  if (!themeData || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p style={{ color: '#8B9DC3' }}>Aucune question disponible.</p>
        <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold press-scale" style={{ background: '#16213E' }}>
          {'← Retour'}
        </button>
      </div>
    );
  }

  const progress = ((index + 1) / questions.length) * 100;

  // Done screen
  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
    const msg = pct >= 80
      ? 'Excellent ! Tu maîtrise ce thème.'
      : pct >= 60
      ? 'Bien ! Quelques points à retravailler.'
      : 'Continue à réviser, ça viendra !';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 gap-4">
        <span className="text-[72px]">{emoji}</span>
        <h1 className="text-[48px] font-black">{pct}%</h1>
        <p className="text-center" style={{ color: '#8B9DC3' }}>{msg}</p>

        <div className="w-full max-w-md flex items-center justify-around rounded-2xl p-5 my-2" style={{ background: '#16213E' }}>
          <div className="text-center">
            <p className="text-[28px] font-black" style={{ color: '#2ecc71' }}>{correctCount}</p>
            <p className="text-xs" style={{ color: '#8B9DC3' }}>Correctes</p>
          </div>
          <div className="w-[1px] h-10" style={{ background: '#2A3550' }} />
          <div className="text-center">
            <p className="text-[28px] font-black" style={{ color: '#e74c3c' }}>{questions.length - correctCount}</p>
            <p className="text-xs" style={{ color: '#8B9DC3' }}>Incorrectes</p>
          </div>
          <div className="w-[1px] h-10" style={{ background: '#2A3550' }} />
          <div className="text-center">
            <p className="text-[28px] font-black">{questions.length}</p>
            <p className="text-xs" style={{ color: '#8B9DC3' }}>Total</p>
          </div>
        </div>

        <button onClick={() => router.back()} className="w-full max-w-md h-[54px] rounded-2xl font-bold text-white press-scale" style={{ background: themeColor }}>
          {'Retour à la carte'}
        </button>
        <button onClick={restart} className="w-full max-w-md h-[54px] rounded-2xl font-bold press-scale" style={{ background: '#16213E', border: '1px solid #2A3550', color: themeColor }}>
          🔁 Recommencer
        </button>
      </div>
    );
  }

  // Question screen
  const q = questions[index];

  return (
    <QuizLayout
      progress={progress}
      progressLabel={`${index + 1}/${questions.length}`}
      headerLeft={
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center press-scale" style={{ background: 'rgba(255,255,255,0.08)', color: '#8B9DC3' }}>
          {'←'}
        </button>
      }
      headerCenter={
        <span className="text-sm font-bold">{themeEmoji} Révision — Thème {themeCode}</span>
      }
      subtitle={`Révision — Thème ${themeCode}`}
      question={q.question}
      signCode={q.sign}
      choices={[...q.choices]}
      selected={selected}
      validated={validated}
      correctIndex={q.correct}
      onSelect={(i) => { if (!validated) setSelected(i); }}
      onValidate={validateSelected}
      onNext={goNext}
      isLastQuestion={index + 1 === questions.length}
      lastLabel="Voir les résultats →"
      explanation={q.explanation}
      shakeWrong={shakeWrong}
      sidebar={
        <>
          {/* Question info */}
          <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>Progression</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>Question</span>
              <span className="text-sm font-bold">{index + 1} / {questions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>Correctes</span>
              <span className="text-sm font-bold" style={{ color: '#2ecc71' }}>{correctCount}</span>
            </div>
            <div className="mt-3">
              <span className="text-xs px-2 py-1 rounded-md font-bold" style={{ background: themeColor + '20', color: themeColor }}>
                {themeEmoji} Thème {themeCode}
              </span>
            </div>
          </div>

          {/* Gaston */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
            <Gaston message={gastonMsg} expression={validated ? (selected === q.correct ? 'impressed' : 'unhappy') : 'encouraging'} size="small" title="Prof. Gaston" />
          </div>
        </>
      }
    />
  );
}
