'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllQuestions, type LocalQuestion } from '@/lib/lessonData';
import { updateQuizHistory, updateXP, checkAndUpdateStreak, setSurvivalBest, getSurvivalBest } from '@/lib/progressStorage';
import { GASTON_CORRECT, GASTON_WRONG, getRandomMessage } from '@/lib/constants';
import SignImage from '@/components/SignImage';
import Gaston from '@/components/Gaston';

type Mode = null | '3min' | '5min' | 'survie';

const MODE_COLORS = {
  '3min': '#00B894',
  '5min': '#FDCB6E',
  'survie': '#FF4757',
};

export default function TurboPage() {
  const [mode, setMode] = useState<Mode>(null);
  const [selectedMode, setSelectedMode] = useState<Mode>('3min');
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gastonMsg, setGastonMsg] = useState('');
  const [gastonExpr, setGastonExpr] = useState<'happy' | 'impressed' | 'unhappy'>('happy');
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameOver(true);
    updateQuizHistory(correctCount, currentQ);
    checkAndUpdateStreak();
    updateXP(correctCount * 10);
    if (mode === 'survie') setSurvivalBest(correctCount);
  }, [correctCount, currentQ, mode]);

  const startGame = () => {
    const m = selectedMode;
    if (!m) return;
    setMode(m);
    const allQ = getAllQuestions();
    const shuffled = [...allQ].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setLives(m === 'survie' ? 1 : 3);
    setGameOver(false);
    if (m === '3min') setTimeLeft(180);
    else if (m === '5min') setTimeLeft(300);
    else setTimeLeft(0);
  };

  useEffect(() => {
    if (!mode || mode === 'survie' || gameOver) return;
    if (timeLeft <= 0 && mode) { endGame(); return; }
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, mode, gameOver, endGame]);

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
      if (mode === 'survie') { setTimeout(() => endGame(), 1200); }
      else { setLives(l => l - 1); }
    }
  };

  const nextQuestion = () => {
    if (gameOver) return;
    setSelected(null);
    setValidated(false);
    if (currentQ + 1 < questions.length) { setCurrentQ(q => q + 1); }
    else { endGame(); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── MODE SELECTION ──
  if (!mode) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8" style={{ background: '#0D0D1A', minHeight: '100vh' }}>
        {/* Animated car circle */}
        <div className="flex justify-center mb-6">
          <div
            className="w-[90px] h-[90px] rounded-full flex items-center justify-center text-4xl car-bounce"
            style={{ background: '#FF4757', border: '3px solid #8B0000', boxShadow: '0 6px 20px rgba(255,71,87,0.5)' }}
          >
            🏎️
          </div>
        </div>

        <h1 className="text-2xl font-black text-center mb-1">Mode Turbo</h1>
        <p className="text-center text-sm mb-6" style={{ color: '#8B9DC3' }}>Réponds le plus vite possible !</p>

        {/* Score card */}
        <div className="flex gap-2 mb-6 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.10)' }}>
          <div className="flex-1 text-center">
            <p className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.45)' }}>AUJOURD&apos;HUI</p>
            <p className="text-[26px] font-black">0</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>pts</p>
          </div>
          <div className="w-[1px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex-1 text-center">
            <p className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.45)' }}>ALL-TIME</p>
            <p className="text-[26px] font-black">{getSurvivalBest()}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>pts</p>
          </div>
        </div>

        {/* Mode cards with radio buttons */}
        <div className="flex flex-col gap-3 mb-8">
          {([['3min', '⏱️', '3 minutes', 'Le maximum en 3 min'], ['5min', '🔥', '5 minutes', 'Plus de temps, plus de pression'], ['survie', '💀', 'Survie', '1 erreur = game over']] as const).map(([m, icon, label, desc]) => (
            <button
              key={m}
              onClick={() => setSelectedMode(m as Mode)}
              className="flex items-center gap-3 p-3 rounded-[14px] text-left transition-all press-scale"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${selectedMode === m ? MODE_COLORS[m] : 'rgba(255,255,255,0.10)'}`,
              }}
            >
              {/* Radio */}
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: `2px solid ${selectedMode === m ? MODE_COLORS[m] : '#5A6B8A'}` }}
              >
                {selectedMode === m && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className="text-2xl">{icon}</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs" style={{ color: '#8B9DC3' }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Launch button */}
        <button
          onClick={startGame}
          className="w-full py-4 rounded-2xl font-black text-lg press-scale"
          style={{
            background: selectedMode ? MODE_COLORS[selectedMode] : '#FFD700',
            color: selectedMode === '5min' ? '#1A1A2E' : 'white',
            boxShadow: `0 4px 16px ${selectedMode ? MODE_COLORS[selectedMode] + '60' : 'rgba(255,215,0,0.4)'}`,
          }}
        >
          LANCER 🏎️
        </button>
      </div>
    );
  }

  // ── GAME OVER ──
  if (gameOver) {
    const mColor = MODE_COLORS[mode] || '#00B894';
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center" style={{ background: '#0D0D1A', minHeight: '100vh' }}>
        <span className="text-[80px] block mb-3">{correctCount >= 10 ? '🏆' : '💪'}</span>
        <h1 className="text-2xl font-black mb-1">Terminé !</h1>
        <p className="text-[48px] font-black mb-1" style={{ color: mColor }}>{correctCount}</p>
        <p className="text-sm mb-6" style={{ color: '#8B9DC3' }}>bonnes réponses</p>

        <div className="px-5 py-2 rounded-full inline-block mb-6" style={{ background: 'rgba(255,215,0,0.15)' }}>
          <span className="font-black" style={{ color: '#FFD700' }}>+{correctCount * 10} XP ⚡</span>
        </div>

        <div className="mb-6">
          <Gaston
            message={correctCount >= 10 ? 'Impressionnant ! 🏆' : 'Continue à t\'entraîner ! 💪'}
            expression={correctCount >= 10 ? 'party' : 'encouraging'}
            size="small"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => { setMode(null); setGameOver(false); }} className="py-4 rounded-2xl font-black press-scale" style={{ background: mColor }}>
            REJOUER
          </button>
          <button onClick={() => { setMode(null); setGameOver(false); }} className="py-4 rounded-2xl font-black press-scale" style={{ background: '#16213E' }}>
            Changer de mode
          </button>
        </div>
      </div>
    );
  }

  // ── GAME IN PROGRESS ──
  const q = questions[currentQ];
  if (!q) return null;
  const mColor = MODE_COLORS[mode] || '#00B894';

  return (
    <div className="max-w-2xl mx-auto px-4 py-5" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {mode !== 'survie' && (
            <span className={`text-sm font-black ${timeLeft <= 30 ? 'text-[var(--lives)]' : ''}`} style={{ color: timeLeft <= 30 ? '#FF4757' : '#8B9DC3' }}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          )}
          {mode === 'survie' && <span className="text-sm font-black" style={{ color: '#FF4757' }}>💀 1 vie</span>}
        </div>
        <span className="text-sm font-black" style={{ color: mColor }}>Score: {correctCount}</span>
      </div>

      {q.sign && (
        <div className="flex justify-center mb-4"><SignImage code={q.sign} size={80} /></div>
      )}

      <p className="text-lg font-bold text-center mb-5 leading-relaxed">{q.question}</p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {q.choices.map((choice, i) => {
          let bg = '#252545';
          let borderColor = 'rgba(255,255,255,0.08)';
          let textColor = 'rgba(255,255,255,0.82)';
          if (validated) {
            if (i === q.correct) { bg = '#0D3B20'; borderColor = '#27AE60'; textColor = '#4ADE80'; }
            else if (i === selected) { bg = '#3B0D0D'; borderColor = '#E74C3C'; textColor = '#FC8181'; }
          } else if (i === selected) {
            bg = 'rgba(0,184,148,0.13)'; borderColor = '#00B894';
          }
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
        <div className="rounded-t-[28px] p-4 mb-4 slide-up" style={{ background: selected === q.correct ? '#1A5C38' : '#6B1A1A' }}>
          <span className="text-2xl mr-2">{selected === q.correct ? '🎉' : '😅'}</span>
          <span className="font-bold">{selected === q.correct ? 'Correct !' : 'Incorrect'}</span>
        </div>
      )}

      {!validated ? (
        <button onClick={handleValidate} disabled={selected === null}
          className="w-full h-14 rounded-2xl font-black text-white press-scale"
          style={{ background: selected !== null ? mColor : '#2A3550', opacity: selected !== null ? 1 : 0.5 }}>
          VALIDER
        </button>
      ) : (
        <button onClick={nextQuestion}
          className="w-full h-14 rounded-2xl font-black text-white press-scale"
          style={{ background: mColor }}>
          SUIVANTE →
        </button>
      )}
    </div>
  );
}
