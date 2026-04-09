'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getAllQuestionsLocalized, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import {
  updateQuizHistory, updateXP, checkAndUpdateStreak, addStudyTime,
  setSurvivalBest, getSurvivalBest,
  getTurboBest, setTurboBest,
  getTurboHistory, addTurboSession,
  getTurboAllTime, addTurboAllTime,
  type TurboSession, type TurboAllTimeStats,
} from '@/lib/progressStorage';
import { GASTON_CORRECT, GASTON_WRONG, GASTON_TIPS, getRandomMsg } from '@/locales/messages';
import { isPremium, canPlayTurbo, getTurboDailyCount, incrementTurboDailyCount, turboRemainingToday } from '@/lib/premium';
import SignImage from '@/components/SignImage';
import Gaston from '@/components/Gaston';
import Image from 'next/image';
import QuizLayout from '@/components/QuizLayout';
import Link from 'next/link';

type Mode = null | '3min' | '5min' | 'survie';

const MODE_META = {
  '3min': { icon: '⏱️', gradient: 'linear-gradient(135deg, #0a2e4a 0%, #0d3b5c 50%, #0a3040 100%)', border: '#2ecc71', color: '#2ecc71', btnColor: '#2ecc71' },
  '5min': { icon: '🔥', gradient: 'linear-gradient(135deg, #3a2000 0%, #4a2800 50%, #3a2200 100%)', border: '#e67e22', color: '#e67e22', btnColor: '#e67e22' },
  'survie': { icon: '💀', gradient: 'linear-gradient(135deg, #2a0a0a 0%, #3a1010 50%, #1a0505 100%)', border: '#e74c3c', color: '#e74c3c', btnColor: '#e74c3c' },
} as const;

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} sec`;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

export default function TurboPage() {
  const { t, lang } = useLang();
  const [mode, setMode] = useState<Mode>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gastonMsg, setGastonMsg] = useState('');
  const [gastonExpr, setGastonExpr] = useState<'happy' | 'impressed' | 'unhappy'>('happy');
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const startTimeRef = useRef(0);
  const hasRestoredRef = useRef(false);

  // Stats
  const [best3, setBest3] = useState(0);
  const [best5, setBest5] = useState(0);
  const [bestSurvie, setBestSurvie] = useState(0);
  const [history, setHistory] = useState<TurboSession[]>([]);
  const [allTime, setAllTime] = useState<TurboAllTimeStats>({ games3min: 0, games5min: 0, gamesSurvie: 0, timeSeconds: 0 });

  useEffect(() => {
    setBest3(getTurboBest('3min'));
    setBest5(getTurboBest('5min'));
    setBestSurvie(getSurvivalBest());
    setHistory(getTurboHistory());
    setAllTime(getTurboAllTime());
  }, [mode]);

  // Restauration d'une session interrompue
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    try {
      const saved = localStorage.getItem('turbo_active');
      if (!saved) return;
      const data = JSON.parse(saved);
      const elapsed = Date.now() - data.startTime;
      const remaining = data.mode === 'survie' ? 1 : (data.duration - elapsed);
      if (remaining > 0) {
        const allQ = getAllQuestionsLocalized(lang);
        const shuffled = [...allQ].sort(() => Math.random() - 0.5).map(q => {
          const s = shuffleChoices(q);
          return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
        });
        setQuestions(shuffled);
        setMode(data.mode as Mode);
        if (data.mode !== 'survie') setTimeLeft(Math.floor((data.duration - elapsed) / 1000));
        setCorrectCount(data.score || 0);
        setCurrentQ(data.questionsAnswered || 0);
        startTimeRef.current = data.startTime;
      } else {
        // Temps écoulé pendant l'absence
        localStorage.removeItem('turbo_active');
      }
    } catch {
      localStorage.removeItem('turbo_active');
    }
  }, [lang]);

  const [tipIndex, setTipIndex] = useState(0);
  const [tipFade, setTipFade] = useState(true);
  const [turboCount, setTurboCount] = useState(0);

  useEffect(() => {
    setTurboCount(getTurboDailyCount());
  }, []);

  useEffect(() => {
    if (mode) return;
    const interval = setInterval(() => {
      setTipFade(false);
      setTimeout(() => {
        setTipIndex(i => (i + 1) % GASTON_TIPS[lang].length);
        setTipFade(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [mode, lang]);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem('turbo_active');
    setGameOver(true);
    updateQuizHistory(correctCount, currentQ);
    checkAndUpdateStreak();
    updateXP(correctCount * 10);
    if (mode === 'survie') setSurvivalBest(correctCount);
    if (mode) {
      setTurboBest(mode, correctCount);
      const elapsed = mode === 'survie'
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : mode === '3min' ? 180 - timeLeft : 300 - timeLeft;
      addTurboSession({
        date: new Date().toISOString(),
        mode,
        score: correctCount,
        total: currentQ,
      });
      addTurboAllTime(mode, elapsed);
      addStudyTime(elapsed);
    }
  }, [correctCount, currentQ, mode, timeLeft]);

  const startGame = (m: '3min' | '5min' | 'survie') => {
    // N'incrémente que si pas de session déjà active (évite double-comptage)
    if (!localStorage.getItem('turbo_active')) {
      incrementTurboDailyCount();
      setTurboCount(getTurboDailyCount());
    }
    const duration = m === '3min' ? 180000 : m === '5min' ? 300000 : null;
    localStorage.setItem('turbo_active', JSON.stringify({
      startTime: Date.now(),
      duration,
      mode: m,
      questionsAnswered: 0,
      score: 0,
    }));
    setMode(m);
    const allQ = getAllQuestionsLocalized(lang);
    const shuffled = [...allQ].sort(() => Math.random() - 0.5).map(q => {
      const s = shuffleChoices(q);
      return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
    });
    setQuestions(shuffled);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setGameOver(false);
    startTimeRef.current = Date.now();
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
    const newScore = isCorrect ? correctCount + 1 : correctCount;
    try {
      const saved = localStorage.getItem('turbo_active');
      if (saved) {
        const data = JSON.parse(saved);
        localStorage.setItem('turbo_active', JSON.stringify({ ...data, score: newScore, questionsAnswered: currentQ }));
      }
    } catch { /* ignore */ }
    if (isCorrect) {
      setCorrectCount(newScore);
      setGastonMsg(getRandomMsg(GASTON_CORRECT[lang]));
      setGastonExpr('impressed');
    } else {
      setGastonMsg(getRandomMsg(GASTON_WRONG[lang]));
      setGastonExpr('unhappy');
      if (mode === 'survie') { setTimeout(() => endGame(), 1200); }
    }
  };

  const nextQuestion = () => {
    if (gameOver) return;
    setSelected(null);
    setValidated(false);
    try {
      const saved = localStorage.getItem('turbo_active');
      if (saved) {
        const data = JSON.parse(saved);
        localStorage.setItem('turbo_active', JSON.stringify({ ...data, questionsAnswered: currentQ + 1, score: correctCount }));
      }
    } catch { /* ignore */ }
    if (currentQ + 1 < questions.length) { setCurrentQ(q => q + 1); }
    else { endGame(); }
  };

  function modeLabel(m: string) {
    if (m === '3min') return t('turbo_3min_label');
    if (m === '5min') return t('turbo_5min_label');
    return t('turbo_survie_label');
  }

  // ── MODE SELECTION (desktop redesign) ──
  if (!mode) {
    return (
      <div className="py-8 px-6" style={{ minHeight: '100vh' }}>
        <div className="max-w-screen-xl mx-auto flex gap-6">
          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-black flex items-center gap-3">
                <span>🏎️</span> {t('turbo_titre')}
              </h1>
              <p className="text-sm mt-1 italic" style={{ color: '#94a3b8' }}>{t('turbo_subtitle')}</p>
            </div>

            {/* Freemium banner — shown when limit reached */}
            {!isPremium() && turboCount >= 5 && (
              <div className="rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4" style={{ background: 'rgba(255,107,107,0.12)', border: '1.5px solid rgba(255,107,107,0.4)' }}>
                <span className="text-3xl">⏰</span>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-black text-white mb-1">Tu as atteint ta limite du jour</p>
                  <p className="text-sm" style={{ color: '#8B9DC3' }}>Passe Premium pour jouer sans limite — reviens demain sinon.</p>
                </div>
                <Link href="/premium" className="flex-shrink-0 px-5 py-2.5 rounded-xl font-black text-sm press-scale" style={{ background: '#FFD700', color: '#0a0e2a' }}>
                  Passer Premium ✨
                </Link>
              </div>
            )}

            {/* Daily counter badge for free users */}
            {!isPremium() && turboCount < 5 && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.2)' }}>
                <span className="text-xs font-bold" style={{ color: '#4ecdc4' }}>
                  {5 - turboCount} partie{5 - turboCount > 1 ? 's' : ''} restante{5 - turboCount > 1 ? 's' : ''} aujourd&apos;hui
                </span>
              </div>
            )}

            {/* 3 mode cards — same height */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['3min', '5min', 'survie'] as const).map((m) => {
                const meta = MODE_META[m];
                const best = m === '3min' ? best3 : m === '5min' ? best5 : bestSurvie;
                const labelKey = m === '3min' ? 'turbo_sprint_3' : m === '5min' ? 'turbo_sprint_5' : 'turbo_survie';
                const descKey = m === '3min' ? 'turbo_sprint_3_desc' : m === '5min' ? 'turbo_sprint_5_desc' : 'turbo_survie_desc';
                const blocked = !isPremium() && turboCount >= 5;
                return (
                  <div
                    key={m}
                    className="rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-200 cursor-pointer"
                    style={{
                      background: meta.gradient,
                      border: `1.5px solid ${meta.border}30`,
                      minHeight: 280,
                      opacity: blocked ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      if (blocked) return;
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = `0 8px 32px ${meta.border}35`;
                      e.currentTarget.style.borderColor = `${meta.border}60`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = `${meta.border}30`;
                    }}
                  >
                    <span className="text-5xl mb-4">{meta.icon}</span>
                    <h2 className="text-xl font-black mb-2">{t(labelKey)}</h2>
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: '#8B9DC3' }}>{t(descKey)}</p>
                    <p className="text-xs font-bold mb-auto" style={{ color: meta.color }}>
                      {best > 0 ? `${t('turbo_meilleur')} : ${best}` : t('turbo_pas_joue')}
                    </p>
                    <button
                      onClick={() => { if (!blocked) startGame(m); }}
                      disabled={blocked}
                      className="w-full py-3 rounded-xl font-black text-sm press-scale transition-all mt-5"
                      style={{
                        background: blocked ? '#3A4560' : meta.btnColor,
                        color: blocked ? '#5A6B8A' : 'white',
                        boxShadow: blocked ? 'none' : `0 4px 16px ${meta.btnColor}40`,
                        cursor: blocked ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {blocked ? '🔒 Limite atteinte' : t('turbo_lancer')}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Gaston tips section — below the cards */}
            <div
              className="mt-6 rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.25)' }}
            >
              <Image src="/images/gaston.png" width={52} height={52} alt="Prof. Gaston" className="gaston-float" style={{ objectFit: 'contain', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold mb-1.5" style={{ color: '#4ecdc4' }}>{t('turbo_gaston_conseille')}</p>
                <p
                  className="text-sm leading-relaxed transition-opacity duration-300"
                  style={{ color: '#94a3b8', opacity: tipFade ? 1 : 0 }}
                >
                  💡 {GASTON_TIPS[lang][tipIndex]}
                </p>
              </div>
            </div>
          </div>

          {/* Right sidebar — desktop only */}
          <div className="w-64 xl:w-80 flex-shrink-0 hidden lg:flex flex-col gap-5">
            {/* Parties jouées */}
            <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2">
                <span>📊</span> {t('turbo_parties_jouees')}
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#8B9DC3' }}>⏱️ {t('turbo_sprint_3')}</span>
                  <span className="text-sm font-bold" style={{ color: '#2ecc71' }}>{allTime.games3min}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#8B9DC3' }}>🔥 {t('turbo_sprint_5')}</span>
                  <span className="text-sm font-bold" style={{ color: '#e67e22' }}>{allTime.games5min}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#8B9DC3' }}>💀 {t('turbo_survie')}</span>
                  <span className="text-sm font-bold" style={{ color: '#e74c3c' }}>{allTime.gamesSurvie}</span>
                </div>
                <div className="h-[1px] my-1" style={{ background: '#2A3550' }} />
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#8B9DC3' }}>{t('turbo_temps_total')}</span>
                  <span className="text-sm font-bold">{formatDuration(allTime.timeSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Records */}
            <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2">
                <span>🏆</span> {t('turbo_records')}
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#8B9DC3' }}>⏱️ {t('turbo_sprint_3')}</span>
                  <span className="text-sm font-bold" style={{ color: '#2ecc71' }}>{best3 || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#8B9DC3' }}>🔥 {t('turbo_sprint_5')}</span>
                  <span className="text-sm font-bold" style={{ color: '#e67e22' }}>{best5 || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#8B9DC3' }}>💀 {t('turbo_survie')}</span>
                  <span className="text-sm font-bold" style={{ color: '#e74c3c' }}>{bestSurvie || '—'}</span>
                </div>
              </div>
            </div>

            {/* Historique */}
            <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2">
                <span>📋</span> {t('turbo_historique')}
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#5A6B8A' }}>{t('turbo_aucune_partie')}</p>
              ) : (
                <div className="flex flex-col overflow-y-auto pr-1" style={{ maxHeight: 300 }}>
                  {history.slice(0, 20).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-2 flex-shrink-0" style={{ borderBottom: i < Math.min(history.length, 20) - 1 ? '1px solid #2A3550' : undefined }}>
                      <span className="flex-1" style={{ color: '#8B9DC3' }}>{formatDate(s.date)}</span>
                      <span
                        className="font-bold px-2 py-0.5 rounded-md text-[10px]"
                        style={{ background: `${MODE_META[s.mode]?.color}20`, color: MODE_META[s.mode]?.color }}
                      >
                        {modeLabel(s.mode)}
                      </span>
                      <span className="font-black w-6 text-right">{s.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME OVER ──
  if (gameOver) {
    const meta = MODE_META[mode];
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <span className="text-[80px] block mb-3">{correctCount >= 10 ? '🏆' : '💪'}</span>
        <h1 className="text-3xl font-black mb-2">{t('turbo_termine')}</h1>
        <p className="text-[56px] font-black mb-1" style={{ color: meta.color }}>{correctCount}</p>
        <p className="text-sm mb-6" style={{ color: '#8B9DC3' }}>{t('turbo_bonnes_reponses')}</p>

        <div className="px-5 py-2 rounded-full inline-block mb-6" style={{ background: 'rgba(255,215,0,0.15)' }}>
          <span className="font-black" style={{ color: '#FFD700' }}>+{correctCount * 10} XP ⚡</span>
        </div>

        <div className="mb-8">
          <Gaston
            message={correctCount >= 10 ? t('turbo_impressionnant') : t('turbo_continue')}
            expression={correctCount >= 10 ? 'party' : 'encouraging'}
            size="small"
          />
        </div>

        <div className="flex gap-4 max-w-md mx-auto">
          <button
            onClick={() => { startGame(mode); }}
            className="flex-1 py-4 rounded-2xl font-black press-scale"
            style={{ background: meta.color, color: mode === '5min' ? '#1A1A2E' : 'white' }}
          >
            {t('turbo_rejouer')}
          </button>
          <button
            onClick={() => { setMode(null); setGameOver(false); }}
            className="flex-1 py-4 rounded-2xl font-black press-scale"
            style={{ background: '#16213E' }}
          >
            {t('turbo_changer_mode')}
          </button>
        </div>
      </div>
    );
  }

  // ── GAME IN PROGRESS ──
  const q = questions[currentQ];
  if (!q) return null;
  const meta = MODE_META[mode];
  const turboProgress = mode === 'survie' ? 100 : ((mode === '3min' ? 180 - timeLeft : 300 - timeLeft) / (mode === '3min' ? 180 : 300)) * 100;

  return (
    <QuizLayout
      progress={turboProgress}
      headerLeft={
        <button
          onClick={() => endGame()}
          className="w-9 h-9 rounded-full flex items-center justify-center press-scale"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#8B9DC3' }}
        >
          {'✕'}
        </button>
      }
      headerCenter={
        mode !== 'survie' ? (
          <span className={`text-sm font-black px-3 py-1 rounded-lg ${timeLeft <= 30 ? 'animate-pulse' : ''}`} style={{ color: timeLeft <= 30 ? '#FF4757' : 'white', background: timeLeft <= 30 ? '#FF475715' : 'transparent' }}>
            {'⏱️'} {formatTime(timeLeft)}
          </span>
        ) : (
          <span className="text-sm font-black px-3 py-1 rounded-lg" style={{ color: '#FF4757', background: '#FF475715' }}>{t('turbo_1_vie')}</span>
        )
      }
      headerRight={
        <span className="text-lg font-black" style={{ color: meta.color }}>{t('turbo_score')}: {correctCount}</span>
      }
      subtitle={mode === '3min' ? t('turbo_sprint_3') : mode === '5min' ? t('turbo_sprint_5') : t('turbo_survie')}
      question={q.question}
      signCode={q.sign}
      choices={[...q.choices]}
      selected={selected}
      validated={validated}
      correctIndex={q.correct}
      onSelect={setSelected}
      onValidate={handleValidate}
      onNext={nextQuestion}
      isLastQuestion={false}
      lastLabel="SUIVANTE →"
      sidebar={
        <>
          {/* Timer / Streak */}
          <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: meta.color }}>
              {mode === '3min' ? t('turbo_sprint_3') : mode === '5min' ? t('turbo_sprint_5') : t('turbo_survie')}
            </h4>
            {mode !== 'survie' && (
              <div className={`text-center mb-3 ${timeLeft <= 30 ? 'animate-pulse' : ''}`}>
                <span className="text-4xl font-black" style={{ color: timeLeft <= 30 ? '#FF4757' : 'white' }}>{formatTime(timeLeft)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>{t('turbo_score')}</span>
              <span className="text-xl font-black" style={{ color: '#2ecc71' }}>{correctCount}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>{t('questions')}</span>
              <span className="text-sm font-bold">{currentQ + 1}</span>
            </div>
          </div>

          {/* Gaston */}
          {gastonMsg && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
              <Gaston message={gastonMsg} expression={gastonExpr} size="small" />
            </div>
          )}
        </>
      }
    />
  );
}
