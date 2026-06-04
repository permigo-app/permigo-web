'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getAllQuestionsLocalized, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import { getUnlockedBadges } from '@/lib/badges';
import { dispatchLevelUp, dispatchBadges } from '@/lib/rewardEvents';
import {
  updateQuizHistory, updateXP, checkAndUpdateStreak, addStudyTime,
  setSurvivalBest, getSurvivalBest,
  getTurboBest, setTurboBest,
  getTurboHistory, addTurboSession,
  getTurboAllTime, addTurboAllTime,
  type TurboSession, type TurboAllTimeStats,
} from '@/lib/progressStorage';
import { isPremium, canPlayTurbo, getTurboDailyCount, incrementTurboDailyCount, turboRemainingToday } from '@/lib/premium';
import SignImage from '@/components/SignImage';
import Image from 'next/image';
import QuizLayout from '@/components/QuizLayout';
import Link from 'next/link';

type Mode = null | '3min' | '5min' | 'survie';

const MODE_META = {
  '3min': { icon: '⏱️', gradient: 'var(--card-primary)', border: '#2ecc71', color: '#2ecc71', btnColor: '#2ecc71' },
  '5min': { icon: '🔥', gradient: 'var(--card-primary)', border: '#e67e22', color: '#e67e22', btnColor: '#e67e22' },
  'survie': { icon: '💀', gradient: 'var(--card-primary)', border: '#e74c3c', color: '#e74c3c', btnColor: '#e74c3c' },
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

  const [turboCount, setTurboCount] = useState(0);
  const [mobileSelectedMode, setMobileSelectedMode] = useState<'3min' | '5min' | 'survie'>('3min');

  useEffect(() => {
    setTurboCount(getTurboDailyCount());
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem('turbo_active');
    setGameOver(true);
    const prevBadges = getUnlockedBadges();
    updateQuizHistory(correctCount, currentQ);
    checkAndUpdateStreak();
    const xpResult = updateXP(correctCount * 10);
    const newBadges = getUnlockedBadges().filter(id => !prevBadges.includes(id));
    const leveledUp = xpResult.level > xpResult.prevLevel;
    if (leveledUp) dispatchLevelUp(xpResult.prevLevel, xpResult.level, 2000);
    if (newBadges.length > 0) dispatchBadges(newBadges, leveledUp ? 5500 : 2000);
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
    } else {
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

  // ── MODE SELECTION ──
  if (!mode) {
    const mBest = mobileSelectedMode === '3min' ? best3 : mobileSelectedMode === '5min' ? best5 : bestSurvie;
    const todayStr = new Date().toLocaleDateString('fr-BE');
    const todayBest = history
      .filter(s => s.mode === mobileSelectedMode && new Date(s.date).toLocaleDateString('fr-BE') === todayStr)
      .reduce((acc, s) => Math.max(acc, s.score), 0);
    const blocked = !isPremium() && turboCount >= 5;
    const remaining = Math.max(0, 5 - turboCount);

    const MODES = [
      { key: '3min' as const, label: t('turbo_sprint_3'), desc: t('turbo_sprint_3_desc'), icon: '⏱️', best: best3 },
      { key: '5min' as const, label: t('turbo_sprint_5'), desc: t('turbo_sprint_5_desc'), icon: '🔥', best: best5 },
      { key: 'survie' as const, label: t('turbo_survie'),  desc: t('turbo_survie_desc'),  icon: '💀', best: bestSurvie },
    ];

    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>

        {/* Header */}
        <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)', paddingTop: 52, paddingBottom: 18, paddingLeft: 20, paddingRight: 20 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>Entraînement</p>
            <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--text-title)', letterSpacing: -0.5 }}>{t('turbo_titre')}</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-sub)' }}>{t('turbo_subtitle')}</p>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>

          {/* limit banner */}
          {blocked && (
            <div style={{ background: '#fff1f2', border: '1.5px solid #fca5a5', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 20 }}>⏰</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-title)' }}>{t('turbo_limite_titre')}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-sub)' }}>{t('turbo_limite_msg')}</p>
              </div>
              <Link href="/premium" className="press-scale" style={{ textDecoration: 'none', background: '#0b2659', color: '#f59e0b', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                Premium
              </Link>
            </div>
          )}

          {/* remaining badge */}
          {!isPremium() && !blocked && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'var(--bg-input)', border: '1px solid var(--border-card)', marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)' }}>{remaining} {t(remaining > 1 ? 'turbo_parties_restantes' : 'turbo_partie_restante')}</span>
            </div>
          )}

          {/* stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>Record du jour</p>
              <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, color: '#0b2659' }}>{todayBest || '—'}</p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>Meilleur absolu</p>
              <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, color: '#0b2659' }}>{mBest || '—'}</p>
            </div>
          </div>

          {/* mode selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {MODES.map((m) => {
              const sel = mobileSelectedMode === m.key;
              return (
                <button key={m.key}
                  onClick={() => setMobileSelectedMode(m.key)}
                  className="press-scale"
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: sel ? 'rgba(11,38,89,0.08)' : 'var(--bg-card)',
                    border: sel ? '2px solid #0b2659' : `1.5px solid var(--border-card)`,
                    borderRadius: 16,
                    padding: '16px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: sel ? '#0b2659' : 'var(--text-title)' }}>{m.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-sub)' }}>{m.desc}</p>
                    {m.best > 0 && <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>Record : {m.best}</p>}
                  </div>
                  {/* radio */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${sel ? '#0b2659' : 'var(--border-card)'}`,
                    background: sel ? '#0b2659' : 'var(--bg-input)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <button
            onClick={() => { if (!blocked) startGame(mobileSelectedMode); }}
            disabled={blocked}
            className="press-scale"
            style={{
              width: '100%', padding: '16px', borderRadius: 14,
              background: blocked ? 'var(--bg-input)' : '#0b2659',
              color: blocked ? 'var(--text-hint)' : '#ffffff',
              fontSize: 15, fontWeight: 700,
              cursor: blocked ? 'not-allowed' : 'pointer',
              border: 'none',
              fontFamily: 'Sora, sans-serif',
              marginBottom: 24,
            }}>
            {blocked ? '🔒 Limite atteinte' : `${t('turbo_lancer')} →`}
          </button>

          {/* historique */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-row)' }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>Parties jouées</p>
            </div>
            {[
              { icon: '⏱️', label: t('turbo_sprint_3'), value: allTime.games3min },
              { icon: '🔥', label: t('turbo_sprint_5'), value: allTime.games5min },
              { icon: '💀', label: t('turbo_survie'),   value: allTime.gamesSurvie },
            ].map((row, i) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < 2 ? '1px solid var(--border-row)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{row.icon} {row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-navy)' }}>{row.value} parties</span>
              </div>
            ))}
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
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('turbo_bonnes_reponses')}</p>

        <div className="px-5 py-2 rounded-full inline-block mb-6" style={{ background: 'rgba(255,201,40,0.15)' }}>
          <span className="font-black" style={{ color: 'var(--premium)' }}>+{correctCount * 10} XP ⚡</span>
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
            style={{ background: 'var(--card-primary)', color: 'var(--text-primary)' }}
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
        <span className="text-lg font-black" style={{ color: meta.color }}>{t('turbo_score')}: <span key={correctCount} className="combo-burst inline-block">{correctCount}</span></span>
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
              <span key={correctCount} className="text-xl font-black combo-burst inline-block" style={{ color: '#2ecc71' }}>{correctCount}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>{t('questions')}</span>
              <span className="text-sm font-bold">{currentQ + 1}</span>
            </div>
          </div>

        </>
      }
    />
  );
}
