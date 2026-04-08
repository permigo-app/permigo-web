'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getExamQuestionsLocalized, getNextThemeCode, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import { setExamPassed, unlockTheme, updateQuizHistory, updateXP, checkAndUpdateStreak, addStudyTime } from '@/lib/progressStorage';
import { THEME_COLORS } from '@/lib/constants';
import { GASTON_CORRECT, GASTON_WRONG, getRandomMsg } from '@/locales/messages';
import { isPremium, isThemeFree, canPlayExam, recordExamPlayed, daysUntilNextExam } from '@/lib/premium';
import PremiumGate from '@/components/PremiumGate';
import Link from 'next/link';
import QuizLayout from '@/components/QuizLayout';
import Gaston from '@/components/Gaston';

function ExamContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, lang } = useLang();
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
  const startTimeRef = useRef(Date.now());

  const color = THEME_COLORS[themeCode] || '#74B9FF';

  // Premium gate: exams for themes B-I require premium (FINAL always requires premium)
  const examThemeFree = themeCode === 'A';
  if (!examThemeFree && !isPremium()) {
    return <PremiumGate><></></PremiumGate>;
  }

  // Weekly limit for non-premium on theme A
  if (!isPremium() && !canPlayExam()) {
    const days = daysUntilNextExam();
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <span className="text-[80px] block mb-4">⏳</span>
        <h1 className="text-2xl font-black mb-3">Examen déjà passé cette semaine</h1>
        <p className="text-base mb-2" style={{ color: '#8B9DC3' }}>
          {days > 0
            ? `Reviens dans ${days} jour${days > 1 ? 's' : ''} pour repasser l'examen.`
            : "Tu pourras repasser l'examen dès demain."}
        </p>
        <p className="text-sm mb-8" style={{ color: '#5A6B8A' }}>
          Les membres Premium peuvent passer l'examen sans limite.
        </p>
        <Link
          href="/premium"
          className="inline-block px-8 py-3.5 rounded-2xl font-black text-base press-scale"
          style={{ background: '#FFD700', color: '#0a0e2a', boxShadow: '0 4px 16px rgba(255,215,0,0.4)' }}
        >
          Passer Premium ✨
        </Link>
      </div>
    );
  }

  const startExam = () => {
    if (!isPremium()) recordExamPlayed();
    const qs = getExamQuestionsLocalized(themeCode, lang, questionCount).map(q => {
      const s = shuffleChoices(q);
      return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
    });
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setStarted(true);
    startTimeRef.current = Date.now();
    setGastonMsg(t('reflechis'));
    setGastonExpr('thinking');
  };

  const handleValidate = () => {
    if (selected === null || validated) return;
    setValidated(true);
    const isCorrect = selected === questions[currentQ].correct;
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setGastonMsg(getRandomMsg(GASTON_CORRECT[lang]));
      setGastonExpr('impressed');
    } else {
      setGastonMsg(getRandomMsg(GASTON_WRONG[lang]));
      setGastonExpr('unhappy');
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setValidated(false);
    setGastonMsg(t('reflechis'));
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
    addStudyTime(Math.round((Date.now() - startTimeRef.current) / 1000));
    router.push(`/resultats?correct=${correctCount}&total=${total}&stars=0&xp=${xpEarned}&theme=${themeCode}&exam=1`);
  };

  // Start screen
  if (!started) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <span className="text-[80px] block mb-4">{'📝'}</span>
        <h1 className="text-2xl font-black mb-2">
          {themeCode === 'FINAL' ? t('examen_blanc_final') : `${t('examen_theme')} ${themeCode}`}
        </h1>
        <p className="text-sm mb-1" style={{ color: '#8B9DC3' }}>
          {`${questionCount} ${t('examen_questions')}`}
        </p>
        <p className="text-sm mb-8" style={{ color: '#8B9DC3' }}>
          {t('examen_seuil')}
        </p>
        <div className="mb-8">
          <Gaston message={t('examen_pret')} expression="happy" />
        </div>
        <button
          onClick={startExam}
          className="px-10 py-4 rounded-2xl font-black text-lg text-white press-scale"
          style={{ background: color, boxShadow: `0 4px 16px ${color}50` }}
        >
          {t('examen_commencer')}
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
        <span className="text-sm font-bold">{t('examen_header')} {themeCode !== 'FINAL' ? `Thème ${themeCode}` : 'Final'}</span>
      }
      headerRight={
        <div className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(243,156,18,0.12)', color: '#F39C12' }}>
          {correctCount} {correctCount > 1 ? t('examen_corrects_count') : t('examen_correct_count')}
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
      questionId={q.id || `exam_${themeCode}_q${currentQ}`}
      sidebar={
        <>
          {/* Score en temps réel */}
          <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>{t('examen_score_direct')}</h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>{t('examen_correctes')}</span>
              <span className="text-xl font-black" style={{ color: '#2ecc71' }}>{correctCount}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>{t('questions')}</span>
              <span className="text-xl font-black">{currentQ + (validated ? 1 : 0)}/{questions.length}</span>
            </div>
            <div className="h-px my-2" style={{ background: '#2A3550' }} />
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#8B9DC3' }}>{t('examen_seuil_reussite')}</span>
              <span className="text-sm font-bold" style={{ color: '#F39C12' }}>{passThreshold}/{questions.length}</span>
            </div>
          </div>

          {/* Gaston */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
            <Gaston message={gastonMsg} expression={gastonExpr} size="small" title={t('prof_gaston')} />
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
