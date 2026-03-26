'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getThemeData, type LocalQuestion } from '@/lib/lessonData';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import SignImage from '@/components/SignImage';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export default function RevisionPage() {
  const params = useSearchParams();
  const router = useRouter();
  const themeCode = params.get('theme') || 'A';
  const themeColor = THEME_COLORS[themeCode] || '#74B9FF';
  const themeEmoji = THEME_EMOJIS[themeCode] || '🔄';

  const themeData = getThemeData(themeCode);

  const [questions, setQuestions] = useState<LocalQuestion[]>(() => {
    if (!themeData) return [];
    return shuffle(themeData.lessons.flatMap(l => l.questions));
  });

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const selectChoice = useCallback((i: number) => {
    if (validated) return;
    setSelected(i);
  }, [validated]);

  const validateSelected = useCallback(() => {
    if (selected === null || validated) return;
    setValidated(true);
    if (selected === questions[index].correct) {
      setCorrectCount(c => c + 1);
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
  }, [index, questions.length]);

  const restart = useCallback(() => {
    if (!themeData) return;
    setQuestions(shuffle(themeData.lessons.flatMap(l => l.questions)));
    setIndex(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setDone(false);
  }, [themeData]);

  if (!themeData || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p style={{ color: '#8B9DC3' }}>Aucune question disponible.</p>
        <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold press-scale" style={{ background: '#16213E' }}>
          ← Retour
        </button>
      </div>
    );
  }

  const progress = (index + 1) / questions.length;

  // Done screen
  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
    const msg = pct >= 80
      ? 'Excellent ! Tu maîtrises ce thème.'
      : pct >= 60
      ? 'Bien ! Quelques points à retravailler.'
      : 'Continue à réviser, ça viendra !';

    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold press-scale" style={{ background: '#16213E' }}>
            ←
          </button>
          <span className="text-lg font-extrabold">{themeEmoji} Révision</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <span className="text-[72px]">{emoji}</span>
          <h1 className="text-[48px] font-black">{pct}%</h1>
          <p className="text-center" style={{ color: '#8B9DC3' }}>{msg}</p>

          {/* Score breakdown */}
          <div className="w-full flex items-center justify-around rounded-2xl p-5 my-2" style={{ background: '#16213E' }}>
            <div className="text-center">
              <p className="text-[28px] font-black" style={{ color: '#27AE60' }}>{correctCount}</p>
              <p className="text-xs" style={{ color: '#8B9DC3' }}>Correctes</p>
            </div>
            <div className="w-[1px] h-10" style={{ background: '#2A3550' }} />
            <div className="text-center">
              <p className="text-[28px] font-black" style={{ color: '#FF6B6B' }}>{questions.length - correctCount}</p>
              <p className="text-xs" style={{ color: '#8B9DC3' }}>Incorrectes</p>
            </div>
            <div className="w-[1px] h-10" style={{ background: '#2A3550' }} />
            <div className="text-center">
              <p className="text-[28px] font-black">{questions.length}</p>
              <p className="text-xs" style={{ color: '#8B9DC3' }}>Total</p>
            </div>
          </div>

          <button onClick={() => router.back()} className="w-full h-[54px] rounded-2xl font-bold text-white press-scale" style={{ background: themeColor }}>
            Retour à la carte
          </button>
          <button onClick={restart} className="w-full h-[54px] rounded-2xl font-bold press-scale" style={{ background: '#16213E', border: '1px solid #2A3550', color: themeColor }}>
            🔁 Recommencer
          </button>
        </div>
      </div>
    );
  }

  // Question screen
  const q = questions[index];

  const choiceStyle = (i: number) => {
    if (!validated) {
      if (i === selected) return { background: themeColor + '18', border: `1.5px solid ${themeColor}` };
      return { background: '#16213E', border: '1.5px solid #2A3550' };
    }
    if (i === q.correct) return { background: '#00B89415', border: '1.5px solid #00B894' };
    if (i === selected && i !== q.correct) return { background: '#FF6B6B15', border: '1.5px solid #FF6B6B' };
    return { background: '#16213E', border: '1.5px solid #2A3550' };
  };

  const choiceTextColor = (i: number) => {
    if (!validated) return '#FFFFFF';
    if (i === q.correct) return '#00B894';
    if (i === selected && i !== q.correct) return '#FF6B6B';
    return '#FFFFFF';
  };

  const labelStyle = (i: number) => {
    if (validated && i === q.correct) return { background: '#00B894' };
    if (validated && i === selected && i !== q.correct) return { background: '#FF6B6B' };
    return { background: '#1E2D4A' };
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold press-scale" style={{ background: '#16213E' }}>
          ←
        </button>
        <span className="text-lg font-extrabold">{themeEmoji} Révision</span>
        <span className="text-sm font-extrabold min-w-[40px] text-right" style={{ color: themeColor }}>
          {index + 1}/{questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-5 h-1 rounded-full overflow-hidden mb-4" style={{ background: '#1E2D4A' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress * 100}%`, background: themeColor }} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Sign image */}
        {q.sign && (
          <div className="flex justify-center py-2 mb-2">
            <SignImage code={q.sign} size={100} />
          </div>
        )}

        {/* Question card */}
        <div className="rounded-2xl p-5 mb-3" style={{ background: '#16213E', boxShadow: '0 3px 12px rgba(0,0,0,0.2)' }}>
          <p className="text-lg font-extrabold leading-relaxed">{q.question}</p>
        </div>

        {/* Choices */}
        <div className="flex flex-col gap-2.5 mb-3">
          {q.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => selectChoice(i)}
              disabled={validated}
              className="flex items-center gap-3 rounded-xl p-3.5 text-left transition-all press-scale"
              style={choiceStyle(i)}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={labelStyle(i)}
              >
                <span className="text-sm font-black" style={{ color: (validated && (i === q.correct || (i === selected && i !== q.correct))) ? '#FFF' : '#FFFFFF' }}>
                  {CHOICE_LABELS[i]}
                </span>
              </div>
              <span className="flex-1 text-sm font-semibold leading-relaxed" style={{ color: choiceTextColor(i) }}>
                {choice}
              </span>
            </button>
          ))}
        </div>

        {/* Explanation after validation */}
        {validated && (
          <div
            className="rounded-xl p-4 mb-3 slide-up"
            style={{
              background: '#16213E',
              borderLeft: `4px solid ${selected === q.correct ? '#00B894' : '#FF6B6B'}`,
            }}
          >
            <p className="text-sm font-extrabold mb-1.5" style={{ color: selected === q.correct ? '#00B894' : '#FF6B6B' }}>
              {selected === q.correct ? '✓ Correct !' : '✗ Incorrect'}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#8B9DC3' }}>
              {q.explanation}
            </p>
          </div>
        )}

        {/* Validate / Next button */}
        {!validated ? (
          <button
            onClick={validateSelected}
            disabled={selected === null}
            className="w-full h-[54px] rounded-2xl font-black text-white press-scale mt-1"
            style={{
              background: selected !== null ? themeColor : '#16213E',
              border: selected === null ? '1px solid #2A3550' : 'none',
              opacity: selected !== null ? 1 : 0.5,
            }}
          >
            VALIDER
          </button>
        ) : (
          <button
            onClick={goNext}
            className="w-full h-[54px] rounded-2xl font-black text-white press-scale mt-1"
            style={{ background: themeColor }}
          >
            {index + 1 === questions.length ? 'Voir les résultats →' : 'Question suivante →'}
          </button>
        )}
      </div>
    </div>
  );
}
