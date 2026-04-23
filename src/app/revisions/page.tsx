'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { fetchDueReviews, recordQuestionReview } from '@/lib/reviewApi';
import { getQuestionById, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { calculateNextReview, type DifficultyLevel } from '@/lib/spacedRepetition';
import { updateXP } from '@/lib/progressStorage';
import { dispatchLevelUp } from '@/lib/rewardEvents';
import QuizLayout from '@/components/QuizLayout';

type Phase = 'loading' | 'intro' | 'quiz' | 'done';

interface DueRecord {
  question_id: string;
  streak_correct: number;
  difficulty_level: string;
}

interface AnswerRecord {
  question: LocalQuestion;
  isCorrect: boolean;
  intervalDays: number;
  newDifficulty: DifficultyLevel;
}

const UI = {
  fr: {
    loading: 'Chargement…',
    noQuestions: 'Aucune révision due pour l\'instant !',
    noQSub: 'Reviens plus tard ou fais d\'abord des leçons.',
    back: '← Retour',
    introTitle: 'Session de révision',
    introSub: 'Tu vas être interrogé sur les questions que tu as déjà vues.',
    introStat: (n: number) => `${n} question${n > 1 ? 's' : ''} à réviser`,
    introTime: (n: number) => `~${n} min estimées`,
    startBtn: 'Commencer la session →',
    doneTitle: 'Session terminée !',
    score: 'Score',
    correct: 'Correctes',
    incorrect: 'Incorrectes',
    xpEarned: 'XP gagné',
    nextReviews: 'Prochaines révisions',
    day1: (n: number) => `${n} question${n > 1 ? 's' : ''} à revoir dans 1 jour`,
    day3: (n: number) => `${n} question${n > 1 ? 's' : ''} dans 3 jours`,
    day7: (n: number) => `${n} question${n > 1 ? 's' : ''} dans 7 jours`,
    mastered: (n: number) => `${n} question${n > 1 ? 's' : ''} maîtrisée${n > 1 ? 's' : ''} ! 🏆`,
    goHome: 'Retour à l\'accueil',
    headerTitle: 'Révision intelligente',
    lastLabel: 'Voir les résultats →',
    sidebar_progress: 'Progression',
    sidebar_correct: 'Correctes',
    sidebar_q: 'Question',
  },
  nl: {
    loading: 'Laden…',
    noQuestions: 'Geen herhalingen gepland voor nu!',
    noQSub: 'Kom later terug of doe eerst lessen.',
    back: '← Terug',
    introTitle: 'Herhalingssessie',
    introSub: 'Je wordt ondervraagd over vragen die je al hebt gezien.',
    introStat: (n: number) => `${n} vraag${n > 1 ? 'en' : ''} te herhalen`,
    introTime: (n: number) => `~${n} min geschat`,
    startBtn: 'Sessie starten →',
    doneTitle: 'Sessie voltooid!',
    score: 'Score',
    correct: 'Juist',
    incorrect: 'Fout',
    xpEarned: 'XP verdiend',
    nextReviews: 'Volgende herhalingen',
    day1: (n: number) => `${n} vraag${n > 1 ? 'en' : ''} over 1 dag herhalen`,
    day3: (n: number) => `${n} vraag${n > 1 ? 'en' : ''} over 3 dagen`,
    day7: (n: number) => `${n} vraag${n > 1 ? 'en' : ''} over 7 dagen`,
    mastered: (n: number) => `${n} vraag${n > 1 ? 'en' : ''} beheerst! 🏆`,
    goHome: 'Terug naar startpagina',
    headerTitle: 'Slimme herhaling',
    lastLabel: 'Resultaten bekijken →',
    sidebar_progress: 'Voortgang',
    sidebar_correct: 'Juist',
    sidebar_q: 'Vraag',
  },
};

export default function RevisionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { lang } = useLang();
  const s = UI[lang];

  const [phase, setPhase] = useState<Phase>('loading');
  const [dueRecords, setDueRecords] = useState<DueRecord[]>([]);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [streakMap, setStreakMap] = useState<Record<string, number>>({});

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const questionStartRef = useRef(Date.now());
  const hasFetchedRef = useRef(false);

  // Load due questions — wait for auth to resolve before redirecting
  useEffect(() => {
    if (loading) return;                 // auth still loading — don't act yet
    if (!user) {
      router.replace('/app');            // confirmed guest → redirect
      return;
    }
    if (hasFetchedRef.current) return;   // prevent double-fetch (Strict Mode)
    hasFetchedRef.current = true;

    // Snapshot lang at fetch time — not a reactive dependency
    const currentLang = lang;
    fetchDueReviews().then(records => {
      const resolved: LocalQuestion[] = [];
      const strMap: Record<string, number> = {};
      for (const r of records) {
        const q = getQuestionById(r.question_id, currentLang);
        if (!q) continue;
        const shuffled = shuffleChoices(q);
        resolved.push({ ...q, choices: shuffled.choices as [string, string, string, string], correct: shuffled.correct });
        strMap[r.question_id] = r.streak_correct;
      }
      setDueRecords(records);
      setQuestions(resolved);
      setStreakMap(strMap);
      setPhase('intro');
    });
  }, [user, loading, router]);

  const startSession = useCallback(() => {
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setAnswers([]);
    questionStartRef.current = Date.now();
    setPhase('quiz');
  }, []);

  const handleValidate = useCallback(() => {
    if (selected === null || validated) return;
    setValidated(true);
    if (selected === questions[currentQ].correct) {
      setCorrectCount(c => c + 1);
    } else {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
    }
  }, [selected, validated, questions, currentQ]);

  const handleNext = useCallback(() => {
    const q = questions[currentQ];
    const isCorrect = selected === q.correct;
    const timeSpent = (Date.now() - questionStartRef.current) / 1000;
    const record = dueRecords.find(r => r.question_id === q.id);
    const currentStreak = streakMap[q.id] ?? 0;
    const currentDifficulty = (record?.difficulty_level ?? 'new') as DifficultyLevel;

    const result = calculateNextReview({ isCorrect, timeSpent, currentStreak, currentDifficulty });

    // Update localStorage review counters for badges
    if (isCorrect) {
      const prev = parseInt(localStorage.getItem('review_total_correct') ?? '0', 10);
      localStorage.setItem('review_total_correct', String(prev + 1));
    }
    if (result.newDifficulty === 'mastered') {
      const prev = parseInt(localStorage.getItem('review_mastered_count') ?? '0', 10);
      localStorage.setItem('review_mastered_count', String(prev + 1));
    }

    setAnswers(prev => [...prev, { question: q, isCorrect, intervalDays: result.intervalDays, newDifficulty: result.newDifficulty }]);

    // Fire-and-forget recording
    recordQuestionReview(q.id, isCorrect, timeSpent).catch(() => {});

    if (currentQ + 1 < questions.length) {
      setCurrentQ(i => i + 1);
      setSelected(null);
      setValidated(false);
      setShakeWrong(false);
      questionStartRef.current = Date.now();
    } else {
      // Session done — award XP
      const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
      const xpEarned = finalCorrect * 5 + (finalCorrect === questions.length ? 20 : 0);
      if (xpEarned > 0) {
        const xpResult = updateXP(xpEarned);
        if (xpResult.level > xpResult.prevLevel) dispatchLevelUp(xpResult.prevLevel, xpResult.level, 600);
      }
      setPhase('done');
    }
  }, [questions, currentQ, selected, correctCount, dueRecords, streakMap]);

  // ── Loading ────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: '#8B9DC3' }}>{s.loading}</p>
      </div>
    );
  }

  // ── Intro ─────────────────────────────────────────────────
  if (phase === 'intro') {
    const estimatedMin = Math.max(1, Math.round(questions.length * 0.5));
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6">
        <div className="text-6xl">🔁</div>
        <h1 className="text-2xl font-black text-white text-center">{s.introTitle}</h1>

        {questions.length === 0 ? (
          <>
            <p className="text-center font-bold" style={{ color: '#00B894', fontSize: 20 }}>{s.noQuestions}</p>
            <p className="text-center text-sm" style={{ color: '#8B9DC3' }}>{s.noQSub}</p>
          </>
        ) : (
          <>
            <p className="text-center text-sm" style={{ color: '#8B9DC3', maxWidth: 320 }}>{s.introSub}</p>
            <div className="flex gap-4">
              <div className="text-center rounded-2xl px-6 py-4" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
                <p className="text-2xl font-black text-white">{questions.length}</p>
                <p className="text-xs" style={{ color: '#8B9DC3' }}>{s.introStat(questions.length).replace(`${questions.length} `, '')}</p>
              </div>
              <div className="text-center rounded-2xl px-6 py-4" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
                <p className="text-2xl font-black text-white">{estimatedMin}</p>
                <p className="text-xs" style={{ color: '#8B9DC3' }}>min</p>
              </div>
            </div>
            <button
              onClick={startSession}
              className="w-full max-w-sm h-14 rounded-2xl font-black text-white text-lg press-scale btn-glow-green"
              style={{ background: 'linear-gradient(135deg, #00B894, #00a884)', border: 'none' }}
            >
              {s.startBtn}
            </button>
          </>
        )}

        <button onClick={() => router.push('/app')} className="text-sm press-scale" style={{ color: '#5A6B8A' }}>
          {s.back}
        </button>
      </div>
    );
  }

  // ── Done ──────────────────────────────────────────────────
  if (phase === 'done') {
    const total = questions.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
    const xpEarned = correct * 5 + (correct === total ? 20 : 0);

    const by1 = answers.filter(a => a.intervalDays === 1).length;
    const by3 = answers.filter(a => a.intervalDays === 3).length;
    const by7 = answers.filter(a => a.intervalDays === 7).length;
    const mastered = answers.filter(a => a.newDifficulty === 'mastered').length;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-5">
        <div className="text-6xl">{emoji}</div>
        <h1 className="text-2xl font-black text-white">{s.doneTitle}</h1>

        {/* Score */}
        <div className="w-full max-w-sm rounded-2xl p-5 flex items-center justify-around" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: '#2ecc71' }}>{correct}</p>
            <p className="text-xs" style={{ color: '#8B9DC3' }}>{s.correct}</p>
          </div>
          <div style={{ width: 1, height: 40, background: '#2A3550' }} />
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: '#e74c3c' }}>{total - correct}</p>
            <p className="text-xs" style={{ color: '#8B9DC3' }}>{s.incorrect}</p>
          </div>
          <div style={{ width: 1, height: 40, background: '#2A3550' }} />
          <div className="text-center">
            <p className="text-3xl font-black text-white">{pct}%</p>
            <p className="text-xs" style={{ color: '#8B9DC3' }}>{s.score}</p>
          </div>
        </div>

        {/* XP */}
        {xpEarned > 0 && (
          <div className="w-full max-w-sm rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0,184,148,0.1)', border: '1px solid rgba(0,184,148,0.25)' }}>
            <span className="text-sm font-bold" style={{ color: '#00B894' }}>{s.xpEarned}</span>
            <span className="font-black text-white">+{xpEarned} XP ⭐</span>
          </div>
        )}

        {/* Next reviews */}
        {(by1 > 0 || by3 > 0 || by7 > 0 || mastered > 0) && (
          <div className="w-full max-w-sm rounded-2xl p-4 flex flex-col gap-2" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#4ecdc4' }}>{s.nextReviews}</p>
            {by1 > 0  && <p className="text-sm" style={{ color: '#e74c3c' }}>📅 {s.day1(by1)}</p>}
            {by3 > 0  && <p className="text-sm" style={{ color: '#FDCB6E' }}>📅 {s.day3(by3)}</p>}
            {by7 > 0  && <p className="text-sm" style={{ color: '#8B9DC3' }}>📅 {s.day7(by7)}</p>}
            {mastered > 0 && <p className="text-sm font-bold" style={{ color: '#00B894' }}>{s.mastered(mastered)}</p>}
          </div>
        )}

        <button
          onClick={() => router.push('/app')}
          className="w-full max-w-sm h-14 rounded-2xl font-black text-white press-scale"
          style={{ background: 'linear-gradient(135deg, #00B894, #00a884)', border: 'none' }}
        >
          {s.goHome}
        </button>
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────
  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <QuizLayout
      progress={progress}
      progressLabel={`${currentQ + 1}/${questions.length}`}
      headerLeft={
        <button
          onClick={() => router.push('/app')}
          className="w-9 h-9 rounded-full flex items-center justify-center press-scale"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#8B9DC3' }}
        >
          {'←'}
        </button>
      }
      headerCenter={
        <span className="text-sm font-bold">🔁 {s.headerTitle}</span>
      }
      question={q.question}
      signCode={q.sign}
      choices={[...q.choices]}
      selected={selected}
      validated={validated}
      correctIndex={q.correct}
      onSelect={i => { if (!validated) setSelected(i); }}
      onValidate={handleValidate}
      onNext={handleNext}
      isLastQuestion={currentQ + 1 === questions.length}
      lastLabel={s.lastLabel}
      explanation={q.explanation}
      shakeWrong={shakeWrong}
      questionId={q.id}
      sidebar={
        <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>
            {s.sidebar_progress}
          </h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: '#8B9DC3' }}>{s.sidebar_q}</span>
            <span className="text-sm font-bold">{currentQ + 1} / {questions.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#8B9DC3' }}>{s.sidebar_correct}</span>
            <span className="text-sm font-bold" style={{ color: '#2ecc71' }}>{correctCount}</span>
          </div>
          <div className="mt-3">
            <span className="text-xs px-2 py-1 rounded-md font-bold" style={{ background: 'rgba(0,184,148,0.15)', color: '#00B894' }}>
              🔁 Spaced Repetition
            </span>
          </div>
        </div>
      }
    />
  );
}
